import { z } from 'zod';
import { canViewWebsite, canUpdateWebsite } from '@/permissions';
import { unauthorized, json, badRequest } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import {
  getContentVariantsForWebsite,
  createContentVariant,
} from '@/queries/sql/persona/getContentVariants';

const getSchema = z.object({});

const postSchema = z.object({
  persona: z.string().min(1).max(50),
  selector: z.string().min(1).max(500),
  content: z.string().min(1),
  contentType: z.enum(['text', 'html', 'class', 'attribute']),
  pagePath: z.string().max(500).optional(),
  name: z.string().max(200).optional(),
});

// GET - List all content variants for a website
export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;
  const { auth, error } = await parseRequest(request, getSchema);

  if (error) return error();
  if (!(await canViewWebsite(auth, websiteId))) return unauthorized();

  const variants = await getContentVariantsForWebsite(websiteId);

  return json({ variants });
}

// POST - Create a new content variant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const { websiteId } = await params;
  const { auth, body, error } = await parseRequest(request, postSchema);

  if (error) return error();
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();

  try {
    const variant = await createContentVariant({
      websiteId,
      persona: body.persona,
      selector: body.selector,
      content: body.content,
      contentType: body.contentType,
      pagePath: body.pagePath,
      name: body.name,
    });

    return json(variant);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to create content variant:', e);
    return badRequest({ message: 'Failed to create content variant' });
  }
}
