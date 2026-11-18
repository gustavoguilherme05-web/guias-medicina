ALTER TABLE users ADD COLUMN subscription_plan TEXT NOT NULL DEFAULT 'free'
  CHECK (subscription_plan IN ('free', 'prescription_only', 'pro'));
ALTER TABLE users ADD COLUMN osce_trial_session_hash TEXT;
ALTER TABLE users ADD COLUMN osce_trial_session_expires_at INTEGER;
