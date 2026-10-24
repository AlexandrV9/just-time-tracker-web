CREATE TABLE auth_rate_limits (
  key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 0,
  failure_count INT NOT NULL DEFAULT 0,
  lockout_tier INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auth_rate_limits_locked_until_idx
  ON auth_rate_limits (locked_until)
  WHERE locked_until IS NOT NULL;
