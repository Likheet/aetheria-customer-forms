/*
  # Fix RLS policies for consultations table

  1. Security Updates
    - Drop existing restrictive policies that may be blocking anonymous inserts
    - Create new policy to allow anonymous users to insert consultation data
    - Maintain existing policies for authenticated users to read their own data
    - Keep service role access for admin operations

  2. Changes Made
    - Enable anonymous users to insert consultation data (for form submissions)
    - Ensure authenticated users can only read their own consultation data
    - Maintain full access for service role
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON consultations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON consultations;
DROP POLICY IF EXISTS "Enable read for authenticated users on own data" ON consultations;
DROP POLICY IF EXISTS "Enable all operations for service role" ON consultations;

-- Create policy for anonymous users to insert consultation data
CREATE POLICY "Allow anonymous consultation submissions"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for authenticated users to insert consultation data
CREATE POLICY "Allow authenticated consultation submissions"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to read their own consultation data
CREATE POLICY "Users can read own consultation data"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'::text));

-- Create policy for service role to have full access
CREATE POLICY "Service role full access"
  ON consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;