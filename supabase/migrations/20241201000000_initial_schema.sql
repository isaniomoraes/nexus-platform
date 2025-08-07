-- Enable RLS
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'se', 'client');
CREATE TYPE exception_type AS ENUM ('authentication', 'data_process', 'integration', 'workflow_logic', 'browser_automation');
CREATE TYPE exception_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE exception_status AS ENUM ('new', 'in_progress', 'resolved', 'ignored');
CREATE TYPE subscription_plan AS ENUM ('basic', 'professional', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');

-- Create tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT,
    contract_start_date DATE NOT NULL,
    departments TEXT[] DEFAULT '{}',
    pipeline_phase TEXT NOT NULL DEFAULT 'Discovery: Initial Survey',
    assigned_ses UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    assigned_clients UUID[],
    is_billing_admin BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    node_count INTEGER DEFAULT 0,
    execution_count INTEGER DEFAULT 0,
    exception_count INTEGER DEFAULT 0,
    time_saved_per_execution NUMERIC DEFAULT 0,
    money_saved_per_execution NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    type exception_type NOT NULL,
    severity exception_severity NOT NULL,
    status exception_status DEFAULT 'new',
    message TEXT NOT NULL,
    remedy TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    monthly_price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_workflows_client_id ON workflows(client_id);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);
CREATE INDEX idx_exceptions_client_id ON exceptions(client_id);
CREATE INDEX idx_exceptions_workflow_id ON exceptions(workflow_id);
CREATE INDEX idx_exceptions_status ON exceptions(status);
CREATE INDEX idx_exceptions_severity ON exceptions(severity);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from JWT (avoids recursion)
CREATE OR REPLACE FUNCTION get_jwt_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(auth.jwt() ->> 'user_role', 'client');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to extract client_id from JWT
CREATE OR REPLACE FUNCTION get_jwt_client_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() ->> 'client_id')::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper function to extract assigned_clients from JWT
CREATE OR REPLACE FUNCTION get_jwt_assigned_clients()
RETURNS UUID[] AS $$
BEGIN
  -- Parse JSON array from JWT into UUID array
  RETURN ARRAY(SELECT (jsonb_array_elements_text((auth.jwt() ->> 'assigned_clients')::jsonb))::UUID);
EXCEPTION WHEN OTHERS THEN
  RETURN ARRAY[]::UUID[];
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RLS Policies using JWT claims (no recursion)

-- Clients table policies
CREATE POLICY "clients_access_policy" ON clients
    FOR ALL USING (
        get_jwt_role() = 'admin'
        OR
        (get_jwt_role() = 'se' AND clients.id = ANY(get_jwt_assigned_clients()))
        OR
        (get_jwt_role() = 'client' AND clients.id = get_jwt_client_id())
    );

-- Users table policies (no self-reference)
CREATE POLICY "users_access_policy" ON users
    FOR ALL USING (
        -- Users can always access their own record
        id = auth.uid()
        OR
        -- Admin can access all
        get_jwt_role() = 'admin'
        OR
        -- SE can access users from assigned clients
        (get_jwt_role() = 'se' AND (users.client_id = ANY(get_jwt_assigned_clients()) OR users.client_id IS NULL))
        OR
        -- Client can access users from same client
        (get_jwt_role() = 'client' AND users.client_id = get_jwt_client_id())
    );

-- Workflows table policies
CREATE POLICY "workflows_access_policy" ON workflows
    FOR ALL USING (
        get_jwt_role() = 'admin'
        OR
        (get_jwt_role() = 'se' AND workflows.client_id = ANY(get_jwt_assigned_clients()))
        OR
        (get_jwt_role() = 'client' AND workflows.client_id = get_jwt_client_id())
    );

-- Exceptions table policies
CREATE POLICY "exceptions_access_policy" ON exceptions
    FOR ALL USING (
        get_jwt_role() = 'admin'
        OR
        (get_jwt_role() = 'se' AND exceptions.client_id = ANY(get_jwt_assigned_clients()))
        OR
        (get_jwt_role() = 'client' AND exceptions.client_id = get_jwt_client_id())
    );

-- Subscriptions table policies
CREATE POLICY "subscriptions_access_policy" ON subscriptions
    FOR ALL USING (
        get_jwt_role() = 'admin'
        OR
        (get_jwt_role() = 'se' AND subscriptions.client_id = ANY(get_jwt_assigned_clients()))
        OR
        (get_jwt_role() = 'client' AND subscriptions.client_id = get_jwt_client_id() AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND is_billing_admin = TRUE))
    );