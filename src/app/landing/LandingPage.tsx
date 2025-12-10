'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './LandingPage.module.css';

// ============================================================================
// SIGNAL CONVERSIONS - Premium Analytics Landing Page
// Inspired by Copilot.money aesthetic - dark, sleek, data-rich
// ============================================================================

const PERSONAS = [
  { id: 'quick-decider', icon: '⚡', label: 'Quick Deciders', color: '#F59E0B', desc: 'Fast scroll, low time, direct to CTA. Ready to act.' },
  { id: 'researcher', icon: '🔍', label: 'Researchers', color: '#3B82F6', desc: 'High time on page, reads everything, multiple visits.' },
  { id: 'price-shopper', icon: '�', label: 'Price Shoppers', color: '#10B981', desc: 'Pricing focus, comparison behavior, tab switches.' },
  { id: 'skeptic', icon: '🤔', label: 'Skeptics', color: '#8B5CF6', desc: 'Heavy FAQ/testimonial time, hesitates on CTAs.' },
  { id: 'impulse-buyer', icon: '🚀', label: 'Impulse Buyers', color: '#EF4444', desc: 'Mobile, evening hours, fast path to conversion.' },
  { id: 'enterprise', icon: '🏢', label: 'Enterprise Buyers', color: '#06B6D4', desc: 'Corporate ISP, desktop, evaluating for teams.' },
];

// 30+ Behavioral Signals organized by category
const SIGNAL_CATEGORIES = [
  {
    category: 'Device & Technical',
    icon: '🖥️',
    color: '#3B82F6',
    signals: [
      { name: 'Device Type', desc: 'Mobile/tablet/desktop context' },
      { name: 'Screen Resolution', desc: 'Device quality indicator' },
      { name: 'Browser & Version', desc: 'Tech-savviness signal' },
      { name: 'Operating System', desc: 'Ecosystem preferences' },
      { name: 'Connection Speed', desc: 'Geographic/economic context' },
      { name: 'Touch vs Mouse', desc: 'True device usage' },
    ],
  },
  {
    category: 'Location & Timing',
    icon: '🌍',
    color: '#10B981',
    signals: [
      { name: 'Country/Region/City', desc: 'Market segment targeting' },
      { name: 'Timezone', desc: 'Work vs personal context' },
      { name: 'Local Time of Visit', desc: 'Morning researcher vs night buyer' },
      { name: 'Day of Week', desc: 'Business vs leisure intent' },
      { name: 'ISP Type', desc: 'Corporate vs residential' },
      { name: 'VPN Detection', desc: 'Privacy-conscious users' },
    ],
  },
  {
    category: 'Interaction Patterns',
    icon: '👆',
    color: '#8B5CF6',
    signals: [
      { name: 'Scroll Depth & Velocity', desc: 'Engagement level' },
      { name: 'Time per Section', desc: 'What resonates' },
      { name: 'Mouse Movement', desc: 'Attention hotspots' },
      { name: 'Hover Duration on CTAs', desc: 'Consideration signals' },
      { name: 'Rage Clicks', desc: 'Frustration detection' },
      { name: 'Copy/Paste Actions', desc: 'High intent behavior' },
      { name: 'Tab Visibility', desc: 'Comparison shopping' },
      { name: 'Idle Patterns', desc: 'Thinking vs distracted' },
    ],
  },
  {
    category: 'Session & Journey',
    icon: '🔗',
    color: '#F59E0B',
    signals: [
      { name: 'Entry Page', desc: 'First impression point' },
      { name: 'Referrer & UTM', desc: 'Traffic source context' },
      { name: 'Pages per Session', desc: 'Exploration depth' },
      { name: 'Navigation Path', desc: 'Decision journey' },
      { name: 'Return Frequency', desc: 'Consideration stage' },
      { name: 'Time Between Visits', desc: 'Urgency level' },
    ],
  },
  {
    category: 'Engagement Quality',
    icon: '🎯',
    color: '#EF4444',
    signals: [
      { name: 'Video Engagement', desc: 'Content consumption' },
      { name: 'FAQ Interactions', desc: 'Objections & concerns' },
      { name: 'Pricing Behavior', desc: 'Purchase intent' },
      { name: 'Testimonial Time', desc: 'Social proof needs' },
      { name: 'Form Field Focus', desc: 'Friction detection' },
      { name: 'Chat Widget Opens', desc: 'Support needs' },
    ],
  },
];

