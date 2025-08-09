-- Allow SEs to SELECT clients where they are directly assigned in clients.assigned_ses
-- This resolves login/middleware bootstrap where JWT assigned_clients is not yet populated

CREATE POLICY "clients_select_se_assigned" ON clients
  FOR SELECT USING (
    get_jwt_role() = 'se' AND auth.uid() = ANY(assigned_ses)
  );


