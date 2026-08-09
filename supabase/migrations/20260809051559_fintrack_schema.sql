/*
# FinTrack schema — transactions, budgets, subscriptions

1. Purpose
   FinTrack is a personal finance tracker. Each signed-in user tracks their own
   transactions, monthly budgets per category, and recurring subscriptions.
   Data is strictly isolated per user via Row Level Security.

2. New Tables
   - transactions
       id uuid PK
       user_id uuid NOT NULL DEFAULT auth.uid()  (owner)
       merchant text NOT NULL
       amount numeric(12,2) NOT NULL  (always positive; type field distinguishes income/expense)
       type text NOT NULL CHECK (type in ('income','expense'))
       category text NOT NULL
       date date NOT NULL
       payment_method text NOT NULL
       notes text DEFAULT ''
       created_at timestamptz DEFAULT now()
   - budgets
       id uuid PK
       user_id uuid NOT NULL DEFAULT auth.uid()
       category text NOT NULL
       monthly_limit numeric(12,2) NOT NULL
       month text NOT NULL  (YYYY-MM)
       created_at timestamptz DEFAULT now()
       UNIQUE(user_id, category, month)
   - subscriptions
       id uuid PK
       user_id uuid NOT NULL DEFAULT auth.uid()
       name text NOT NULL
       amount numeric(12,2) NOT NULL
       frequency text NOT NULL CHECK (frequency in ('monthly','yearly','weekly'))
       next_payment_date date NOT NULL
       active boolean NOT NULL DEFAULT true
       created_at timestamptz DEFAULT now()

3. Security
   RLS enabled on all three tables.
   Owner-scoped CRUD: each authenticated user can only access rows where
   user_id = auth.uid(). The DEFAULT auth.uid() on user_id lets the client
   insert rows without explicitly passing user_id.

4. Indexes
   transactions(user_id), transactions(user_id, date), transactions(user_id, category)
   budgets(user_id, month), subscriptions(user_id)
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('income','expense')),
  category text NOT NULL,
  date date NOT NULL,
  payment_method text NOT NULL,
  notes text DEFAULT ''::text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  monthly_limit numeric(12,2) NOT NULL,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_budgets" ON budgets;
CREATE POLICY "select_own_budgets" ON budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_budgets" ON budgets;
CREATE POLICY "insert_own_budgets" ON budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_budgets" ON budgets;
CREATE POLICY "update_own_budgets" ON budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_budgets" ON budgets;
CREATE POLICY "delete_own_budgets" ON budgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('monthly','yearly','weekly')),
  next_payment_date date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subscriptions" ON subscriptions;
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_subscriptions" ON subscriptions;
CREATE POLICY "insert_own_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_subscriptions" ON subscriptions;
CREATE POLICY "update_own_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_subscriptions" ON subscriptions;
CREATE POLICY "delete_own_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
