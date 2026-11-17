PRAGMA defer_foreign_keys = ON;

CREATE TABLE users_new (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  osce_trial_used INTEGER NOT NULL DEFAULT 0
    CHECK (osce_trial_used IN (0, 1)),
  prescriptions_today_count INTEGER NOT NULL DEFAULT 0
    CHECK (prescriptions_today_count >= 0),
  last_prescription_date TEXT,
  stripe_subscription_id TEXT
);

CREATE TABLE sessions_new (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL REFERENCES users_new(email) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE comments_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guide_id TEXT NOT NULL,
  user_email TEXT NOT NULL REFERENCES users_new(email),
  user_name TEXT NOT NULL,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO users_new (
  email, name, password_salt, password_hash, created_at, stripe_customer_id,
  subscription_status, osce_trial_used, prescriptions_today_count,
  last_prescription_date, stripe_subscription_id
)
SELECT
  email, name, password_salt, password_hash, created_at, stripe_customer_id,
  subscription_status, osce_trial_used, prescriptions_today_count,
  last_prescription_date, NULL
FROM users;

INSERT INTO sessions_new (token_hash, email, expires_at, created_at)
SELECT token_hash, email, expires_at, created_at FROM sessions;

INSERT INTO comments_new (id, guide_id, user_email, user_name, body, created_at)
SELECT id, guide_id, user_email, user_name, body, created_at FROM comments;

DROP TABLE sessions;
DROP TABLE comments;
DROP TABLE users;

ALTER TABLE users_new RENAME TO users;
ALTER TABLE sessions_new RENAME TO sessions;
ALTER TABLE comments_new RENAME TO comments;

CREATE UNIQUE INDEX users_stripe_customer_id_idx
  ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX users_stripe_subscription_id_idx
  ON users(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
CREATE INDEX comments_guide_id_id_idx ON comments(guide_id, id DESC);
