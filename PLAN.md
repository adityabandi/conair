# Signal Conversions - Implementation Plan

## 🎯 The Vision

**Signal** = Conversion Intelligence Platform that:
- Captures **30+ behavioral signals** from visitors
- Detects **6 buyer personas** in real-time using ML
- Shows **traffic source intelligence** (how Google Ads vs organic behave)
- Calculates **conversion readiness scores**
- Enables **dynamic content personalization** based on persona
- All **privacy-first** - no cookies, no PII, GDPR compliant

---

## ✅ What's Built & Working

| Component | Status | Notes |
|-----------|--------|-------|
| **Landing Page** | ✅ Complete | New Signal branding, burnt orange theme, 30+ signals showcase |
| **Zen Design System** | ✅ 37 components | Modern, Linear-inspired styling |
| **Database Schema** | ✅ 15 migrations | All persona tables ready (PersonaAnalytics, PersonaInsight, etc.) |
| **Tracker JS** | ✅ 1022 lines | Full behavioral signal extraction |
| **Persona API** | ✅ Complete | Detection endpoint + content variants |
| **Insights Engine** | ✅ Complete | Auto-generates recommendations |
| **Dashboard Components** | ✅ Built | PersonaOverview, LiveVisitorFeed, InsightsList |
| **Branding** | ✅ Updated | Signal Conversions across codebase |

---

## 🔧 What Needs Work

### Priority 1: Get It Running

1. **Database Migration** - Schema exists but needs to be applied
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Environment Setup** - Need `.env` with database URL
   ```
   DATABASE_URL=postgresql://...
   ```

3. **First User Creation** - Create admin account
   ```bash
   node scripts/create-user.js admin your-password
   ```

### Priority 2: Core Features to Complete

| Feature | Status | What's Needed |
|---------|--------|---------------|
| **Login Flow** | 90% | Test & polish styling |
| **Add Website Flow** | 90% | Wire up to persona detection |
| **Tracking Script Install** | 90% | Show snippet, verify installation |
| **Persona Dashboard** | 80% | Empty states, loading states |
| **Live Visitor Feed** | 80% | Real-time updates, animations |
| **Insights Panel** | 70% | Wire to real data, "Apply" action |
| **Content Personalization** | 60% | ContentEditor UI needs integration |

### Priority 3: Polish & Differentiation

- [ ] Traffic Source breakdown (UTM analysis)
- [ ] Conversion Readiness Score visual
- [ ] A/B Testing for personas
- [ ] Export/reporting
- [ ] API access for headless usage

---

## 📁 File Structure (Key Files)

```
src/
├── app/
│   ├── landing/           # ✅ New Signal landing page
│   ├── login/             # Login flow
│   ├── (main)/
│   │   ├── websites/      # Website management
│   │   │   └── [websiteId]/
│   │   │       ├── persona/    # 🎯 CORE: Persona dashboard
│   │   │       ├── live/       # Live visitor feed
│   │   │       └── insights/   # AI insights
│   │   ├── settings/      # User/team settings
│   │   └── welcome/       # Onboarding
│   └── api/
│       ├── persona/       # Persona detection API
│       └── websites/      # Website data APIs
├── components/
│   ├── persona/           # 🎯 CORE: Persona UI components
│   │   ├── PersonaOverview.tsx
│   │   ├── LiveVisitorFeed.tsx
│   │   ├── InsightsList.tsx
│   │   ├── ContentEditor.tsx
│   │   └── SetupWizard.tsx
│   ├── zen/               # Design system
│   └── ui/                # Shared UI components
├── tracker/               # 🎯 CORE: Tracker script (collects signals)
├── lib/
│   └── persona/           # Persona detection logic
└── queries/               # Database queries
```

---

## 🚀 Next Steps (In Order)

### Step 1: Database & Auth
```bash
# 1. Set up PostgreSQL (local or cloud)
# 2. Update .env with DATABASE_URL
# 3. Run migrations
npx prisma migrate dev
npx prisma generate

# 4. Create admin user
node scripts/create-user.js admin password123
```

### Step 2: Test Core Flow
1. Start dev server: `npm run dev`
2. Go to http://localhost:3001/login
3. Login with admin account
4. Add a website
5. Get tracking code
6. Install on a test page
7. Visit the test page
8. Check Persona dashboard for detected persona

### Step 3: Polish Persona Dashboard
- Add loading skeletons
- Add empty states
- Wire insights to real data
- Add persona distribution chart

### Step 4: Traffic Source Intelligence
- Parse UTM parameters
- Show source breakdown
- Compare behavior by source

---

## 🗑️ Files We Could Remove (Legacy Umami)

These are Umami features not core to Signal's persona focus:

| Path | What It Is | Keep? |
|------|-----------|-------|
| `src/app/(main)/boards/` | Dashboard boards | Maybe (could adapt) |
| `src/app/(main)/links/` | Link tracking | Maybe |
| `src/app/(main)/pixels/` | Tracking pixels | Maybe |
| `src/lang/` (non-English) | 50+ language files | Remove most |
| `cypress/` | E2E tests (Umami) | Update or remove |

**Recommendation**: Keep for now, focus on persona features first.

---

## 📊 The 30+ Behavioral Signals

### Device & Technical (6)
- Device type, Screen resolution, Browser, OS, Connection speed, Touch vs mouse

### Location & Timing (6)  
- Country/region/city, Timezone, Local time, Day of week, ISP type, VPN detection

### Interaction Patterns (8)
- Scroll depth/velocity, Time per section, Mouse movement, Hover on CTAs, Rage clicks, Copy/paste, Tab visibility, Idle patterns

### Session & Journey (6)
- Entry page, Referrer/UTM, Pages per session, Nav path, Return frequency, Time between visits

### Engagement Quality (6)
- Video engagement, FAQ interactions, Pricing behavior, Testimonial time, Form focus, Chat opens

---

## 🎨 Design System

**Colors (Burnt Orange Theme)**
- Primary: `#EA580C`
- Primary Light: `#F97316`
- Primary Dark: `#C2410C`
- Accent: `#FB923C`

**Typography**
- Font: System stack (-apple-system, etc.)
- Headings: 700 weight, tight letter-spacing

**Components** (in `src/components/zen/`)
- Button, Card, Input, Modal, Dropdown, Table, etc.

---

*Last updated: December 9, 2024*
