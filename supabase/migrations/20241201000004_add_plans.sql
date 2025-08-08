-- Enums for plans
DO $$ BEGIN
  CREATE TYPE pricing_model AS ENUM ('Fixed', 'Usage', 'Tiered');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_cadence AS ENUM ('Monthly', 'Quarterly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_usage_api AS ENUM ('AIR Direct', 'SDK', 'Manual Upload');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE contract_length AS ENUM ('1 month', '3 months', '6 months', '12 months');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pricing_model pricing_model NOT NULL,
  credits_per_period INTEGER,
  price_per_credit NUMERIC,
  product_usage_api product_usage_api NOT NULL,
  contract_length contract_length NOT NULL DEFAULT '12 months',
  billing_cadence billing_cadence NOT NULL DEFAULT 'Monthly',
  setup_fee NUMERIC NOT NULL DEFAULT 0,
  prepayment_percent NUMERIC NOT NULL DEFAULT 0,
  cap_amount NUMERIC NOT NULL DEFAULT 0,
  overage_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add plan_id to subscriptions for linkage (nullable to preserve existing data)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);

-- Update trigger for plans (Postgres does not support IF NOT EXISTS for triggers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_plans_updated_at'
  ) THEN
    CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS for plans: Admin full access; SE read; Clients no access
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plans_select ON plans;
CREATE POLICY plans_select ON plans FOR SELECT USING (
  get_jwt_role() IN ('admin','se')
);

DROP POLICY IF EXISTS plans_write ON plans;
CREATE POLICY plans_write ON plans FOR ALL TO PUBLIC USING (
  get_jwt_role() = 'admin'
) WITH CHECK (
  get_jwt_role() = 'admin'
);


