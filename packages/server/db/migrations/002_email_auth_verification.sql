-- Migration 002: OAuth providers, email verification, password resets
-- Run once after 001_add_users_email_avatar.sql on existing deployments.
-- Fresh Docker installs already get this schema from db/init.sql.

-- OAuth: password optional for provider-only accounts
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Email verification timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

UPDATE users
SET email_verified_at = created_at
WHERE email IS NOT NULL AND email_verified_at IS NULL;

-- auth_providers (OAuth), including soft-unlink via disconnected_at
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

ALTER TABLE auth_providers
  ADD COLUMN IF NOT EXISTS disconnected_at TIMESTAMPTZ;

ALTER TABLE auth_providers
  DROP CONSTRAINT IF EXISTS auth_providers_user_id_provider_key;

CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_providers_active_user_provider
  ON auth_providers (user_id, provider)
  WHERE disconnected_at IS NULL;

-- email_verifications (single active email change request per user)
DROP TABLE IF EXISTS email_verification_codes;

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
