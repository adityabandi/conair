'use client';

import { useState } from 'react';
import { Row, Column, Text, Button } from '@umami/react-zen';
import { PersonaOverview } from './PersonaOverview';
import { LiveVisitorFeed } from './LiveVisitorFeed';
import { InsightsList } from './InsightsList';
import styles from './PersonaDashboard.module.css';

interface PersonaDashboardProps {
  websiteId: string;
}

export function PersonaDashboard({ websiteId }: PersonaDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'insights'>('overview');

  return (
    <Column gap="6" className={styles.dashboard}>
      {/* Header */}
      <Row justifyContent="space-between" alignItems="center">
        <Column gap="1">
          <Text size="7" weight="bold">
            Persona Intelligence
          </Text>
          <Text color="muted">
            Understand your visitors and optimize their experience automatically
          </Text>
        </Column>
        <Row gap="2">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'live' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('live')}
          >
            Live Feed
          </Button>
          <Button
            variant={activeTab === 'insights' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </Button>
        </Row>
      </Row>

      {/* Content */}
      {activeTab === 'overview' && <PersonaOverview websiteId={websiteId} />}
      {activeTab === 'live' && <LiveVisitorFeed websiteId={websiteId} />}
      {activeTab === 'insights' && <InsightsList websiteId={websiteId} />}
    </Column>
  );
}