const FEATURES = [
  {
    icon: '📡',
    title: '30+ Behavioral Signals',
    desc: 'From scroll velocity to rage clicks, we capture every meaningful interaction to build complete visitor profiles.',
  },
  {
    icon: '🧠',
    title: 'ML Persona Detection',
    desc: 'Real-time classification into 6 buyer personas. Know who\'s ready to convert before they do.',
  },
  {
    icon: '✨',
    title: 'Dynamic Personalization',
    desc: 'Automatically adjust CTAs, headlines, and offers based on detected persona. Zero code changes.',
  },
  {
    icon: '📊',
    title: 'Traffic Source Intelligence',
    desc: 'See how Google Ads vs. organic vs. social visitors behave differently. Optimize spend accordingly.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Visitor Feed',
    desc: 'Watch visitors arrive and personas get detected live. See your landing page through their eyes.',
  },
  {
    icon: '🎯',
    title: 'Conversion Readiness Score',
    desc: 'Instant scoring tells you if a visitor is hot, warm, or cold. Prioritize follow-ups intelligently.',
  },
  {
    icon: '🔒',
    title: 'Privacy-First Architecture',
    desc: 'No cookies, no PII, no fingerprinting. GDPR/CCPA compliant by design. You own your data.',
  },
  {
    icon: '💡',
    title: 'AI-Powered Insights',
    desc: 'Automatic recommendations: "40% are Skeptics—add testimonials above the fold."',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for testing the waters',
    features: ['1 website', '10,000 sessions/mo', 'Basic persona detection', '7-day data retention', 'Core signals (15+)'],
    cta: 'Start Free',
    href: '/login',
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/month',
    desc: 'For serious conversion optimization',
    features: ['5 websites', '100,000 sessions/mo', 'All 6 personas', 'All 30+ signals', 'Content personalization', 'A/B testing', '90-day retention'],
    cta: 'Start Free Trial',
    href: '/login?plan=growth',
    popular: true,
  },
  {
    name: 'Scale',
    price: '$199',
    period: '/month',
    desc: 'For high-traffic properties',
    features: ['Unlimited websites', '1M sessions/mo', 'Custom personas', 'API access', 'Team seats', 'Priority support', '1-year retention'],
    cta: 'Start Free Trial',
    href: '/login?plan=scale',
  },
];

const STATS = [
  { value: '30+', label: 'Behavioral signals' },
  { value: '< 50ms', label: 'Detection latency' },
  { value: '94%', label: 'Persona accuracy' },
  { value: '2.4x', label: 'Avg. conversion lift' },
];

const TESTIMONIALS = [
  {
    quote: "Signal identified that 40% of our Google Ads traffic were Skeptics. We added trust badges and saw a 67% conversion lift in one week.",
    author: "Sarah Chen",
    role: "Head of Growth",
    company: "TechFlow",
    avatar: "SC",
  },
  {
    quote: "The real-time feed is addictive. Watching personas get classified as people browse—it's like having X-ray vision for your landing page.",
    author: "Marcus Johnson",
    role: "Marketing Director",
    company: "ScaleUp",
    avatar: "MJ",
  },
  {
    quote: "We used to A/B test blindly. Now we know exactly which persona to optimize for. Our CAC dropped 35% in the first month.",
    author: "Emily Rodriguez",
    role: "Product Lead",
    company: "GrowthLabs",
    avatar: "ER",
  },
];

const LIVE_VISITORS = [
  { persona: 'Quick Decider', icon: '⚡', color: '#F59E0B', page: '/pricing', source: 'Google Ads', device: 'iPhone', time: 'now' },
  { persona: 'Researcher', icon: '🔍', color: '#3B82F6', page: '/features', source: 'Organic', device: 'MacBook', time: '3s ago' },
  { persona: 'Enterprise', icon: '🏢', color: '#06B6D4', page: '/enterprise', source: 'LinkedIn', device: 'Windows', time: '7s ago' },
  { persona: 'Skeptic', icon: '🤔', color: '#8B5CF6', page: '/reviews', source: 'Twitter', device: 'Android', time: '12s ago' },
  { persona: 'Impulse Buyer', icon: '🚀', color: '#EF4444', page: '/checkout', source: 'Instagram', device: 'iPhone', time: '18s ago' },
];

