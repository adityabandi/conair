'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Row, Column, Text, Button } from '@/components/zen';
import { useApi } from '@/components/hooks/useApi';
import { Sparkline } from '@/components/charts/Sparkline';
import styles from './InsightsPage.module.css';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
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

const INSIGHT_ICONS = {
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
  'explorer': { icon: '🧭', color: '#6B7280', label: 'Explorers' },
};

// Mock data
const MOCK_INSIGHTS: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    impact: 'high',
    title: 'Value Seekers drop off on pricing page',
    description: '68% of visitors identified as Value Seekers leave within 10 seconds of viewing the pricing page. Consider showing comparison tables or ROI calculators.',
    metric: 'Bounce Rate',
    metricValue: '68%',
    metricChange: 12,
    chartData: [54, 58, 62, 60, 65, 68, 68],
    persona: 'value-seeker',
    confidence: 94,
    createdAt: '2024-01-15T10:30:00Z',
    actions: [
      { id: 'a1', label: 'Create A/B Test', type: 'primary', action: 'create_experiment' },
      { id: 'a2', label: 'Add Content Variant', type: 'secondary', action: 'create_variant' },
    ],
  },
  {
    id: '2',
    type: 'recommendation',
    impact: 'high',
    title: 'Trust Seekers convert 3x more with testimonials',
    description: 'Pages with customer testimonials show 3.2x higher conversion for Trust Seeker personas. Consider adding testimonials to your landing and pricing pages.',
    metric: 'Conversion Lift',
    metricValue: '+320%',
    metricChange: 320,
    chartData: [1.2, 1.5, 2.1, 2.8, 3.0, 3.2, 3.2],
    persona: 'trust-seeker',
    confidence: 91,
    createdAt: '2024-01-15T09:15:00Z',
    actions: [
      { id: 'a3', label: 'Add Testimonials', type: 'primary', action: 'create_variant' },
      { id: 'a4', label: 'View Details', type: 'secondary', action: 'view_details' },
    ],
  },
  {
    id: '3',
    type: 'trend',
    impact: 'medium',
    title: 'Ready Buyers increasing on weekends',
    description: 'We\'ve detected 40% more Ready Buyer personas visiting on weekends. Consider running targeted campaigns during this high-intent period.',
    metric: 'Weekend Traffic',
    metricValue: '+40%',
    metricChange: 40,
    chartData: [100, 105, 110, 125, 130, 140, 140],
    persona: 'ready-buyer',
    confidence: 87,
    createdAt: '2024-01-14T16:45:00Z',
    actions: [
      { id: 'a5', label: 'Schedule Campaign', type: 'primary', action: 'create_experiment' },
      { id: 'a6', label: 'Dismiss', type: 'secondary', action: 'dismiss' },
    ],
  },
  {
    id: '4',
    type: 'warning',
    impact: 'medium',
    title: 'Mobile conversion significantly lower',
    description: 'Mobile visitors convert at 0.8% vs 2.4% desktop. Solution Seekers on mobile are particularly affected—consider optimizing mobile product comparison.',
    metric: 'Mobile Gap',
    metricValue: '-67%',
    metricChange: -67,
    chartData: [2.4, 2.3, 2.2, 1.5, 1.0, 0.9, 0.8],
    persona: 'solution-seeker',
    confidence: 96,
    createdAt: '2024-01-14T11:20:00Z',
    actions: [
      { id: 'a7', label: 'View Mobile Data', type: 'primary', action: 'view_details' },
      { id: 'a8', label: 'Create Mobile Variant', type: 'secondary', action: 'create_variant' },
    ],
  },
];

export function InsightsPage() {
  const { websiteId } = useParams();
  const [filter, setFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredInsights = MOCK_INSIGHTS.filter(insight => {
    if (filter === 'all') return true;
    if (filter === 'high') return insight.impact === 'high';
    return insight.type === filter;
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Column gap="1">
          <h1 className={styles.title}>AI Insights</h1>
          <p className={styles.subtitle}>
            Actionable recommendations powered by persona behavior analysis
          </p>
        </Column>
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Analyzing...' : '✨ Generate New Insights'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>💡</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>{MOCK_INSIGHTS.length}</span>
            <span className={styles.summaryLabel}>Active Insights</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>🎯</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>
              {MOCK_INSIGHTS.filter(i => i.impact === 'high').length}
            </span>
            <span className={styles.summaryLabel}>High Impact</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>✅</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>12</span>
            <span className={styles.summaryLabel}>Applied This Month</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>📈</div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryValue}>+18%</span>
            <span className={styles.summaryLabel}>Conversion Lift</span>
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
          className={`${styles.filterButton} ${filter === 'opportunity' ? styles.filterActive : ''}`}
          onClick={() => setFilter('opportunity')}
        >
          💡 Opportunities
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'recommendation' ? styles.filterActive : ''}`}
          onClick={() => setFilter('recommendation')}
        >
          ✨ Recommendations
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'warning' ? styles.filterActive : ''}`}
          onClick={() => setFilter('warning')}
        >
          ⚠️ Warnings
        </button>
      </div>

      {/* Insights List */}
      <div className={styles.insightsList}>
        {filteredInsights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔍</span>
          <h3 className={styles.emptyTitle}>No insights found</h3>
          <p className={styles.emptyDescription}>
            Try adjusting your filters or generate new insights from your visitor data.
          </p>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const [isExpanded, setIsExpanded] = useState(false);
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
          <span className={styles.confidenceBadge}>
            {insight.confidence}% confident
          </span>
        </Row>
        <span className={styles.timestamp}>
          {new Date(insight.createdAt).toLocaleDateString()}
        </span>
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
