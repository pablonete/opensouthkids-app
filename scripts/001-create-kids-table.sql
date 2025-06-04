-- Create the kids registration table
CREATE TABLE IF NOT EXISTS kids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 99),
  sex VARCHAR(10) NOT NULL CHECK (sex IN ('boy', 'girl', 'other')),
  registration_number VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on registration_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_kids_registration_number ON kids(registration_number);

-- Create an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_kids_created_at ON kids(created_at);
