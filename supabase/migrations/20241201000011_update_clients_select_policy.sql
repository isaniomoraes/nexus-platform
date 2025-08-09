-- Broaden clients select policy to not depend on JWT role claim
-- Allow any authenticated user to SELECT clients where their auth uid is present in assigned_ses

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clients' AND policyname = 'clients_select_se_assigned'
  ) THEN
    DROP POLICY "clients_select_se_assigned" ON clients;
  END IF;
END $$;

CREATE POLICY "clients_select_assigned_any" ON clients
  FOR SELECT USING (
    auth.uid() = ANY(assigned_ses)
  );


