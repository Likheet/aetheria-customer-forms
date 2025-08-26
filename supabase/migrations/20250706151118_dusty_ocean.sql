/*
  # Create feedback system tables

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - Basic information fields (appointment_id, customer_name, staff_member, etc.)
      - Rating fields (overall_satisfaction, service_quality, staff_rating, etc.)
      - Text feedback fields (text_feedback, additional_comments)
      - Recommendation fields (recommendation_score, would_return)

  2. Security
    - Disable RLS for now (can be enabled later if needed)
    - Add indexes for performance

  3. Indexes
    - Index on appointment_id for linking
    - Index on created_at for reporting
    - Index on staff_member for staff performance tracking
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  -- Appointment Information
  appointment_id text NOT NULL,
  customer_name text NOT NULL,
  services text[] DEFAULT '{}',
  staff_member text NOT NULL,
  service_duration text DEFAULT '',
  
  -- Rating Fields (1-5 scale)
  overall_rating integer DEFAULT 0,
  service_quality integer DEFAULT 0,
  staff_rating integer DEFAULT 0,
  cleanliness integer DEFAULT 0,
  value_for_money integer DEFAULT 0,
  
  -- Text Feedback
  text_feedback text DEFAULT '',
  additional_comments text DEFAULT '',
  
  -- Recommendation (1-10 scale)
  recommendation_score integer DEFAULT 0,
  would_return text DEFAULT '',
  
  -- Metadata
  submitted_by_staff_id text DEFAULT '',
  submission_device text DEFAULT 'tablet'
);

-- Disable Row Level Security for now
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS feedback_appointment_id_idx ON feedback(appointment_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_staff_member_idx ON feedback(staff_member);
CREATE INDEX IF NOT EXISTS feedback_overall_rating_idx ON feedback(overall_rating);
CREATE INDEX IF NOT EXISTS feedback_recommendation_score_idx ON feedback(recommendation_score);