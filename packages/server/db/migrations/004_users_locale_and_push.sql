-- Migration 004: user locale and push notification preference
-- Run once on existing deployments after 003_notifications_and_activity_settings.sql.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS locale VARCHAR(5) NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN NOT NULL DEFAULT true;
