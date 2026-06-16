-- Daily per-user email send counter (verification + password reset).

CREATE TABLE IF NOT EXISTS user_email_daily_sends (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  send_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day),
  CONSTRAINT user_email_daily_sends_count_positive CHECK (send_count >= 0)
);
