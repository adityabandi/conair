'use client';

import { useState, useEffect } from 'react';
import { Row, Column, Text, Button } from '@umami/react-zen';
import { useApi } from '@/components/hooks/useApi';
import styles from './PersonaDashboard.module.css';

interface LiveVisitorFeedProps {
  websiteId: string;
}

const PERSONA_ICONS: Record<string, string> = {
  'value-seeker': '💰',
  'solution-seeker': '🔧',
  'trust-seeker': '⭐',
  'ready-buyer': '🎯',
  explorer: '🧭',
};

const PERSONA_COLORS: Record<string, string> = {
  'value-seeker': '#10B981',
  'solution-seeker': '#3B82F6',
  'trust-seeker': '#8B5CF6',
  'ready-buyer': '#EF4444',
  explorer: '#6B7280',
};

export function LiveVisitorFeed({ websiteId }: LiveVisitorFeedProps) {
  const { data, isLoading, refetch } = useApi(`/api/websites/${websiteId}/live`);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refetch, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  if (isLoading) {
    return <LiveFeedSkeleton />;
  }

  const visitors = data?.visitors || [];
  const summary = data?.summary || { total: 0, highIntent: 0, distribution: {} };

  return (
    <Column gap="6">
      {/* Live Header */}
      <Row justifyContent="space-between" alignItems="center">
        <Row gap="3" alignItems="center">
          <span className={styles.liveDot} />
          <Text size="5" weight="bold">
            {summary.total} visitors on your site
          </Text>
          {summary.highIntent > 0 && (
            <span className={styles.highIntentBadge}>🎯 {summary.highIntent} high-intent</span>
          )}
        </Row>
        <Row gap="2">
          <Button variant="secondary" onClick={refetch}>
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'primary' : 'secondary'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </Row>
      </Row>

      {/* Visitor Stream */}
      <Column gap="3" className={styles.visitorStream}>
        {visitors.length === 0 ? (
          <Column alignItems="center" padding="8" gap="3">
            <Text size="6">🔍</Text>
            <Text color="muted">No active visitors right now</Text>
            <Text color="muted" size="1">
              Visitors will appear here when they&apos;re on your site
            </Text>
          </Column>
        ) : (
          visitors.map((visitor: any) => <VisitorCard key={visitor.id} visitor={visitor} />)
        )}
      </Column>
    </Column>
  );
}

function VisitorCard({ visitor }: { visitor: any }) {
  const icon = PERSONA_ICONS[visitor.persona] || '🧭';
  const color = PERSONA_COLORS[visitor.persona] || '#6B7280';
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Row
      className={styles.visitorCard}
      gap="4"
      alignItems="center"
      padding="4"
      style={{ borderLeftColor: color }}
    >
      {/* Persona Icon */}
      <span className={styles.visitorIcon}>{icon}</span>

      {/* Main Info */}
      <Column gap="1" style={{ flex: 1 }}>
        <Row gap="2" alignItems="center">
          <Text weight="bold" style={{ color }}>
            {formatPersonaLabel(visitor.persona)}
          </Text>
          <span className={styles.confidenceBadge}>{visitor.confidence}% confident</span>
          {visitor.isHighIntent && <span className={styles.intentBadge}>High Intent</span>}
        </Row>
        <Row gap="2" alignItems="center">
          <Text color="muted" size="2">
            {visitor.currentPage || 'Unknown page'}
          </Text>
          {visitor.referrer && (
            <>
              <Text color="muted" size="2">
                •
              </Text>
              <Text color="muted" size="2">
                from {formatReferrer(visitor.referrer)}
              </Text>
            </>
          )}
        </Row>
      </Column>

      {/* Journey */}
      <Column gap="1" alignItems="flex-end">
        <Row gap="1">
          {(visitor.pageHistory || []).slice(-3).map((page: string, i: number) => (
            <span key={i} className={styles.journeyStep}>
              {page.split('/').pop() || '/'}
            </span>
          ))}
        </Row>
        <Text color="muted" size="1">
          {visitor.pageHistory?.length || 1} pages • {formatDuration(visitor.sessionDuration)}
        </Text>
      </Column>

      {/* Engagement Score */}
      <Column alignItems="center" gap="1">
        <div
          className={styles.engagementRing}
          style={{
            background: `conic-gradient(${color} ${(visitor.engagementScore || 0) * 3.6}deg, #e5e7eb ${(visitor.engagementScore || 0) * 3.6}deg)`,
          }}
        >
          <span className={styles.engagementValue}>{visitor.engagementScore || 0}</span>
        </div>
        <Text color="muted" size="1">
          engagement
        </Text>
      </Column>

      {/* Device & Location */}
      <Column alignItems="flex-end" gap="1">
        <Row gap="2">
          {visitor.device && (
            <span className={styles.deviceIcon}>
              {visitor.device === 'mobile' ? '📱' : visitor.device === 'tablet' ? '📱' : '💻'}
            </span>
          )}
          {visitor.country && (
            <span className={styles.countryFlag}>{getCountryFlag(visitor.country)}</span>
          )}
        </Row>
        <Text color="muted" size="1">
          {getTimeAgo(visitor.lastSeen)}
        </Text>
      </Column>
    </Row>
  );
}

function LiveFeedSkeleton() {
  return (
    <Column gap="4">
      <Row gap="3" alignItems="center">
        <div className={styles.skeletonDot} />
        <div className={styles.skeletonText} />
      </Row>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={styles.skeletonVisitor} />
      ))}
    </Column>
  );
}

// Helper functions
function formatPersonaLabel(persona: string): string {
  const labels: Record<string, string> = {
    'value-seeker': 'Value Seeker',
    'solution-seeker': 'Solution Seeker',
    'trust-seeker': 'Trust Seeker',
    'ready-buyer': 'Ready Buyer',
    explorer: 'Explorer',
  };
  return labels[persona] || persona;
}

function formatReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    return url.hostname.replace('www.', '');
  } catch {
    return referrer.slice(0, 20);
  }
}

function getCountryFlag(code: string): string {
  const offset = 127397;
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
}

function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1m ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
