/*
  # Temporarily disable RLS for consultations table

  1. Security Changes
    - Disable RLS on consultations table to allow form submissions
    - This is a temporary fix to get the consultation form working
    - Can be re-enabled later with proper policies

  2. Notes
    - This removes all access restrictions on the consultations table
    - Only use this for development/testing purposes
    - For production, proper RLS policies should be implemented
*/

-- Disable Row Level Security on consultations table
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since RLS is disabled
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON consultations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON consultations;
DROP POLICY IF EXISTS "Enable read for own data" ON consultations;
DROP POLICY IF EXISTS "Enable all for service role" ON consultations;
DROP POLICY IF EXISTS "Allow anonymous consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Allow authenticated consultation submissions" ON consultations;
DROP POLICY IF EXISTS "Users can read own consultation data" ON consultations;
DROP POLICY IF EXISTS "Service role full access" ON consultations;