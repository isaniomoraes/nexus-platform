-- Allow clients and assigned SEs to create workflows for their client context
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'workflows' AND policyname = 'workflows_insert_policy'
  ) THEN
    CREATE POLICY workflows_insert_policy ON workflows
      FOR INSERT
      WITH CHECK (
        get_jwt_role() = 'admin'
        OR (get_jwt_role() = 'se' AND workflows.client_id = ANY(get_jwt_assigned_clients()))
        OR (get_jwt_role() = 'client' AND workflows.client_id = get_jwt_client_id())
      );
  END IF;
END $$;


