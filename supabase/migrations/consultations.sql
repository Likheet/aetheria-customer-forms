-- First, drop any existing foreign key constraints
ALTER TABLE consultant_inputs 
  DROP CONSTRAINT IF EXISTS consultant_inputs_consultation_id_fkey,
  DROP CONSTRAINT IF EXISTS fk_consultation;

-- Drop and recreate the index
DROP INDEX IF EXISTS consultant_inputs_consultation_id_idx;
CREATE INDEX consultant_inputs_consultation_id_idx ON consultant_inputs(consultation_id);

-- Add back the single foreign key constraint
ALTER TABLE consultant_inputs
  ADD CONSTRAINT consultant_inputs_consultation_id_fkey 
  FOREIGN KEY (consultation_id) 
  REFERENCES consultations(id) 
  ON DELETE CASCADE; 