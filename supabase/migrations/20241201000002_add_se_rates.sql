-- Add hourly rates for SE users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS hourly_cost_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS hourly_bill_rate NUMERIC;


