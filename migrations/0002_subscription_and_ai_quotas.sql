ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN osce_trial_used INTEGER NOT NULL DEFAULT 0
  CHECK (osce_trial_used IN (0, 1));
ALTER TABLE users ADD COLUMN prescriptions_today_count INTEGER NOT NULL DEFAULT 0
  CHECK (prescriptions_today_count >= 0);
ALTER TABLE users ADD COLUMN last_prescription_date TEXT;

CREATE UNIQUE INDEX users_stripe_customer_id_idx
  ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
