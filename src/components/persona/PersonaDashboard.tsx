'use client';

import { useState } from 'react';
import { Row, Column, Text } from '@/components/zen';
import { PersonaOverview } from './PersonaOverview';
import { LiveVisitorFeed } from './LiveVisitorFeed';
import { InsightsList } from './InsightsList';
import { ContentEditor } from './ContentEditor';
import styles from './PersonaDashboard.module.css';

interface PersonaDashboardProps {
  websiteId: string;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'live', label: 'Live Feed', icon: '⚡' },
  { id: 'insights', label: 'AI Insights', icon: '💡' },
  { id: 'personalize', label: 'Personalize', icon: '✨' },
] as const;

export function PersonaDashboard({ websiteId }: PersonaDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'insights' | 'personalize'>(
    'overview',
  );

  return (
    <Column gap="6" className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <Column gap="2">
          <Row gap="3" alignItems="center">
            <span className={styles.headerIcon}>🧠</span>
            <Text size="7" weight="bold">
              Persona Intelligence
            </Text>
          </Row>
          <Text color="muted" size="3">
            AI-powered visitor analysis and conversion optimization
          </Text>
        </Column>

        <div className={styles.tabsContainer}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.dashboardContent}>
        {activeTab === 'overview' && <PersonaOverview websiteId={websiteId} />}
        {activeTab === 'live' && <LiveVisitorFeed websiteId={websiteId} />}
        {activeTab === 'insights' && <InsightsList websiteId={websiteId} />}
        {activeTab === 'personalize' && <ContentEditor websiteId={websiteId} />}
      </div>
    </Column>
  );
}
