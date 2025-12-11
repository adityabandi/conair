'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Row, Column, Button } from '@/components/zen';
import { useApi } from '@/components/hooks/useApi';
import { Sparkline } from '@/components/charts/Sparkline';
import styles from './InsightsPage.module.css';

interface Insight {
  id: string;
  type: string;
  impact: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: string;
  metricValue?: string;
  metricChange?: number;
  chartData?: number[];
  actions?: InsightAction[];
  persona?: string;
  confidence: number;
  createdAt: string;
}

interface InsightAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  action: 'create_experiment' | 'create_variant' | 'dismiss' | 'view_details';
}

const INSIGHT_ICONS: Record<string, string> = {
  bounce_page: '🚪',
  conversion_path: '🛤️',
  engagement_pattern: '📊',
  page_performance: '⚡',
  opportunity: '💡',
  warning: '⚠️',
  trend: '📈',
  recommendation: '✨',
};

const IMPACT_CONFIG = {
  high: { label: 'High Impact', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
  medium: { label: 'Medium Impact', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  low: { label: 'Low Impact', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
};

const PERSONA_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  'value-seeker': { icon: '💰', color: '#10B981', label: 'Value Seekers' },
  'solution-seeker': { icon: '🔧', color: '#3B82F6', label: 'Solution Seekers' },
  'trust-seeker': { icon: '⭐', color: '#8B5CF6', label: 'Trust Seekers' },
  'ready-buyer': { icon: '🎯', color: '#EF4444', label: 'Ready Buyers' },
  explorer: { icon: '🧭', color: '#6B7280', label: 'Explorers' },
};

export function InsightsPage() {
  const { websiteId } = useParams();
  const [filter, setFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { get, post, useQuery } = useApi();

  const {
    data,
    refetch,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['insights', websiteId],
    queryFn: () => get(`/websites/${websiteId}/insights`),
  });

  const insights = data?.insights || [];
  const summary = data?.summary || { high: 0, medium: 0, low: 0 };

  const filteredInsights = insights.filter((insight: Insight) => {
    if (filter === 'all') return true;
    if (filter === 'high') return insight.impact === 'high';
    return insight.type === filter;
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      await post(`/websites/${websiteId}/insights`, { action: 'generate' });
      refetch();
    } catch {
      setGenerateError('Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <InsightsPageSkeleton />;
  }

  if (queryError) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⚠️</span>
          <h3 className={styles.emptyTitle}>Failed to load insights</h3>
          <p className={styles.emptyDescription}>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Error Banner */}
      {generateError && (
        <div className={styles.errorBanner}>
          <span>{generateError}</span>
          <button onClick={() => setGenerateError(null)} className={styles.errorClose}>
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <Column gap="1">
          <h1 className={styles.title}>AI Insights</h1>
          <p className={styles.subtitle}>
            Actionable recommendations powered by persona behavior analysis
          </p>
        </Column>
        <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Analyzing...' : '✨ Generate New Insights'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>💡</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>{insights.length}</span>
            <span className={styles.summaryLabel}>Active Insights</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🎯</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>{summary.high}</span>
            <span className={styles.summaryLabel}>High Impact</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>⚡</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>{summary.medium}</span>
            <span className={styles.summaryLabel}>Medium Impact</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📊</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>{summary.low}</span>
            <span className={styles.summaryLabel}>Low Impact</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All Insights
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'high' ? styles.filterActive : ''}`}
          onClick={() => setFilter('high')}
        >
          High Impact
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'bounce_page' ? styles.filterActive : ''}`}
          onClick={() => setFilter('bounce_page')}
        >
          🚪 Bounce Issues
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'conversion_path' ? styles.filterActive : ''}`}
          onClick={() => setFilter('conversion_path')}
        >
          🛤️ Conversion Paths
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'engagement_pattern' ? styles.filterActive : ''}`}
          onClick={() => setFilter('engagement_pattern')}
        >
          📊 Engagement
        </button>
      </div>

      {/* Insights List */}
      <div className={styles.insightsList}>
        {filteredInsights.map((insight: Insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <h3 className={styles.emptyTitle}>No insights found</h3>
          <p className={styles.emptyDescription}>
            {insights.length === 0
              ? 'Click "Generate New Insights" to analyze your visitor data and get actionable recommendations.'
              : 'Try adjusting your filters or generate new insights from your visitor data.'}
          </p>
          {insights.length === 0 && (
            <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Analyzing...' : '✨ Generate Insights'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const impactConfig = IMPACT_CONFIG[insight.impact];
  const personaConfig = insight.persona ? PERSONA_CONFIG[insight.persona] : null;

  return (
    <div className={styles.insightCard}>
      <div className={styles.insightHeader}>
        <Row gap="3" alignItems="center">
          <span className={styles.insightIcon}>{INSIGHT_ICONS[insight.type]}</span>
          <span
            className={styles.impactBadge}
            style={{ backgroundColor: impactConfig.bg, color: impactConfig.color }}
          >
            {impactConfig.label}
          </span>
          {personaConfig && (
            <span
              className={styles.personaBadge}
              style={{ backgroundColor: `${personaConfig.color}15`, color: personaConfig.color }}
            >
              {personaConfig.icon} {personaConfig.label}
            </span>
          )}
          <span className={styles.confidenceBadge}>{insight.confidence}% confident</span>
        </Row>
        <span className={styles.timestamp}>{new Date(insight.createdAt).toLocaleDateString()}</span>
      </div>

      <div className={styles.insightContent}>
        <h3 className={styles.insightTitle}>{insight.title}</h3>
        <p className={styles.insightDescription}>{insight.description}</p>
      </div>

      {/* Metric with Chart */}
      {insight.metric && (
        <div className={styles.metricSection}>
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>{insight.metric}</span>
            <Row gap="2" alignItems="baseline">
              <span className={styles.metricValue}>{insight.metricValue}</span>
              {insight.metricChange && (
                <span
                  className={styles.metricChange}
                  style={{ color: insight.metricChange > 0 ? '#10B981' : '#EF4444' }}
                >
                  {insight.metricChange > 0 ? '↑' : '↓'} vs last period
                </span>
              )}
            </Row>
          </div>
          {insight.chartData && (
            <Sparkline
              data={insight.chartData}
              width={140}
              height={40}
              color={insight.metricChange && insight.metricChange > 0 ? '#10B981' : '#EF4444'}
              showDots
            />
          )}
        </div>
      )}

      {/* Actions */}
      {insight.actions && insight.actions.length > 0 && (
        <div className={styles.actionsSection}>
          {insight.actions.map(action => (
            <button
              key={action.id}
              className={`${styles.actionButton} ${action.type === 'primary' ? styles.actionPrimary : styles.actionSecondary}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InsightsPageSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Column gap="1">
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSubtitle} />
        </Column>
        <div className={styles.skeletonButton} />
      </div>
      <div className={styles.summaryGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
      <div className={styles.filters}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonFilter} />
        ))}
      </div>
      <div className={styles.insightsList}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.skeletonInsight} />
        ))}
      </div>
    </div>
  );
}
