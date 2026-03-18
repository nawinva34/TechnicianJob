
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician');
CREATE TYPE job_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'technician',
  skills TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_line_user_id ON profiles(line_user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by all authenticated users"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can do everything"
  ON profiles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  customer_phone TEXT,
  location_name TEXT,
  google_maps_url TEXT,
  budget NUMERIC(10, 2),
  status job_status NOT NULL DEFAULT 'OPEN',
  assigned_technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_assigned_technician ON jobs(assigned_technician_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs viewable by authenticated users"
  ON jobs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers and admins can create jobs"
  ON jobs FOR INSERT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can update jobs"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Service role can do everything"
  ON jobs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE TABLE job_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status_changed_to job_status NOT NULL,
  photo_url TEXT,
  notes TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX idx_job_logs_timestamp ON job_logs(timestamp DESC);

-- RLS
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job logs viewable by authenticated users"
  ON job_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Job logs insertable by authenticated users"
  ON job_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Service role can do everything"
  ON job_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE FUNCTION claim_job(
  p_job_id UUID,
  p_line_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tech_id UUID;
  v_rows_updated INTEGER;
BEGIN
  SELECT id INTO v_tech_id FROM profiles WHERE line_user_id = p_line_user_id;

  IF v_tech_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE jobs
  SET
    status = 'ASSIGNED',
    assigned_technician_id = v_tech_id,
    updated_at = NOW()
  WHERE
    id = p_job_id
    AND status = 'OPEN'
    AND assigned_technician_id IS NULL;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 1 THEN
    INSERT INTO job_logs (job_id, changed_by, status_changed_to)
    VALUES (p_job_id, v_tech_id, 'ASSIGNED');
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE job_logs;

