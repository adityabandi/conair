import prisma from '@/lib/prisma';

export interface InsightData {
  websiteId: string;
  persona: string;
  insightType: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  metrics: Record<string, unknown>;
  actionType?: string;
  actionData?: Record<string, unknown>;
}

/**
 * Analyzes behavior data and generates actionable insights
 * Run this periodically (e.g., daily) or on-demand
 */
export async function generateInsights(websiteId: string): Promise<InsightData[]> {
  const insights: InsightData[] = [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 1. Analyze bounce patterns by persona
  const bounceInsights = await analyzeBouncePatterns(websiteId, thirtyDaysAgo);
  insights.push(...bounceInsights);

  // 2. Analyze conversion paths by persona
  const conversionInsights = await analyzeConversionPaths(websiteId, thirtyDaysAgo);
  insights.push(...conversionInsights);

  // 3. Analyze engagement patterns
  const engagementInsights = await analyzeEngagementPatterns(websiteId, thirtyDaysAgo);
  insights.push(...engagementInsights);

  // 4. Analyze page performance by persona
  const pageInsights = await analyzePagePerformance(websiteId, thirtyDaysAgo);
  insights.push(...pageInsights);

  // Save insights to database
  for (const insight of insights) {
    try {
      await prisma.client.personaInsight.create({
        data: {
          websiteId: insight.websiteId,
          persona: insight.persona,
          insightType: insight.insightType,
          title: insight.title,
          description: insight.description,
          impact: insight.impact,
          confidence: insight.confidence,
          metrics: insight.metrics,
          actionType: insight.actionType,
          actionData: insight.actionData,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        },
      });
    } catch {
      // Ignore duplicates
    }
  }

  return insights;
}

async function analyzeBouncePatterns(websiteId: string, since: Date): Promise<InsightData[]> {
  const insights: InsightData[] = [];

  // Get bounce rates by persona and page
  const bounceData = await prisma.client.$queryRaw<
    Array<{
      persona: string;
      page: string;
      bounceRate: number;
      sampleSize: number;
    }>
  >`
    SELECT
      pp.persona,
      (ce.event_data->>'pagesBefore')::jsonb->>0 as page,
      COUNT(CASE WHEN ce.event_type = 'bounce' THEN 1 END)::float / COUNT(*)::float as "bounceRate",
      COUNT(*) as "sampleSize"
    FROM personality_profile pp
    LEFT JOIN conversion_event ce ON pp.session_id = ce.session_id
    WHERE pp.persona IS NOT NULL
      AND ce.website_id = ${websiteId}
      AND ce.created_at > ${since}
    GROUP BY pp.persona, (ce.event_data->>'pagesBefore')::jsonb->>0
    HAVING COUNT(*) > 10
    ORDER BY "bounceRate" DESC
    LIMIT 20
  `;

  for (const row of bounceData) {
    if (row.bounceRate > 0.4 && row.sampleSize > 20) {
      insights.push({
        websiteId,
        persona: row.persona,
        insightType: 'bounce_page',
        title: `${formatPersona(row.persona)}s bounce ${Math.round(row.bounceRate * 100)}% on ${row.page}`,
        description: `Based on ${row.sampleSize} sessions, ${formatPersona(row.persona).toLowerCase()}s are leaving your site after viewing ${row.page}. Consider adding more relevant content or CTAs for this persona.`,
        impact: row.bounceRate > 0.6 ? 'high' : 'medium',
        confidence: Math.min(0.95, row.sampleSize / 100),
        metrics: { bounceRate: row.bounceRate, sampleSize: row.sampleSize, page: row.page },
        actionType: 'add_cta',
        actionData: { page: row.page, suggestedCta: getPersonaCta(row.persona) },
      });
    }
  }

  return insights;
}

async function analyzeConversionPaths(websiteId: string, since: Date): Promise<InsightData[]> {
  const insights: InsightData[] = [];

  // Find pages that lead to conversions by persona
  const conversionPaths = await prisma.client.$queryRaw<
    Array<{
      persona: string;
      firstPage: string;
      conversionRate: number;
      sampleSize: number;
    }>
  >`
    SELECT
      pp.persona,
      (pp.page_visits::jsonb->>'value')::jsonb->0->>'path' as "firstPage",
      COUNT(CASE WHEN ce.event_type IS NOT NULL THEN 1 END)::float / COUNT(*)::float as "conversionRate",
      COUNT(*) as "sampleSize"
    FROM personality_profile pp
    LEFT JOIN conversion_event ce ON pp.session_id = ce.session_id AND ce.event_type NOT IN ('bounce', 'page_view')
    WHERE pp.persona IS NOT NULL
      AND pp.website_id = ${websiteId}
      AND pp.created_at > ${since}
    GROUP BY pp.persona, (pp.page_visits::jsonb->>'value')::jsonb->0->>'path'
    HAVING COUNT(*) > 10
    ORDER BY "conversionRate" DESC
  `;

  // Group by persona to find best paths
  const personaPaths = new Map<string, typeof conversionPaths>();
  for (const path of conversionPaths) {
    if (!personaPaths.has(path.persona)) {
      personaPaths.set(path.persona, []);
    }
    personaPaths.get(path.persona)!.push(path);
  }

  for (const [persona, paths] of personaPaths) {
    if (paths.length >= 2) {
      const bestPath = paths[0];
      const avgRate = paths.reduce((sum, p) => sum + p.conversionRate, 0) / paths.length;

      if (bestPath.conversionRate > avgRate * 1.5) {
        insights.push({
          websiteId,
          persona,
          insightType: 'conversion_path',
          title: `${formatPersona(persona)}s convert ${Math.round((bestPath.conversionRate / avgRate) * 100 - 100)}% better when starting at ${bestPath.firstPage}`,
          description: `Sessions starting at ${bestPath.firstPage} have a ${Math.round(bestPath.conversionRate * 100)}% conversion rate vs ${Math.round(avgRate * 100)}% average. Consider directing ${formatPersona(persona).toLowerCase()}s here first.`,
          impact: bestPath.conversionRate > avgRate * 2 ? 'high' : 'medium',
          confidence: Math.min(0.9, bestPath.sampleSize / 50),
          metrics: {
            bestPage: bestPath.firstPage,
            conversionRate: bestPath.conversionRate,
            avgRate,
            improvement: bestPath.conversionRate / avgRate,
            sampleSize: bestPath.sampleSize,
          },
          actionType: 'page_redirect',
          actionData: { targetPage: bestPath.firstPage },
        });
      }
    }
  }

  return insights;
}

async function analyzeEngagementPatterns(websiteId: string, since: Date): Promise<InsightData[]> {
  const insights: InsightData[] = [];

  // Compare engagement by persona
  const engagementData = await prisma.client.$queryRaw<
    Array<{
      persona: string;
      avgEngagement: number;
      avgTimeOnSite: number;
      avgPageCount: number;
      sampleSize: number;
    }>
  >`
    SELECT
      pp.persona,
      AVG((pp.value_score + pp.solution_score + pp.trust_score + pp.intent_score) / 4.0) as "avgEngagement",
      AVG(pbs.session_duration) as "avgTimeOnSite",
      AVG(pbs.page_count) as "avgPageCount",
      COUNT(*) as "sampleSize"
    FROM personality_profile pp
    JOIN persona_behavior_sample pbs ON pp.session_id = pbs.session_id
    WHERE pp.persona IS NOT NULL
      AND pbs.website_id = ${websiteId}
      AND pbs.created_at > ${since}
    GROUP BY pp.persona
    HAVING COUNT(*) > 20
  `;

  // Find outliers (very engaged or disengaged personas)
  const avgEngagement =
    engagementData.reduce((sum, d) => sum + d.avgEngagement, 0) / engagementData.length;

  for (const data of engagementData) {
    if (data.avgEngagement < avgEngagement * 0.7) {
      insights.push({
        websiteId,
        persona: data.persona,
        insightType: 'engagement_pattern',
        title: `${formatPersona(data.persona)}s are ${Math.round((1 - data.avgEngagement / avgEngagement) * 100)}% less engaged than average`,
        description: `${formatPersona(data.persona)}s spend ${Math.round(data.avgTimeOnSite)}s on your site (${Math.round(data.avgPageCount)} pages) but show lower engagement signals. They may not be finding what they need.`,
        impact: 'high',
        confidence: Math.min(0.85, data.sampleSize / 100),
        metrics: {
          avgEngagement: data.avgEngagement,
          siteAvgEngagement: avgEngagement,
          avgTimeOnSite: data.avgTimeOnSite,
          avgPageCount: data.avgPageCount,
          sampleSize: data.sampleSize,
        },
        actionType: 'content_emphasis',
        actionData: { emphasize: getPersonaContent(data.persona) },
      });
    } else if (data.avgEngagement > avgEngagement * 1.3 && data.sampleSize > 50) {
      // High engagement but maybe not converting?
      insights.push({
        websiteId,
        persona: data.persona,
        insightType: 'engagement_pattern',
        title: `${formatPersona(data.persona)}s are highly engaged - optimize for conversion`,
        description: `${formatPersona(data.persona)}s spend ${Math.round(data.avgTimeOnSite)}s on your site and view ${Math.round(data.avgPageCount)} pages. This engaged audience may need clearer conversion paths.`,
        impact: 'medium',
        confidence: Math.min(0.8, data.sampleSize / 100),
        metrics: {
          avgEngagement: data.avgEngagement,
          avgTimeOnSite: data.avgTimeOnSite,
          avgPageCount: data.avgPageCount,
          sampleSize: data.sampleSize,
        },
        actionType: 'add_cta',
        actionData: { ctaType: 'conversion', position: 'prominent' },
      });
    }
  }

  return insights;
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
async function analyzePagePerformance(websiteId: string, _since: Date): Promise<InsightData[]> {
  /* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
  const insights: InsightData[] = [];

  // Find pages where personas spend unusually long or short time
  const pagePerformance = await prisma.client.$queryRaw<
    Array<{
      persona: string;
      page: string;
      avgTime: number;
      avgScroll: number;
      visits: number;
    }>
  >`
    SELECT
      pp.persona,
      dp.path as page,
      dp.avg_time_on_page as "avgTime",
      dp.avg_scroll_depth as "avgScroll",
      dp.visits
    FROM detected_page dp
    JOIN personality_profile pp ON dp.website_id = pp.website_id
    WHERE dp.website_id = ${websiteId}
      AND pp.persona IS NOT NULL
      AND dp.visits > 10
    ORDER BY dp.visits DESC
    LIMIT 50
  `;

  // Group by page to compare personas
  const pagePersonaMap = new Map<string, typeof pagePerformance>();
  for (const row of pagePerformance) {
    if (!pagePersonaMap.has(row.page)) {
      pagePersonaMap.set(row.page, []);
    }
    pagePersonaMap.get(row.page)!.push(row);
  }

  for (const [page, performances] of pagePersonaMap) {
    if (performances.length >= 2) {
      const sorted = performances.sort((a, b) => b.avgTime - a.avgTime);
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];

      if (best.avgTime > worst.avgTime * 2 && worst.visits > 10) {
        insights.push({
          websiteId,
          persona: worst.persona,
          insightType: 'page_performance',
          title: `${formatPersona(worst.persona)}s leave ${page} quickly`,
          description: `${formatPersona(worst.persona)}s spend only ${Math.round(worst.avgTime)}s on ${page} vs ${Math.round(best.avgTime)}s for ${formatPersona(best.persona).toLowerCase()}s. This page may need persona-specific content.`,
          impact: 'medium',
          confidence: 0.7,
          metrics: {
            page,
            worstPersona: worst.persona,
            worstTime: worst.avgTime,
            bestPersona: best.persona,
            bestTime: best.avgTime,
          },
          actionType: 'personalize_content',
          actionData: { page, persona: worst.persona },
        });
      }
    }
  }

  return insights;
}

// Helper functions
function formatPersona(persona: string): string {
  const map: Record<string, string> = {
    'value-seeker': 'Value-seeker',
    'solution-seeker': 'Solution-seeker',
    'trust-seeker': 'Trust-seeker',
    'ready-buyer': 'Ready-buyer',
    explorer: 'Explorer',
  };
  return map[persona] || persona;
}

function getPersonaCta(persona: string): string {
  const map: Record<string, string> = {
    'value-seeker': 'See Pricing',
    'solution-seeker': 'Watch Demo',
    'trust-seeker': 'Read Case Studies',
    'ready-buyer': 'Start Free Trial',
    explorer: 'Learn More',
  };
  return map[persona] || 'Learn More';
}

function getPersonaContent(persona: string): string {
  const map: Record<string, string> = {
    'value-seeker': 'pricing, ROI, cost comparison',
    'solution-seeker': 'features, how it works, use cases',
    'trust-seeker': 'testimonials, case studies, social proof',
    'ready-buyer': 'signup forms, trial offers, CTAs',
    explorer: 'overview, getting started guides',
  };
  return map[persona] || 'relevant content';
}
