/*
  # Create consultations table with proper schema and security

  1. New Tables
    - `consultations`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - Basic information fields (name, phone, email, age, gender, visit_frequency)
      - Skin assessment fields (skin_type, skin_concerns, products, treatments, etc.)
      - Lifestyle fields (water_intake, sleep_hours, sun_exposure, pollution_exposure)
      - Hair assessment fields (scalp_type, hair_type, concerns, products, treatments)
      - Final fields (data_consent, communication_preference, additional_notes)

  2. Security
    - Enable RLS on `consultations` table
    - Add policy for anonymous users to insert consultation data
    - Add policy for authenticated users to insert and read their own data
    - Add policy for service role to manage all consultations

  3. Performance
    - Add indexes on email, created_at, and phone for efficient queries
*/

-- Drop existing table if it exists (clean slate)
DROP TABLE IF EXISTS consultations CASCADE;

-- Create consultations table
CREATE TABLE consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  -- Basic Information
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  age text NOT NULL,
  gender text NOT NULL,
  visit_frequency text NOT NULL,
  
  -- Skin Assessment
  skin_type text NOT NULL,
  skin_concerns text[] DEFAULT '{}',
  top_skin_concern text DEFAULT '',
  routine_steps text DEFAULT '',
  current_products jsonb DEFAULT '{}',
  active_ingredients text[] DEFAULT '{}',
  product_reactions text DEFAULT '',
  facial_frequency text DEFAULT '',
  facial_reactions text DEFAULT '',
  facial_reaction_details text DEFAULT '',
  skin_treatments text DEFAULT '',
  skin_treatment_details text DEFAULT '',
  medications text[] DEFAULT '{}',
  medication_other text DEFAULT '',
  skin_conditions text[] DEFAULT '{}',
  skin_condition_other text DEFAULT '',
  
  -- Lifestyle
  water_intake text DEFAULT '',
  sleep_hours text DEFAULT '',
  sun_exposure text DEFAULT '',
  pollution_exposure text DEFAULT '',
  
  -- Hair Assessment
  scalp_type text DEFAULT '',
  hair_type text[] DEFAULT '{}',
  hair_concerns text[] DEFAULT '{}',
  top_hair_concern text DEFAULT '',
  wash_frequency text DEFAULT '',
  hair_products jsonb DEFAULT '{}',
  hair_treatments text[] DEFAULT '{}',
  hair_reactions text DEFAULT '',
  hair_reaction_details text DEFAULT '',
  
  -- Final
  data_consent text DEFAULT '',
  communication_preference text DEFAULT '',
  additional_notes text DEFAULT ''
);

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX consultations_email_idx ON consultations(email);
CREATE INDEX consultations_created_at_idx ON consultations(created_at DESC);
CREATE INDEX consultations_phone_idx ON consultations(phone);

-- Security Policies

-- Allow anonymous users to insert consultation data (for public form)
CREATE POLICY "Allow anonymous consultation submissions"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert consultation data
CREATE POLICY "Allow authenticated consultation submissions"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own consultation data
CREATE POLICY "Users can read own consultation data"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role can manage all consultations"
  ON consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);