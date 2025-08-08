-- Client document links to store overview URLs
CREATE TABLE IF NOT EXISTS client_document_links (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  survey_questions TEXT,
  survey_results TEXT,
  process_documentation TEXT,
  ada_proposal TEXT,
  contract TEXT,
  factory_markdown TEXT,
  test_plan TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_client_document_links_updated_at'
  ) THEN
    CREATE TRIGGER update_client_document_links_updated_at
    BEFORE UPDATE ON client_document_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Pipeline phases per client
CREATE TABLE IF NOT EXISTS client_pipeline_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_pipeline_phases_client ON client_pipeline_phases(client_id);

-- Seed phases for existing clients if table empty per client
INSERT INTO client_pipeline_phases (client_id, phase_name, position)
SELECT c.id, p.phase, p.pos
FROM clients c,
     (VALUES
       ('Discovery: Initial Survey', 1),
       ('Discovery: Process deep dive', 2),
       ('ADA Proposal Sent', 3),
       ('ADA Proposal Review done', 4),
       ('ADA Contract Sent', 5),
       ('ADA Contract Signed', 6),
       ('Credentials collected', 7),
       ('Factory build initiated', 8),
       ('Test plan generated', 9),
       ('Testing started', 10),
       ('Production deploy', 11)
     ) AS p(phase, pos)
WHERE NOT EXISTS (
  SELECT 1 FROM client_pipeline_phases cpp WHERE cpp.client_id = c.id
);

-- RLS
ALTER TABLE client_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_pipeline_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_documents_access_policy ON client_document_links
  FOR ALL USING (
    get_jwt_role() = 'admin' OR
    (get_jwt_role() = 'se' AND client_id = ANY(get_jwt_assigned_clients())) OR
    (get_jwt_role() = 'client' AND client_id = get_jwt_client_id())
  );

CREATE POLICY client_pipeline_access_policy ON client_pipeline_phases
  FOR ALL USING (
    get_jwt_role() = 'admin' OR
    (get_jwt_role() = 'se' AND client_id = ANY(get_jwt_assigned_clients())) OR
    (get_jwt_role() = 'client' AND client_id = get_jwt_client_id())
  );