export function LandingPage() {
  const [activePersona, setActivePersona] = useState(0);
  const [activeSignalCategory, setActiveSignalCategory] = useState(0);
  const [visitorIndex, setVisitorIndex] = useState(0);

  // Animate through live visitors
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorIndex((prev) => (prev + 1) % LIVE_VISITORS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>◉</span>
            <span className={styles.logoText}>Signal</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#signals">Signals</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.navLogin}>Log in</Link>
            <Link href="/login" className={styles.navCta}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>Conversion Intelligence Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
            Decode visitor intent.
            <br />
            <span className={styles.heroGradient}>Convert with precision.</span>
          </h1>
          <p className={styles.heroDesc}>
            Signal captures 30+ behavioral signals to identify buyer personas in real-time.
            Understand who's browsing, what they need, and how to convert them—all without cookies.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/login" className={styles.ctaPrimary}>
              Start Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#signals" className={styles.ctaSecondary}>
              <span className={styles.ctaPlay}>▶</span>
              See it in action
            </a>
          </div>
          <div className={styles.heroStats}>
            {STATS.map((stat, i) => (
              <div key={i} className={styles.heroStat}>
                <span className={styles.heroStatValue}>{stat.value}</span>
                <span className={styles.heroStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual - Live Feed Preview */}
        <div className={styles.heroVisual}>
          <div className={styles.dashboardPreview}>
            <div className={styles.dashboardHeader}>
              <div className={styles.dashboardTitle}>
                <span className={styles.liveDot} />
                Live Visitor Feed
              </div>
              <span className={styles.dashboardMeta}>yoursite.com</span>
            </div>
            <div className={styles.visitorStream}>
              {LIVE_VISITORS.map((v, i) => (
                <div 
                  key={i} 
                  className={`${styles.visitorRow} ${i === visitorIndex ? styles.visitorRowActive : ''}`}
                >
                  <span className={styles.visitorIcon} style={{ background: `${v.color}20`, color: v.color }}>
                    {v.icon}
                  </span>
                  <div className={styles.visitorInfo}>
                    <span className={styles.visitorPersona} style={{ color: v.color }}>{v.persona}</span>
                    <span className={styles.visitorMeta}>{v.device} · {v.source}</span>
                  </div>
                  <div className={styles.visitorRight}>
                    <span className={styles.visitorPage}>{v.page}</span>
                    <span className={styles.visitorTime}>{v.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.dashboardFooter}>
              <div className={styles.personaBreakdown}>
                {PERSONAS.slice(0, 4).map((p, i) => (
                  <div key={i} className={styles.personaMini}>
                    <span className={styles.personaMiniIcon} style={{ background: p.color }}>{p.icon}</span>
                    <span className={styles.personaMiniPercent}>{[28, 24, 19, 16][i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signals Section - The Core Differentiator */}
      <section className={styles.signals} id="signals">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>30+ Signals</span>
            <h2 className={styles.sectionTitle}>
              Every interaction tells a story
            </h2>
            <p className={styles.sectionDesc}>
              We capture behavioral signals across 5 categories to build a complete picture of visitor intent.
              No cookies, no fingerprinting—just intelligent observation.
            </p>
          </div>
          
          <div className={styles.signalsLayout}>
            {/* Category Tabs */}
            <div className={styles.signalTabs}>
              {SIGNAL_CATEGORIES.map((cat, i) => (
                <button
                  key={i}
                  className={`${styles.signalTab} ${activeSignalCategory === i ? styles.signalTabActive : ''}`}
                  onClick={() => setActiveSignalCategory(i)}
                  style={activeSignalCategory === i ? { borderColor: cat.color, color: cat.color } : {}}
                >
                  <span className={styles.signalTabIcon}>{cat.icon}</span>
                  <span>{cat.category}</span>
                  <span className={styles.signalCount}>{cat.signals.length}</span>
                </button>
              ))}
            </div>
            
            {/* Signals Grid */}
            <div className={styles.signalsGrid}>
              {SIGNAL_CATEGORIES[activeSignalCategory].signals.map((signal, i) => (
                <div 
                  key={i} 
                  className={styles.signalCard}
                  style={{ 
                    animationDelay: `${i * 50}ms`,
                    borderColor: `${SIGNAL_CATEGORIES[activeSignalCategory].color}30`
                  }}
                >
                  <div className={styles.signalDot} style={{ background: SIGNAL_CATEGORIES[activeSignalCategory].color }} />
                  <div className={styles.signalContent}>
                    <span className={styles.signalName}>{signal.name}</span>
                    <span className={styles.signalDesc}>{signal.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className={styles.personas}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>AI Personas</span>
            <h2 className={styles.sectionTitle}>6 buyer personas, detected in real-time</h2>
            <p className={styles.sectionDesc}>
              Our ML models analyze behavioral patterns to classify visitors instantly.
              Know who's ready to buy before they do.
            </p>
          </div>
          <div className={styles.personaGrid}>
            {PERSONAS.map((persona, i) => (
              <div
                key={persona.id}
                className={`${styles.personaCard} ${activePersona === i ? styles.personaCardActive : ''}`}
                style={activePersona === i ? { borderColor: persona.color, background: `${persona.color}08` } : {}}
                onMouseEnter={() => setActivePersona(i)}
              >
                <span className={styles.personaIcon} style={{ background: `${persona.color}15`, color: persona.color }}>
                  {persona.icon}
                </span>
                <h3 className={styles.personaName}>{persona.label}</h3>
                <p className={styles.personaDesc}>{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Platform</span>
            <h2 className={styles.sectionTitle}>Everything you need to convert</h2>
            <p className={styles.sectionDesc}>
              From signal capture to real-time personalization—Signal handles the entire conversion intelligence stack.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Testimonials</span>
            <h2 className={styles.sectionTitle}>Loved by growth teams</h2>
            <p className={styles.sectionDesc}>
              See what conversion-focused teams are saying about Signal.
            </p>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>
                  <svg className={styles.quoteIcon} width="32" height="24" viewBox="0 0 32 24" fill="none">
                    <path d="M0 24V14.4C0 10.4 0.8 7.2 2.4 4.8C4 2.4 6.4 0.8 9.6 0V5.6C8 6.4 6.8 7.6 6 9.2C5.2 10.8 4.8 12.4 4.8 14.4H9.6V24H0ZM17.6 24V14.4C17.6 10.4 18.4 7.2 20 4.8C21.6 2.4 24 0.8 27.2 0V5.6C25.6 6.4 24.4 7.6 23.6 9.2C22.8 10.8 22.4 12.4 22.4 14.4H27.2V24H17.6Z" fill="currentColor"/>
                  </svg>
                  <p>{testimonial.quote}</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.testimonialAvatar}>{testimonial.avatar}</span>
                  <div>
                    <p className={styles.authorName}>{testimonial.author}</p>
                    <p className={styles.authorRole}>{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Pricing</span>
            <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
            <p className={styles.sectionDesc}>
              Start free, upgrade when you need more. No credit card required.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {PLANS.map((plan, i) => (
              <div key={i} className={`${styles.pricingCard} ${plan.popular ? styles.pricingCardPopular : ''}`}>
                {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.priceValue}>{plan.price}</span>
                  {plan.period && <span className={styles.pricePeriod}>{plan.period}</span>}
                </div>
                <p className={styles.planDesc}>{plan.desc}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.333 4L6 11.333L2.667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`${styles.planCta} ${plan.popular ? styles.planCtaPrimary : ''}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaGlow} />
        <div className={styles.sectionInner}>
          <h2 className={styles.ctaTitle}>
            Ready to decode your traffic?
          </h2>
          <p className={styles.ctaDesc}>
            Join growth teams using Signal to understand visitors and convert with precision.
            Free to start, no credit card required.
          </p>
          <div className={styles.finalCtaButtons}>
            <Link href="/login" className={styles.ctaPrimary}>
              Start Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="mailto:hello@signalconversions.com" className={styles.ctaSecondary}>
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span className={styles.logoIcon}>◉</span>
              <span className={styles.logoText}>Signal</span>
            </div>
            <span className={styles.footerCopy}>© 2024 Signal Conversions. All rights reserved.</span>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnTitle}>Product</span>
              <a href="#signals">Signals</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnTitle}>Resources</span>
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Changelog</a>
            </div>
            <div className={styles.footerColumn}>
              <span className={styles.footerColumnTitle}>Company</span>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="mailto:hello@signalconversions.com">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
