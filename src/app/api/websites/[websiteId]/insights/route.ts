import { canViewWebsite } from '@/permissions';
import { unauthorized, json, badRequest } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import prisma from '@/lib/prisma';
import { generateInsights } from '@/lib/insights/generateInsights';
import { z } from 'zod';

const getSchema = z.object({});

const postSchema = z.object({
  action: z.enum(['generate', 'apply', 'dismiss']),
  insightId: z.string().uuid().optional(),
});

// GET - Fetch insights for a website
export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;
  const { auth, error } = await parseRequest(request, getSchema);

  if (error) return error();
  if (!(await canViewWebsite(auth, websiteId))) return unauthorized();

  try {
    // Get active insights
    const insights = await prisma.client.personaInsight.findMany({
      where: {
        websiteId,
        status: { in: ['new', 'viewed'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ impact: 'asc' }, { confidence: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });

    // Get summary stats
    const summary = await prisma.client.personaInsight.groupBy({
      by: ['impact'],
      where: { websiteId, status: { in: ['new', 'viewed'] } },
      _count: true,
    });

    // Get persona performance summary
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const personaStats = await prisma.client.personaAnalytics.aggregate({
      where: { websiteId, date: { gte: thirtyDaysAgo } },
      _sum: {
        valueSeekerCount: true,
        solutionSeekerCount: true,
        trustSeekerCount: true,
        readyBuyerCount: true,
        explorerCount: true,
        valueSeekerConversions: true,
        solutionSeekerConversions: true,
        trustSeekerConversions: true,
        readyBuyerConversions: true,
        explorerConversions: true,
        totalSessions: true,
      },
      _avg: {
        avgConfidence: true,
      },
    });

    // Calculate conversion rates by persona
    const s = personaStats._sum;
    const conversionRates = {
      'value-seeker': s.valueSeekerCount
        ? ((s.valueSeekerConversions || 0) / s.valueSeekerCount) * 100
        : 0,
      'solution-seeker': s.solutionSeekerCount
        ? ((s.solutionSeekerConversions || 0) / s.solutionSeekerCount) * 100
        : 0,
      'trust-seeker': s.trustSeekerCount
        ? ((s.trustSeekerConversions || 0) / s.trustSeekerCount) * 100
        : 0,
      'ready-buyer': s.readyBuyerCount
        ? ((s.readyBuyerConversions || 0) / s.readyBuyerCount) * 100
        : 0,
      explorer: s.explorerCount ? ((s.explorerConversions || 0) / s.explorerCount) * 100 : 0,
    };

    return json({
      insights: insights.map(i => ({
        id: i.id,
        persona: i.persona,
        type: i.insightType,
        title: i.title,
        description: i.description,
        impact: i.impact,
        confidence: i.confidence,
        metrics: i.metrics,
        actionType: i.actionType,
        actionData: i.actionData,
        status: i.status,
        createdAt: i.createdAt,
      })),
      summary: {
        high: summary.find(s => s.impact === 'high')?._count || 0,
        medium: summary.find(s => s.impact === 'medium')?._count || 0,
        low: summary.find(s => s.impact === 'low')?._count || 0,
      },
      personaPerformance: {
        distribution: {
          'value-seeker': s.valueSeekerCount || 0,
          'solution-seeker': s.solutionSeekerCount || 0,
          'trust-seeker': s.trustSeekerCount || 0,
          'ready-buyer': s.readyBuyerCount || 0,
          explorer: s.explorerCount || 0,
        },
        conversionRates,
        totalSessions: s.totalSessions || 0,
        avgConfidence: personaStats._avg.avgConfidence || 0,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch insights:', e);
    return json({
      insights: [],
      summary: { high: 0, medium: 0, low: 0 },
      personaPerformance: null,
    });
  }
}

// POST - Generate new insights or act on existing ones
export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;
  const { auth, body, error } = await parseRequest(request, postSchema);

  if (error) return error();
  if (!(await canViewWebsite(auth, websiteId))) return unauthorized();

  const { action, insightId } = body;

  try {
    if (action === 'generate') {
      // Generate new insights
      const insights = await generateInsights(websiteId);
      return json({ generated: insights.length, insights });
    }

    if (action === 'apply' && insightId) {
      // Mark insight as applied and create optimization rule
      const insight = await prisma.client.personaInsight.update({
        where: { id: insightId },
        data: { status: 'applied', appliedAt: new Date() },
      });

      // Create optimization rule from insight
      if (insight.actionType && insight.actionData) {
        await prisma.client.optimizationRule.create({
          data: {
            websiteId,
            personas: [insight.persona],
            name: insight.title,
            ruleType: insight.actionType,
            condition: { persona: insight.persona, confidence: { gte: 50 } },
            action: insight.actionData as object,
            isAutoGenerated: true,
            mlScore: insight.confidence,
          },
        });
      }

      return json({ success: true, insight });
    }

    if (action === 'dismiss' && insightId) {
      await prisma.client.personaInsight.update({
        where: { id: insightId },
        data: { status: 'dismissed' },
      });
      return json({ success: true });
    }

    return badRequest({ message: 'Invalid action' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to process insight action:', e);
    return badRequest({ message: 'Failed to process action' });
  }
}
