-- Make clients.contract_start_date nullable to allow onboarding before contract
ALTER TABLE clients ALTER COLUMN contract_start_date DROP NOT NULL;


