'use client';

import { Row, Column, Text } from '@/components/zen';
import { useApi } from '@/components/hooks/useApi';
import { formatNumber } from '@/lib/format';
import styles from './PersonaDashboard.module.css';

interface PersonaOverviewProps {
  websiteId: string;
}

const PERSONA_CONFIG = {
  'value-seeker': {
    icon: '💰',
    color: '#10B981',
    label: 'Value Seekers',
    description: 'Focused on pricing & ROI',
    tip: 'Show ROI calculators and pricing transparency',
  },
  'solution-seeker': {
    icon: '🔧',
    color: '#3B82F6',
    label: 'Solution Seekers',
    description: 'Exploring features & capabilities',
    tip: 'Highlight features and show product demos',
  },
  'trust-seeker': {
    icon: '🛡️',
    color: '#8B5CF6',
    label: 'Trust Seekers',
    description: 'Looking for social proof',
    tip: 'Show testimonials and case studies',
  },
  'ready-buyer': {
    icon: '🎯',
    color: '#EF4444',
    label: 'Ready Buyers',
    description: 'High intent, ready to convert',
    tip: 'Clear CTAs and minimal friction',
  },
  explorer: {
    icon: '🔍',
    color: '#6B7280',
    label: 'Explorers',
    description: 'Just browsing around',
    tip: 'Capture email and offer value',
  },
};

// Mock data for demo/development
const MOCK_DATA = {
  personaPerformance: {
    distribution: {
      'value-seeker': 1247,
      'solution-seeker': 892,
      'trust-seeker': 634,
      'ready-buyer': 423,
      'explorer': 1891,
    },
    conversionRates: {
      'value-seeker': 3.2,
      'solution-seeker': 4.1,
      'trust-seeker': 5.8,
      'ready-buyer': 12.4,
      'explorer': 0.8,
    },
    totalSessions: 5087,
    avgConfidence: 78,
  },
  summary: {
    high: 3,
    medium: 5,
    low: 2,
  },
};

