-- ============================================================
-- CognitoSense centralized schema (Postgres)
-- Idempotent: safe to run on every startup.
-- ============================================================

-- ---------- Users (login / create account) ----------
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL   PRIMARY KEY,
  name          TEXT        NOT NULL DEFAULT '',
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Assessments (latest-only, one row per user) ----------
-- Mirrors the old CSV: questionnaire + games + eye-tracking in one row,
-- overwritten in place on each new submission.
CREATE TABLE IF NOT EXISTS assessments (
  user_id                BIGINT      PRIMARY KEY
                                     REFERENCES users(id) ON DELETE CASCADE,
  questionnaire_response JSONB,
  games_response         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  eye_tracking_response  JSONB,
  q_total_score          NUMERIC,
  target_risk_class      INTEGER,
  q_completed_at         TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated           TIMESTAMPTZ NOT NULL DEFAULT now(),

  predicted_class INTEGER,
  prediction_confidence DOUBLE PRECISION,
  prediction_probabilities JSONB,
  risk_score DOUBLE PRECISION,
  predicted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
