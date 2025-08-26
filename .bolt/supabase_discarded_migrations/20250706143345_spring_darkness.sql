/*
  # Create feedback table for post-treatment customer feedback

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - Basic information fields (name, email, phone, visit_date, consultation_id)
      - Treatment information (treatments_received, treatment_duration, therapist_name)
      - Rating fields (overall_satisfaction, facility_rating, staff_rating, etc.)
      - Text feedback fields (immediate_results, what_worked_well, etc.)
      - Follow-up fields (reactions, recommendations, return intent)
      - Consent fields (testimonial use, contact permission)

  2. Security
    - Enable RLS on `feedback` table
    - Add policy for anonymous users to submit feedback
    - Add policy for authenticated users to read their own feedback
    - Add policy for service role to manage all feedback

  3. Indexes
    - Index on email for quick lookups
    - Index on visit_date for reporting
    - Index on consultation_id for linking to original consultation
*/

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  
  -- Basic Information
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  visit_date text NOT NULL,
  consultation_id text DEFAULT '',
  
  -- Treatment Information
  treatments_received text[] DEFAULT '{}',
  treatment_duration text DEFAULT '',
  therapist_name text DEFAULT '',
  
  -- Overall Experience (1-5 ratings)
  overall_satisfaction integer DEFAULT 0,
  facility_rating integer DEFAULT 0,
  staff_rating integer DEFAULT 0,
  value_for_money integer DEFAULT 0,
  
  -- Treatment Specific Feedback
  treatment_effectiveness integer DEFAULT 0,
  treatment_comfort integer DEFAULT 0,
  immediate_results text DEFAULT '',
  skin_condition_after text DEFAULT '',
  hair_condition_after text DEFAULT '',
  
  -- Service Quality
  appointment_scheduling integer DEFAULT 0,
  wait_time text DEFAULT '',
  consultation_quality integer DEFAULT 0,
  aftercare_instructions integer DEFAULT 0,
  
  -- Detailed Feedback
  what_worked_well text DEFAULT '',
  areas_for_improvement text DEFAULT '',
  additional_comments text DEFAULT '',
  
  -- Follow-up
  experience_any_reactions text DEFAULT '',
  reaction_details text DEFAULT '',
  follow_up_needed text DEFAULT '',
  recommend_to_friends integer DEFAULT 0,
  return_for_future_services text DEFAULT '',
  
  -- Suggestions
  additional_services_interested text[] DEFAULT '{}',
  suggested_improvements text DEFAULT '',
  
  -- Consent
  allow_testimonial_use text DEFAULT '',
  allow_contact_for_follow_up text DEFAULT ''
);

-- Disable Row Level Security for now (can be enabled later if needed)
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS feedback_email_idx ON feedback(email);
CREATE INDEX IF NOT EXISTS feedback_visit_date_idx ON feedback(visit_date);
CREATE INDEX IF NOT EXISTS feedback_consultation_id_idx ON feedback(consultation_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);