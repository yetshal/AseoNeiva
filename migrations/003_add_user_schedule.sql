-- Add collection_schedule to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS collection_schedule JSONB DEFAULT '[]'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN users.collection_schedule IS 'Store user-defined collection days and times. Format: [{"day": "Lunes", "time": "06:00"}]';
