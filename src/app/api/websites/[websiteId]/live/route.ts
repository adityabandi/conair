import { canViewWebsite } from '@/permissions';
import { unauthorized, json } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const getSchema = z.object({
  websiteId: z.uuid(),
});

// GET - Fetch live visitors on the site
export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;
  const { auth, error } = await parseRequest(request, getSchema, { websiteId });

  if (error) return error();
  if (!(await canViewWebsite(auth, websiteId))) return unauthorized();

  try {
    // Get visitors active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const liveVisitors = await prisma.client.liveVisitor.findMany({
      where: {
        websiteId,
        lastSeen: { gte: fiveMinutesAgo },
      },
      orderBy: { lastSeen: 'desc' },
      take: 50,
    });

    // Get high-intent visitors (for priority display)
    const highIntentCount = liveVisitors.filter(v => v.isHighIntent).length;

    // Persona distribution of current visitors
    const personaDistribution = liveVisitors.reduce(
      (acc, v) => {
        const p = v.persona || 'explorer';
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return json({
      visitors: liveVisitors.map(v => ({
        id: v.id,
        persona: v.persona || 'explorer',
        confidence: v.confidence || 0,
        currentPage: v.currentPage,
        pageHistory: v.pageHistory,
        engagementScore: v.engagementScore,
        isHighIntent: v.isHighIntent,
        bounceRisk: v.bounceRisk,
        referrer: v.referrer,
        utmSource: v.utmSource,
        device: v.device,
        country: v.country,
        firstSeen: v.firstSeen,
        lastSeen: v.lastSeen,
        sessionDuration: Math.round((Date.now() - new Date(v.firstSeen).getTime()) / 1000),
      })),
      summary: {
        total: liveVisitors.length,
        highIntent: highIntentCount,
        distribution: personaDistribution,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch live visitors:', e);
    return json({ visitors: [], summary: { total: 0, highIntent: 0, distribution: {} } });
  }
}
