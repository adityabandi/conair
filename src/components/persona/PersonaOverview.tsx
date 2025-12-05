'use client';

import { Row, Column, Text } from '@umami/react-zen';
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
  },
  'solution-seeker': {
    icon: '🔧',
    color: '#3B82F6',
    label: 'Solution Seekers',
    description: 'Exploring features & capabilities',
  },
  'trust-seeker': {
    icon: '⭐',
    color: '#8B5CF6',
    label: 'Trust Seekers',
    description: 'Looking for social proof',
  },
  'ready-buyer': {
    icon: '🎯',
    color: '#EF4444',
    label: 'Ready Buyers',
    description: 'High intent, ready to convert',
  },
  explorer: {
    icon: '🧭',
    color: '#6B7280',
    label: 'Explorers',
    description: 'Just browsing',
  },
};

export function PersonaOverview({ websiteId }: PersonaOverviewProps) {
  const { data, isLoading } = useApi(`/api/websites/${websiteId}/insights`);

  if (isLoading || !data?.personaPerformance) {
    return <PersonaOverviewSkeleton />;
  }

  const { distribution, conversionRates, totalSessions, avgConfidence } = data.personaPerformance;
  const personas = Object.entries(distribution) as [keyof typeof PERSONA_CONFIG, number][];
  const totalVisitors = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <Column gap="6">
      {/* Summary Cards */}
      <Row gap="4" wrap="wrap">
        <SummaryCard
          label="Total Sessions"
          value={formatNumber(totalSessions)}
          subtext="Last 30 days"
        />
        <SummaryCard
          label="Avg. Confidence"
          value={`${Math.round(avgConfidence)}%`}
          subtext="Persona detection accuracy"
        />
        <SummaryCard
          label="Identified Personas"
          value={formatNumber(totalVisitors - (distribution.explorer || 0))}
          subtext={`${Math.round(((totalVisitors - (distribution.explorer || 0)) / totalVisitors) * 100)}% of visitors`}
        />
      </Row>

      {/* Persona Distribution */}
      <Column gap="4" className={styles.card}>
        <Text size="5" weight="bold">
          Persona Distribution
        </Text>
        <Row gap="4" wrap="wrap">
          {personas.map(([persona, count]) => {
            const config = PERSONA_CONFIG[persona];
            const percentage = totalVisitors > 0 ? (count / totalVisitors) * 100 : 0;
            const convRate = conversionRates[persona] || 0;

            return (
              <PersonaCard
                key={persona}
                icon={config.icon}
                label={config.label}
                description={config.description}
                count={count}
                percentage={percentage}
                conversionRate={convRate}
                color={config.color}
              />
            );
          })}
        </Row>
      </Column>

      {/* Quick Insights Summary */}
      {data.summary && (
        <Column gap="4" className={styles.card}>
          <Text size="5" weight="bold">
            Actionable Insights
          </Text>
          <Row gap="4">
            <InsightBadge count={data.summary.high} label="High Impact" color="#EF4444" />
            <InsightBadge count={data.summary.medium} label="Medium Impact" color="#F59E0B" />
            <InsightBadge count={data.summary.low} label="Low Impact" color="#6B7280" />
          </Row>
        </Column>
      )}
    </Column>
  );
}

function SummaryCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <Column className={styles.summaryCard} gap="2" padding="5">
      <Text color="muted" size="2">
        {label}
      </Text>
      <Text size="7" weight="bold">
        {value}
      </Text>
      <Text color="muted" size="1">
        {subtext}
      </Text>
    </Column>
  );
}

function PersonaCard({
  icon,
  label,
  description,
  count,
  percentage,
  conversionRate,
  color,
}: {
  icon: string;
  label: string;
  description: string;
  count: number;
  percentage: number;
  conversionRate: number;
  color: string;
}) {
  return (
    <Column className={styles.personaCard} gap="3" padding="5">
      <Row gap="3" alignItems="center">
        <span className={styles.personaIcon}>{icon}</span>
        <Column gap="1">
          <Text weight="bold">{label}</Text>
          <Text color="muted" size="1">
            {description}
          </Text>
        </Column>
      </Row>
      <Row gap="4">
        <Column>
          <Text size="5" weight="bold">
            {formatNumber(count)}
          </Text>
          <Text color="muted" size="1">
            visitors
          </Text>
        </Column>
        <Column>
          <Text size="5" weight="bold">
            {percentage.toFixed(1)}%
          </Text>
          <Text color="muted" size="1">
            of total
          </Text>
        </Column>
        <Column>
          <Text size="5" weight="bold" style={{ color }}>
            {conversionRate.toFixed(1)}%
          </Text>
          <Text color="muted" size="1">
            convert
          </Text>
        </Column>
      </Row>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </Column>
  );
}

function InsightBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <Row gap="2" alignItems="center" className={styles.insightBadge} style={{ borderColor: color }}>
      <span className={styles.insightCount} style={{ backgroundColor: color }}>
        {count}
      </span>
      <Text size="2">{label}</Text>
    </Row>
  );
}

function PersonaOverviewSkeleton() {
  return (
    <Column gap="6">
      <Row gap="4">
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </Row>
      <div className={styles.skeletonLarge} />
    </Column>
  );
}
