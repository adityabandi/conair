import prisma from '@/lib/prisma';

export async function getContentVariants(websiteId: string, persona: string) {
  try {
    return await prisma.client.contentVariant.findMany({
      where: {
        websiteId,
        persona,
        isActive: true,
      },
      select: {
        selector: true,
        content: true,
        contentType: true,
        pagePath: true,
      },
    });
  } catch {
    // Table might not exist yet (migrations not run)
    return [];
  }
}

export async function getContentVariantsForWebsite(websiteId: string) {
  try {
    return await prisma.client.contentVariant.findMany({
      where: { websiteId },
      orderBy: [{ persona: 'asc' }, { createdAt: 'desc' }],
    });
  } catch {
    return [];
  }
}

export async function createContentVariant(data: {
  websiteId: string;
  persona: string;
  selector: string;
  content: string;
  contentType: string;
  pagePath?: string;
  name?: string;
}) {
  return prisma.client.contentVariant.create({
    data,
  });
}

export async function updateContentVariant(
  id: string,
  data: {
    persona?: string;
    selector?: string;
    content?: string;
    contentType?: string;
    pagePath?: string;
    name?: string;
    isActive?: boolean;
  },
) {
  return prisma.client.contentVariant.update({
    where: { id },
    data,
  });
}

export async function deleteContentVariant(id: string) {
  return prisma.client.contentVariant.delete({
    where: { id },
  });
}
