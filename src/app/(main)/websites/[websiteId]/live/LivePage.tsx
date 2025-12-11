'use client';

import { useParams } from 'next/navigation';
import { Row, Column } from '@/components/zen';
import { LiveVisitorFeed } from '@/components/persona/LiveVisitorFeed';
import { useApi } from '@/components/hooks/useApi';
import styles from './LivePage.module.css';

export function LivePage() {
  const { websiteId } = useParams();
  const { get, useQuery } = useApi();

  // Fetch live stats
  const { data } = useQuery({
    queryKey: ['live-stats', websiteId],
    queryFn: () => get(`/websites/${websiteId}/live`),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const summary = data?.summary || { total: 0, highIntent: 0, distribution: {} };
  const personasDetected = Object.keys(summary.distribution || {}).filter(
    k => summary.distribution[k] > 0 && k !== 'explorer',
  ).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Column gap="1">
          <Row gap="3" alignItems="center">
            <span className={styles.liveDot} />
            <h1 className={styles.title}>Live Visitor Feed</h1>
          </Row>
          <p className={styles.subtitle}>
            Watch visitors in real-time with AI-powered persona detection
          </p>
        </Column>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{summary.total}</span>
          <span className={styles.statLabel}>Active Now</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>
            {Object.values(summary.distribution || {}).reduce(
              (a: number, b) => a + (typeof b === 'number' ? b : 0),
              0,
            )}
          </span>
          <span className={styles.statLabel}>Today&apos;s Visitors</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{personasDetected}</span>
          <span className={styles.statLabel}>Personas Detected</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{summary.highIntent}</span>
          <span className={styles.statLabel}>High Intent</span>
        </div>
      </div>

      {/* Live Feed */}
      <div className={styles.feedContainer}>
        <LiveVisitorFeed websiteId={websiteId as string} />
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendTitle}>Persona Types:</span>
        <div className={styles.legendItems}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#10B981' }} />
            Value Seeker
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#3B82F6' }} />
            Solution Seeker
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#8B5CF6' }} />
            Trust Seeker
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#EF4444' }} />
            Ready Buyer
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#6B7280' }} />
            Explorer
          </span>
        </div>
      </div>
    </div>
  );
}
