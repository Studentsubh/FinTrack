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

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  category TEXT NOT NULL,
  budget_limit NUMERIC(12, 2) NOT NULL,
  month TEXT NOT NULL,
  CONSTRAINT budgets_user_id_category_id_month_unique UNIQUE (user_id, category_id, month)
);

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
