-- DropForeignKey
ALTER TABLE "personality_profile" DROP CONSTRAINT "personality_profile_session_id_fkey";

-- AlterTable
ALTER TABLE "content_variant" ALTER COLUMN "variant_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "conversion_event" ALTER COLUMN "conversion_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "detected_page" ALTER COLUMN "page_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "live_visitor" ALTER COLUMN "visitor_id" DROP DEFAULT,
ALTER COLUMN "page_history" DROP DEFAULT;

-- AlterTable
ALTER TABLE "optimization_rule" ALTER COLUMN "rule_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "persona_analytics" ALTER COLUMN "analytics_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "persona_behavior_sample" ALTER COLUMN "sample_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "persona_insight" ALTER COLUMN "insight_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "personality_profile" ALTER COLUMN "profile_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "session_optimization" ALTER COLUMN "session_opt_id" DROP DEFAULT;
