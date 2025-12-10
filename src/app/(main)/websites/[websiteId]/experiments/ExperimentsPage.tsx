'use client';

import { useState } from 'react';
import { Row, Column, Text, Button } from '@/components/zen';
import { useParams } from 'next/navigation';
import { useApi } from '@/components/hooks/useApi';
import { Sparkline, TrendBadge } from '@/components/charts/Sparkline';
import styles from './ExperimentsPage.module.css';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  persona: string;
  variants: ExperimentVariant[];
  startDate?: string;
  endDate?: string;
  traffic: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  winner?: string;
}

interface ExperimentVariant {
  id: string;
  name: string;
  traffic: number;
  conversions: number;
  conversionRate: number;
  isControl: boolean;
  chartData: number[];
}

const PERSONA_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  'value-seeker': { icon: '💰', color: '#10B981', label: 'Value Seekers' },
  'solution-seeker': { icon: '🔧', color: '#3B82F6', label: 'Solution Seekers' },
  'trust-seeker': { icon: '⭐', color: '#8B5CF6', label: 'Trust Seekers' },
  'ready-buyer': { icon: '🎯', color: '#EF4444', label: 'Ready Buyers' },
  'explorer': { icon: '🧭', color: '#6B7280', label: 'Explorers' },
  'all': { icon: '👥', color: '#64748B', label: 'All Visitors' },
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
  running: { label: 'Running', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  paused: { label: 'Paused', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  completed: { label: 'Completed', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
};

// Mock data - in production this would come from the API
const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: '1',
    name: 'Pricing CTA for Value Seekers',
    description: 'Testing "Start Free Trial" vs "See Pricing" for value-seeking visitors',
    status: 'running',
    persona: 'value-seeker',
    traffic: 4523,
    conversions: 234,
    conversionRate: 5.17,
    confidence: 92,
    variants: [
      {
        id: 'control',
        name: 'Control: Start Free Trial',
        traffic: 2261,
        conversions: 98,
        conversionRate: 4.33,
        isControl: true,
        chartData: [4.1, 4.2, 4.0, 4.3, 4.5, 4.2, 4.33],
      },
      {
        id: 'variant-a',
        name: 'Variant A: See Pricing',
        traffic: 2262,
        conversions: 136,
        conversionRate: 6.01,
        isControl: false,
        chartData: [5.2, 5.5, 5.8, 5.9, 6.2, 5.8, 6.01],
      },
    ],
    startDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Social Proof for Trust Seekers',
    description: 'Testing customer testimonials vs company logos on the landing page',
    status: 'completed',
    persona: 'trust-seeker',
    traffic: 8901,
    conversions: 623,
    conversionRate: 7.0,
    confidence: 98,
    winner: 'variant-a',
    variants: [
      {
        id: 'control',
        name: 'Control: Company Logos',
        traffic: 4450,
        conversions: 267,
        conversionRate: 6.0,
        isControl: true,
        chartData: [5.8, 5.9, 6.1, 5.9, 6.0, 6.0, 6.0],
      },
      {
        id: 'variant-a',
        name: 'Variant A: Customer Testimonials',
        traffic: 4451,
        conversions: 356,
        conversionRate: 8.0,
        isControl: false,
        chartData: [7.2, 7.5, 7.8, 7.9, 8.1, 7.9, 8.0],
      },
    ],
    startDate: '2024-01-01',
    endDate: '2024-01-14',
  },
];

