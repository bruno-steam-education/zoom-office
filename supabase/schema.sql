-- schema.sql

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. allowed_domains
CREATE TABLE allowed_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. profiles & departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    manager_id UUID, -- References profiles(id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role DEFAULT 'employee',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    job_title TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE departments ADD CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. spaces
CREATE TYPE space_type AS ENUM ('desk', 'meeting_room', 'parking_spot');

CREATE TABLE spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type space_type NOT NULL,
    capacity INTEGER DEFAULT 1,
    resources JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. attendance_days
CREATE TYPE attendance_period AS ENUM ('morning', 'afternoon', 'full_day');

CREATE TABLE attendance_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period attendance_period DEFAULT 'full_day',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 5. reservations
CREATE TYPE reservation_status AS ENUM ('active', 'cancelled');

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    title TEXT,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status reservation_status DEFAULT 'active',
    notes TEXT,
    vehicle_plate TEXT,
    needs_coffee BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reservation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    external_name TEXT,
    external_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. floor_plans
CREATE TYPE floor_plan_type AS ENUM ('office', 'parking');

CREATE TABLE floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type floor_plan_type NOT NULL,
    image_url TEXT,
    storage_path TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE space_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    floor_plan_id UUID NOT NULL REFERENCES floor_plans(id) ON DELETE CASCADE,
    x_position NUMERIC NOT NULL,
    y_position NUMERIC NOT NULL,
    width NUMERIC,
    height NUMERIC,
    rotation NUMERIC DEFAULT 0,
    label TEXT,
    icon_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(space_id, floor_plan_id)
);

-- RLS Configuration
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_positions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view allowed domains" ON allowed_domains FOR SELECT USING (true);
CREATE POLICY "Authenticated can view departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view spaces" ON spaces FOR SELECT TO authenticated USING (true);

-- Attendance: User can only manage their own, authenticated can view all
CREATE POLICY "Authenticated can view attendance" ON attendance_days FOR SELECT TO authenticated USING (true);
CREATE POLICY "User can insert own attendance" ON attendance_days FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own attendance" ON attendance_days FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User can delete own attendance" ON attendance_days FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reservations: User can only manage their own, authenticated can view all
CREATE POLICY "Authenticated can view reservations" ON reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "User can insert own reservation" ON reservations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own reservation" ON reservations FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can view participants" ON reservation_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "User can insert participants" ON reservation_participants FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM reservations WHERE id = reservation_id AND user_id = auth.uid())
);

-- Floor plans
CREATE POLICY "Authenticated can view floor_plans" ON floor_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view space_positions" ON space_positions FOR SELECT TO authenticated USING (true);

-- Admin policies (Admins can do everything)
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin full access spaces" ON spaces FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin full access floor_plans" ON floor_plans FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "Admin full access space_positions" ON space_positions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Trigger for new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_domain TEXT;
BEGIN
    user_domain := split_part(new.email, '@', 2);
    
    -- Check if domain is allowed
    IF NOT EXISTS (SELECT 1 FROM public.allowed_domains WHERE domain = user_domain AND is_active = true) THEN
        RAISE EXCEPTION 'Domain % is not authorized.', user_domain;
    END IF;

    -- The first user created should probably be an admin, but let's default to employee and let you manually change the first one.
    INSERT INTO public.profiles (id, name, email)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
      new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
