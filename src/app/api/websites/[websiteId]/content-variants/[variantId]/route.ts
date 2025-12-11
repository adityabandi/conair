import { z } from 'zod';
import { canUpdateWebsite } from '@/permissions';
import { unauthorized, json, badRequest } from '@/lib/response';
import { parseRequest } from '@/lib/request';
import {
  updateContentVariant,
  deleteContentVariant,
} from '@/queries/sql/persona/getContentVariants';

const patchSchema = z.object({
  persona: z.string().min(1).max(50).optional(),
  selector: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  contentType: z.enum(['text', 'html', 'class', 'attribute']).optional(),
  pagePath: z.string().max(500).optional(),
  name: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

const deleteSchema = z.object({});

// PATCH - Update a content variant
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; variantId: string }> },
) {
  const { websiteId, variantId } = await params;
  const { auth, body, error } = await parseRequest(request, patchSchema);

  if (error) return error();
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();

  try {
    const variant = await updateContentVariant(variantId, body);
    return json(variant);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to update content variant:', e);
    return badRequest({ message: 'Failed to update content variant' });
  }
}

// DELETE - Delete a content variant
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; variantId: string }> },
) {
  const { websiteId, variantId } = await params;
  const { auth, error } = await parseRequest(request, deleteSchema);

  if (error) return error();
  if (!(await canUpdateWebsite(auth, websiteId))) return unauthorized();

  try {
    await deleteContentVariant(variantId);
    return json({ success: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete content variant:', e);
    return badRequest({ message: 'Failed to delete content variant' });
  }
}
