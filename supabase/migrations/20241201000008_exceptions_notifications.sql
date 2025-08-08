ALTER TABLE exceptions
  ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '[]'::jsonb;

