ALTER TABLE users ADD COLUMN cpf_hash TEXT;

CREATE UNIQUE INDEX users_cpf_hash_idx
  ON users(cpf_hash)
  WHERE cpf_hash IS NOT NULL;
