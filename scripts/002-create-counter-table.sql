-- Create a simple counter table to track registration numbers
CREATE TABLE IF NOT EXISTS registration_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  counter INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial counter value
INSERT INTO registration_counter (id, counter) 
VALUES (1, 1) 
ON CONFLICT (id) DO NOTHING;
