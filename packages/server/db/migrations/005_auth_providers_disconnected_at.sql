-- Migration 005: soft-disconnect for auth_providers.
-- A provider link is a login method, independent from the user's email.
-- Unlinking sets disconnected_at instead of deleting, so the same OAuth
-- account can be re-linked (and the user logged back in) later.

ALTER TABLE auth_providers
  ADD COLUMN IF NOT EXISTS disconnected_at TIMESTAMPTZ;

-- Active (user_id, provider) uniqueness must allow keeping a disconnected row
-- alongside a new active one, so swap the plain constraint for a partial index.
ALTER TABLE auth_providers
  DROP CONSTRAINT IF EXISTS auth_providers_user_id_provider_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_providers_active_user_provider
  ON auth_providers (user_id, provider)
  WHERE disconnected_at IS NULL;
