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
  avatar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_user_id),
  UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);

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
