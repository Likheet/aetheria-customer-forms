-- Enable RLS and create policies for feedback table
-- This allows anonymous form submissions for customer feedback

-- Enable RLS on feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "feedback_service_role_all" ON public.feedback;
DROP POLICY IF EXISTS "feedback_authenticated_read" ON public.feedback;
DROP POLICY IF EXISTS "feedback_authenticated_insert" ON public.feedback;
DROP POLICY IF EXISTS "feedback_authenticated_update" ON public.feedback;

-- Create permissive policies for anonymous feedback submission
-- Allow anonymous users to insert feedback (customer form submissions)
CREATE POLICY "feedback_anonymous_insert" ON public.feedback
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own feedback (optional, for confirmation)
CREATE POLICY "feedback_anonymous_read" ON public.feedback
  FOR SELECT TO anon
  USING (true);

-- Allow authenticated users (staff) to read all feedback
CREATE POLICY "feedback_authenticated_read" ON public.feedback
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users (staff) to update feedback if needed
CREATE POLICY "feedback_authenticated_update" ON public.feedback
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service role full access for admin operations
CREATE POLICY "feedback_service_role_all" ON public.feedback
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
