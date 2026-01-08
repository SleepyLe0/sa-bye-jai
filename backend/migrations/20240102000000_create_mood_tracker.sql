-- Create mood_tracker table
CREATE TABLE IF NOT EXISTS mood_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR(20) NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
    note TEXT,
    activities TEXT[], -- Array of activity strings
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_id for faster queries
CREATE INDEX idx_mood_tracker_user_id ON mood_tracker(user_id);

-- Create index for created_at for sorting
CREATE INDEX idx_mood_tracker_created_at ON mood_tracker(created_at DESC);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_mood_tracker_updated_at
BEFORE UPDATE ON mood_tracker
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
