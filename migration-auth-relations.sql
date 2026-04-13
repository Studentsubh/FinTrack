BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_name_type_unique UNIQUE (name, type)
);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category_id INTEGER;

ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS category_id INTEGER;

INSERT INTO users (name, email, password_hash)
SELECT
  'Legacy User',
  'legacy@fintrack.local',
  'legacysalt123456:ecb1a6abd29d3fd101c2238afe2996756f6ef21feff90c1a10757aa3edd71aa3b9034993aa16acc90d1b73cc1897e41ba9621484ac28c1de2a8373868b03d4be'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'legacy@fintrack.local'
);

INSERT INTO categories (name, type)
SELECT DISTINCT
  t.category,
  t.type
FROM transactions t
WHERE t.category IS NOT NULL
ON CONFLICT (name, type) DO NOTHING;

INSERT INTO categories (name, type)
SELECT DISTINCT
  b.category,
  'expense'
FROM budgets b
WHERE b.category IS NOT NULL
ON CONFLICT (name, type) DO NOTHING;

INSERT INTO categories (name, type)
VALUES
  ('Food', 'expense'),
  ('Transport', 'expense'),
  ('Shopping', 'expense'),
  ('Bills', 'expense'),
  ('Entertainment', 'expense'),
  ('Health', 'expense'),
  ('Other', 'expense'),
  ('Salary', 'income'),
  ('Freelance', 'income'),
  ('Investment', 'income'),
  ('Gift', 'income'),
  ('Other', 'income')
ON CONFLICT (name, type) DO NOTHING;

UPDATE transactions t
SET
  user_id = legacy_user.id,
  category_id = c.id
FROM users legacy_user
JOIN categories c
  ON c.name = t.category
 AND c.type = t.type
WHERE legacy_user.email = 'legacy@fintrack.local'
  AND (t.user_id IS NULL OR t.category_id IS NULL);

UPDATE budgets b
SET
  user_id = legacy_user.id,
  category_id = c.id
FROM users legacy_user
JOIN categories c
  ON c.name = b.category
 AND c.type = 'expense'
WHERE legacy_user.email = 'legacy@fintrack.local'
  AND (b.user_id IS NULL OR b.category_id IS NULL);

ALTER TABLE transactions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE budgets
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN category_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'transactions_user_id_fkey'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'transactions_category_id_fkey'
  ) THEN
    ALTER TABLE transactions
      ADD CONSTRAINT transactions_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budgets_user_id_fkey'
  ) THEN
    ALTER TABLE budgets
      ADD CONSTRAINT budgets_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budgets_category_id_fkey'
  ) THEN
    ALTER TABLE budgets
      ADD CONSTRAINT budgets_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budgets_user_id_category_id_month_unique'
  ) THEN
    ALTER TABLE budgets
      ADD CONSTRAINT budgets_user_id_category_id_month_unique
      UNIQUE (user_id, category_id, month);
  END IF;
END $$;

COMMIT;
