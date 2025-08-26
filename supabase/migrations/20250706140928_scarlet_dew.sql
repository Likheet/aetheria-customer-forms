/*
  # Fix RLS policies for consultations table

  1. Security Updates
    - Drop all existing policies to start fresh
    - Create proper policies for anonymous and authenticated users
    - Allow anonymous users to INSERT consultation data (for public form)
    - Allow authenticated users to INSERT consultation data
    - Allow authenticated users to SELECT, UPDATE, DELETE their own data
    - Allow service role full access for admin operations

  2. Policy Design
    - Use separate policies for each operation (INSERT, SELECT, UPDATE, DELETE)
    - Use proper role targeting (anon, authenticated, service_role)
    - Use optimized JWT functions with SELECT wrapper for performance
    - Follow Supabase best practices for RLS policies
*/

-- Ensure RLS is enabled
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anonymous users can submit consultations" ON consultations;
DROP POLICY IF EXISTS "Authenticated users can submit consultations" ON consultations;
DROP POLICY IF EXISTS "Users can read their own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can update their own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can delete their own consultations" ON consultations;
DROP POLICY IF EXISTS "Service role has full access" ON consultations;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON consultations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON consultations;
DROP POLICY IF EXISTS "Enable read for own data" ON consultations;
DROP POLICY IF EXISTS "Enable all for service role" ON consultations;
DROP POLICY IF EXISTS "Allow anonymous consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Allow authenticated consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Users can read own consultation data" ON consultations;
DROP POLICY IF EXISTS "Service role full access" ON consultations;

-- Policy 1: Allow anonymous users to insert consultation data (for public form)
CREATE POLICY "Anonymous users can submit consultations"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to insert consultation data
CREATE POLICY "Authenticated users can submit consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to select their own consultation data
CREATE POLICY "Users can read their own consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- Policy 4: Allow authenticated users to update their own consultation data
CREATE POLICY "Users can update their own consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'))
  WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

-- Policy 5: Allow authenticated users to delete their own consultation data
CREATE POLICY "Users can delete their own consultations"
  ON consultations
  FOR DELETE
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- Policy 6: Allow service role full access for admin operations
CREATE POLICY "Service role has full access"
  ON consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);