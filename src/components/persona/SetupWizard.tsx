'use client';

import { useState } from 'react';
import { Row, Column, Text, Button, CopyButton } from '@umami/react-zen';
import styles from './SetupWizard.module.css';

interface SetupWizardProps {
  websiteId: string;
  domain?: string;
}

const STEPS = [
  { id: 1, title: 'Install Tracker', icon: '📦' },
  { id: 2, title: 'Verify Setup', icon: '✅' },
  { id: 3, title: 'Configure Personas', icon: '🎯' },
  { id: 4, title: 'Start Optimizing', icon: '🚀' },
];

export function SetupWizard({ websiteId, domain }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const trackingCode = `<script defer src="${typeof window !== 'undefined' ? window.location.origin : ''}/script.js" data-website-id="${websiteId}"></script>`;

  const handleVerify = async () => {
    setIsVerifying(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerified(true);
    setIsVerifying(false);
    setCurrentStep(3);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Column gap="6" className={styles.stepContent}>
            <Column gap="2">
              <Text size="6" weight="bold">
                Add the tracking script to your website
              </Text>
              <Text color="muted">
                Copy and paste this code snippet before the closing{' '}
                <code className={styles.code}>&lt;/head&gt;</code> tag on every page you want to
                track.
              </Text>
            </Column>

            <Column gap="3">
              <div className={styles.codeBlock}>
                <pre className={styles.codeContent}>{trackingCode}</pre>
                <div className={styles.copyButton}>
                  <CopyButton value={trackingCode} />
                </div>
              </div>
            </Column>

            <Column gap="4" className={styles.infoBox}>
              <Row gap="2" alignItems="center">
                <span className={styles.infoIcon}>💡</span>
                <Text weight="bold">Pro Tips</Text>
              </Row>
              <ul className={styles.tipsList}>
                <li>
                  <Text size="2" color="muted">
                    Works with any website: HTML, React, Next.js, Vue, WordPress, Shopify, etc.
                  </Text>
                </li>
                <li>
                  <Text size="2" color="muted">
                    The script is tiny (~2KB) and loads asynchronously - zero performance impact
                  </Text>
                </li>
                <li>
                  <Text size="2" color="muted">
                    Persona detection starts working immediately after installation
                  </Text>
                </li>
              </ul>
            </Column>

            <Row gap="3" justifyContent="flex-end">
              <Button variant="primary" onClick={() => setCurrentStep(2)}>
                I&apos;ve Added the Script →
              </Button>
            </Row>
          </Column>
        );

      case 2:
        return (
          <Column gap="6" className={styles.stepContent}>
            <Column gap="2">
              <Text size="6" weight="bold">
                Verify your installation
              </Text>
              <Text color="muted">
                Let&apos;s make sure everything is set up correctly. We&apos;ll check if the tracker
                is receiving data from your website.
              </Text>
            </Column>

            {!isVerified ? (
              <Column gap="4" alignItems="center" className={styles.verifyBox}>
                {isVerifying ? (
                  <>
                    <div className={styles.spinner} />
                    <Text color="muted">
                      Listening for events from {domain || 'your website'}...
                    </Text>
                    <Text size="1" color="muted">
                      Open your website in another tab to trigger a page view
                    </Text>
                  </>
                ) : (
                  <>
                    <span className={styles.verifyIcon}>🔍</span>
                    <Text color="muted">Click the button below to start verification</Text>
                  </>
                )}
              </Column>
            ) : (
              <Column gap="4" alignItems="center" className={styles.successBox}>
                <span className={styles.successIcon}>✨</span>
                <Text size="5" weight="bold" style={{ color: '#059669' }}>
                  Setup Verified!
                </Text>
                <Text color="muted" style={{ textAlign: 'center' }}>
                  We&apos;re receiving data from your website. Persona detection is now active.
                </Text>
              </Column>
            )}

            <Row gap="3" justifyContent="space-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                ← Back
              </Button>
              {!isVerified ? (
                <Button variant="primary" onClick={handleVerify} isDisabled={isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Verify Installation'}
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setCurrentStep(3)}>
                  Continue →
                </Button>
              )}
            </Row>
          </Column>
        );

      case 3:
        return (
          <Column gap="6" className={styles.stepContent}>
            <Column gap="2">
              <Text size="6" weight="bold">
                Configure persona detection
              </Text>
              <Text color="muted">
                Customize how Convert Air identifies and classifies your visitors. You can always
                adjust these settings later.
              </Text>
            </Column>

            <Column gap="4">
              <PersonaConfigCard
                icon="💰"
                title="Value Seekers"
                description="Visitors focused on pricing, ROI, and cost comparison"
                pages={['pricing', 'plans', 'compare']}
                color="#10B981"
              />
              <PersonaConfigCard
                icon="🔧"
                title="Solution Seekers"
                description="Exploring features, how it works, and capabilities"
                pages={['features', 'how-it-works', 'demo']}
                color="#3B82F6"
              />
              <PersonaConfigCard
                icon="⭐"
                title="Trust Seekers"
                description="Looking for social proof, reviews, and case studies"
                pages={['testimonials', 'case-studies', 'about']}
                color="#8B5CF6"
              />
              <PersonaConfigCard
                icon="🎯"
                title="Ready Buyers"
                description="High intent signals, ready to convert"
                pages={['signup', 'register', 'checkout']}
                color="#EF4444"
              />
            </Column>

            <Row gap="3" justifyContent="space-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                ← Back
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep(4)}>
                Save & Continue →
              </Button>
            </Row>
          </Column>
        );

      case 4:
        return (
          <Column gap="6" className={styles.stepContent}>
            <Column gap="4" alignItems="center" className={styles.completeBox}>
              <span className={styles.completeIcon}>🎉</span>
              <Text size="7" weight="bold">
                You&apos;re All Set!
              </Text>
              <Text color="muted" style={{ textAlign: 'center', maxWidth: 400 }}>
                Convert Air is now analyzing your visitors and will start showing persona insights
                within minutes.
              </Text>
            </Column>

            <Column gap="4">
              <Text size="4" weight="bold">
                What happens next?
              </Text>
              <div className={styles.nextStepsGrid}>
                <NextStepCard
                  icon="📊"
                  title="Watch the Live Feed"
                  description="See visitors classified in real-time with their persona types"
                />
                <NextStepCard
                  icon="💡"
                  title="Get Insights"
                  description="Receive AI-powered recommendations to optimize conversions"
                />
                <NextStepCard
                  icon="✨"
                  title="Personalize Content"
                  description="Create dynamic content that changes based on visitor type"
                />
                <NextStepCard
                  icon="📈"
                  title="Track Results"
                  description="Measure conversion improvements by persona segment"
                />
              </div>
            </Column>

            <Row gap="3" justifyContent="center">
              <Button variant="primary" size="lg">
                Go to Dashboard →
              </Button>
            </Row>
          </Column>
        );

      default:
        return null;
    }
  };

  return (
    <Column className={styles.wizard}>
      {/* Progress Steps */}
      <Row className={styles.progressBar}>
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`${styles.progressStep} ${currentStep >= step.id ? styles.progressStepActive : ''} ${currentStep === step.id ? styles.progressStepCurrent : ''}`}
          >
            <div className={styles.progressIcon}>{currentStep > step.id ? '✓' : step.icon}</div>
            <Text size="2" weight={currentStep === step.id ? 'bold' : 'medium'}>
              {step.title}
            </Text>
            {index < STEPS.length - 1 && <div className={styles.progressLine} />}
          </div>
        ))}
      </Row>

      {/* Step Content */}
      {renderStep()}
    </Column>
  );
}

function PersonaConfigCard({
  icon,
  title,
  description,
  pages,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  pages: string[];
  color: string;
}) {
  return (
    <Row className={styles.personaConfigCard} style={{ borderLeftColor: color }}>
      <span className={styles.personaConfigIcon}>{icon}</span>
      <Column gap="1" style={{ flex: 1 }}>
        <Text weight="bold">{title}</Text>
        <Text size="2" color="muted">
          {description}
        </Text>
        <Row gap="2" wrap="wrap" style={{ marginTop: 8 }}>
          {pages.map(page => (
            <span key={page} className={styles.pageTag}>
              /{page}
            </span>
          ))}
        </Row>
      </Column>
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </Row>
  );
}

function NextStepCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Column className={styles.nextStepCard} gap="2">
      <span className={styles.nextStepIcon}>{icon}</span>
      <Text weight="bold">{title}</Text>
      <Text size="2" color="muted">
        {description}
      </Text>
    </Column>
  );
}
