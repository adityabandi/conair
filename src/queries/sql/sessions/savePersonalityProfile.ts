import prisma from '@/lib/prisma';

export interface PersonaData {
  persona: string;
  confidence: number;
  scores: {
    value?: number;
    solution?: number;
    trust?: number;
    intent?: number;
  };
  pageVisits?: Record<string, Array<{ path: string; timeSpent: number; scrollDepth: number }>>;
}

export interface BehaviorFeatures {
  scrollVelocity?: number;
  avgTimePerPage?: number;
  bounceRisk?: number;
  clickRate?: number;
  mouseMovementRate?: number;
  hoverDuration?: number;
  readingPattern?: string;
  engagementScore?: number;
}

export interface FeatureVector {
  referrerCategory: string;
  utmCategory: string;
  entryPageCategory: string;
  deviceType: string;
  timeOfDay: string;
  isReturning: number;
  scrollVelocity: number;
  clickRate: number;
  avgTimePerPage: number;
  mouseMovementRate: number;
  bounceRisk: number;
  engagementScore: number;
  readingPatternCode: number;
  sessionDuration: number;
  pageCount: number;
  totalClicks: number;
  valueScore: number;
  solutionScore: number;
  trustScore: number;
  intentScore: number;
}

export interface LegacyPersonaData {
  impulsivityScore?: number;
  priceSensitivityScore?: number;
  focusScore?: number;
  rawSignals?: Record<string, unknown>;
}

export async function savePersonalityProfile(data: {
  sessionId: string;
  websiteId?: string;
  // New persona fields
  persona?: string;
  confidence?: number;
  scores?: PersonaData['scores'];
  pageVisits?: PersonaData['pageVisits'];
  // ML fields
  behaviorFeatures?: BehaviorFeatures;
  featureVector?: FeatureVector;
  sessionDuration?: number;
  // Legacy fields
  impulsivityScore?: number;
  priceSensitivityScore?: number;
  focusScore?: number;
  rawSignals?: Record<string, unknown>;
}) {
  const {
    sessionId,
    websiteId,
    persona,
    confidence,
    scores,
    pageVisits,
    behaviorFeatures,
    featureVector,
    sessionDuration,
    impulsivityScore,
    priceSensitivityScore,
    focusScore,
    rawSignals,
  } = data;

  // Save personality profile
  const profile = await prisma.client.personalityProfile.upsert({
    where: { sessionId },
    update: {
      persona,
      confidence,
      valueScore: scores?.value,
      solutionScore: scores?.solution,
      trustScore: scores?.trust,
      intentScore: scores?.intent,
      pageVisits,
      impulsivityScore,
      priceSensitivityScore,
      focusScore,
      rawSignals,
      updatedAt: new Date(),
    },
    create: {
      sessionId,
      persona,
      confidence,
      valueScore: scores?.value,
      solutionScore: scores?.solution,
      trustScore: scores?.trust,
      intentScore: scores?.intent,
      pageVisits,
      impulsivityScore,
      priceSensitivityScore,
      focusScore,
      rawSignals,
    },
  });

  // Save ML training sample if we have feature vector and websiteId
  if (websiteId && featureVector && persona) {
    try {
      await prisma.client.personaBehaviorSample.create({
        data: {
          websiteId,
          sessionId,
          featureVector,
          predictedPersona: persona,
          sessionDuration: sessionDuration ? Math.round(sessionDuration) : null,
          pageCount: featureVector.pageCount ? Math.round(featureVector.pageCount * 10) : null,
          engagementScore: behaviorFeatures?.engagementScore
            ? Math.round(behaviorFeatures.engagementScore)
            : null,
        },
      });
    } catch {
      // Ignore duplicates - we only want one sample per session
    }
  }

  // Update daily analytics
  if (websiteId && persona) {
    await updateDailyAnalytics(websiteId, persona, confidence || 0);
  }

  return profile;
}

async function updateDailyAnalytics(websiteId: string, persona: string, confidence: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const personaCountField = getPersonaCountField(persona);

  try {
    // Try to increment existing record
    await prisma.client.$executeRawUnsafe(
      `
      INSERT INTO persona_analytics (analytics_id, website_id, date, ${personaCountField}, total_sessions, avg_confidence)
      VALUES (gen_random_uuid(), $1, $2, 1, 1, $3)
      ON CONFLICT (website_id, date)
      DO UPDATE SET
        ${personaCountField} = persona_analytics.${personaCountField} + 1,
        total_sessions = persona_analytics.total_sessions + 1,
        avg_confidence = (persona_analytics.avg_confidence * persona_analytics.total_sessions + $3) / (persona_analytics.total_sessions + 1)
    `,
      websiteId,
      today,
      confidence,
    );
  } catch {
    // Table might not exist yet
  }
}

function getPersonaCountField(persona: string): string {
  const mapping: Record<string, string> = {
    'value-seeker': 'value_seeker_count',
    'solution-seeker': 'solution_seeker_count',
    'trust-seeker': 'trust_seeker_count',
    'ready-buyer': 'ready_buyer_count',
    explorer: 'explorer_count',
  };
  return mapping[persona] || 'explorer_count';
}

export async function getPersonalityProfile(sessionId: string) {
  return prisma.client.personalityProfile.findUnique({
    where: { sessionId },
    select: {
      persona: true,
      confidence: true,
      valueScore: true,
      solutionScore: true,
      trustScore: true,
      intentScore: true,
      pageVisits: true,
      updatedAt: true,
    },
  });
}
