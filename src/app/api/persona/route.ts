import { z } from 'zod';
import { badRequest, json } from '@/lib/response';
import { getPersonalityProfile } from '@/queries/sql/sessions/savePersonalityProfile';
import { getContentVariants } from '@/queries/sql/persona/getContentVariants';

// Public endpoint - no auth required (used by client-side content switching)
const schema = z.object({
  sessionId: z.string().uuid(),
  websiteId: z.string().uuid(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  const websiteId = url.searchParams.get('websiteId');

  const result = schema.safeParse({ sessionId, websiteId });
  if (!result.success) {
    return badRequest({ message: 'Invalid sessionId or websiteId' });
  }

  // Get persona profile
  const profile = await getPersonalityProfile(result.data.sessionId);
  const persona = profile?.persona || 'explorer';

  // Get content variants for this website + persona
  const variants = await getContentVariants(result.data.websiteId, persona);

  return json({
    persona,
    confidence: profile?.confidence || 0,
    scores: {
      value: profile?.valueScore || 0,
      solution: profile?.solutionScore || 0,
      trust: profile?.trustScore || 0,
      intent: profile?.intentScore || 0,
    },
    variants,
  });
}
