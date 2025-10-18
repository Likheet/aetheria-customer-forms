-- ============================================================================
-- POST ACNE SCARRING MATRIX SETUP
-- ============================================================================
-- This script sets up the post acne scarring concern in your Supabase database
-- Copy and run in your Supabase SQL editor
-- ============================================================================

-- STEP 1: Insert Concern Subtypes
-- Run this first to create the 4 scar types
-- ============================================================================

INSERT INTO public.concern_subtype (concern, code, label, description, created_at, updated_at)
VALUES
  (
    'postacnescars',
    'IcePick',
    'Ice Pick Scars',
    'Small, shallow, round or pitted scars that create a depressed appearance',
    NOW(),
    NOW()
  ),
  (
    'postacnescars',
    'Rolling',
    'Rolling Scars',
    'Broad, shallow depressions with sloping edges that create an undulating surface',
    NOW(),
    NOW()
  ),
  (
    'postacnescars',
    'PostInflammatoryPigmentation',
    'Post-inflammatory Pigmentation',
    'Flat or slightly raised dark marks from inflammation (not true scars)',
    NOW(),
    NOW()
  ),
  (
    'postacnescars',
    'Keloid',
    'Keloid / Hypertrophic Scars',
    'Raised, thick scars that extend beyond the original acne area',
    NOW(),
    NOW()
  )
ON CONFLICT (concern, code) DO NOTHING;

-- Verify insertion
SELECT id, concern, code, label FROM concern_subtype WHERE concern = 'postacnescars' ORDER BY code;

-- ============================================================================
-- HELPER QUERIES: Find Your Products
-- Run these to identify product UUIDs
-- ============================================================================

-- Find all cleansers
SELECT id, display_name, brand 
FROM product 
WHERE category ILIKE '%cleanser%' 
ORDER BY brand, display_name;

-- Find all serums
SELECT id, display_name, brand, ingredient_keywords
FROM product 
WHERE category ILIKE '%serum%' 
ORDER BY brand, display_name;

-- Find all moisturizers
SELECT id, display_name, brand
FROM product 
WHERE category ILIKE '%moisturizer%' 
ORDER BY brand, display_name;

-- Find all sunscreens
SELECT id, display_name, brand
FROM product 
WHERE category ILIKE '%sunscreen%' OR display_name ILIKE '%spf%'
ORDER BY brand, display_name;

-- Find products by ingredient
SELECT DISTINCT id, display_name, brand
FROM product 
WHERE ingredient_keywords && '{"BHA"}'
ORDER BY brand, display_name;

-- ============================================================================
-- STEP 2: Collect Product UUIDs
-- After running the queries above, record the UUIDs you want to use:
-- ============================================================================

-- Example mapping (REPLACE THESE WITH YOUR ACTUAL IDs):
-- Cleanser (gentle): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- BHA (mild): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- AHA (gentle): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- Hydrating serum: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- Peptide serum: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- Moisturizer (light): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- Moisturizer (balanced): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- Moisturizer (rich): xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
-- Sunscreen: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

