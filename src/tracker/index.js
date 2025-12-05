(window => {
  const {
    screen: { width, height },
    navigator: { language, doNotTrack: ndnt, msDoNotTrack: msdnt },
    location,
    document,
    history,
    top,
    doNotTrack,
  } = window;
  const { currentScript, referrer } = document;
  if (!currentScript) return;

  const { hostname, href, origin } = location;
  const localStorage = href.startsWith('data:') ? undefined : window.localStorage;

  const _data = 'data-';
  const _false = 'false';
  const _true = 'true';
  const attr = currentScript.getAttribute.bind(currentScript);

  const website = attr(_data + 'website-id');
  const hostUrl = attr(_data + 'host-url');
  const beforeSend = attr(_data + 'before-send');
  const tag = attr(_data + 'tag') || undefined;
  const autoTrack = attr(_data + 'auto-track') !== _false;
  const dnt = attr(_data + 'do-not-track') === _true;
  const excludeSearch = attr(_data + 'exclude-search') === _true;
  const excludeHash = attr(_data + 'exclude-hash') === _true;
  const domain = attr(_data + 'domains') || '';
  const credentials = attr(_data + 'fetch-credentials') || 'omit';

  const domains = domain.split(',').map(n => n.trim());
  const host =
    hostUrl || '__COLLECT_API_HOST__' || currentScript.src.split('/').slice(0, -1).join('/');
  const endpoint = `${host.replace(/\/$/, '')}__COLLECT_API_ENDPOINT__`;
  const screen = `${width}x${height}`;
  const eventRegex = /data-umami-event-([\w-_]+)/;
  const eventNameAttribute = _data + 'umami-event';
  const delayDuration = 300;

  /* ============================================
   PERSONA INTELLIGENCE - Production ML System
   ============================================ */

  const PERSONA_CONFIG = {
    // Page categories mapped to intent
    categories: {
      value: ['/pricing', '/plans', '/cost', '/roi', '/compare', '/discount', '/free', '/trial'],
      solution: [
        '/features',
        '/how-it-works',
        '/solutions',
        '/use-cases',
        '/product',
        '/demo',
        '/tour',
      ],
      trust: [
        '/case-studies',
        '/testimonials',
        '/customers',
        '/about',
        '/team',
        '/reviews',
        '/press',
      ],
      intent: ['/signup', '/register', '/start', '/contact', '/book', '/schedule', '/get-started'],
    },
    // Referrer patterns for instant classification
    referrerSignals: {
      value: ['google.com/search', 'bing.com', 'price', 'cost', 'cheap', 'compare', 'vs'],
      solution: ['stackoverflow', 'github', 'reddit.com/r/', 'producthunt', 'how to', 'tutorial'],
      trust: ['linkedin', 'twitter', 'facebook', 'review', 'g2.com', 'capterra', 'trustpilot'],
      intent: ['email', 'newsletter', 'utm_medium=email', 'retarget'],
    },
    // UTM campaign patterns
    utmSignals: {
      value: ['pricing', 'deal', 'discount', 'offer', 'sale'],
      solution: ['demo', 'webinar', 'guide', 'howto', 'tutorial'],
      trust: ['case-study', 'testimonial', 'customer', 'success'],
      intent: ['trial', 'signup', 'start', 'convert', 'bottom'],
    },
    engagementThreshold: 5,
    scrollThreshold: 30,
    updateInterval: 5000, // Faster updates for ML
    storageKey: 'umami.persona',
  };

  // Enhanced persona state with behavioral features
  const personaState = {
    // Core state
    pageVisits: {},
    currentPage: { path: '', startTime: 0, maxScroll: 0 },
    scores: { value: 0, solution: 0, trust: 0, intent: 0 },
    persona: null,
    confidence: 0,

    // Instant signals (available immediately)
    instantSignals: {
      referrerCategory: null,
      utmCategory: null,
      entryPageCategory: null,
      isReturning: false,
      storedPersona: null,
      deviceType: null,
      timeOfDay: null,
    },

    // Behavioral features for ML (collected over time)
    behaviorFeatures: {
      scrollVelocity: 0, // pixels per second
      avgTimePerPage: 0, // seconds
      bounceRisk: 0, // 0-1 probability
      clickRate: 0, // clicks per minute
      scrollDepthVariance: 0, // reading consistency
      mouseMovementRate: 0, // movements per second
      hoverDuration: 0, // avg ms on interactive elements
      readingPattern: 'scan', // 'scan' | 'read' | 'skim'
      engagementScore: 0, // composite 0-100
    },

    // Session metrics
    sessionMetrics: {
      startTime: Date.now(),
      pageCount: 0,
      totalClicks: 0,
      totalScrollDistance: 0,
      lastScrollTime: 0,
      lastScrollY: 0,
      mouseEvents: 0,
      conversionEvents: [],
    },
  };

  // ============================================
  // INSTANT SIGNAL EXTRACTION (0-2 seconds)
  // ============================================

  const extractInstantSignals = () => {
    const signals = personaState.instantSignals;
    const url = new URL(location.href);

    // 1. Check for returning visitor with stored persona
    if (localStorage) {
      try {
        const stored = JSON.parse(localStorage.getItem(PERSONA_CONFIG.storageKey) || '{}');
        if (stored.persona && stored.confidence > 50) {
          signals.storedPersona = stored.persona;
          signals.isReturning = true;
          // Immediately set persona for returning high-confidence visitors
          personaState.persona = stored.persona;
          personaState.confidence = Math.min(stored.confidence, 70); // Cap at 70 for returning
        }
      } catch {
        /* ignore */
      }
    }

    // 2. Classify referrer
    const ref = referrer.toLowerCase();
    for (const [category, patterns] of Object.entries(PERSONA_CONFIG.referrerSignals)) {
      if (patterns.some(p => ref.includes(p))) {
        signals.referrerCategory = category;
        personaState.scores[category] += 5; // Boost from referrer
        break;
      }
    }

    // 3. Check UTM parameters
    const utmSource = url.searchParams.get('utm_source') || '';
    const utmMedium = url.searchParams.get('utm_medium') || '';
    const utmCampaign = url.searchParams.get('utm_campaign') || '';
    const utmString = `${utmSource} ${utmMedium} ${utmCampaign}`.toLowerCase();

    for (const [category, patterns] of Object.entries(PERSONA_CONFIG.utmSignals)) {
      if (patterns.some(p => utmString.includes(p))) {
        signals.utmCategory = category;
        personaState.scores[category] += 8; // Strong signal from UTM
        break;
      }
    }

    // 4. Entry page category
    signals.entryPageCategory = categorizeUrl(location.pathname);
    if (signals.entryPageCategory !== 'general') {
      personaState.scores[signals.entryPageCategory] += 3;
    }

    // 5. Device type (mobile often = different intent)
    signals.deviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

    // 6. Time of day (business hours = B2B likely)
    const hour = new Date().getHours();
    signals.timeOfDay = hour >= 9 && hour <= 17 ? 'business' : 'personal';

    // Calculate initial persona from instant signals
    calculatePersona();

    // Dispatch instant persona event
    if (personaState.persona !== 'explorer' || signals.isReturning) {
      window.dispatchEvent(
        new CustomEvent('umami:persona', {
          detail: {
            persona: personaState.persona,
            confidence: personaState.confidence,
            scores: personaState.scores,
            source: 'instant',
          },
        }),
      );
    }
  };

  // ============================================
  // BEHAVIORAL FEATURE EXTRACTION (Real-time)
  // ============================================

  const extractBehaviorFeatures = () => {
    const features = personaState.behaviorFeatures;
    const metrics = personaState.sessionMetrics;
    const elapsed = (Date.now() - metrics.startTime) / 1000;

    if (elapsed < 2) return; // Need some data

    // Scroll velocity (pixels per second)
    features.scrollVelocity = metrics.totalScrollDistance / elapsed;

    // Click rate (per minute)
    features.clickRate = (metrics.totalClicks / elapsed) * 60;

    // Average time per page
    features.avgTimePerPage = elapsed / Math.max(1, metrics.pageCount);

    // Mouse movement rate
    features.mouseMovementRate = metrics.mouseEvents / elapsed;

    // Reading pattern classification
    if (features.scrollVelocity < 50 && features.avgTimePerPage > 30) {
      features.readingPattern = 'read'; // Deep reader
    } else if (features.scrollVelocity > 200 || features.avgTimePerPage < 10) {
      features.readingPattern = 'scan'; // Quick scanner
    } else {
      features.readingPattern = 'skim'; // In between
    }

    // Bounce risk (high scroll velocity + low time = bouncing)
    features.bounceRisk = Math.min(
      1,
      (features.scrollVelocity / 500) * 0.5 + (1 - Math.min(1, elapsed / 30)) * 0.5,
    );

    // Engagement score (composite)
    features.engagementScore = Math.min(
      100,
      Math.round(
        (1 - features.bounceRisk) * 30 +
          Math.min(30, features.avgTimePerPage) +
          Math.min(20, features.clickRate * 5) +
          (features.readingPattern === 'read' ? 20 : features.readingPattern === 'skim' ? 10 : 0),
      ),
    );

    // Use behavior to adjust scores
    applyBehaviorToScores();
  };

  const applyBehaviorToScores = () => {
    const features = personaState.behaviorFeatures;

    // Deep readers more likely trust-seekers (reading case studies)
    if (features.readingPattern === 'read') {
      personaState.scores.trust += 2;
    }

    // High click rate + scanning = solution-seeker (exploring features)
    if (features.readingPattern === 'scan' && features.clickRate > 3) {
      personaState.scores.solution += 2;
    }

    // High engagement + time on pricing = value-seeker
    if (features.engagementScore > 60 && personaState.pageVisits.value?.length > 0) {
      personaState.scores.value += 3;
    }

    // Low bounce risk + high engagement = ready-buyer
    if (features.bounceRisk < 0.3 && features.engagementScore > 70) {
      personaState.scores.intent += 2;
    }
  };

  // ============================================
  // BEHAVIORAL EVENT TRACKING
  // ============================================

  const trackBehaviorEvents = () => {
    const metrics = personaState.sessionMetrics;

    // Track scroll with velocity
    let lastScrollY = window.scrollY;

    document.addEventListener(
      'scroll',
      () => {
        const now = Date.now();
        const currentY = window.scrollY;
        const distance = Math.abs(currentY - lastScrollY);

        metrics.totalScrollDistance += distance;
        metrics.lastScrollTime = now;
        metrics.lastScrollY = currentY;

        lastScrollY = currentY;
      },
      { passive: true },
    );

    // Track clicks
    document.addEventListener(
      'click',
      e => {
        metrics.totalClicks++;

        // Check if click on CTA (strong intent signal)
        const target = e.target.closest('a, button');
        if (target) {
          const text = (target.textContent || '').toLowerCase();
          const href = (target.href || '').toLowerCase();

          if (/sign.?up|start|get.?started|try|demo|contact|book/i.test(text + href)) {
            personaState.scores.intent += 5;
            metrics.conversionEvents.push({ type: 'cta_click', time: Date.now(), text });
          }

          if (/pricing|plans|cost/i.test(text + href)) {
            personaState.scores.value += 3;
          }
        }
      },
      { passive: true },
    );

    // Track mouse movement (reading indicator)
    let mouseThrottle = 0;
    document.addEventListener(
      'mousemove',
      () => {
        if (Date.now() - mouseThrottle > 100) {
          metrics.mouseEvents++;
          mouseThrottle = Date.now();
        }
      },
      { passive: true },
    );

    // Track hover on interactive elements
    document.querySelectorAll('a, button, [data-umami-event]').forEach(el => {
      let hoverStart;
      el.addEventListener('mouseenter', () => {
        hoverStart = Date.now();
      });
      el.addEventListener('mouseleave', () => {
        if (hoverStart) {
          const duration = Date.now() - hoverStart;
          personaState.behaviorFeatures.hoverDuration =
            (personaState.behaviorFeatures.hoverDuration + duration) / 2;
        }
      });
    });
  };

  // ============================================
  // ML FEATURE VECTOR GENERATION
  // ============================================

  const generateFeatureVector = () => {
    const features = personaState.behaviorFeatures;
    const signals = personaState.instantSignals;
    const metrics = personaState.sessionMetrics;
    const elapsed = (Date.now() - metrics.startTime) / 1000;

    return {
      // Instant signals (categorical, one-hot encoded on server)
      referrerCategory: signals.referrerCategory || 'none',
      utmCategory: signals.utmCategory || 'none',
      entryPageCategory: signals.entryPageCategory || 'general',
      deviceType: signals.deviceType,
      timeOfDay: signals.timeOfDay,
      isReturning: signals.isReturning ? 1 : 0,

      // Behavioral features (numeric, normalized 0-1)
      scrollVelocity: Math.min(1, features.scrollVelocity / 500),
      clickRate: Math.min(1, features.clickRate / 10),
      avgTimePerPage: Math.min(1, features.avgTimePerPage / 120),
      mouseMovementRate: Math.min(1, features.mouseMovementRate / 5),
      bounceRisk: features.bounceRisk,
      engagementScore: features.engagementScore / 100,
      readingPatternCode:
        features.readingPattern === 'read' ? 1 : features.readingPattern === 'skim' ? 0.5 : 0,

      // Session features
      sessionDuration: Math.min(1, elapsed / 300), // normalize to 5 min
      pageCount: Math.min(1, metrics.pageCount / 10),
      totalClicks: Math.min(1, metrics.totalClicks / 20),

      // Current scores (already computed)
      valueScore: personaState.scores.value,
      solutionScore: personaState.scores.solution,
      trustScore: personaState.scores.trust,
      intentScore: personaState.scores.intent,
    };
  };

  // ============================================
  // PERSONA CALCULATION (Rule-based + ML ready)
  // ============================================

  const categorizeUrl = path => {
    const lowerPath = path.toLowerCase();
    for (const [category, patterns] of Object.entries(PERSONA_CONFIG.categories)) {
      if (patterns.some(p => lowerPath.includes(p))) return category;
    }
    return 'general';
  };

  const calculatePersona = () => {
    const { scores } = personaState;

    // Add page visit scores
    for (const [category, visits] of Object.entries(personaState.pageVisits)) {
      if (category === 'general') continue;

      for (const visit of visits) {
        let points = 2;

        if (visit.timeSpent > PERSONA_CONFIG.engagementThreshold) {
          points += Math.min(8, visit.timeSpent / 10);
        }

        if (visit.scrollDepth > PERSONA_CONFIG.scrollThreshold) {
          points += (visit.scrollDepth / 100) * 5;
        }

        scores[category] = (scores[category] || 0) + points;
      }
    }

    // Determine persona
    const entries = Object.entries(scores).filter(([, s]) => s > 0);
    if (entries.length === 0) {
      personaState.persona = 'explorer';
      personaState.confidence = 0;
      return;
    }

    entries.sort((a, b) => b[1] - a[1]);
    const [topCategory, topScore] = entries[0];
    const secondScore = entries[1]?.[1] || 0;
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    // Calculate confidence
    const scoreLead = (topScore - secondScore) / (totalScore + 1);
    const engagementBonus = (personaState.behaviorFeatures.engagementScore / 100) * 20;
    const timeBonus = Math.min(20, (Date.now() - personaState.sessionMetrics.startTime) / 1000 / 3);

    personaState.confidence = Math.min(
      100,
      Math.round(
        scoreLead * 50 +
          engagementBonus +
          timeBonus +
          (personaState.instantSignals.isReturning ? 10 : 0),
      ),
    );

    // Determine persona with priority rules
    if (scores.intent >= 8) {
      personaState.persona = 'ready-buyer';
    } else if (topScore >= 5) {
      const personaMap = {
        value: 'value-seeker',
        solution: 'solution-seeker',
        trust: 'trust-seeker',
        intent: 'ready-buyer',
      };
      personaState.persona = personaMap[topCategory] || 'explorer';
    } else {
      personaState.persona = 'explorer';
    }

    // Persist for returning visitors
    if (localStorage && personaState.confidence > 40) {
      try {
        localStorage.setItem(
          PERSONA_CONFIG.storageKey,
          JSON.stringify({
            persona: personaState.persona,
            confidence: personaState.confidence,
            scores: personaState.scores,
            timestamp: Date.now(),
          }),
        );
      } catch {
        /* ignore */
      }
    }
  };

  /* Helper functions */

  const normalize = raw => {
    if (!raw) return raw;
    try {
      const u = new URL(raw, location.href);
      if (excludeSearch) u.search = '';
      if (excludeHash) u.hash = '';
      return u.toString();
    } catch {
      return raw;
    }
  };

  const getPayload = () => ({
    website,
    screen,
    language,
    title: document.title,
    hostname,
    url: currentUrl,
    referrer: currentRef,
    tag,
    id: identity ? identity : undefined,
  });

  const hasDoNotTrack = () => {
    const dnt = doNotTrack || ndnt || msdnt;
    return dnt === 1 || dnt === '1' || dnt === 'yes';
  };

  /* Event handlers */

  const handlePush = (_state, _title, url) => {
    if (!url) return;

    currentRef = currentUrl;
    currentUrl = normalize(new URL(url, location.href).toString());

    if (currentUrl !== currentRef) {
      setTimeout(track, delayDuration);
    }
  };

  const handlePathChanges = () => {
    const hook = (_this, method, callback) => {
      const orig = _this[method];
      return (...args) => {
        callback.apply(null, args);
        return orig.apply(_this, args);
      };
    };

    history.pushState = hook(history, 'pushState', handlePush);
    history.replaceState = hook(history, 'replaceState', handlePush);
  };

  const handleClicks = () => {
    const trackElement = async el => {
      const eventName = el.getAttribute(eventNameAttribute);
      if (eventName) {
        const eventData = {};

        el.getAttributeNames().forEach(name => {
          const match = name.match(eventRegex);
          if (match) eventData[match[1]] = el.getAttribute(name);
        });

        return track(eventName, eventData);
      }
    };
    const onClick = async e => {
      const el = e.target;
      const parentElement = el.closest('a,button');
      if (!parentElement) return trackElement(el);

      const { href, target } = parentElement;
      if (!parentElement.getAttribute(eventNameAttribute)) return;

      if (parentElement.tagName === 'BUTTON') {
        return trackElement(parentElement);
      }
      if (parentElement.tagName === 'A' && href) {
        const external =
          target === '_blank' ||
          e.ctrlKey ||
          e.shiftKey ||
          e.metaKey ||
          (e.button && e.button === 1);
        if (!external) e.preventDefault();
        return trackElement(parentElement).then(() => {
          if (!external) {
            (target === '_top' ? top.location : location).href = href;
          }
        });
      }
    };
    document.addEventListener('click', onClick, true);
  };

  const handlePersona = () => {
    // Respect DNT for persona tracking
    if (dnt && hasDoNotTrack()) return;

    // ====== PHASE 1: Instant signals (0-2 seconds) ======
    extractInstantSignals();

    // ====== PHASE 2: Set up behavioral tracking ======
    trackBehaviorEvents();

    // Track scroll depth (enhanced)
    const logScroll = () => {
      const depth = Math.round(
        ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100,
      );
      if (depth > personaState.currentPage.maxScroll) {
        personaState.currentPage.maxScroll = depth;
      }
    };

    // Start tracking current page
    const startPageTracking = () => {
      const path = location.pathname;
      personaState.currentPage = {
        path,
        startTime: Date.now(),
        maxScroll: 0,
      };
      personaState.sessionMetrics.pageCount++;
    };

    // Save current page visit data
    const saveCurrentPage = () => {
      const { path, startTime, maxScroll } = personaState.currentPage;
      if (!path || !startTime) return;

      const timeSpent = (Date.now() - startTime) / 1000;
      const category = categorizeUrl(path);

      if (!personaState.pageVisits[category]) {
        personaState.pageVisits[category] = [];
      }

      // Update existing or add new
      const existing = personaState.pageVisits[category].find(v => v.path === path);
      if (existing) {
        existing.timeSpent += timeSpent;
        existing.maxScroll = Math.max(existing.maxScroll, maxScroll);
      } else {
        personaState.pageVisits[category].push({ path, timeSpent, scrollDepth: maxScroll });
      }
    };

    // Send persona update to server (enhanced with ML features)
    const sendPersonaUpdate = () => {
      saveCurrentPage();

      // ====== PHASE 3: Extract behavioral features ======
      extractBehaviorFeatures();
      calculatePersona();

      const { persona, confidence, scores, pageVisits, behaviorFeatures } = personaState;

      // Only send if we have some confidence
      if (confidence < 10) return;

      // Generate ML feature vector for training
      const featureVector = generateFeatureVector();

      send(
        {
          ...getPayload(),
          data: {
            persona,
            confidence,
            scores,
            pageVisits,
            // ML training data
            behaviorFeatures,
            featureVector,
            sessionDuration: (Date.now() - personaState.sessionMetrics.startTime) / 1000,
          },
        },
        'personality',
      );

      // Dispatch event for real-time client-side switching
      window.dispatchEvent(
        new CustomEvent('umami:persona', {
          detail: {
            persona,
            confidence,
            scores,
            behaviorFeatures,
            source: 'behavioral',
          },
        }),
      );
    };

    document.addEventListener('scroll', logScroll, { passive: true });
    startPageTracking();

    // Update on navigation (SPA)
    const originalPush = history.pushState;
    history.pushState = function (...args) {
      saveCurrentPage();
      originalPush.apply(this, args);
      startPageTracking();
    };

    // Send updates periodically (faster for ML)
    setInterval(sendPersonaUpdate, PERSONA_CONFIG.updateInterval);

    // Send on page hide (leaving)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendPersonaUpdate();
      }
    });

    // Also extract behavior features more frequently for responsive UI
    setInterval(extractBehaviorFeatures, 2000);
  };

  /* Tracking functions */

  const trackingDisabled = () =>
    disabled ||
    !website ||
    (localStorage && localStorage.getItem('umami.disabled')) ||
    (domain && !domains.includes(hostname)) ||
    (dnt && hasDoNotTrack());

  const send = async (payload, type = 'event') => {
    if (trackingDisabled()) return;

    const callback = window[beforeSend];

    if (typeof callback === 'function') {
      payload = await Promise.resolve(callback(type, payload));
    }

    if (!payload) return;

    try {
      const res = await fetch(endpoint, {
        keepalive: true,
        method: 'POST',
        body: JSON.stringify({ type, payload }),
        headers: {
          'Content-Type': 'application/json',
          ...(typeof cache !== 'undefined' && { 'x-umami-cache': cache }),
        },
        credentials,
      });

      const data = await res.json();
      if (data) {
        disabled = !!data.disabled;
        cache = data.cache;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* no-op */
    }
  };

  const init = () => {
    if (!initialized) {
      initialized = true;
      track();
      handlePathChanges();
      handleClicks();
      handlePersona();
    }
  };

  const track = (name, data) => {
    if (typeof name === 'string') return send({ ...getPayload(), name, data });
    if (typeof name === 'object') return send({ ...name });
    if (typeof name === 'function') return send(name(getPayload()));
    return send(getPayload());
  };

  const identify = (id, data) => {
    if (typeof id === 'string') {
      identity = id;
    }

    cache = '';
    return send(
      {
        ...getPayload(),
        data: typeof id === 'object' ? id : data,
      },
      'identify',
    );
  };

  /* Start */

  // Content switching functionality
  const contentSwitcher = {
    variants: [],
    applied: new Set(),

    // Fetch content variants from server
    async fetchVariants() {
      if (!website || !cache) return;
      try {
        const res = await fetch(
          `${host}/api/persona?websiteId=${website}&sessionId=${cache.sessionId}`,
        );
        if (res.ok) {
          const data = await res.json();
          this.variants = data.variants || [];
          personaState.persona = data.persona;
          personaState.confidence = data.confidence;
          personaState.scores = data.scores;
        }
      } catch {
        /* silent fail */
      }
    },

    // Apply variants to elements below viewport
    applyVariants() {
      const viewportBottom = window.scrollY + window.innerHeight;

      for (const variant of this.variants) {
        if (this.applied.has(variant.selector)) continue;

        const elements = document.querySelectorAll(variant.selector);
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;

          // Only apply to elements below current viewport OR not yet visible
          if (elementTop > viewportBottom || rect.top > window.innerHeight) {
            this.applyVariant(el, variant);
            this.applied.add(variant.selector);
          }
        }
      }
    },

    // Apply a single variant to an element
    applyVariant(el, variant) {
      switch (variant.contentType) {
        case 'text':
          el.textContent = variant.content;
          break;
        case 'html':
          el.innerHTML = variant.content;
          break;
        case 'attribute': {
          const [attr, value] = variant.content.split('=');
          el.setAttribute(attr, value);
          break;
        }
        case 'class':
          el.className = variant.content;
          break;
      }
      el.setAttribute('data-persona-variant', personaState.persona);
    },

    // Initialize content switching
    init() {
      // Fetch variants after first persona update
      window.addEventListener(
        'umami:persona',
        async () => {
          if (this.variants.length === 0) {
            await this.fetchVariants();
          }
          this.applyVariants();
        },
        { once: true },
      );

      // Re-apply on scroll (for lazy-loaded content)
      let scrollTimeout;
      document.addEventListener(
        'scroll',
        () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => this.applyVariants(), 100);
        },
        { passive: true },
      );
    },
  };

  // ============================================
  // CONVERSION TRACKING (for ML training)
  // ============================================

  const trackConversion = (eventType, value = null, data = {}) => {
    const { persona, confidence, pageVisits } = personaState;
    const sessionDuration = (Date.now() - personaState.sessionMetrics.startTime) / 1000;

    // Get pages visited before conversion
    const pagesBefore = Object.values(pageVisits)
      .flat()
      .map(p => p.path);

    send(
      {
        ...getPayload(),
        name: `conversion:${eventType}`,
        data: {
          eventType,
          eventValue: value,
          persona,
          confidence,
          pagesBefore,
          timeToConvert: Math.round(sessionDuration),
          ...data,
        },
      },
      'conversion',
    );

    // Also track as regular event for analytics
    track(`conversion:${eventType}`, { value, persona });
  };

  // Auto-detect form submissions
  const handleFormConversions = () => {
    document.addEventListener(
      'submit',
      e => {
        const form = e.target;
        if (!form || form.tagName !== 'FORM') return;

        const action = (form.action || '').toLowerCase();
        const id = (form.id || '').toLowerCase();
        const className = (form.className || '').toLowerCase();
        const formStr = `${action} ${id} ${className}`;

        // Detect conversion type from form attributes
        let conversionType = 'form_submit';
        if (/signup|register|join/i.test(formStr)) {
          conversionType = 'signup';
        } else if (/contact|inquiry|message/i.test(formStr)) {
          conversionType = 'contact';
        } else if (/demo|book|schedule/i.test(formStr)) {
          conversionType = 'demo_request';
        } else if (/newsletter|subscribe/i.test(formStr)) {
          conversionType = 'newsletter';
        } else if (/checkout|payment|purchase/i.test(formStr)) {
          conversionType = 'purchase';
        }

        trackConversion(conversionType, null, { formId: form.id });
      },
      { capture: true },
    );
  };

  if (!window.umami) {
    window.umami = {
      track,
      identify,
      // Conversion tracking for ML
      trackConversion,
      // Persona API for real-time content switching
      getPersona: () => ({
        persona: personaState.persona,
        confidence: personaState.confidence,
        scores: { ...personaState.scores },
        features: { ...personaState.behaviorFeatures },
      }),
      // Get ML feature vector (for debugging/validation)
      getFeatures: () => generateFeatureVector(),
      // Listen for persona changes
      onPersonaChange: callback => {
        window.addEventListener('umami:persona', e => callback(e.detail));
      },
      // Manual content switching
      switchContent: (selector, content, type = 'text') => {
        contentSwitcher.applyVariant(document.querySelector(selector), {
          content,
          contentType: type,
        });
      },
    };
  }

  // Initialize form conversion tracking
  handleFormConversions();

  // Initialize content switching
  contentSwitcher.init();

  let currentUrl = normalize(href);
  let currentRef = normalize(referrer.startsWith(origin) ? '' : referrer);

  let initialized = false;
  let disabled = false;
  let cache;
  let identity;

  if (autoTrack && !trackingDisabled()) {
    if (document.readyState === 'complete') {
      init();
    } else {
      document.addEventListener('readystatechange', init, true);
    }
  }
})(window);
