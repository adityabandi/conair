import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { QueryFilters } from '@/lib/types';

export interface PersonaParameters {
  startDate: Date;
  endDate: Date;
  persona?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface PersonaDistribution {
  persona: string;
  visitors: number;
  avgConfidence: number;
  avgEngagement: number;
  conversions: number;
  conversionRate: number;
}

export interface PersonaTrend {
  date: string;
  valueSeekers: number;
  solutionSeekers: number;
  trustSeekers: number;
  readyBuyers: number;
  explorers: number;
  total: number;
}

export interface PersonaAnalyticsResult {
  distribution: PersonaDistribution[];
  trends: PersonaTrend[];
  summary: {
    totalSessions: number;
    avgConfidence: number;
    topPersona: string;
    conversionsByPersona: Record<string, number>;
  };
}

export async function getPersonaAnalytics(
  ...args: [websiteId: string, parameters: PersonaParameters, filters: QueryFilters]
): Promise<PersonaAnalyticsResult> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
async function relationalQuery(
  websiteId: string,
  parameters: PersonaParameters,
  _filters: QueryFilters,
): Promise<PersonaAnalyticsResult> {
  /* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
  const { startDate, endDate, groupBy = 'day' } = parameters;
  const { rawQuery } = prisma;

  // Get persona distribution
  const distribution = (await rawQuery(
    `
    SELECT
      COALESCE(pp.persona, 'explorer') as persona,
      COUNT(DISTINCT s.session_id) as visitors,
      AVG(pp.confidence) as "avgConfidence",
      AVG(COALESCE(
        (pp.value_score + pp.solution_score + pp.trust_score + pp.intent_score) / 4,
        0
      )) as "avgEngagement",
      COUNT(DISTINCT ce.conversion_id) as conversions,
      CASE
        WHEN COUNT(DISTINCT s.session_id) > 0
        THEN CAST(COUNT(DISTINCT ce.conversion_id) AS FLOAT) / COUNT(DISTINCT s.session_id) * 100
        ELSE 0
      END as "conversionRate"
    FROM session s
    LEFT JOIN personality_profile pp ON s.session_id = pp.session_id
    LEFT JOIN conversion_event ce ON s.session_id = ce.session_id
      AND ce.created_at BETWEEN {{startDate}} AND {{endDate}}
    WHERE s.website_id = {{websiteId::uuid}}
      AND s.created_at BETWEEN {{startDate}} AND {{endDate}}
    GROUP BY COALESCE(pp.persona, 'explorer')
    ORDER BY visitors DESC
    `,
    { websiteId, startDate, endDate },
  )) as PersonaDistribution[];

  // Get trends over time
  const dateFormat =
    groupBy === 'month' ? 'YYYY-MM' : groupBy === 'week' ? 'IYYY-IW' : 'YYYY-MM-DD';
  const trends = (await rawQuery(
    `
    SELECT
      TO_CHAR(s.created_at, '${dateFormat}') as date,
      COUNT(DISTINCT CASE WHEN pp.persona = 'value-seeker' THEN s.session_id END) as "valueSeekers",
      COUNT(DISTINCT CASE WHEN pp.persona = 'solution-seeker' THEN s.session_id END) as "solutionSeekers",
      COUNT(DISTINCT CASE WHEN pp.persona = 'trust-seeker' THEN s.session_id END) as "trustSeekers",
      COUNT(DISTINCT CASE WHEN pp.persona = 'ready-buyer' THEN s.session_id END) as "readyBuyers",
      COUNT(DISTINCT CASE WHEN pp.persona = 'explorer' OR pp.persona IS NULL THEN s.session_id END) as explorers,
      COUNT(DISTINCT s.session_id) as total
    FROM session s
    LEFT JOIN personality_profile pp ON s.session_id = pp.session_id
    WHERE s.website_id = {{websiteId::uuid}}
      AND s.created_at BETWEEN {{startDate}} AND {{endDate}}
    GROUP BY TO_CHAR(s.created_at, '${dateFormat}')
    ORDER BY date
    `,
    { websiteId, startDate, endDate },
  )) as PersonaTrend[];

  // Calculate summary
  const totalSessions = distribution.reduce((sum, d) => sum + Number(d.visitors), 0);
  const avgConfidence =
    distribution.reduce((sum, d) => sum + Number(d.avgConfidence || 0) * Number(d.visitors), 0) /
    (totalSessions || 1);
  const topPersona = distribution[0]?.persona || 'explorer';
  const conversionsByPersona = distribution.reduce(
    (acc, d) => {
      acc[d.persona] = Number(d.conversions);
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    distribution,
    trends,
    summary: {
      totalSessions,
      avgConfidence: Math.round(avgConfidence),
      topPersona,
      conversionsByPersona,
    },
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
async function clickhouseQuery(
  websiteId: string,
  parameters: PersonaParameters,
  _filters: QueryFilters,
): Promise<PersonaAnalyticsResult> {
  /* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */
  const { startDate, endDate, groupBy = 'day' } = parameters;
  const { rawQuery } = clickhouse;

  // For ClickHouse, we need to query from persona_analytics table or join with session
  // This is a simplified version - in production you'd aggregate from the raw data
  const distribution = await rawQuery<PersonaDistribution[]>(
    `
    SELECT
      persona,
      sum(visitors) as visitors,
      avg(avgConfidence) as avgConfidence,
      0 as avgEngagement,
      sum(conversions) as conversions,
      if(sum(visitors) > 0, sum(conversions) / sum(visitors) * 100, 0) as conversionRate
    FROM (
      SELECT
        'value-seeker' as persona,
        sum(value_seeker_count) as visitors,
        avg(avg_confidence) as avgConfidence,
        sum(value_seeker_conversions) as conversions
      FROM persona_analytics
      WHERE website_id = {websiteId:UUID}
        AND date BETWEEN {startDate:Date} AND {endDate:Date}
      UNION ALL
      SELECT
        'solution-seeker' as persona,
        sum(solution_seeker_count) as visitors,
        avg(avg_confidence) as avgConfidence,
        sum(solution_seeker_conversions) as conversions
      FROM persona_analytics
      WHERE website_id = {websiteId:UUID}
        AND date BETWEEN {startDate:Date} AND {endDate:Date}
      UNION ALL
      SELECT
        'trust-seeker' as persona,
        sum(trust_seeker_count) as visitors,
        avg(avg_confidence) as avgConfidence,
        sum(trust_seeker_conversions) as conversions
      FROM persona_analytics
      WHERE website_id = {websiteId:UUID}
        AND date BETWEEN {startDate:Date} AND {endDate:Date}
      UNION ALL
      SELECT
        'ready-buyer' as persona,
        sum(ready_buyer_count) as visitors,
        avg(avg_confidence) as avgConfidence,
        sum(ready_buyer_conversions) as conversions
      FROM persona_analytics
      WHERE website_id = {websiteId:UUID}
        AND date BETWEEN {startDate:Date} AND {endDate:Date}
      UNION ALL
      SELECT
        'explorer' as persona,
        sum(explorer_count) as visitors,
        avg(avg_confidence) as avgConfidence,
        sum(explorer_conversions) as conversions
      FROM persona_analytics
      WHERE website_id = {websiteId:UUID}
        AND date BETWEEN {startDate:Date} AND {endDate:Date}
    )
    GROUP BY persona
    ORDER BY visitors DESC
    `,
    { websiteId, startDate, endDate },
  );

  // Get trends
  const dateFunc =
    groupBy === 'month'
      ? 'toStartOfMonth(date)'
      : groupBy === 'week'
        ? 'toStartOfWeek(date)'
        : 'date';
  const trends = await rawQuery<PersonaTrend[]>(
    `
    SELECT
      toString(${dateFunc}) as date,
      sum(value_seeker_count) as valueSeekers,
      sum(solution_seeker_count) as solutionSeekers,
      sum(trust_seeker_count) as trustSeekers,
      sum(ready_buyer_count) as readyBuyers,
      sum(explorer_count) as explorers,
      sum(total_sessions) as total
    FROM persona_analytics
    WHERE website_id = {websiteId:UUID}
      AND date BETWEEN {startDate:Date} AND {endDate:Date}
    GROUP BY ${dateFunc}
    ORDER BY date
    `,
    { websiteId, startDate, endDate },
  );

  // Calculate summary
  const totalSessions = distribution.reduce((sum, d) => sum + Number(d.visitors), 0);
  const avgConfidence =
    distribution.reduce((sum, d) => sum + Number(d.avgConfidence || 0) * Number(d.visitors), 0) /
    (totalSessions || 1);
  const topPersona = distribution[0]?.persona || 'explorer';
  const conversionsByPersona = distribution.reduce(
    (acc, d) => {
      acc[d.persona] = Number(d.conversions);
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    distribution,
    trends,
    summary: {
      totalSessions,
      avgConfidence: Math.round(avgConfidence),
      topPersona,
      conversionsByPersona,
    },
  };
}
