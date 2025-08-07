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

-- Helper function to get user role and client_id from auth.users
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (auth.jwt()->>'role')::user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.user_client_id()
RETURNS UUID AS $$
BEGIN
    RETURN (auth.jwt()->>'client_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for clients table
CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (auth.user_role() = 'admin');

CREATE POLICY "SEs can view assigned clients" ON clients
    FOR SELECT USING (
        auth.user_role() = 'se' AND
        id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        ))
    );

CREATE POLICY "Clients can view own client" ON clients
    FOR SELECT USING (
        auth.user_role() = 'client' AND
        id = auth.user_client_id()
    );

CREATE POLICY "Admins can manage all clients" ON clients
    FOR ALL USING (auth.user_role() = 'admin');

-- RLS Policies for users table
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (auth.user_role() = 'admin');

CREATE POLICY "SEs can view users from assigned clients" ON users
    FOR SELECT USING (
        auth.user_role() = 'se' AND
        (client_id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        )) OR client_id IS NULL)
    );

CREATE POLICY "Clients can view users from same client" ON users
    FOR SELECT USING (
        auth.user_role() = 'client' AND
        client_id = auth.user_client_id()
    );

CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (auth.user_role() = 'admin');

-- RLS Policies for workflows table
CREATE POLICY "Admins can view all workflows" ON workflows
    FOR SELECT USING (auth.user_role() = 'admin');

CREATE POLICY "SEs can view workflows from assigned clients" ON workflows
    FOR SELECT USING (
        auth.user_role() = 'se' AND
        client_id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        ))
    );

CREATE POLICY "Clients can view own workflows" ON workflows
    FOR SELECT USING (
        auth.user_role() = 'client' AND
        client_id = auth.user_client_id()
    );

CREATE POLICY "Admins and SEs can manage workflows" ON workflows
    FOR ALL USING (
        auth.user_role() IN ('admin', 'se') AND
        (auth.user_role() = 'admin' OR client_id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        )))
    );

-- RLS Policies for exceptions table
CREATE POLICY "Admins can view all exceptions" ON exceptions
    FOR SELECT USING (auth.user_role() = 'admin');

CREATE POLICY "SEs can view exceptions from assigned clients" ON exceptions
    FOR SELECT USING (
        auth.user_role() = 'se' AND
        client_id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        ))
    );

CREATE POLICY "Clients can view own exceptions" ON exceptions
    FOR SELECT USING (
        auth.user_role() = 'client' AND
        client_id = auth.user_client_id()
    );

CREATE POLICY "Admins and SEs can manage exceptions" ON exceptions
    FOR ALL USING (
        auth.user_role() IN ('admin', 'se') AND
        (auth.user_role() = 'admin' OR client_id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        )))
    );

-- RLS Policies for subscriptions table
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (auth.user_role() = 'admin');

CREATE POLICY "SEs can view subscriptions from assigned clients" ON subscriptions
    FOR SELECT USING (
        auth.user_role() = 'se' AND
        client_id = ANY((
            SELECT assigned_clients FROM users
            WHERE id = auth.uid() AND role = 'se'
        ))
    );

CREATE POLICY "Billing admins can view own subscription" ON subscriptions
    FOR SELECT USING (
        auth.user_role() = 'client' AND
        client_id = auth.user_client_id() AND
        EXISTS(
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_billing_admin = TRUE
        )
    );

CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
    FOR ALL USING (auth.user_role() = 'admin');
