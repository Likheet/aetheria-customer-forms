/*
  # Fix RLS policies for consultations table

  1. Security Updates
    - Drop existing policies that may be conflicting
    - Create new simplified policies for anonymous and authenticated users
    - Ensure anonymous users can insert consultation data
    - Ensure authenticated users can read their own data
    - Maintain service role full access

  2. Changes
    - Remove potentially conflicting policies
    - Add clear, working policies for INSERT and SELECT operations
    - Ensure anonymous consultation submissions work properly
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Allow authenticated consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Users can read own consultation data" ON consultations;
DROP POLICY IF EXISTS "Service role full access" ON consultations;

-- Create new, simplified policies
-- Allow anonymous users to insert consultations (for public form submissions)
CREATE POLICY "Enable insert for anonymous users"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert consultations
CREATE POLICY "Enable insert for authenticated users"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own consultation data
CREATE POLICY "Enable read for own data"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'::text));

-- Allow service role full access for admin operations
CREATE POLICY "Enable all for service role"
  ON consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);