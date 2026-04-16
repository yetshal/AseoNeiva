-- Gamification System for AseoNeiva
-- Tables for levels, achievements, trash collections, and report validations

-- Levels configuration table
CREATE TABLE IF NOT EXISTS levels (
    id SERIAL PRIMARY KEY,
    level_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    icon VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements configuration table
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(20),
    points_reward INTEGER DEFAULT 0,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (which achievements each user has unlocked)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Trash collections (tracking when users report trash pickup)
CREATE TABLE IF NOT EXISTS trash_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER DEFAULT 0,
    location_lat NUMERIC(9,6),
    location_lng NUMERIC(9,6),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID
);

-- Report validations (tracking if citizen reports are verified as valid)
CREATE TABLE IF NOT EXISTS report_validations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    validated_by UUID REFERENCES dashboard_admins(id),
    is_valid BOOLEAN NOT NULL,
    validation_notes TEXT,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User types for role-based access
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(30) DEFAULT 'citizen';
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_streak_data JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_collections INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reports INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS valid_reports INTEGER DEFAULT 0;

-- Add constraint for user types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_user_type_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_user_type_check 
        CHECK (user_type::text = ANY (ARRAY['citizen'::text, 'driver'::text, 'collector'::text, 'admin'::text]));
    END IF;
END
$$;

-- Insert default levels
INSERT INTO levels (level_number, title, description, points_required, icon) VALUES
(1, 'Novato', 'Acabas de empezar tu journey verde', 0, '🌱'),
(2, 'Intermedio', 'Estás tomando el ritmo', 100, '🌿'),
(3, 'Avanzado', 'Un vecino ejemplar', 250, '🌳'),
(4, 'Experto', 'Maestro de la limpieza', 500, '🏆'),
(5, 'Master', 'Leyenda verde de la comunidad', 1000, '👑')
ON CONFLICT (level_number) DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points_reward, trigger_type, trigger_value) VALUES
('Primer paso', 'Saca la basura por primera vez', '🌱', 10, 'first_collection', 1),
('Semana completa', '7 días sacando la basura', '📅', 50, 'streak_days', 7),
('Mes de racha', '30 días consecutivos', '🔥', 200, 'streak_days', 30),
('Reportero', 'Realiza 5 reportes válidos', '📱', 30, 'valid_reports', 5),
('Vecino ejemplar', 'Invita 3 amigos (pendiente)', '👥', 100, 'referred_users', 3),
('Pionero', 'Sé de los primeros 100 usuarios', '⭐', 100, 'early_adopter', 1),
('Ojo crítico', 'Reporta 10 problemas reales', '👁️', 75, 'valid_reports', 10),
('Recolector范例', '100 colecciones registradas', '♻️', 150, 'total_collections', 100)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_validations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_trash_collections_user ON trash_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_trash_collections_date ON trash_collections(collected_at);
CREATE INDEX IF NOT EXISTS idx_reports_user_type ON users(user_type);