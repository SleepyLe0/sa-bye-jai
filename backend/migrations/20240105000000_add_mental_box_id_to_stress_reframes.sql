-- Add mental_box_id to stress_reframes table
ALTER TABLE stress_reframes
ADD COLUMN mental_box_id UUID REFERENCES mental_box_entries(id) ON DELETE CASCADE;

-- Create index for mental_box_id for faster queries
CREATE INDEX idx_stress_reframes_mental_box_id ON stress_reframes(mental_box_id);
