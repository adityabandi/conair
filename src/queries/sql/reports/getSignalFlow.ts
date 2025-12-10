import prisma from '@/lib/prisma';

import { runQuery, PRISMA, CLICKHOUSE } from '@/lib/db';

export async function getSignalFlow(websiteId: string, startDate: Date, endDate: Date) {
  return runQuery({
    [PRISMA]: () => getSignalFlowQuery(websiteId, startDate, endDate),
    [CLICKHOUSE]: () => Promise.resolve([]), // Postpone CH support
  });
}

async function getSignalFlowQuery(websiteId: string, startDate: Date, endDate: Date) {
  // We want to map: Source -> Persona -> Outcome
  // Source: utm_source > referrer_domain > 'Direct'
  // Persona: personality_profile.persona > 'Explorer' (default)
  // Outcome: conversion_event exists ? 'Converted' : 'Visited'

  const rawData = await prisma.client.$queryRaw`
    WITH session_source AS (
      SELECT 
        s.session_id,
        COALESCE(
          NULLIF(we.utm_source, ''), 
          NULLIF(we.referrer_domain, ''), 
          'Direct'
        ) as source,
        COALESCE(pp.persona, 'Explorer') as persona,
        CASE 
          WHEN ce.conversion_id IS NOT NULL THEN 'Converted'
          ELSE 'Visited'
        END as outcome
      FROM session s
      -- Get first pageview for source info
      LEFT JOIN (
        SELECT DISTINCT ON (session_id) session_id, utm_source, referrer_domain
        FROM website_event 
        WHERE website_id = ${websiteId}::uuid
          AND event_type = 1 
        ORDER BY session_id, created_at ASC
      ) we ON s.session_id = we.session_id
      -- Get persona info
      LEFT JOIN personality_profile pp ON s.session_id = pp.session_id
      -- Get conversion info
      LEFT JOIN conversion_event ce ON s.session_id = ce.session_id
      
      WHERE s.website_id = ${websiteId}::uuid
        AND s.created_at >= ${startDate}
        AND s.created_at <= ${endDate}
    )
    SELECT 
      source, 
      persona, 
      outcome, 
      COUNT(*) as count
    FROM session_source
    GROUP BY source, persona, outcome
    ORDER BY count DESC
    LIMIT 100;
  `;

  return rawData;
}
