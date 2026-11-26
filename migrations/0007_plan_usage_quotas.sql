ALTER TABLE users ADD COLUMN prescription_package_count INTEGER NOT NULL DEFAULT 0
  CHECK (prescription_package_count >= 0);

ALTER TABLE users ADD COLUMN osce_package_count INTEGER NOT NULL DEFAULT 0
  CHECK (osce_package_count >= 0);

ALTER TABLE users ADD COLUMN osce_usage_count INTEGER NOT NULL DEFAULT 0
  CHECK (osce_usage_count >= 0);

ALTER TABLE users ADD COLUMN osce_usage_date TEXT;

