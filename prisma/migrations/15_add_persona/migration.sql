-- Add Persona Intelligence tables for Convert Air
-- Migration: 15_add_persona

-- PersonalityProfile: Stores persona classification for each session
CREATE TABLE IF NOT EXISTS "personality_profile" (
    "profile_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "persona" VARCHAR(50),
    "confidence" INTEGER,
    "value_score" INTEGER,
    "solution_score" INTEGER,
    "trust_score" INTEGER,
    "intent_score" INTEGER,
    "page_visits" JSONB,
    "impulsivity_score" INTEGER,
    "price_sensitivity_score" INTEGER,
    "focus_score" INTEGER,
    "raw_signals" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "personality_profile_pkey" PRIMARY KEY ("profile_id"),
    CONSTRAINT "personality_profile_session_id_key" UNIQUE ("session_id"),
    CONSTRAINT "personality_profile_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("session_id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "personality_profile_persona_idx" ON "personality_profile"("persona");

-- ContentVariant: Persona-based content personalization
CREATE TABLE IF NOT EXISTS "content_variant" (
    "variant_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "persona" VARCHAR(50) NOT NULL,
    "selector" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "content_type" VARCHAR(50) NOT NULL,
    "page_path" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "content_variant_pkey" PRIMARY KEY ("variant_id")
);

CREATE INDEX IF NOT EXISTS "content_variant_website_id_idx" ON "content_variant"("website_id");
CREATE INDEX IF NOT EXISTS "content_variant_website_id_persona_idx" ON "content_variant"("website_id", "persona");
CREATE INDEX IF NOT EXISTS "content_variant_website_id_page_path_idx" ON "content_variant"("website_id", "page_path");

-- DetectedPage: Auto-detected pages from tracking
CREATE TABLE IF NOT EXISTS "detected_page" (
    "page_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "title" VARCHAR(500),
    "visits" INTEGER NOT NULL DEFAULT 0,
    "avg_time_on_page" DOUBLE PRECISION,
    "avg_scroll_depth" DOUBLE PRECISION,
    "category" VARCHAR(50),
    "first_seen" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMPTZ(6),

    CONSTRAINT "detected_page_pkey" PRIMARY KEY ("page_id"),
    CONSTRAINT "detected_page_website_id_path_key" UNIQUE ("website_id", "path")
);

CREATE INDEX IF NOT EXISTS "detected_page_website_id_idx" ON "detected_page"("website_id");
CREATE INDEX IF NOT EXISTS "detected_page_website_id_category_idx" ON "detected_page"("website_id", "category");

-- PersonaBehaviorSample: ML training data
CREATE TABLE IF NOT EXISTS "persona_behavior_sample" (
    "sample_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "feature_vector" JSONB NOT NULL,
    "predicted_persona" VARCHAR(50),
    "actual_conversion" VARCHAR(100),
    "converted_value" DECIMAL(19, 4),
    "session_duration" INTEGER,
    "page_count" INTEGER,
    "engagement_score" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_behavior_sample_pkey" PRIMARY KEY ("sample_id")
);

CREATE INDEX IF NOT EXISTS "persona_behavior_sample_website_id_idx" ON "persona_behavior_sample"("website_id");
CREATE INDEX IF NOT EXISTS "persona_behavior_sample_website_id_predicted_persona_idx" ON "persona_behavior_sample"("website_id", "predicted_persona");
CREATE INDEX IF NOT EXISTS "persona_behavior_sample_website_id_actual_conversion_idx" ON "persona_behavior_sample"("website_id", "actual_conversion");
CREATE INDEX IF NOT EXISTS "persona_behavior_sample_created_at_idx" ON "persona_behavior_sample"("created_at");

-- PersonaAnalytics: Daily aggregated persona analytics
CREATE TABLE IF NOT EXISTS "persona_analytics" (
    "analytics_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "value_seeker_count" INTEGER NOT NULL DEFAULT 0,
    "solution_seeker_count" INTEGER NOT NULL DEFAULT 0,
    "trust_seeker_count" INTEGER NOT NULL DEFAULT 0,
    "ready_buyer_count" INTEGER NOT NULL DEFAULT 0,
    "explorer_count" INTEGER NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "value_seeker_conversions" INTEGER NOT NULL DEFAULT 0,
    "solution_seeker_conversions" INTEGER NOT NULL DEFAULT 0,
    "trust_seeker_conversions" INTEGER NOT NULL DEFAULT 0,
    "ready_buyer_conversions" INTEGER NOT NULL DEFAULT 0,
    "explorer_conversions" INTEGER NOT NULL DEFAULT 0,
    "engagement_by_persona" JSONB,
    "avg_confidence" DOUBLE PRECISION,

    CONSTRAINT "persona_analytics_pkey" PRIMARY KEY ("analytics_id"),
    CONSTRAINT "persona_analytics_website_id_date_key" UNIQUE ("website_id", "date")
);

CREATE INDEX IF NOT EXISTS "persona_analytics_website_id_idx" ON "persona_analytics"("website_id");
CREATE INDEX IF NOT EXISTS "persona_analytics_website_id_date_idx" ON "persona_analytics"("website_id", "date");

-- ConversionEvent: Conversion events for ML training
CREATE TABLE IF NOT EXISTS "conversion_event" (
    "conversion_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "event_value" DECIMAL(19, 4),
    "event_data" JSONB,
    "persona" VARCHAR(50),
    "confidence" INTEGER,
    "pages_before" JSONB,
    "time_to_convert" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_event_pkey" PRIMARY KEY ("conversion_id")
);

CREATE INDEX IF NOT EXISTS "conversion_event_website_id_idx" ON "conversion_event"("website_id");
CREATE INDEX IF NOT EXISTS "conversion_event_website_id_event_type_idx" ON "conversion_event"("website_id", "event_type");
CREATE INDEX IF NOT EXISTS "conversion_event_website_id_persona_idx" ON "conversion_event"("website_id", "persona");
CREATE INDEX IF NOT EXISTS "conversion_event_created_at_idx" ON "conversion_event"("created_at");

-- PersonaInsight: Generated insights about persona behavior
CREATE TABLE IF NOT EXISTS "persona_insight" (
    "insight_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "persona" VARCHAR(50) NOT NULL,
    "insight_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "impact" VARCHAR(20) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "metrics" JSONB NOT NULL,
    "action_type" VARCHAR(50),
    "action_data" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "applied_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "persona_insight_pkey" PRIMARY KEY ("insight_id")
);

CREATE INDEX IF NOT EXISTS "persona_insight_website_id_idx" ON "persona_insight"("website_id");
CREATE INDEX IF NOT EXISTS "persona_insight_website_id_persona_idx" ON "persona_insight"("website_id", "persona");
CREATE INDEX IF NOT EXISTS "persona_insight_website_id_status_idx" ON "persona_insight"("website_id", "status");
CREATE INDEX IF NOT EXISTS "persona_insight_website_id_impact_idx" ON "persona_insight"("website_id", "impact");

-- OptimizationRule: Auto-learned optimization rules
CREATE TABLE IF NOT EXISTS "optimization_rule" (
    "rule_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "personas" VARCHAR(50)[] NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "rule_type" VARCHAR(50) NOT NULL,
    "condition" JSONB NOT NULL,
    "action" JSONB NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "ml_score" DOUBLE PRECISION,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "optimization_rule_pkey" PRIMARY KEY ("rule_id")
);

CREATE INDEX IF NOT EXISTS "optimization_rule_website_id_idx" ON "optimization_rule"("website_id");
CREATE INDEX IF NOT EXISTS "optimization_rule_website_id_is_enabled_idx" ON "optimization_rule"("website_id", "is_enabled");

-- SessionOptimization: Track what optimization was shown to which session
CREATE TABLE IF NOT EXISTS "session_optimization" (
    "session_opt_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "rule_id" UUID,
    "persona" VARCHAR(50) NOT NULL,
    "confidence" INTEGER NOT NULL,
    "pages_viewed" VARCHAR(500)[] NOT NULL,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "conversion_type" VARCHAR(50),
    "conversion_value" DECIMAL(19, 4),
    "session_duration" INTEGER,
    "engagement_score" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_optimization_pkey" PRIMARY KEY ("session_opt_id")
);

CREATE INDEX IF NOT EXISTS "session_optimization_website_id_idx" ON "session_optimization"("website_id");
CREATE INDEX IF NOT EXISTS "session_optimization_website_id_rule_id_idx" ON "session_optimization"("website_id", "rule_id");
CREATE INDEX IF NOT EXISTS "session_optimization_website_id_persona_idx" ON "session_optimization"("website_id", "persona");
CREATE INDEX IF NOT EXISTS "session_optimization_website_id_converted_idx" ON "session_optimization"("website_id", "converted");

-- LiveVisitor: Live visitor tracking for real-time feed
CREATE TABLE IF NOT EXISTS "live_visitor" (
    "visitor_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "website_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "persona" VARCHAR(50),
    "confidence" INTEGER,
    "current_page" VARCHAR(500),
    "page_history" VARCHAR(500)[] NOT NULL DEFAULT '{}',
    "engagement_score" INTEGER,
    "is_high_intent" BOOLEAN NOT NULL DEFAULT false,
    "bounce_risk" DOUBLE PRECISION,
    "referrer" VARCHAR(500),
    "utm_source" VARCHAR(100),
    "device" VARCHAR(20),
    "country" CHAR(2),
    "first_seen" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_visitor_pkey" PRIMARY KEY ("visitor_id"),
    CONSTRAINT "live_visitor_session_id_key" UNIQUE ("session_id")
);

CREATE INDEX IF NOT EXISTS "live_visitor_website_id_idx" ON "live_visitor"("website_id");
CREATE INDEX IF NOT EXISTS "live_visitor_website_id_last_seen_idx" ON "live_visitor"("website_id", "last_seen");
CREATE INDEX IF NOT EXISTS "live_visitor_website_id_persona_idx" ON "live_visitor"("website_id", "persona");
CREATE INDEX IF NOT EXISTS "live_visitor_website_id_is_high_intent_idx" ON "live_visitor"("website_id", "is_high_intent");