export function ExperimentsPage() {
  const { websiteId } = useParams();
  const [isCreating, setIsCreating] = useState(false);
  const [experiments] = useState<Experiment[]>(MOCK_EXPERIMENTS);

  const runningExperiments = experiments.filter(e => e.status === 'running');
  const completedExperiments = experiments.filter(e => e.status === 'completed');
  const draftExperiments = experiments.filter(e => e.status === 'draft');

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Column gap="1">
          <h1 className={styles.title}>Experiments</h1>
          <p className={styles.subtitle}>
            Run A/B tests targeted at specific visitor personas to optimize conversions
          </p>
        </Column>
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          + New Experiment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🧪</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{runningExperiments.length}</span>
            <span className={styles.statLabel}>Running</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{completedExperiments.length}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>
              {completedExperiments.filter(e => e.winner).length}
            </span>
            <span className={styles.statLabel}>Winners Found</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📈</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>+23%</span>
            <span className={styles.statLabel}>Avg. Lift</span>
          </div>
        </div>
      </div>

      {/* Running Experiments */}
      {runningExperiments.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.liveDot} />
            Running Experiments
          </h2>
          <div className={styles.experimentsList}>
            {runningExperiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Experiments */}
      {completedExperiments.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Completed Experiments</h2>
          <div className={styles.experimentsList}>
            {completedExperiments.map(experiment => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {experiments.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🧪</span>
          <h3 className={styles.emptyTitle}>No experiments yet</h3>
          <p className={styles.emptyDescription}>
            Create your first A/B test to start optimizing for different visitor personas.
            Target specific audiences and measure what works best.
          </p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            Create First Experiment
          </Button>
        </div>
      )}

      {/* Create Experiment Modal */}
      {isCreating && (
        <CreateExperimentModal
          websiteId={websiteId as string}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const personaConfig = PERSONA_CONFIG[experiment.persona] || PERSONA_CONFIG['all'];
  const statusConfig = STATUS_CONFIG[experiment.status];
  const winningVariant = experiment.variants.find(v => v.id === experiment.winner);
  const controlVariant = experiment.variants.find(v => v.isControl);

  // Calculate lift
  const lift = winningVariant && controlVariant
    ? ((winningVariant.conversionRate - controlVariant.conversionRate) / controlVariant.conversionRate) * 100
    : 0;

  return (
    <div className={styles.experimentCard}>
      <div className={styles.experimentHeader}>
        <Row gap="3" alignItems="center">
          <span
            className={styles.personaBadge}
            style={{ backgroundColor: `${personaConfig.color}15`, color: personaConfig.color }}
          >
            {personaConfig.icon} {personaConfig.label}
          </span>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
          {experiment.confidence >= 95 && (
            <span className={styles.confidenceBadge}>
              {experiment.confidence}% Confident
            </span>
          )}
        </Row>
        <div className={styles.experimentActions}>
          {experiment.status === 'running' && (
            <>
              <button className={styles.actionButton}>Pause</button>
              <button className={styles.actionButton}>End</button>
            </>
          )}
          {experiment.status === 'completed' && experiment.winner && (
            <button className={`${styles.actionButton} ${styles.actionPrimary}`}>
              Apply Winner
            </button>
          )}
        </div>
      </div>

      <Column gap="2" className={styles.experimentInfo}>
        <h3 className={styles.experimentName}>{experiment.name}</h3>
        <p className={styles.experimentDescription}>{experiment.description}</p>
      </Column>

      {/* Variants */}
      <div className={styles.variantsGrid}>
        {experiment.variants.map(variant => {
          const isWinner = variant.id === experiment.winner;
          return (
            <div
              key={variant.id}
              className={`${styles.variantCard} ${isWinner ? styles.variantWinner : ''}`}
            >
              {isWinner && <span className={styles.winnerBadge}>Winner</span>}
              <Row justifyContent="space-between" alignItems="flex-start">
                <Column gap="1">
                  <span className={styles.variantName}>
                    {variant.isControl && <span className={styles.controlTag}>Control</span>}
                    {variant.name}
                  </span>
                  <span className={styles.variantTraffic}>
                    {variant.traffic.toLocaleString()} visitors
                  </span>
                </Column>
                <Sparkline
                  data={variant.chartData}
                  width={80}
                  height={28}
                  color={isWinner ? '#10B981' : 'var(--accent)'}
                  showDots
                />
              </Row>

              <Row justifyContent="space-between" alignItems="baseline" className={styles.variantStats}>
                <Column gap="0">
                  <span className={styles.conversionRate}>{variant.conversionRate.toFixed(2)}%</span>
                  <span className={styles.conversionLabel}>Conversion Rate</span>
                </Column>
                <Column gap="0" style={{ textAlign: 'right' }}>
                  <span className={styles.conversionCount}>{variant.conversions}</span>
                  <span className={styles.conversionLabel}>Conversions</span>
                </Column>
              </Row>
            </div>
          );
        })}
      </div>

      {/* Results Summary */}
      {experiment.status === 'completed' && experiment.winner && (
        <div className={styles.resultsSummary}>
          <Row alignItems="center" gap="2">
            <span className={styles.resultIcon}>🎉</span>
            <span className={styles.resultText}>
              <strong>{winningVariant?.name}</strong> outperformed control by{' '}
              <span className={styles.liftValue}>+{lift.toFixed(1)}%</span>
            </span>
          </Row>
        </div>
      )}

      {/* Progress Bar */}
      {experiment.status === 'running' && (
        <div className={styles.progressSection}>
          <Row justifyContent="space-between" alignItems="center">
            <span className={styles.progressLabel}>
              {experiment.traffic.toLocaleString()} visitors tested
            </span>
            <span className={styles.progressLabel}>
              Est. {experiment.confidence >= 95 ? 'complete' : `${Math.round((100 - experiment.confidence) / 5)} days remaining`}
            </span>
          </Row>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(experiment.confidence, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CreateExperimentModal({
  websiteId,
  onClose,
}: {
  websiteId: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: 'all',
    goal: 'conversion',
    selector: '',
    controlContent: '',
    variantContent: '',
    trafficSplit: 50,
  });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Experiment</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        {/* Progress Steps */}
        <div className={styles.modalSteps}>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`${styles.step} ${step >= s ? styles.stepActive : ''}`}
            >
              <span className={styles.stepNumber}>{s}</span>
              <span className={styles.stepLabel}>
                {s === 1 ? 'Setup' : s === 2 ? 'Variants' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.modalContent}>
          {step === 1 && (
            <Column gap="5">
              <Column gap="2">
                <label className={styles.label}>Experiment Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Pricing CTA Test for Value Seekers"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </Column>

              <Column gap="2">
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="What are you testing and why?"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </Column>

              <Column gap="2">
                <label className={styles.label}>Target Persona</label>
                <div className={styles.personaGrid}>
                  {Object.entries(PERSONA_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      className={`${styles.personaOption} ${formData.persona === key ? styles.personaOptionActive : ''}`}
                      style={formData.persona === key ? { borderColor: config.color, backgroundColor: `${config.color}10` } : {}}
                      onClick={() => setFormData({ ...formData, persona: key })}
                    >
                      <span className={styles.personaOptionIcon}>{config.icon}</span>
                      <span className={styles.personaOptionLabel}>{config.label}</span>
                    </button>
                  ))}
                </div>
              </Column>

              <Column gap="2">
                <label className={styles.label}>Goal</label>
                <select
                  className={styles.select}
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="conversion">Conversion (Button Click, Form Submit)</option>
                  <option value="engagement">Engagement (Time on Page, Scroll)</option>
                  <option value="revenue">Revenue (Purchase Value)</option>
                </select>
              </Column>
            </Column>
          )}

          {step === 2 && (
            <Column gap="5">
              <Column gap="2">
                <label className={styles.label}>CSS Selector</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., .hero-cta, #signup-button"
                  value={formData.selector}
                  onChange={e => setFormData({ ...formData, selector: e.target.value })}
                />
                <span className={styles.hint}>
                  The element to personalize based on the experiment variant
                </span>
              </Column>

              <Row gap="4">
                <Column gap="2" style={{ flex: 1 }}>
                  <label className={styles.label}>Control (Original)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Original content..."
                    rows={4}
                    value={formData.controlContent}
                    onChange={e => setFormData({ ...formData, controlContent: e.target.value })}
                  />
                </Column>
                <Column gap="2" style={{ flex: 1 }}>
                  <label className={styles.label}>Variant A</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="New content to test..."
                    rows={4}
                    value={formData.variantContent}
                    onChange={e => setFormData({ ...formData, variantContent: e.target.value })}
                  />
                </Column>
              </Row>

              <Column gap="2">
                <label className={styles.label}>Traffic Split: {formData.trafficSplit}%</label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={formData.trafficSplit}
                  onChange={e => setFormData({ ...formData, trafficSplit: Number(e.target.value) })}
                  className={styles.slider}
                />
                <Row justifyContent="space-between" className={styles.sliderLabels}>
                  <span>Control: {100 - formData.trafficSplit}%</span>
                  <span>Variant: {formData.trafficSplit}%</span>
                </Row>
              </Column>
            </Column>
          )}

          {step === 3 && (
            <Column gap="5">
              <div className={styles.reviewCard}>
                <h4 className={styles.reviewTitle}>{formData.name || 'Untitled Experiment'}</h4>
                <p className={styles.reviewDescription}>{formData.description || 'No description'}</p>

                <div className={styles.reviewMeta}>
                  <Row gap="4">
                    <div>
                      <span className={styles.reviewLabel}>Target</span>
                      <span className={styles.reviewValue}>
                        {PERSONA_CONFIG[formData.persona]?.icon} {PERSONA_CONFIG[formData.persona]?.label}
                      </span>
                    </div>
                    <div>
                      <span className={styles.reviewLabel}>Goal</span>
                      <span className={styles.reviewValue}>{formData.goal}</span>
                    </div>
                    <div>
                      <span className={styles.reviewLabel}>Split</span>
                      <span className={styles.reviewValue}>
                        {100 - formData.trafficSplit}% / {formData.trafficSplit}%
                      </span>
                    </div>
                  </Row>
                </div>

                <Row gap="4" className={styles.reviewVariants}>
                  <div className={styles.reviewVariant}>
                    <span className={styles.reviewVariantLabel}>Control</span>
                    <span className={styles.reviewVariantContent}>
                      {formData.controlContent || '[Original content]'}
                    </span>
                  </div>
                  <div className={styles.reviewVariant}>
                    <span className={styles.reviewVariantLabel}>Variant A</span>
                    <span className={styles.reviewVariantContent}>
                      {formData.variantContent || '[New content]'}
                    </span>
                  </div>
                </Row>
              </div>

              <div className={styles.estimateCard}>
                <span className={styles.estimateIcon}>📊</span>
                <div>
                  <span className={styles.estimateTitle}>Estimated Duration</span>
                  <span className={styles.estimateValue}>
                    Based on your traffic, this experiment will likely reach statistical significance in <strong>7-14 days</strong>
                  </span>
                </div>
              </div>
            </Column>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step > 1 && (
            <button className={styles.modalButtonSecondary} onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className={styles.modalButtonSecondary} onClick={onClose}>
            Cancel
          </button>
          {step < 3 ? (
            <button className={styles.modalButtonPrimary} onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button className={styles.modalButtonPrimary}>
              Launch Experiment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
