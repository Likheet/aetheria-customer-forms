/*
  # Disable RLS policies for consultations table

  1. Security Changes
    - Disable Row Level Security on consultations table
    - Drop all existing policies
    - Allow unrestricted access to the table

  This migration completely disables RLS, allowing any user (anonymous or authenticated)
  to perform any operation on the consultations table without restrictions.
*/

-- Disable Row Level Security on consultations table
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since RLS is disabled
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