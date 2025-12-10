'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './BillingPage.module.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1 website',
      '10,000 pageviews/month',
      'Basic persona detection',
      '7 day data retention',
      'Community support',
    ],
    cta: 'Current Plan',
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing businesses',
    features: [
      'Unlimited websites',
      '100,000 pageviews/month',
      'Advanced persona AI',
      'Content personalization',
      '90 day data retention',
      'AI-generated insights',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited everything',
      'Custom pageview limits',
      'ML model fine-tuning',
      'Custom integrations',
      'Unlimited data retention',
      'White-label options',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
  },
];

const USAGE = {
  websites: { used: 1, limit: 1 },
  pageviews: { used: 2847, limit: 10000 },
  retention: '7 days',
};

export function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Billing & Plans</h1>
        <p className={styles.subtitle}>
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Usage */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Current Usage</h2>
        <div className={styles.usageGrid}>
          <UsageCard
            label="Websites"
            used={USAGE.websites.used}
            limit={USAGE.websites.limit}
            unit="sites"
          />
          <UsageCard
            label="Pageviews"
            used={USAGE.pageviews.used}
            limit={USAGE.pageviews.limit}
            unit="this month"
          />
          <div className={styles.usageCard}>
            <span className={styles.usageLabel}>Data Retention</span>
            <span className={styles.usageValue}>{USAGE.retention}</span>
          </div>
        </div>
      </section>

      {/* Billing Period Toggle */}
      <section className={styles.section}>
        <div className={styles.periodToggle}>
          <button
            className={`${styles.periodButton} ${billingPeriod === 'monthly' ? styles.active : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.periodButton} ${billingPeriod === 'yearly' ? styles.active : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Yearly
            <span className={styles.saveBadge}>Save 20%</span>
          </button>
        </div>
      </section>

      {/* Plans Grid */}
      <section className={styles.plansSection}>
        <div className={styles.plansGrid}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              {...plan}
              price={
                billingPeriod === 'yearly' && plan.price !== '$0' && plan.price !== 'Custom'
                  ? `$${Math.floor(parseInt(plan.price.replace('$', '')) * 0.8)}`
                  : plan.price
              }
              period={billingPeriod === 'yearly' && plan.period === '/month' ? '/month (billed yearly)' : plan.period}
            />
          ))}
        </div>
      </section>

      {/* Payment Method */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Payment Method</h2>
        <div className={styles.paymentCard}>
          <div className={styles.noPayment}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className={styles.cardIcon}>
              <rect x="4" y="12" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 20H44" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 28H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>No payment method on file</p>
            <span className={styles.paymentHint}>Add a payment method to upgrade your plan</span>
            <button className={styles.addPaymentButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Payment Method
            </button>
          </div>
        </div>
      </section>

      {/* Billing History */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Billing History</h2>
        <div className={styles.historyCard}>
          <div className={styles.emptyHistory}>
            <p>No billing history yet</p>
            <span>Invoices will appear here after your first payment</span>
          </div>
        </div>
      </section>

      {/* Stripe Badge */}
      <div className={styles.stripeBadge}>
        <svg width="60" height="25" viewBox="0 0 60 25" fill="none">
          <path d="M5 3.5C5 2.11929 6.11929 1 7.5 1H52.5C53.8807 1 55 2.11929 55 3.5V21.5C55 22.8807 53.8807 24 52.5 24H7.5C6.11929 24 5 22.8807 5 21.5V3.5Z" fill="#635BFF"/>
          <path d="M15.71 10.33C15.71 9.36 16.5 8.92 17.77 8.92C19.43 8.92 21.49 9.46 23.15 10.33V6.35C21.33 5.62 19.53 5.33 17.77 5.33C13.59 5.33 10.91 7.41 10.91 10.59C10.91 15.61 18.15 14.81 18.15 16.93C18.15 18.07 17.13 18.51 15.77 18.51C13.97 18.51 11.65 17.79 9.81 16.77V20.83C11.85 21.73 13.91 22.1 15.77 22.1C20.05 22.1 22.93 20.09 22.93 16.85C22.91 11.39 15.71 12.35 15.71 10.33ZM29.29 3.13L24.71 4.11V7.51L29.29 6.53V3.13ZM24.71 8.11V21.79H29.29V8.11H24.71ZM38.99 8.11L38.65 9.69C37.77 8.53 36.33 7.89 34.51 7.89C31.13 7.89 28.33 10.87 28.33 14.95C28.33 19.01 31.11 22.01 34.51 22.01C36.31 22.01 37.77 21.37 38.65 20.21L38.99 21.79H43.35V8.11H38.99ZM35.57 18.25C33.95 18.25 32.75 16.83 32.75 14.95C32.75 13.05 33.95 11.65 35.57 11.65C37.17 11.65 38.39 13.07 38.39 14.95C38.39 16.83 37.17 18.25 35.57 18.25ZM49.25 22.01C51.43 22.01 52.97 21.21 53.91 19.99L54.23 21.79H58.61V3.13L54.03 4.11V9.55C53.13 8.47 51.77 7.89 50.09 7.89C46.57 7.89 43.63 10.95 43.63 14.95C43.63 19.01 46.29 22.01 49.25 22.01ZM50.31 18.25C48.71 18.25 47.49 16.83 47.49 14.95C47.49 13.07 48.71 11.65 50.31 11.65C51.91 11.65 53.11 13.05 53.11 14.95C53.11 16.83 51.91 18.25 50.31 18.25Z" fill="white"/>
        </svg>
        <span>Payments secured by Stripe</span>
      </div>
    </div>
  );
}

function UsageCard({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const percentage = (used / limit) * 100;
  const isWarning = percentage > 80;

  return (
    <div className={styles.usageCard}>
      <span className={styles.usageLabel}>{label}</span>
      <div className={styles.usageNumbers}>
        <span className={styles.usageValue}>{used.toLocaleString()}</span>
        <span className={styles.usageLimit}>/ {limit.toLocaleString()} {unit}</span>
      </div>
      <div className={styles.usageBar}>
        <div
          className={`${styles.usageFill} ${isWarning ? styles.warning : ''}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  current,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  current?: boolean;
  popular?: boolean;
}) {
  return (
    <div className={`${styles.planCard} ${popular ? styles.popular : ''} ${current ? styles.current : ''}`}>
      {popular && <div className={styles.popularBadge}>Most Popular</div>}

      <div className={styles.planHeader}>
        <h3 className={styles.planName}>{name}</h3>
        <div className={styles.planPrice}>
          <span className={styles.priceValue}>{price}</span>
          {period && <span className={styles.pricePeriod}>{period}</span>}
        </div>
        <p className={styles.planDescription}>{description}</p>
      </div>

      <ul className={styles.planFeatures}>
        {features.map((feature, i) => (
          <li key={i} className={styles.planFeature}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.333 4L6 11.333L2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button
        className={`${styles.planCta} ${current ? styles.currentCta : ''}`}
        disabled={current}
      >
        {cta}
      </button>
    </div>
  );
}
