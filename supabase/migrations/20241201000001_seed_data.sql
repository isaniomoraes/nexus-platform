-- Insert sample clients
INSERT INTO clients (id, name, url, contract_start_date, departments, pipeline_phase, assigned_ses) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechCorp Inc.', 'https://techcorp.com', '2024-01-15', ARRAY['Finance', 'HR', 'Operations'], 'Production deploy', ARRAY['550e8400-e29b-41d4-a716-446655440101']::UUID[]),
('550e8400-e29b-41d4-a716-446655440002', 'Global Manufacturing Ltd.', 'https://globalmanufacturing.com', '2024-03-01', ARRAY['Supply Chain', 'Quality Control'], 'Testing started', ARRAY['550e8400-e29b-41d4-a716-446655440101']::UUID[]),
('550e8400-e29b-41d4-a716-446655440003', 'RetailMax Solutions', 'https://retailmax.com', '2024-02-10', ARRAY['Inventory', 'Customer Service'], 'Factory build initiated', ARRAY['550e8400-e29b-41d4-a716-446655440102']::UUID[]);

-- Insert sample users
INSERT INTO users (id, email, name, phone, role, client_id, assigned_clients, is_billing_admin, can_manage_users) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440100', 'admin@nexus.com', 'Sarah Johnson', '+1-555-0100', 'admin', NULL, NULL, FALSE, TRUE),
-- SE users
('550e8400-e29b-41d4-a716-446655440101', 'john.doe@nexus.com', 'John Doe', '+1-555-0101', 'se', NULL, ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002']::UUID[], FALSE, FALSE),
('550e8400-e29b-41d4-a716-446655440102', 'jane.smith@nexus.com', 'Jane Smith', '+1-555-0102', 'se', NULL, ARRAY['550e8400-e29b-41d4-a716-446655440003']::UUID[], FALSE, FALSE),
-- Client users for TechCorp
('550e8400-e29b-41d4-a716-446655440201', 'mike.wilson@techcorp.com', 'Mike Wilson', '+1-555-0201', 'client', '550e8400-e29b-41d4-a716-446655440001', NULL, TRUE, TRUE),
('550e8400-e29b-41d4-a716-446655440202', 'lisa.brown@techcorp.com', 'Lisa Brown', '+1-555-0202', 'client', '550e8400-e29b-41d4-a716-446655440001', NULL, FALSE, FALSE),
-- Client users for Global Manufacturing
('550e8400-e29b-41d4-a716-446655440203', 'david.martinez@globalmanufacturing.com', 'David Martinez', '+1-555-0203', 'client', '550e8400-e29b-41d4-a716-446655440002', NULL, TRUE, FALSE),
-- Client users for RetailMax
('550e8400-e29b-41d4-a716-446655440204', 'emma.davis@retailmax.com', 'Emma Davis', '+1-555-0204', 'client', '550e8400-e29b-41d4-a716-446655440003', NULL, TRUE, TRUE);

-- Insert sample workflows
INSERT INTO workflows (id, client_id, name, department, description, is_active, node_count, execution_count, exception_count, time_saved_per_execution, money_saved_per_execution) VALUES
-- TechCorp workflows
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Invoice Processing Automation', 'Finance', 'Automated invoice processing and approval workflow', TRUE, 12, 156, 3, 45.5, 125.00),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Employee Onboarding', 'HR', 'Streamlined new employee onboarding process', TRUE, 8, 23, 1, 120.0, 300.00),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Inventory Management', 'Operations', 'Automated inventory tracking and reordering', TRUE, 15, 89, 2, 30.0, 75.00),
-- Global Manufacturing workflows
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Supply Chain Optimization', 'Supply Chain', 'Automated supplier communication and ordering', TRUE, 20, 67, 1, 60.0, 200.00),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Quality Control Reports', 'Quality Control', 'Automated quality control report generation', TRUE, 10, 134, 0, 25.0, 80.00),
-- RetailMax workflows
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Customer Support Ticket Routing', 'Customer Service', 'Automated customer support ticket classification and routing', TRUE, 6, 245, 4, 15.0, 45.00),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Inventory Replenishment', 'Inventory', 'Automated stock level monitoring and reordering', FALSE, 14, 98, 2, 40.0, 120.00);

-- Insert sample exceptions
INSERT INTO exceptions (id, client_id, workflow_id, type, severity, status, message, remedy, reported_at, resolved_at) VALUES
-- TechCorp exceptions
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'authentication', 'high', 'resolved', 'API authentication failed for external invoice system', 'Updated API credentials and refreshed tokens', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'data_process', 'medium', 'in_progress', 'Employee data validation failed for incomplete forms', 'Implementing additional validation rules', NOW() - INTERVAL '1 day', NULL),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'integration', 'low', 'new', 'Inventory system API response timeout', NULL, NOW() - INTERVAL '6 hours', NULL),
-- Global Manufacturing exceptions
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'workflow_logic', 'medium', 'resolved', 'Supplier selection logic produced unexpected results', 'Fixed supplier ranking algorithm', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
-- RetailMax exceptions
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'browser_automation', 'critical', 'in_progress', 'Browser automation failed due to website changes', 'Updating selectors and testing new automation flow', NOW() - INTERVAL '4 hours', NULL),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440007', 'data_process', 'high', 'new', 'Inventory data parsing failed for new product format', NULL, NOW() - INTERVAL '2 hours', NULL);

-- Insert sample subscriptions
INSERT INTO subscriptions (id, client_id, plan, status, current_period_start, current_period_end, monthly_price) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'professional', 'active', '2024-11-01', '2024-12-01', 2499.00),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'enterprise', 'active', '2024-11-15', '2024-12-15', 4999.00),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'basic', 'active', '2024-11-10', '2024-12-10', 999.00);