'use client';

import { useParams } from 'next/navigation';
import { Row, Column, Text } from '@/components/zen';
import { LiveVisitorFeed } from '@/components/persona/LiveVisitorFeed';
import styles from './LivePage.module.css';

export function LivePage() {
  const { websiteId } = useParams();

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
          <span className={styles.statValue}>—</span>
          <span className={styles.statLabel}>Active Now</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>—</span>
          <span className={styles.statLabel}>Today's Visitors</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>—</span>
          <span className={styles.statLabel}>Personas Detected</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>—</span>
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
