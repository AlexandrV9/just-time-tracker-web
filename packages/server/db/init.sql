-- Initial schema for fresh PostgreSQL (docker-entrypoint-initdb.d)
-- Runs only when the postgres data volume is created for the first time.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  first_name VARCHAR(255) NOT NULL,
  login VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),

  email VARCHAR(255) UNIQUE,
  email_verified_at TIMESTAMPTZ,
  avatar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  locale VARCHAR(5) NOT NULL DEFAULT 'en',
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- auth_providers (OAuth)
CREATE TABLE IF NOT EXISTS auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_providers_active_user_provider
  ON auth_providers (user_id, provider)
  WHERE disconnected_at IS NULL;

-- email_verifications (single active email change request per user)
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  attempts_count INT NOT NULL DEFAULT 0,
  resend_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  resend_available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_verifications_user_id
  ON email_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at
  ON email_verifications(expires_at);

-- password_resets (single active "forgot password" request per user)
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(255) NOT NULL,
  attempts_count INT NOT NULL DEFAULT 0,
  resend_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  resend_available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_password_resets_user_id
  ON password_resets(user_id);

CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at
  ON password_resets(expires_at);

-- Daily per-user email send counter (verification + password reset)
CREATE TABLE IF NOT EXISTS user_email_daily_sends (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  send_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day),
  CONSTRAINT user_email_daily_sends_count_positive CHECK (send_count >= 0)
);

-- auth_rate_limits (login/reset/email verification rate limiting and lockouts)
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  lockout_tier INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_rate_limits_locked_until_idx
  ON auth_rate_limits (locked_until)
  WHERE locked_until IS NOT NULL;

-- activities
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000),

  created_by_id TEXT NOT NULL,

  tags TEXT[] NOT NULL DEFAULT '{}',

  last_activity_session_id UUID,

  active_duration_ms BIGINT NOT NULL DEFAULT 0,
  pause_duration_ms BIGINT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT activities_tags_max_10 CHECK (cardinality(tags) <= 10)
);

CREATE INDEX IF NOT EXISTS idx_activities_created_by
  ON activities(created_by_id);

CREATE INDEX IF NOT EXISTS idx_activities_created_at
  ON activities(created_at);

CREATE INDEX IF NOT EXISTS idx_activities_tags
  ON activities USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_activities_last_activity_session_id
  ON activities(last_activity_session_id);

-- activity_sessions
CREATE TABLE IF NOT EXISTS activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,

  status VARCHAR(20) NOT NULL
    CHECK (status IN ('active', 'paused', 'finished')),

  active_duration_ms BIGINT NOT NULL DEFAULT 0,
  pause_duration_ms BIGINT NOT NULL DEFAULT 0,

  current_segment_id UUID
);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_activity_id
  ON activity_sessions(activity_id);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_started_at
  ON activity_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_activity_sessions_current_segment_id
  ON activity_sessions(current_segment_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'activities_last_activity_session_id_fkey'
  ) THEN
    ALTER TABLE activities
      ADD CONSTRAINT activities_last_activity_session_id_fkey
      FOREIGN KEY (last_activity_session_id)
      REFERENCES activity_sessions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- activity_session_segments
CREATE TABLE IF NOT EXISTS activity_session_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  session_id UUID NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,

  segment_type VARCHAR(10) NOT NULL
    CHECK (segment_type IN ('active', 'pause')),

  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_activity_session_segments_session_id
  ON activity_session_segments(session_id);

CREATE INDEX IF NOT EXISTS idx_activity_session_segments_started_at
  ON activity_session_segments(started_at);

-- day_plans
CREATE TABLE IF NOT EXISTS day_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  created_by_id TEXT NOT NULL,
  date DATE NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT day_plans_created_by_date_unique UNIQUE (created_by_id, date)
);

CREATE INDEX IF NOT EXISTS idx_day_plans_created_by_id
  ON day_plans(created_by_id);

CREATE INDEX IF NOT EXISTS idx_day_plans_date
  ON day_plans(date);

-- day_plan_items
CREATE TABLE IF NOT EXISTS day_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  day_plan_id UUID NOT NULL
    REFERENCES day_plans(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL
    REFERENCES activities(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT day_plan_items_plan_activity_unique UNIQUE (day_plan_id, activity_id)
);

CREATE INDEX IF NOT EXISTS idx_day_plan_items_day_plan_id
  ON day_plan_items(day_plan_id);

CREATE INDEX IF NOT EXISTS idx_day_plan_items_activity_id
  ON day_plan_items(activity_id);

-- notification_jobs (deferred notifications)
CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  send_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notification_jobs_status_check
    CHECK (status IN ('pending', 'sent', 'failed', 'canceled'))
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_send_at
  ON notification_jobs(status, send_at);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_user_id
  ON notification_jobs(user_id);

-- push_subscriptions (Web Push endpoints; delivery wired later)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

-- activity_settings (per-activity notification preferences)
CREATE TABLE IF NOT EXISTS activity_settings (
  activity_id UUID PRIMARY KEY REFERENCES activities(id) ON DELETE CASCADE,
  session_goal_seconds INT NOT NULL DEFAULT 5400,
  notify_on_goal_reached BOOLEAN NOT NULL DEFAULT false,
  notify_on_long_pause BOOLEAN NOT NULL DEFAULT false,
  long_pause_threshold_seconds INT NOT NULL DEFAULT 1800,
  notify_on_long_activity BOOLEAN NOT NULL DEFAULT false,
  long_activity_threshold_seconds INT NOT NULL DEFAULT 1800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT activity_settings_session_goal_positive
    CHECK (session_goal_seconds > 0),
  CONSTRAINT activity_settings_long_pause_threshold_positive
    CHECK (long_pause_threshold_seconds > 0),
  CONSTRAINT activity_settings_long_activity_threshold_positive
    CHECK (long_activity_threshold_seconds > 0)
);
