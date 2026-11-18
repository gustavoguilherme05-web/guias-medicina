ALTER TABLE users ADD COLUMN experience_expires_at INTEGER;

CREATE TABLE experience_purchases (
  checkout_session_id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
