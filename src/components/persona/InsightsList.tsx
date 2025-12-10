'use client';

import { Row, Column, Text, Button } from '@/components/zen';
import { useApi } from '@/components/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import styles from './PersonaDashboard.module.css';

interface InsightsListProps {
  websiteId: string;
}

const IMPACT_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6B7280',
};

// Mock insights for demo
const MOCK_INSIGHTS = [
  {
    id: 'i1',
    title: 'Ready Buyers are dropping off at checkout',
    description: 'High-intent visitors identified as "Ready Buyers" have a 34% cart abandonment rate. Consider simplifying the checkout flow or adding trust signals like security badges and money-back guarantees.',
    impact: 'high',
    confidence: 0.92,
    actionType: 'optimize-checkout',
    persona: 'ready-buyer',
  },
  {
    id: 'i2',
    title: 'Value Seekers respond well to ROI calculators',
    description: 'Visitors classified as "Value Seekers" spend 3x longer on pages with ROI calculators. Add an interactive calculator to your pricing page to improve conversion.',
    impact: 'high',
    confidence: 0.87,
    actionType: 'add-calculator',
    persona: 'value-seeker',
  },
  {
    id: 'i3',
    title: 'Trust Seekers need more social proof',
    description: 'Trust-seeking visitors exit after viewing testimonials but before converting. Consider adding case studies, customer logos, or video testimonials to build credibility.',
    impact: 'medium',
    confidence: 0.84,
    actionType: 'add-social-proof',
    persona: 'trust-seeker',
  },
  {
    id: 'i4',
    title: 'Mobile experience needs optimization',
    description: '42% of your high-intent visitors are on mobile, but conversion rate is 60% lower than desktop. Review mobile checkout flow and page load times.',
    impact: 'medium',
    confidence: 0.79,
    actionType: 'optimize-mobile',
    persona: null,
  },
  {
    id: 'i5',
    title: 'Solution Seekers engage with feature comparisons',
    description: 'Visitors looking for solutions spend significant time comparing features. A side-by-side competitor comparison table could improve their conversion path.',
    impact: 'medium',
    confidence: 0.81,
    actionType: 'add-comparison',
    persona: 'solution-seeker',
  },
  {
    id: 'i6',
    title: 'Explorers can be nurtured with email capture',
    description: 'Low-intent "Explorer" visitors rarely convert on first visit. Implement an exit-intent popup offering valuable content in exchange for email to nurture them.',
    impact: 'low',
    confidence: 0.76,
    actionType: 'add-email-capture',
    persona: 'explorer',
  },
];

export function InsightsList({ websiteId }: InsightsListProps) {
  const { get, useQuery } = useApi();
  const queryClient = useQueryClient();
  const queryKey = ['insights', websiteId];

  const { data: apiData, isLoading } = useQuery({
    queryKey,
    queryFn: () => get(`/websites/${websiteId}/insights`),
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  const handleApply = async (insightId: string) => {
    await fetch(`/api/websites/${websiteId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'apply', insightId }),
    });
    refetch();
  };

  const handleDismiss = async (insightId: string) => {
    await fetch(`/api/websites/${websiteId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss', insightId }),
    });
    refetch();
  };

  const handleGenerate = async () => {
    await fetch(`/api/websites/${websiteId}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate' }),
    });
    refetch();
  };

  if (isLoading) return <InsightsSkeleton />;

  // Use mock data if API doesn't return insights
  const insights = apiData?.insights?.length > 0 ? apiData.insights : MOCK_INSIGHTS;

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
          <Button variant="quiet" onClick={onDismiss}>
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
