-- Migration 003: notification jobs, push subscriptions, activity settings
-- Run once on existing deployments after 002_email_auth_verification.sql.
-- Fresh Docker installs already get this schema from db/init.sql.

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
