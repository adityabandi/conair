'use client';

import Link from 'next/link';
import styles from './LoginPage.module.css';
import { LoginForm } from './LoginForm';

const DEMO_VISITORS = [
  { persona: 'Ready Buyer', icon: '🎯', color: '#EF4444', page: '/checkout', time: '2s ago' },
  { persona: 'Value Seeker', icon: '💰', color: '#10B981', page: '/pricing', time: '5s ago' },
  { persona: 'Trust Seeker', icon: '⭐', color: '#8B5CF6', page: '/reviews', time: '8s ago' },
  { persona: 'Solution Seeker', icon: '🔧', color: '#3B82F6', page: '/features', time: '12s ago' },
];

export function LoginPage() {
  return (
    <div className={styles.page}>
      {/* Left Panel - Hero */}
      <div className={styles.leftPanel}>
        <div className={styles.heroContent}>
          <div className={styles.heroLogo}>
            <div className={styles.logoIcon}>◈</div>
            <span className={styles.logoText}>Signal</span>
          </div>

          <h1 className={styles.heroTitle}>
            Understand every
            <br />
            <span className={styles.heroGradient}>visitor instantly</span>
          </h1>

          <p className={styles.heroDesc}>
            AI-powered persona detection identifies visitor intent in real-time.
            Show the right content to the right people and watch conversions soar.
          </p>

          {/* Live Preview */}
          <div className={styles.livePreview}>
            <div className={styles.previewHeader}>
              <span className={styles.previewDot} style={{ background: '#EF4444' }} />
              <span className={styles.previewDot} style={{ background: '#F59E0B' }} />
              <span className={styles.previewDot} style={{ background: '#10B981' }} />
              <span className={styles.previewTitle}>Live Visitor Feed</span>
            </div>
            <div className={styles.previewContent}>
              {DEMO_VISITORS.map((visitor, i) => (
                <div
                  key={i}
                  className={styles.visitorRow}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <span
                    className={styles.visitorIcon}
                    style={{ background: `${visitor.color}20`, color: visitor.color }}
                  >
                    {visitor.icon}
                  </span>
                  <div className={styles.visitorInfo}>
                    <div className={styles.visitorPersona} style={{ color: visitor.color }}>
                      {visitor.persona}
                    </div>
                    <div className={styles.visitorPage}>{visitor.page}</div>
                  </div>
                  <span className={styles.visitorTime}>{visitor.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValue}>2.4x</span>
              <span className={styles.statLabel}>Conversion lift</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>50ms</span>
              <span className={styles.statLabel}>Detection speed</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>94%</span>
              <span className={styles.statLabel}>Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <LoginForm />

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Don&apos;t have an account?{' '}
              <Link href="/login?signup=true" className={styles.footerLink}>
                Sign up free
              </Link>
            </p>
            <p className={styles.termsText}>
              By signing in, you agree to our{' '}
              <a href="#" className={styles.termsLink}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" className={styles.termsLink}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