export function PersonaOverview({ websiteId }: PersonaOverviewProps) {
  const { get, useQuery } = useApi();
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['persona-overview', websiteId],
    queryFn: () => get(`/websites/${websiteId}/insights`),
  });

  if (isLoading) {
    return <PersonaOverviewSkeleton />;
  }

  // Use mock data if no real data available (for demo purposes)
  const data = apiData?.personaPerformance ? apiData : MOCK_DATA;
  const { distribution, conversionRates, totalSessions, avgConfidence } = data.personaPerformance;
  const personas = Object.entries(distribution || {}) as [keyof typeof PERSONA_CONFIG, number][];
  const totalVisitors = Object.values(distribution || {}).reduce((a: number, b: unknown) => a + (b as number), 0);

  // Calculate overall stats
  const identifiedCount = totalVisitors - (distribution?.explorer || 0);
  const identifiedPct = totalVisitors > 0 ? (identifiedCount / totalVisitors) * 100 : 0;

  // Find best converting persona
  const bestPersona = personas.reduce((best, [persona]) => {
    if ((conversionRates?.[persona] || 0) > (conversionRates?.[best] || 0)) return persona;
    return best;
  }, personas[0]?.[0] || 'explorer');

  // Calculate average conversion
  const avgConversion = personas.length > 0
    ? personas.reduce((sum, [p]) => sum + (conversionRates?.[p] || 0), 0) / personas.length
    : 0;

  return (
    <Column gap="8">
      {/* Key Metrics */}
      <Row gap="4" wrap="wrap">
        <MetricCard
          icon="📊"
          label="Total Sessions"
          value={formatNumber(totalSessions || 0)}
          subtext="Last 30 days"
        />
        <MetricCard
          icon="🎯"
          label="Identified Visitors"
          value={`${identifiedPct.toFixed(0)}%`}
          subtext={`${formatNumber(identifiedCount)} of ${formatNumber(totalVisitors)}`}
          highlight={identifiedPct > 50}
        />
        <MetricCard
          icon="🧠"
          label="Detection Confidence"
          value={`${Math.round(avgConfidence || 0)}%`}
          subtext="Average accuracy"
          highlight={(avgConfidence || 0) > 70}
        />
        <MetricCard
          icon="📈"
          label="Avg. Conversion"
          value={`${avgConversion.toFixed(1)}%`}
          subtext={`Best: ${PERSONA_CONFIG[bestPersona]?.label || 'N/A'}`}
        />
      </Row>

      {/* Persona Distribution */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <Text size="5" weight="bold">Persona Distribution</Text>
            <Text color="muted" size="2">How visitors break down by intent type</Text>
          </div>
        </div>

        <Row gap="4" wrap="wrap" style={{ marginTop: '20px' }}>
          {personas
            .filter(([p]) => PERSONA_CONFIG[p])
            .sort((a, b) => b[1] - a[1])
            .map(([persona, count]) => {
              const config = PERSONA_CONFIG[persona];
              const percentage = totalVisitors > 0 ? (count / totalVisitors) * 100 : 0;
              const convRate = conversionRates?.[persona] || 0;
              const isTop = persona === bestPersona && convRate > 0;

              return (
                <PersonaCard
                  key={persona}
                  icon={config.icon}
                  label={config.label}
                  description={config.description}
                  tip={config.tip}
                  count={count}
                  percentage={percentage}
                  conversionRate={convRate}
                  color={config.color}
                  isTopPerformer={isTop}
                />
              );
            })}
        </Row>
      </div>

      {/* Conversion Comparison Chart */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <Text size="5" weight="bold">Conversion by Persona</Text>
            <Text color="muted" size="2">Which visitors convert best</Text>
          </div>
        </div>

        <div className={styles.barChart}>
          {personas
            .filter(([p, count]) => PERSONA_CONFIG[p] && count > 0)
            .sort((a, b) => (conversionRates?.[b[0]] || 0) - (conversionRates?.[a[0]] || 0))
            .map(([persona]) => {
              const config = PERSONA_CONFIG[persona];
              const convRate = conversionRates?.[persona] || 0;
              const maxRate = Math.max(...Object.values(conversionRates || {}), 1);

              return (
                <div key={persona} className={styles.barRow}>
                  <div className={styles.barLabel}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${(convRate / maxRate) * 100}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                  <div className={styles.barValue}>
                    <Text weight="bold">{convRate.toFixed(1)}%</Text>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Insights Summary */}
      {data.summary && (data.summary.high > 0 || data.summary.medium > 0) && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <Text size="5" weight="bold">Actionable Insights</Text>
              <Text color="muted" size="2">AI-generated recommendations</Text>
            </div>
          </div>
          <Row gap="3" style={{ marginTop: '16px' }}>
            {data.summary.high > 0 && (
              <InsightBadge count={data.summary.high} label="High Impact" color="#EF4444" />
            )}
            {data.summary.medium > 0 && (
              <InsightBadge count={data.summary.medium} label="Medium Impact" color="#F59E0B" />
            )}
            {data.summary.low > 0 && (
              <InsightBadge count={data.summary.low} label="Low Impact" color="#6B7280" />
            )}
          </Row>
        </div>
      )}
    </Column>
  );
}

function MetricCard({
  icon,
  label,
  value,
  subtext,
  highlight = false,
}: {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}) {
  return (
    <div className={`${styles.metricCard} ${highlight ? styles.metricHighlight : ''}`}>
      <Row justifyContent="space-between" alignItems="flex-start">
        <Text color="muted" size="2">{label}</Text>
        <span style={{ fontSize: '18px' }}>{icon}</span>
      </Row>
      <Text size="7" weight="bold" style={{ margin: '8px 0 4px' }}>
        {value}
      </Text>
      <Text color="muted" size="1">{subtext}</Text>
    </div>
  );
}

function PersonaCard({
  icon,
  label,
  description,
  tip,
  count,
  percentage,
  conversionRate,
  color,
  isTopPerformer,
}: {
  icon: string;
  label: string;
  description: string;
  tip: string;
  count: number;
  percentage: number;
  conversionRate: number;
  color: string;
  isTopPerformer: boolean;
}) {
  return (
    <div
      className={styles.personaCard}
      style={{ borderColor: isTopPerformer ? color : undefined }}
    >
      {isTopPerformer && (
        <div className={styles.topBadge} style={{ backgroundColor: color }}>
          ✨ Best Converting
        </div>
      )}

      <Row gap="3" alignItems="center">
        <span className={styles.personaIcon} style={{ backgroundColor: `${color}15` }}>
          {icon}
        </span>
        <Column gap="1">
          <Text weight="bold">{label}</Text>
          <Text color="muted" size="1">{description}</Text>
        </Column>
      </Row>

      <Row gap="5" style={{ marginTop: '16px' }}>
        <Column>
          <Text size="5" weight="bold">{formatNumber(count)}</Text>
          <Text color="muted" size="1">visitors</Text>
        </Column>
        <Column>
          <Text size="5" weight="bold">{percentage.toFixed(1)}%</Text>
          <Text color="muted" size="1">of total</Text>
        </Column>
        <Column>
          <Text size="5" weight="bold" style={{ color }}>{conversionRate.toFixed(1)}%</Text>
          <Text color="muted" size="1">convert</Text>
        </Column>
      </Row>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>

      <div className={styles.personaTip}>
        <Text color="muted" size="1">💡 {tip}</Text>
      </div>
    </div>
  );
}

function InsightBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={styles.insightBadge} style={{ borderColor: `${color}40` }}>
      <span className={styles.insightCount} style={{ backgroundColor: color, color: '#fff' }}>
        {count}
      </span>
      <Text size="2">{label}</Text>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>📊</div>
      <Text size="5" weight="bold" style={{ marginTop: '16px' }}>
        Waiting for visitor data
      </Text>
      <Text color="muted" style={{ marginTop: '8px', maxWidth: '400px', textAlign: 'center' }}>
        Once visitors arrive, you'll see persona distribution and conversion rates.
        Make sure the tracking code is installed.
      </Text>
      <div className={styles.codeHint}>
        <code>{'<script src="/script.js" data-website-id="..." />'}</code>
      </div>
    </div>
  );
}

function PersonaOverviewSkeleton() {
  return (
    <Column gap="6">
      <Row gap="4" wrap="wrap">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonCard} style={{ minWidth: '200px', height: '110px' }} />
        ))}
      </Row>
      <div className={styles.skeletonLarge} style={{ height: '320px' }} />
      <div className={styles.skeletonLarge} style={{ height: '200px' }} />
    </Column>
  );
}
