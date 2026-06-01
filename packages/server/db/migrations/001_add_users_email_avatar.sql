-- Migration 001: add email and avatar columns to users, add unique constraint on email
-- Run once on any environment where the users table was created before these columns existed.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email  VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;
