/*
  # Enable proper RLS for consultations table

  1. Security
    - Enable RLS on consultations table
    - Allow anonymous users to INSERT consultation data (for public form)
    - Allow authenticated users to INSERT consultation data
    - Allow authenticated users to SELECT their own data based on email
    - Allow service role full access for admin operations

  2. Policy Design
    - Separate policies for each operation (INSERT, SELECT, UPDATE, DELETE)
    - Use proper role targeting (anon, authenticated, service_role)
    - Use correct JWT functions for user identification
*/

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to insert consultation data
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

-- Policy 3: Allow authenticated users to read their own consultation data
CREATE POLICY "Users can read their own consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (
    email = (auth.jwt() ->> 'email')
  );

-- Policy 4: Allow service role full access for admin operations
CREATE POLICY "Service role has full access"
  ON consultations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 5: Allow authenticated users to update their own consultations
CREATE POLICY "Users can update their own consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (email = (auth.jwt() ->> 'email'));

-- Policy 6: Allow authenticated users to delete their own consultations
CREATE POLICY "Users can delete their own consultations"
  ON consultations
  FOR DELETE
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));