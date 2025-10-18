-- Post Acne Scarring - Supabase SQL Setup Guide
-- This SQL will populate the concern_subtype and concern_matrix tables

-- ============================================================================
-- STEP 1: Add Concern Subtypes
-- ============================================================================
-- Run this first to create the scarring subtypes

INSERT INTO concern_subtype (concern, code, label, description) VALUES
('postacnescars', 'IcePick', 'Ice Pick Scars', 'Small, shallow, round or pitted scars - less than 10% of face affected'),
('postacnescars', 'Rolling', 'Rolling Scars', 'Broad, shallow depressions - create undulating appearance'),
('postacnescars', 'PostInflammatoryPigmentation', 'Post-inflammatory Pigmentation', 'Flat or slightly raised dark marks from healed acne'),
('postacnescars', 'Keloid', 'Keloid / Hypertrophic Scars', 'Raised, thick scars that extend beyond original acne area')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Add Matrix Entries for Post-Acne Scarring
-- ============================================================================
-- NOTE: You'll need to replace <product_id> with actual product IDs from your database
-- Use: SELECT id, slug FROM product WHERE ... to find IDs
--
-- Product Selection Strategy:
-- 
-- ICE PICK / ROLLING SCARS (Depressed scars):
--   - Core Serum: Resurfacing (AHA/BHA) or Brightening (Vitamin C, Niacinamide)
--   - Secondary: Hydrating or supportive
--   - Focus: Texture smoothing, cell turnover
--
-- POST-INFLAMMATORY PIGMENTATION:
--   - Red marks: Anti-inflammatory (Azelaic, Niacinamide)
--   - Brown marks: Depigmenting (Vitamin C, Tranexamic acid, Kojic acid)
--   - Cleanser: Always gentle
--
-- KELOID / HYPERTROPHIC:
--   - Blue/Moderate: Supportive routine
--   - Severe (Red): Refer to dermatologist, minimal routine only
--   - Focus: Prevent worsening, professional treatments recommended

-- ============================================================================
-- Template Examples (You must substitute actual product IDs)
-- ============================================================================

-- EXAMPLE: Ice Pick Scars - Dry Skin - Mild (Blue)
-- INSERT INTO concern_matrix 
-- (concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id, remarks)
-- VALUES 
-- ('postacnescars', 'IcePick', 'Dry', 'blue', 
--   '<gentle_cleanser_id>', 
--   '<niacinamide_brightening_id>', 
--   '<hydrating_serum_id>', 
--   '<rich_moisturizer_id>', 
--   '<spf50_id>',
--   'Mild ice pick scars - gentle texture support');

-- ============================================================================
-- SQL to FIND PRODUCT IDs (Run these to get actual IDs)
-- ============================================================================

-- Find gentle cleansers:
-- SELECT id, display_name FROM product WHERE category = 'Cleanser' AND is_referral != true LIMIT 10;

-- Find brightening/texture serums:
-- SELECT id, display_name FROM product WHERE category = 'Serum' AND ingredient_keywords LIKE '%niacinamide%' OR ingredient_keywords LIKE '%vitamin c%' LIMIT 10;

-- Find resurfacing serums (AHA/BHA):
-- SELECT id, display_name FROM product WHERE category = 'Serum' AND ingredient_keywords LIKE '%aha%' OR ingredient_keywords LIKE '%bha%' LIMIT 10;

-- Find anti-inflammatory serums:
-- SELECT id, display_name FROM product WHERE category = 'Serum' AND ingredient_keywords LIKE '%azelaic%' OR ingredient_keywords LIKE '%zinc%' LIMIT 10;

-- Find depigmenting serums:
-- SELECT id, display_name FROM product WHERE category = 'Serum' AND ingredient_keywords LIKE '%tranexamic%' OR ingredient_keywords LIKE '%kojic%' LIMIT 10;

-- Find moisturizers:
-- SELECT id, display_name FROM product WHERE category = 'Moisturizer' LIMIT 10;

-- Find sunscreens:
-- SELECT id, display_name FROM product WHERE category = 'Sunscreen' OR category = 'SPF' LIMIT 10;

-- ============================================================================
-- STEP 3: Build Complete Matrix
-- ============================================================================
-- Create entries for all combinations:
-- - 4 Subtypes (IcePick, Rolling, PostInflammatoryPigmentation, Keloid)
-- - 5 Skin types (Dry, Combo, Oily, Sensitive, Normal)
-- - 3 Severity bands (blue=mild, yellow=moderate, red=severe)
-- Total: ~60 entries
--
-- For PostInflammatoryPigmentation, you may want to differentiate:
--   - Brown severity bands vs. Red severity bands
--   - Or create separate entries with products targeting each color
--
-- Keloid Red severity should either:
--   - Use referral products (is_referral = true)
--   - Or note "refer-professional-scars" in remarks

-- ============================================================================
-- HELPER: Check matrix exists for a concern
-- ============================================================================
-- SELECT COUNT(*) FROM concern_matrix WHERE concern = 'postacnescars';
-- SELECT DISTINCT subtype_id, skin_type, band FROM concern_matrix WHERE concern = 'postacnescars' ORDER BY subtype_id, skin_type, band;

