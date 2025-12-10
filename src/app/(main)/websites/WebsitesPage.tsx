'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WebsitesDataTable } from './WebsitesDataTable';
import { WebsiteAddButton } from './WebsiteAddButton';
import { useMessages, useNavigation, useApi } from '@/components/hooks';
import { Column, Row, Text } from '@/components/zen';
import { PageHeader } from '@/components/common/PageHeader';
import { Panel } from '@/components/common/Panel';
import { PageBody } from '@/components/common/PageBody';
import Link from 'next/link';
import styles from './WebsitesPage.module.css';

export function WebsitesPage() {
  const { teamId } = useNavigation();
  const { formatMessage, labels } = useMessages();
  const { data, isLoading } = useApi('/api/websites');
  const router = useRouter();

  // Check if user has no websites
  const hasNoWebsites = !isLoading && (!data?.data || data.data.length === 0);

  // Redirect to welcome on first visit with no websites
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('convertair.seen-welcome');
    if (hasNoWebsites && !hasSeenWelcome) {
      localStorage.setItem('convertair.seen-welcome', 'true');
      router.push('/welcome');
    }
  }, [hasNoWebsites, router]);

  if (hasNoWebsites) {
    return (
      <PageBody>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIcon}>🚀</div>
            <h1 className={styles.emptyTitle}>Welcome to Signal</h1>
            <p className={styles.emptyDescription}>
              Add your first website to start detecting visitor personas
              and optimizing conversions with AI.
            </p>

            <div className={styles.emptyCtas}>
              <WebsiteAddButton teamId={teamId} variant="primary" size="lg" />
              <Link href="/welcome" className={styles.learnMore}>
                Learn how it works →
              </Link>
            </div>

            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⚡</span>
                <div>
                  <strong>Instant Detection</strong>
                  <p>Know visitor intent within 2 seconds</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🧠</span>
                <div>
                  <strong>ML-Powered</strong>
                  <p>18+ behavioral signals analyzed</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>📊</span>
                <div>
                  <strong>Actionable Insights</strong>
                  <p>AI-generated recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    );
  }

  return (
    <PageBody>
      <Column gap="6" margin="2">
        <PageHeader title={formatMessage(labels.websites)}>
          <WebsiteAddButton teamId={teamId} />
        </PageHeader>
        <Panel>
          <WebsitesDataTable teamId={teamId} />
        </Panel>
      </Column>
    </PageBody>
  );
}
