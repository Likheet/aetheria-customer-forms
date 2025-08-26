-- Drop the existing table and its dependencies
DROP TABLE IF EXISTS consultant_inputs CASCADE;

-- Recreate the consultant_inputs table with the correct structure
CREATE TABLE consultant_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  consultation_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  
  -- Evaluation
  evaluation jsonb NOT NULL DEFAULT '{}'::jsonb,
  unsuitable_products text[] NOT NULL DEFAULT '{}'::text[],
  
  -- Skin Analysis
  skin_analysis jsonb NOT NULL DEFAULT '{
    "skin_type_confirmation": "",
    "additional_skin_concerns": [],
    "recommended_treatments": [],
    "contraindications": [],
    "patch_test_required": false,
    "patch_test_notes": null
  }'::jsonb,
  
  -- Product Recommendations
  product_recommendations jsonb NOT NULL DEFAULT '{
    "cleanser": "",
    "toner": "",
    "serum": [],
    "moisturizer": "",
    "sunscreen": "",
    "treatments": [],
    "masks": []
  }'::jsonb,
  
  -- Treatment Plan
  treatment_plan jsonb NOT NULL DEFAULT '{
    "immediate_treatments": [],
    "future_treatments": [],
    "treatment_frequency": "",
    "special_considerations": ""
  }'::jsonb,
  
  -- Notes and Staff Info
  staff_notes text NOT NULL DEFAULT '',
  follow_up_required boolean NOT NULL DEFAULT false,
  follow_up_date date,
  staff_member text NOT NULL,
  consultation_date date NOT NULL,

  -- Add the foreign key constraint
  CONSTRAINT consultant_inputs_consultation_id_fkey 
    FOREIGN KEY (consultation_id) 
    REFERENCES consultations(id) 
    ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX consultant_inputs_consultation_id_idx ON consultant_inputs(consultation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE consultant_inputs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
  ON consultant_inputs
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create a view to get consultations without input
CREATE OR REPLACE VIEW consultations_without_input AS
SELECT c.*
FROM consultations c
LEFT JOIN consultant_inputs ci ON c.id = ci.consultation_id
WHERE ci.id IS NULL; 