-- ============================================================================
-- HELPER: Verify product tags for compatibility checking
-- ============================================================================
-- SELECT p.id, p.display_name, t.tag_id 
-- FROM product p 
-- LEFT JOIN product_tag t ON p.id = t.product_id 
-- WHERE p.display_name LIKE '%[Product Name]%'
-- ORDER BY p.display_name;

-- ============================================================================
-- RECOMMENDED PRODUCT COMBINATIONS BY SCENARIO
-- ============================================================================

-- SCENARIO 1: Ice Pick Scars - Mild (Blue) - Combination Skin
-- Best approach: Gentle niacinamide + hydration
-- Cleanser: Gentle gel or foam
-- Core: Niacinamide 10% + Zinc (The Ordinary equivalent)
-- Secondary: Hyaluronic acid serum
-- Moisturizer: Lightweight gel-cream
-- Sunscreen: SPF 50+

-- SCENARIO 2: Ice Pick Scars - Moderate (Yellow) - Combination Skin
-- Best approach: Gentle resurfacing + brightening
-- Cleanser: Gentle exfoliating cleanser (optional)
-- Core: BHA 2% or AHA 8-10%
-- Secondary: Vitamin C 15% or Niacinamide
-- Moisturizer: Balanced hydration
-- Sunscreen: SPF 50+ (mandatory with actives)

-- SCENARIO 3: Ice Pick Scars - Severe (Red) - Combination Skin
-- Best approach: Strong resurfacing, refer professional
-- NOTE: Recommend laser/microneedling at this severity
-- Cleanser: Gentle
-- Core: Combination of AHA + BHA or strong single active
-- Secondary: Supportive (peptides, ceramides)
-- Moisturizer: Barrier-supportive (ceramides, centella asiatica)
-- Sunscreen: SPF 50+ (non-negotiable)
-- Remarks: "Consider professional laser or microneedling for optimal results"

-- SCENARIO 4: Post-inflammatory Pigmentation (Red) - Yellow Severity
-- Best approach: Anti-inflammatory focus
-- Cleanser: Gentle
-- Core: Azelaic acid 20% OR Niacinamide + Zinc
-- Secondary: Soothing (centella, bisabolol)
-- Moisturizer: Calming with anti-inflammatory ingredients
-- Sunscreen: SPF 50+ (prevents darkening of marks)

-- SCENARIO 5: Post-inflammatory Pigmentation (Brown) - Yellow Severity
-- Best approach: Depigmenting + brightening
-- Cleanser: Gentle
-- Core: Vitamin C 15-20% OR Tranexamic acid 5%
-- Secondary: Brightening (niacinamide, kojic acid)
-- Moisturizer: Standard hydration
-- Sunscreen: SPF 50+ (sun causes darkening of marks)

-- SCENARIO 6: Keloid - Severe (Red)
-- Best approach: Minimal routine, refer professional
-- NOTE: Recommend steroid injections or laser at this severity
-- Cleanser: Gentle (non-irritating only)
-- Core: Soothing only (NO actives)
-- Secondary: None
-- Moisturizer: Barrier-supportive, non-irritating
-- Sunscreen: SPF 50+ (monitor for irritation)
-- Remarks: "Refer to dermatologist for steroid injections, laser, or other professional treatments"

-- ============================================================================
-- IMPLEMENTATION NOTES
-- ============================================================================

-- 1. Post-acne scarring uses the 'postacnescars' concern
-- 2. Subtype_id values: 'IcePick', 'Rolling', 'PostInflammatoryPigmentation', 'Keloid'
-- 3. Severity bands: 'blue' (mild), 'yellow' (moderate), 'red' (severe)
-- 4. Skin types: 'Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'
-- 5. Product slots: cleanser, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id
-- 6. Sunscreen is NON-NEGOTIABLE for all scarring recommendations (PIH gets worse with sun)
-- 7. Red severity should include professional treatment referrals
-- 8. No machine bands are involved - purely user input based

-- ============================================================================
-- TESTING CHECKLIST BEFORE DEPLOYMENT
-- ============================================================================

-- 1. Verify subtypes exist:
--    SELECT * FROM concern_subtype WHERE concern = 'postacnescars';

-- 2. Verify matrix entries exist:
--    SELECT COUNT(*) as matrix_count FROM concern_matrix WHERE concern = 'postacnescars';
--    Expected: ~60 (4 subtypes × 5 skin types × 3 severity bands)

-- 3. Spot check a few combinations:
--    SELECT * FROM concern_matrix 
--    WHERE concern = 'postacnescars' 
--    AND subtype_id = 'IcePick' 
--    AND skin_type = 'Combo'
--    LIMIT 5;

-- 4. Verify all severity bands represented:
--    SELECT DISTINCT band FROM concern_matrix WHERE concern = 'postacnescars' ORDER BY band;
--    Expected: blue, yellow, red

-- 5. Verify all skin types represented:
--    SELECT DISTINCT skin_type FROM concern_matrix WHERE concern = 'postacnescars' ORDER BY skin_type;
--    Expected: Combo, Dry, Normal, Oily, Sensitive

