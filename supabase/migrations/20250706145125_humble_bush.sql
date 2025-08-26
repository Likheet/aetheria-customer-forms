/*
  # Add AI summary field to consultations table

  1. New Fields
    - `ai_summary` (jsonb) - Comprehensive JSON containing all questions and answers
      for easy AI analysis and customer history insights

  2. Structure
    - Contains structured question-answer pairs
    - Includes user's personal information
    - Organized by consultation sections (basic info, skin, lifestyle, hair, etc.)
    - Optimized for AI consumption and analysis

  3. Performance
    - Uses JSONB for efficient querying and indexing
    - Add GIN index for fast JSON queries
*/

-- Add ai_summary field to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS ai_summary jsonb DEFAULT '{}';

-- Create GIN index for efficient JSON queries
CREATE INDEX IF NOT EXISTS consultations_ai_summary_gin_idx 
ON consultations USING gin (ai_summary);

-- Add comment for documentation
COMMENT ON COLUMN consultations.ai_summary IS 'Comprehensive JSON summary of all consultation questions and answers for AI analysis';