import prisma from '@/lib/prisma';
import { PAGE_CATEGORIES } from '@/lib/constants';

// Categorize a path based on URL patterns
function categorizeUrl(path: string): string {
  const lowerPath = path.toLowerCase();
  for (const [category, patterns] of Object.entries(PAGE_CATEGORIES)) {
    if (patterns.some(p => lowerPath.includes(p))) {
      return category;
    }
  }
  return 'general';
}

export async function getDetectedPages(websiteId: string) {
  try {
    return await prisma.client.detectedPage.findMany({
      where: { websiteId },
      orderBy: [{ visits: 'desc' }],
    });
  } catch {
    return [];
  }
}

export async function upsertDetectedPage(data: {
  websiteId: string;
  path: string;
  title?: string;
  timeOnPage?: number;
  scrollDepth?: number;
}) {
  const category = categorizeUrl(data.path);

  try {
    const existing = await prisma.client.detectedPage.findUnique({
      where: {
        websiteId_path: {
          websiteId: data.websiteId,
          path: data.path,
        },
      },
    });

    if (existing) {
      // Update with running averages
      const newVisits = existing.visits + 1;
      const avgTime = existing.avgTimeOnPage
        ? (existing.avgTimeOnPage * existing.visits + (data.timeOnPage || 0)) / newVisits
        : data.timeOnPage;
      const avgScroll = existing.avgScrollDepth
        ? (existing.avgScrollDepth * existing.visits + (data.scrollDepth || 0)) / newVisits
        : data.scrollDepth;

      return await prisma.client.detectedPage.update({
        where: { id: existing.id },
        data: {
          visits: newVisits,
          avgTimeOnPage: avgTime,
          avgScrollDepth: avgScroll,
          title: data.title || existing.title,
          lastSeen: new Date(),
        },
      });
    }

    return await prisma.client.detectedPage.create({
      data: {
        websiteId: data.websiteId,
        path: data.path,
        title: data.title,
        visits: 1,
        avgTimeOnPage: data.timeOnPage,
        avgScrollDepth: data.scrollDepth,
        category,
      },
    });
  } catch {
    return null;
  }
}
