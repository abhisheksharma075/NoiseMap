-- NoiseMap Database Schema Migration
-- Compatible with PostgreSQL 15 + PostGIS Extension

-- 1. Enable Spatial Capabilities
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Individual Noise Readings Table
CREATE TABLE IF NOT EXISTS noise_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    grid_id TEXT GENERATED ALWAYS AS (
        ROUND(lat::numeric, 3)::text || '_' || ROUND(lng::numeric, 3)::text
    ) STORED,
    db_avg FLOAT NOT NULL,
    db_peak FLOAT NOT NULL,
    source_type TEXT DEFAULT 'unknown',
    zone_type TEXT DEFAULT 'residential',
    geom GEOGRAPHY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for ultra-fast spatial and temporal queries
CREATE INDEX IF NOT EXISTS idx_readings_geom ON noise_readings USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_readings_time ON noise_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_grid ON noise_readings(grid_id, created_at DESC);

-- Trigger to auto-compute PostGIS geography point from coordinates
CREATE OR REPLACE FUNCTION set_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_geom ON noise_readings;
CREATE TRIGGER trg_set_geom
BEFORE INSERT ON noise_readings
FOR EACH ROW EXECUTE FUNCTION set_geom();

-- 3. Verified Noise Incidents Table
CREATE TABLE IF NOT EXISTS noise_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grid_id TEXT NOT NULL,
    center_lat DECIMAL(9,6) NOT NULL,
    center_lng DECIMAL(9,6) NOT NULL,
    location_name TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    duration_min FLOAT GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (last_seen_at - started_at)) / 60
    ) STORED,
    avg_db FLOAT NOT NULL,
    peak_db FLOAT NOT NULL,
    reading_count INT NOT NULL DEFAULT 0,
    unique_users INT NOT NULL DEFAULT 0,
    dominant_source TEXT DEFAULT 'unknown',
    evidence_score FLOAT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON noise_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_grid ON noise_incidents(grid_id);

-- 4. User-Pinned Locations Table (For Targeted Push Alerts)
CREATE TABLE IF NOT EXISTS user_pins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    label TEXT NOT NULL, -- e.g. 'home', 'school', 'work'
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    threshold_db FLOAT DEFAULT 70.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pins_session ON user_pins(session_id);

-- 5. Complaints Generated Table (CPCB Statutory Records)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES noise_incidents(id) ON DELETE SET NULL,
    reference_number TEXT NOT NULL,
    location_text TEXT,
    avg_db FLOAT NOT NULL,
    peak_db FLOAT NOT NULL,
    duration_min FLOAT NOT NULL,
    reading_count INT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'generated'
);

-- 6. User Gamification & Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
    session_id TEXT PRIMARY KEY,
    total_readings INT DEFAULT 0,
    verified_readings INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    badge_level TEXT DEFAULT 'newcomer',
    last_reading TIMESTAMPTZ
);

-- 7. User Alert History Table
CREATE TABLE IF NOT EXISTS user_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    incident_id UUID REFERENCES noise_incidents(id) ON DELETE CASCADE,
    pin_id UUID REFERENCES user_pins(id) ON DELETE CASCADE,
    threshold_db FLOAT,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Enable Supabase Realtime Publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'noise_readings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE noise_readings;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'noise_incidents'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE noise_incidents;
    END IF;
END $$;
