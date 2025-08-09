-- Ensure JWT claim helpers read from top-level and user_metadata keys

-- Role: prefer top-level 'user_role', then user_metadata.user_role, default 'client'
CREATE OR REPLACE FUNCTION get_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'user_role',
    (auth.jwt() -> 'user_metadata') ->> 'user_role',
    'client'
  );
$$;

-- Client ID: prefer top-level 'client_id', then user_metadata.client_id
CREATE OR REPLACE FUNCTION get_jwt_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'client_id', '')::uuid,
    NULLIF((auth.jwt() -> 'user_metadata') ->> 'client_id', '')::uuid
  );
$$;

-- Assigned clients: prefer top-level 'assigned_clients', then user_metadata.assigned_clients
CREATE OR REPLACE FUNCTION get_jwt_assigned_clients()
RETURNS uuid[]
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (
      CASE
        WHEN (auth.jwt() ? 'assigned_clients') THEN (
          ARRAY(
            SELECT (jsonb_array_elements_text((auth.jwt() ->> 'assigned_clients')::jsonb))::uuid
          )
        )
        WHEN ((auth.jwt() -> 'user_metadata') ? 'assigned_clients') THEN (
          ARRAY(
            SELECT (jsonb_array_elements_text(((auth.jwt() -> 'user_metadata') ->> 'assigned_clients')::jsonb))::uuid
          )
        )
        ELSE ARRAY[]::uuid[]
      END
    ),
    ARRAY[]::uuid[]
  );
$$;


