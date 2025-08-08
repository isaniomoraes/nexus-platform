ALTER TABLE workflows
  ADD COLUMN IF NOT EXISTS reporting_link TEXT,
  ADD COLUMN IF NOT EXISTS roi_link TEXT,
  ADD COLUMN IF NOT EXISTS documentation_link TEXT;

