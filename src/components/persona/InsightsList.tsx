'use client';

import { Row, Column, Text, Button } from '@umami/react-zen';
import { useApi } from '@/components/hooks/useApi';
import styles from './PersonaDashboard.module.css';

interface InsightsListProps {
  websiteId: string;
}

const IMPACT_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6B7280',
};

export function InsightsList({ websiteId }: InsightsListProps) {
  const { data, isLoading, mutate } = useApi(`/api/websites/${websiteId}/insights`);

  const handleApply = async (insightId: string) => {
    await fetch(`/api/websites/${websiteId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apply', insightId }),
    });
    mutate();
  };

  const handleDismiss = async (insightId: string) => {
    await fetch(`/api/websites/${websiteId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss', insightId }),
    });
    mutate();
  };

  const handleGenerate = async () => {
    await fetch(`/api/websites/${websiteId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate' }),
    });
    mutate();
  };

  if (isLoading) return <InsightsSkeleton />;

  const insights = data?.insights || [];

  return (
    <Column gap="6">
      <Row justifyContent="space-between" alignItems="center">
        <Text size="5" weight="bold">
          Actionable Insights
        </Text>
        <Button variant="primary" onClick={handleGenerate}>
          Generate New Insights
        </Button>
      </Row>

      {insights.length === 0 ? (
        <Column alignItems="center" padding="8" gap="3" className={styles.card}>
          <Text size="6">💡</Text>
          <Text>No insights yet</Text>
          <Text color="muted" size="2">
            Click &quot;Generate New Insights&quot; to analyze your visitor data
          </Text>
        </Column>
      ) : (
        <Column gap="4">
          {insights.map((insight: any) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onApply={() => handleApply(insight.id)}
              onDismiss={() => handleDismiss(insight.id)}
            />
          ))}
        </Column>
      )}
    </Column>
  );
}

function InsightCard({
  insight,
  onApply,
  onDismiss,
}: {
  insight: any;
  onApply: () => void;
  onDismiss: () => void;
}) {
  const color = IMPACT_COLORS[insight.impact as keyof typeof IMPACT_COLORS] || '#6B7280';

  return (
    <Column className={styles.insightCard} gap="4" padding="5" style={{ borderLeftColor: color }}>
      <Row justifyContent="space-between" alignItems="flex-start">
        <Column gap="2" style={{ flex: 1 }}>
          <Row gap="2" alignItems="center">
            <span className={styles.impactBadge} style={{ backgroundColor: color }}>
              {insight.impact}
            </span>
            <Text color="muted" size="1">
              {Math.round(insight.confidence * 100)}% confident
            </Text>
          </Row>
          <Text size="4" weight="bold">
            {insight.title}
          </Text>
          <Text color="muted">{insight.description}</Text>
        </Column>
      </Row>

      {insight.actionType && (
        <Row gap="3">
          <Button variant="primary" onClick={onApply}>
            Apply This
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            Dismiss
          </Button>
        </Row>
      )}
    </Column>
  );
}

function InsightsSkeleton() {
  return (
    <Column gap="4">
      {[1, 2, 3].map(i => (
        <div key={i} className={styles.skeletonInsight} />
      ))}
    </Column>
  );
}
