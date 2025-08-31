-- Create missing tables for consultant input functionality
-- This migration adds the consultant_inputs table and consultations_without_input view

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create consultant_inputs table to store consultant evaluations
CREATE TABLE IF NOT EXISTS consultant_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  
  -- Acne evaluation
  acne_observation text,
  acne_classification text,
  
  -- Pigmentation evaluation  
  pigmentation_observation text,
  pigmentation_classification text,
  
  -- Texture evaluation
  texture_observation text,
  texture_classification text,
  
  -- Sensitivity evaluation
  sensitivity_observation text,
  sensitivity_classification text,
  
  -- Additional notes
  additional_notes text,
  
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure one consultant input per session
  CONSTRAINT consultant_inputs_session_unique UNIQUE (session_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultant_inputs_session ON consultant_inputs (session_id);
CREATE INDEX IF NOT EXISTS idx_consultant_inputs_created ON consultant_inputs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultant_inputs_phone ON consultant_inputs (customer_phone);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_consultant_inputs_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_consultant_inputs_updated_at 
  BEFORE UPDATE ON consultant_inputs 
  FOR EACH ROW EXECUTE PROCEDURE update_consultant_inputs_updated_at();

-- Create view for consultations without consultant input
CREATE OR REPLACE VIEW consultations_without_input AS
SELECT 
  s.id,
  c.full_name as name,
  c.phone_e164 as phone,
  s.created_at
FROM assessment_session s
JOIN customer c ON c.id = s.customer_id
LEFT JOIN consultant_inputs ci ON ci.session_id = s.id
WHERE ci.id IS NULL  -- Only sessions without consultant input
ORDER BY s.created_at DESC;

-- Enable RLS on consultant_inputs table
ALTER TABLE consultant_inputs ENABLE ROW LEVEL SECURITY;

-- Create policies for consultant_inputs table
CREATE POLICY "Service role can do everything on consultant_inputs" ON consultant_inputs
  FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions on the view
GRANT SELECT ON consultations_without_input TO anon, authenticated, service_role;

-- Optional: Add some helpful comments
COMMENT ON TABLE consultant_inputs IS 'Stores consultant evaluations and observations for customer consultations';
COMMENT ON VIEW consultations_without_input IS 'Shows customer consultations that have not yet received consultant input';
