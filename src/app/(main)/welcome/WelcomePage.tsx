'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './WelcomePage.module.css';

const PERSONAS = [
  {
    id: 'value-seeker',
    label: 'Value Seeker',
    color: '#10b981',
    description: 'Focused on pricing & ROI',
    icon: '💰'
  },
  {
    id: 'solution-seeker',
    label: 'Solution Seeker',
    color: '#3b82f6',
    description: 'Exploring features & capabilities',
    icon: '🔧'
  },
  {
    id: 'trust-seeker',
    label: 'Trust Seeker',
    color: '#8b5cf6',
    description: 'Looking for social proof',
    icon: '🛡️'
  },
  {
    id: 'ready-buyer',
    label: 'Ready Buyer',
    color: '#ef4444',
    description: 'High intent, ready to convert',
    icon: '🎯'
  },
  {
    id: 'explorer',
    label: 'Explorer',
    color: '#6b7280',
    description: 'Just browsing around',
    icon: '🔍'
  },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Detection',
    description: 'Know visitor intent within 2 seconds of page load'
  },
  {
    icon: '🧠',
    title: 'ML-Powered',
    description: 'Behavioral analysis with 18+ signal features'
  },
  {
    icon: '🎨',
    title: 'Auto-Personalize',
    description: 'Dynamic content that adapts to each visitor'
  },
  {
    icon: '📊',
    title: 'Actionable Insights',
    description: 'AI-generated recommendations, one-click apply'
  },
];

export function WelcomePage() {
  const router = useRouter();
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            AI-Powered Conversion Optimization
          </div>

          <h1 className={styles.title}>
            Know your visitors.
            <br />
            <span className={styles.gradient}>Convert them.</span>
          </h1>

          <p className={styles.subtitle}>
            Signal detects visitor intent in real-time and automatically
            personalizes your site to maximize conversions. No manual setup required.
          </p>

          <div className={styles.ctas}>
            <Link href="/websites" className={styles.primaryCta}>
              Add Your First Website
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <button className={styles.secondaryCta} onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>
        </div>

        {/* Animated Persona Cards */}
        <div className={styles.heroVisual}>
          <div className={styles.personaOrbit}>
            {PERSONAS.map((persona, index) => (
              <div
                key={persona.id}
                className={styles.personaCard}
                style={{
                  '--delay': `${index * 0.1}s`,
                  '--color': persona.color,
                  '--index': index,
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredPersona(persona.id)}
                onMouseLeave={() => setHoveredPersona(null)}
              >
                <span className={styles.personaIcon}>{persona.icon}</span>
                <span className={styles.personaLabel}>{persona.label}</span>
                {hoveredPersona === persona.id && (
                  <span className={styles.personaDescription}>{persona.description}</span>
                )}
              </div>
            ))}
          </div>
          <div className={styles.glowOrb} />
        </div>
      </section>

      {/* How It Works */}
      <section id="demo" className={styles.demoSection}>
        <h2 className={styles.sectionTitle}>How Signal Works</h2>
        <p className={styles.sectionSubtitle}>
          Three steps to intelligent conversion optimization
        </p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Add Tracking Code</h3>
              <p>One line of JavaScript. Works with any website, framework, or CMS.</p>
              <div className={styles.codeBlock}>
                <code>{'<script src="https://your-domain/script.js" />'}</code>
              </div>
            </div>
          </div>

          <div className={styles.stepConnector}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>AI Detects Intent</h3>
              <p>Within 2 seconds, we analyze referrer, behavior, and 18+ signals to classify visitors.</p>
              <div className={styles.signalGrid}>
                <span className={styles.signal}>Referrer</span>
                <span className={styles.signal}>Scroll depth</span>
                <span className={styles.signal}>Click patterns</span>
                <span className={styles.signal}>Time on page</span>
                <span className={styles.signal}>UTM params</span>
                <span className={styles.signal}>+13 more</span>
              </div>
            </div>
          </div>

          <div className={styles.stepConnector}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Convert More Visitors</h3>
              <p>Get actionable insights and auto-personalize content for each persona type.</p>
              <div className={styles.insightPreview}>
                <div className={styles.insightCard}>
                  <span className={styles.insightBadge}>High Impact</span>
                  <span className={styles.insightText}>Value-seekers bounce 47% on /pricing — add ROI calculator</span>
                  <button className={styles.applyButton}>Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{feature.icon}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingCard}>
          <div className={styles.pricingBadge}>Early Access</div>
          <h2 className={styles.pricingTitle}>Start Free, Scale When Ready</h2>
          <p className={styles.pricingDescription}>
            Free during beta. Pro plans coming soon with advanced features.
          </p>
          <div className={styles.pricingFeatures}>
            <div className={styles.pricingFeature}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unlimited websites
            </div>
            <div className={styles.pricingFeature}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Real-time persona detection
            </div>
            <div className={styles.pricingFeature}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              AI-generated insights
            </div>
            <div className={styles.pricingFeature}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M16.667 5L7.5 14.167L3.333 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Content personalization
            </div>
          </div>
          <Link href="/websites" className={styles.pricingCta}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <h2>Ready to convert more visitors?</h2>
        <Link href="/websites" className={styles.primaryCta}>
          Add Your First Website
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>
    </div>
  );
}
