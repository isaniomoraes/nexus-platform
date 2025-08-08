-- Ensure three starter plans exist and link existing subscriptions.plan -> plans.plan_id

-- Seed plans if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Starter') THEN
    INSERT INTO plans (
      name, pricing_model, credits_per_period, price_per_credit, product_usage_api,
      contract_length, billing_cadence, setup_fee, prepayment_percent, cap_amount, overage_cost
    ) VALUES (
      'Starter', 'Usage', 1000, 1.00, 'AIR Direct', '3 months', 'Monthly', 1000, 10, 25000, 100
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Business Plus') THEN
    INSERT INTO plans (
      name, pricing_model, credits_per_period, price_per_credit, product_usage_api,
      contract_length, billing_cadence, setup_fee, prepayment_percent, cap_amount, overage_cost
    ) VALUES (
      'Business Plus', 'Fixed', NULL, NULL, 'SDK', '6 months', 'Quarterly', 2500, 15, 50000, 125
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Enterprise Pro') THEN
    INSERT INTO plans (
      name, pricing_model, credits_per_period, price_per_credit, product_usage_api,
      contract_length, billing_cadence, setup_fee, prepayment_percent, cap_amount, overage_cost
    ) VALUES (
      'Enterprise Pro', 'Tiered', NULL, NULL, 'Manual Upload', '12 months', 'Monthly', 5000, 25, 100000, 150
    );
  END IF;
END $$;

-- Link existing subscriptions rows to seeded plans using enum mapping -> plan names
UPDATE subscriptions s
SET plan_id = p.id
FROM plans p
WHERE s.plan_id IS NULL AND (
  (s.plan = 'basic' AND p.name = 'Starter') OR
  (s.plan = 'professional' AND p.name = 'Business Plus') OR
  (s.plan = 'enterprise' AND p.name = 'Enterprise Pro')
);


