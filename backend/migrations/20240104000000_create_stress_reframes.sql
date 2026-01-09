-- Create stress_reframes table
CREATE TABLE IF NOT EXISTS stress_reframes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_thought TEXT NOT NULL,
    stoic_reframe TEXT NOT NULL,
    optimist_reframe TEXT NOT NULL,
    realist_reframe TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for user_id for faster queries
CREATE INDEX idx_stress_reframes_user_id ON stress_reframes(user_id);

-- Create index for created_at for sorting
CREATE INDEX idx_stress_reframes_created_at ON stress_reframes(created_at DESC);