-- Get subtype IDs (you'll need these too)
SELECT id, code FROM concern_subtype WHERE concern = 'postacnescars' ORDER BY code;

-- ============================================================================
-- STEP 3: Insert Matrix Entries (CUSTOMIZE WITH YOUR PRODUCT IDs)
-- ============================================================================

-- NOTE: Replace all UUID placeholders with actual product IDs from your queries above
-- Placeholder format: '<product-name>_id' (e.g., '<cleanser_gentle_id>')

-- Template for one entry (customize and duplicate for all 60):
-- INSERT INTO public.matrix_entry (
--   concern,
--   subtype_id,
--   skin_type,
--   band,
--   cleanser_id,
--   core_serum_id,
--   secondary_serum_id,
--   moisturizer_id,
--   sunscreen_id,
--   remarks,
--   created_at,
--   updated_at
-- ) VALUES (
--   'postacnescars',
--   '<ice_pick_subtype_id>',
--   'Dry',
--   'blue',
--   '<cleanser_gentle_id>',
--   '<bha_mild_id>',
--   '<hydrating_serum_id>',
--   '<moisturizer_rich_id>',
--   '<sunscreen_id>',
--   'Mild BHA + hydration for textured improvement',
--   NOW(),
--   NOW()
-- );

-- ============================================================================
-- STEP 4: Verify Your Matrix Population
-- ============================================================================

-- Count total entries
SELECT COUNT(*) as total_postacnescars_entries FROM matrix_entry WHERE concern = 'postacnescars';

-- Count by subtype
SELECT 
  cs.code as subtype,
  COUNT(me.id) as entry_count
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
WHERE me.concern = 'postacnescars'
GROUP BY cs.id, cs.code
ORDER BY cs.code;

-- View all entries
SELECT 
  cs.code as subtype,
  me.skin_type,
  me.band,
  p_cleanser.display_name as cleanser,
  p_core.display_name as core_serum,
  COALESCE(p_secondary.display_name, 'N/A') as secondary_serum,
  p_moisturizer.display_name as moisturizer,
  p_sunscreen.display_name as sunscreen,
  me.remarks
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
LEFT JOIN product p_cleanser ON me.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON me.core_serum_id = p_core.id
LEFT JOIN product p_secondary ON me.secondary_serum_id = p_secondary.id
LEFT JOIN product p_moisturizer ON me.moisturizer_id = p_moisturizer.id
LEFT JOIN product p_sunscreen ON me.sunscreen_id = p_sunscreen.id
WHERE me.concern = 'postacnescars'
ORDER BY cs.code, me.skin_type, me.band;

-- Check for missing combinations
SELECT 
  cs.code,
  st.skin_type,
  bc.band,
  CASE WHEN COUNT(me.id) = 0 THEN 'MISSING' ELSE 'OK' END as status
FROM 
  (SELECT 'Dry' as skin_type UNION SELECT 'Combo' UNION SELECT 'Oily' UNION SELECT 'Sensitive' UNION SELECT 'Normal') st,
  (SELECT 'blue' as band UNION SELECT 'yellow' UNION SELECT 'red') bc,
  (SELECT id, code FROM concern_subtype WHERE concern = 'postacnescars') cs
LEFT JOIN matrix_entry me ON 
  me.concern = 'postacnescars' 
  AND me.subtype_id = cs.id
  AND me.skin_type = st.skin_type::skin_type_key
  AND me.band = bc.band::band_color
GROUP BY cs.id, cs.code, st.skin_type, bc.band
ORDER BY cs.code, st.skin_type, bc.band;

-- ============================================================================
-- STEP 5: Test Integration
-- ============================================================================

-- Simulate lookup for a user with Ice Pick Scars, Yellow severity, Oily skin
SELECT 
  me.id as matrix_entry_id,
  cs.label as scar_type,
  me.skin_type,
  me.band as severity,
  p_cleanser.display_name as cleanser,
  p_core.display_name as core_active,
  COALESCE(p_secondary.display_name, '(none)') as secondary_active,
  p_moisturizer.display_name as moisturizer,
  p_sunscreen.display_name as sunscreen,
  me.remarks
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
LEFT JOIN product p_cleanser ON me.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON me.core_serum_id = p_core.id
LEFT JOIN product p_secondary ON me.secondary_serum_id = p_secondary.id
LEFT JOIN product p_moisturizer ON me.moisturizer_id = p_moisturizer.id
LEFT JOIN product p_sunscreen ON me.sunscreen_id = p_sunscreen.id
WHERE 
  me.concern = 'postacnescars'
  AND cs.code = 'IcePick'
  AND me.skin_type = 'Oily'
  AND me.band = 'yellow';

-- ============================================================================
-- NOTES & TROUBLESHOOTING
-- ============================================================================

-- If you get "foreign key violation" errors:
-- 1. Double-check that all product IDs exist in the product table
-- 2. Verify the subtype_id exists in concern_subtype table
-- 3. Make sure skin_type and band values are exactly: 
--    skin_type: 'Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'
--    band: 'blue', 'yellow', 'red'

-- If matrix entries don't appear in the form:
-- 1. Verify concern_matrix.ts can load the data
-- 2. Check browser console for errors
-- 3. Make sure concern_subtype records have the correct concern value: 'postacnescars'

-- If you need to delete and start over:
-- DELETE FROM matrix_entry WHERE concern = 'postacnescars';
-- DELETE FROM concern_subtype WHERE concern = 'postacnescars';
