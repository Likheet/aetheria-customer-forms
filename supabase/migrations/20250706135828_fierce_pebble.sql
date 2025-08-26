/*
  # Fix RLS policies for consultations table

  1. Security Updates
    - Drop existing policies that might be causing conflicts
    - Create new simplified policies for anonymous and authenticated users
    - Ensure proper INSERT permissions for consultation submissions
    - Maintain data security while allowing form submissions

  2. Changes Made
    - Allow anonymous users to insert consultation data
    - Allow authenticated users to insert consultation data
    - Allow authenticated users to read their own consultation data
    - Service role maintains full access
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Allow authenticated consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Users can read own consultation data" ON consultations;
DROP POLICY IF EXISTS "Service role can manage all consultations" ON consultations;

-- Create new policies with explicit permissions
CREATE POLICY "Enable insert for anonymous users"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users on own data"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'::text));

CREATE POLICY "Enable all operations for service role"
  ON consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;