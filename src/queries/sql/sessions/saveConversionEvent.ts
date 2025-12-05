import prisma from '@/lib/prisma';

export interface ConversionEventData {
  websiteId: string;
  sessionId: string;
  eventType: string;
  eventValue?: number | null;
  eventData?: Record<string, unknown>;
  persona?: string;
  confidence?: number;
  pagesBefore?: string[];
  timeToConvert?: number;
}

export async function saveConversionEvent(data: ConversionEventData) {
  const {
    websiteId,
    sessionId,
    eventType,
    eventValue,
    eventData,
    persona,
    confidence,
    pagesBefore,
    timeToConvert,
  } = data;

  try {
    // Save conversion event
    const conversion = await prisma.client.conversionEvent.create({
      data: {
        websiteId,
        sessionId,
        eventType,
        eventValue: eventValue ? eventValue : null,
        eventData,
        persona,
        confidence,
        pagesBefore,
        timeToConvert,
      },
    });

    // Update daily analytics with conversion
    if (persona) {
      await updateConversionAnalytics(websiteId, persona);
    }

    // Update the ML training sample with actual conversion
    await prisma.client.personaBehaviorSample.updateMany({
      where: {
        websiteId,
        sessionId,
        actualConversion: null,
      },
      data: {
        actualConversion: eventType,
        convertedValue: eventValue ? eventValue : null,
      },
    });

    return conversion;
  } catch (e) {
    // Table might not exist yet
    // eslint-disable-next-line no-console
    console.error('Failed to save conversion event:', e);
    return null;
  }
}

async function updateConversionAnalytics(websiteId: string, persona: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const conversionField = getConversionField(persona);

  try {
    await prisma.client.$executeRawUnsafe(
      `
      UPDATE persona_analytics
      SET ${conversionField} = ${conversionField} + 1
      WHERE website_id = $1 AND date = $2
    `,
      websiteId,
      today,
    );
  } catch {
    // Table might not exist yet
  }
}

function getConversionField(persona: string): string {
  const mapping: Record<string, string> = {
    'value-seeker': 'value_seeker_conversions',
    'solution-seeker': 'solution_seeker_conversions',
    'trust-seeker': 'trust_seeker_conversions',
    'ready-buyer': 'ready_buyer_conversions',
    explorer: 'explorer_conversions',
  };
  return mapping[persona] || 'explorer_conversions';
}
