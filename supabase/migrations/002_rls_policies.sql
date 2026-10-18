-- Migration 002: Row Level Security (RLS) Policies for Public Crowdsourced Noise Monitoring
-- Enables public anonymous insert and select for sensor readings, incidents, user pins, and complaints

-- 1. noise_readings
ALTER TABLE noise_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on noise_readings" ON noise_readings;
CREATE POLICY "Allow public read access on noise_readings"
    ON noise_readings FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert access on noise_readings" ON noise_readings;
CREATE POLICY "Allow public insert access on noise_readings"
    ON noise_readings FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. noise_incidents
ALTER TABLE noise_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on noise_incidents" ON noise_incidents;
CREATE POLICY "Allow public read access on noise_incidents"
    ON noise_incidents FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow public insert/update access on noise_incidents" ON noise_incidents;
CREATE POLICY "Allow public insert/update access on noise_incidents"
    ON noise_incidents FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. user_pins
ALTER TABLE user_pins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on user_pins" ON user_pins;
CREATE POLICY "Allow public access on user_pins"
    ON user_pins FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. complaints
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on complaints" ON complaints;
CREATE POLICY "Allow public access on complaints"
    ON complaints FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on user_streaks" ON user_streaks;
CREATE POLICY "Allow public access on user_streaks"
    ON user_streaks FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. user_alerts
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on user_alerts" ON user_alerts;
CREATE POLICY "Allow public access on user_alerts"
    ON user_alerts FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
