-- ============================================================================
-- AETHERIA FORMS - RECOMMENDATION ENGINE SCHEMA SETUP
-- ============================================================================
-- This script creates the complete database schema for the skincare 
-- consultation form and recommendation engine.
--
-- Date: October 18, 2025
-- PostgreSQL Version: 12+
-- Supabase Compatible: Yes
--
-- ============================================================================
-- PART 1: ENUM TYPES
-- ============================================================================

-- Skincare concerns that can be assessed
CREATE TYPE concern_key AS ENUM (
  'acne',
  'pigmentation', 
  'pores',
  'texture',
  'sebum',
  'acnescars'
);

-- Health/severity bands (green=optimal, red=severe)
CREATE TYPE band_color AS ENUM (
  'green',   -- Optimal, no concern
  'blue',    -- Mild, manageable
  'yellow',  -- Moderate, needs attention
  'red'      -- Severe
);

-- Skin type classification
CREATE TYPE skin_type_key AS ENUM (
  'Dry',
  'Combo',
  'Oily',
  'Sensitive',
  'Normal'
);


-- ============================================================================
-- PART 2: PRODUCT CATALOG
-- ============================================================================

CREATE TABLE product (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  display_name VARCHAR NOT NULL,
  ingredient_keywords TEXT,
  is_referral BOOLEAN DEFAULT FALSE,
  pregnancy_unsafe BOOLEAN DEFAULT FALSE,
  isotretinoin_unsafe BOOLEAN DEFAULT FALSE,
  barrier_unsafe BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_slug ON product(slug);

-- Alternative names for products (for user input matching)
CREATE TABLE product_alias (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  alias VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_alias_product_id ON product_alias(product_id);

-- Product ingredient tags for compatibility checking
CREATE TABLE product_tag (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  tag VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_tag_product_id ON product_tag(product_id);
CREATE INDEX idx_product_tag_tag ON product_tag(tag);


-- ============================================================================
-- PART 3: CONCERN CONFIGURATION
-- ============================================================================

-- Subtypes within each concern (e.g., "Comedonal", "Inflammatory" for acne)
CREATE TABLE concern_subtype (
  id UUID PRIMARY KEY,
  concern concern_key NOT NULL,
  subtype_name VARCHAR NOT NULL,
  subtype_id VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(concern, subtype_id)
);

CREATE INDEX idx_concern_subtype_concern ON concern_subtype(concern);


-- ============================================================================
-- PART 4: RECOMMENDATION MATRIX (Core Business Logic)
-- ============================================================================

-- Master lookup table: (concern, subtype, skin_type, band) → products
CREATE TABLE concern_matrix (
  id UUID PRIMARY KEY,
  concern concern_key NOT NULL,
  subtype_id VARCHAR NOT NULL,
  skin_type skin_type_key NOT NULL,
  band band_color NOT NULL,
  
  -- Product slots for routine
  cleanser_id UUID REFERENCES product(id),  -- Can be NULL (falls back to defaults)
  core_serum_id UUID NOT NULL REFERENCES product(id),  -- Primary treatment (required)
  secondary_serum_id UUID REFERENCES product(id),  -- Optional secondary (can be NULL)
  moisturizer_id UUID NOT NULL REFERENCES product(id),  -- Required
  sunscreen_id UUID NOT NULL REFERENCES product(id),  -- Required
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(concern, subtype_id, skin_type, band),
  FOREIGN KEY (concern, subtype_id) REFERENCES concern_subtype(concern, subtype_id)
);

CREATE INDEX idx_concern_matrix_concern_band ON concern_matrix(concern, band);
CREATE INDEX idx_concern_matrix_skin_type ON concern_matrix(skin_type);


-- Fallback products when exact matrix entry not found
CREATE TABLE skin_type_defaults (
  id UUID PRIMARY KEY,
  skin_type skin_type_key NOT NULL,
  slot VARCHAR NOT NULL,  -- 'cleanser', 'coreSerum', 'moisturizer', 'sunscreen'
  product_id UUID NOT NULL REFERENCES product(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(skin_type, slot)
);

CREATE INDEX idx_skin_type_defaults_skin_type ON skin_type_defaults(skin_type);


-- ============================================================================
-- PART 5: CONSULTATION & FEEDBACK STORAGE
-- ============================================================================

-- Main consultation session records
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR UNIQUE,
  form_data JSONB,  -- Complete form submission data
  recommendations JSONB,  -- Generated recommendations output
  staff_id VARCHAR,
  client_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_session_id ON consultations(session_id);
CREATE INDEX idx_consultations_client_id ON consultations(client_id);


-- User feedback on recommendations
CREATE TABLE feedback_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_consultation_id ON feedback_sessions(consultation_id);


-- ============================================================================
-- PART 6: POST-ACNE SCARRING DATA (October 18, 2025)
-- ============================================================================
-- This section documents the Post Acne Scarring concern added for Q4 2025.
-- See docs/SUPABASE_SCHEMA.md for detailed explanation.

-- Subtypes for acnescars concern:
-- - IcePick: Small, deep, narrow scars
-- - Rolling: Broad, shallow depressions  
-- - Keloid: Raised, thick scars
-- - PostInflammatoryPigmentation: Red or brown discoloration marks

-- Expected matrix entries: 6 subtypes × 5 skin types × 3 bands (blue, yellow, red) = ~90 rows
-- See migration files for actual data load


-- ============================================================================
-- PART 7: VIEWS (OPTIONAL - for easier querying)
-- ============================================================================

-- View to see complete matrix with product names
CREATE VIEW v_concern_matrix_with_products AS
SELECT 
  cm.concern,
  cs.subtype_name,
  cm.skin_type,
  cm.band,
  p_cleanser.display_name AS cleanser_name,
  p_core.display_name AS core_serum_name,
  p_secondary.display_name AS secondary_serum_name,
  p_moisture.display_name AS moisturizer_name,
  p_sun.display_name AS sunscreen_name
FROM concern_matrix cm
JOIN concern_subtype cs ON cm.concern = cs.concern AND cm.subtype_id = cs.subtype_id
LEFT JOIN product p_cleanser ON cm.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON cm.core_serum_id = p_core.id
LEFT JOIN product p_secondary ON cm.secondary_serum_id = p_secondary.id
LEFT JOIN product p_moisture ON cm.moisturizer_id = p_moisture.id
LEFT JOIN product p_sun ON cm.sunscreen_id = p_sun.id;


-- ============================================================================
-- PART 8: NOTES FOR FUTURE MODIFICATIONS
-- ============================================================================

-- ADDING A NEW CONCERN SUBTYPE:
-- 1. INSERT into concern_subtype table
-- 2. Create 5 × 3 = 15 concern_matrix rows (all skin types × blue/yellow/red bands)
-- 3. Assign products to each matrix entry
-- 4. Test with test script: pnpm run test:acne-complete

-- MODIFYING PRODUCT INGREDIENTS:
-- 1. Update product.ingredient_keywords
-- 2. UPDATE/INSERT product_tag rows
-- 3. Verify ingredient compatibility in src/services/ingredientInteractions.ts

-- ADDING SAFETY GATES:
-- 1. Add form field to UpdatedConsultForm.tsx
-- 2. Add to form_data JSONB in consultations table
-- 3. Add gate check in recommendationEngineMatrix.ts functions
-- 4. Document gate logic here

-- RLS POLICIES (if needed):
-- Current setup allows direct Supabase client queries. 
-- To add Row Level Security, implement policies in Supabase dashboard.
