-- MahaIND Supabase Schema Foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients Table
CREATE TABLE public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    gst_number VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    weight_grams DECIMAL(10,2),
    base_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Quotations Table (For Pricing Engine)
CREATE TABLE public.quotations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Accepted, Rejected
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Dispatch Log
CREATE TABLE public.dispatch_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    vehicle_no VARCHAR(50),
    dispatch_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    invoice_amount DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'Dispatched'
);

-- 5. Inventory
CREATE TABLE public.inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    material_category VARCHAR(100) NOT NULL,
    total_quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    total_value DECIMAL(12,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Receivables & Payables
CREATE TABLE public.receivables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    invoice_amount DECIMAL(12,2) NOT NULL,
    pending_amount DECIMAL(12,2) NOT NULL,
    due_date DATE
);

-- Setup basic Row Level Security (Allow all for rapid prototyping with Anon Key)
-- IMPORTANT: Once deployed, adjust these policies!
CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable all access for all users" ON public.clients FOR ALL USING (true);

CREATE POLICY "Enable all access for all users" ON public.quotations FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.dispatch_log FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.inventory FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.receivables FOR ALL USING (true);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- PHASE IV: OPERATIONAL CONTROL SCHEMAS
-- ==========================================

-- 7. User Profiles & Roles
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer', -- 'super_admin' or 'viewer'
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Suspended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Factory Machines (Digital Twin)
CREATE TABLE public.machines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(100), -- 'Loom', 'Extruder', 'Printer'
    status VARCHAR(50) DEFAULT 'Idle', -- 'Running', 'Idle', 'Maintenance'
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    last_maintained DATE
);

-- 9. Operational Tasks (KPI Engine)
CREATE TABLE public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    priority VARCHAR(20) DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase IV Security Policies
CREATE POLICY "Enable all access for all users" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.machines FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.tasks FOR ALL USING (true);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
