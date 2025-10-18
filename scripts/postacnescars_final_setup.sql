-- ============================================================================
-- POST ACNE SCARRING - FINAL SETUP (Based on Your Exact Product List)
-- ============================================================================

-- STEP 1: Create concern_subtype entries
INSERT INTO public.concern_subtype (concern, code, label, description, created_at, updated_at)
VALUES
  ('postacnescars', 'IcePick', 'Ice Pick Scars', 'Small, shallow, round or pitted scars', NOW(), NOW()),
  ('postacnescars', 'Rolling', 'Rolling Scars', 'Broad, shallow depressions', NOW(), NOW()),
  ('postacnescars', 'PostInflammatoryPigmentationRed', 'Post-inflammatory Pigmentation (Red)', 'Flat or slightly raised red/active marks', NOW(), NOW()),
  ('postacnescars', 'PostInflammatoryPigmentationBrown', 'Post-inflammatory Pigmentation (Brown)', 'Flat or slightly raised brown/older marks', NOW(), NOW()),
  ('postacnescars', 'Keloid', 'Keloid / Hypertrophic Scars', 'Raised, thick scars', NOW(), NOW())
ON CONFLICT (concern, code) DO NOTHING;

-- STEP 2: Get your product IDs (RUN THESE QUERIES FIRST)
-- ============================================================================

-- Get product IDs for Ice Pick Scars
-- Core: Adapalene 0.1% (3-5x a week)
-- Secondary: 2% Salicylic Acid (2x a week)
SELECT id, display_name FROM product WHERE display_name ILIKE '%Differin%' OR display_name ILIKE '%Adapalene%';

-- Get Salicylic Acid 2%
SELECT id, display_name FROM product WHERE display_name ILIKE '%salicylic%' AND (display_name ILIKE '%2%' OR ingredient_keywords && '{"Salicylic_acid"}');

-- Get Glycolic Acid 8-10%
SELECT id, display_name FROM product WHERE display_name ILIKE '%glycolic%' OR display_name ILIKE '%lactic%';

-- Get Lactic Acid 5%
SELECT id, display_name FROM product WHERE display_name ILIKE '%lactic%';

-- Get Azelaic Acid 10%
SELECT id, display_name FROM product WHERE display_name ILIKE '%azelaic%' OR display_name ILIKE '%aziderm%' OR ingredient_keywords && '{"Azelaic_acid"}';

-- Get Tranexamic Acid + Alpha Arbutin
SELECT id, display_name FROM product WHERE display_name ILIKE '%tranexamic%' OR display_name ILIKE '%alpha%arbutin%' OR display_name ILIKE '%skarfix%' OR display_name ILIKE '%skin 1004%';

-- Get Cleansers (As per skin type)
SELECT id, display_name, category FROM product WHERE category ILIKE '%cleanser%' ORDER BY display_name;

-- Get Moisturizers (As per skin type)
SELECT id, display_name, category FROM product WHERE category ILIKE '%moisturizer%' ORDER BY display_name;

-- Get Sunscreens
SELECT id, display_name, category FROM product WHERE category ILIKE '%sunscreen%' ORDER BY display_name;

-- Get Silicon sheets / barrier products
SELECT id, display_name FROM product WHERE display_name ILIKE '%silicon%' OR display_name ILIKE '%sheet%' OR display_name ILIKE '%barrier%';

-- STEP 3: After getting product IDs above, fill in the template below
-- ============================================================================
-- CUSTOMIZE THESE IDs with your actual product UUIDs:

-- Define your product IDs (REPLACE THESE)
-- Products from your concern table for Acne Scars:
-- Cleanser: As per skin type → use "Gentle foaming cleanser" or "Hydrating cleanser"
-- Adapalene 0.1%: Differin gel
-- Salicylic Acid 2%: Minimalist 2% salicylic acid / CeraVe / Dermalogica
-- Glycolic Acid 8-10%: The Ordinary 10% Lactic Acid
-- Lactic Acid 5%: Minimalist 5% Lactic Acid
-- Azelaic Acid 10%: The Ordinary 10% / Paula's Choice 10%
-- Tranexamic Acid + Alpha Arbutin: Fixderma Skarfix TX
-- Moisturizer: As per skin type
-- Sunscreen: As per skin type / Tinted mineral for PIH

-- Get subtype IDs first:
SELECT id, code FROM concern_subtype WHERE concern = 'postacnescars';

-- STEP 4: INSERT MATRIX ENTRIES (based on your exact concern data)
-- ============================================================================

-- TEMPLATE: Update placeholder IDs below with actual UUIDs from queries above
-- Format: 
-- ('postacnescars', [subtype_uuid], '[skin_type]', '[band]', [cleanser_id], [core_serum_id], [secondary_id], [moisturizer_id], [sunscreen_id], '[remarks]')

-- Example (CUSTOMIZE):
-- INSERT INTO public.matrix_entry (concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id, remarks, created_at, updated_at)
-- VALUES
-- ('postacnescars', [ice_pick_uuid], 'Dry', 'blue', [cleanser_dry], [adapalene], [salicylic_2pct], [moisturizer_rich], [sunscreen_standard], 'Gentle adapalene + mild exfoliation for ice pick scars', NOW(), NOW()),
-- ('postacnescars', [ice_pick_uuid], 'Combo', 'blue', [cleanser_gentle], [adapalene], [salicylic_2pct], [moisturizer_gelcream], [sunscreen_standard], 'Adapalene + salicylic for balanced skin', NOW(), NOW()),
-- ('postacnescars', [ice_pick_uuid], 'Oily', 'blue', [cleanser_gentle], [adapalene], [salicylic_2pct], [moisturizer_oilyfree], [sunscreen_standard], 'Adapalene with 2% salicylic for oily ice pick scars', NOW(), NOW()),
-- ... (repeat for all bands and skin types)

-- YOUR EXACT MAPPING (from your concern table):
-- 
-- Ice Pick Scars → Adapalene 0.1% (3-5x/week) + 2% Salicylic Acid (2x/week)
-- Rolling Scars (Oily/Combo) → Adapalene 0.1% (3-5x/week) + 8-10% Glycolic Acid
-- Rolling Scars (Dry) → Adapalene 0.1% (3-5x/week) + 5% Lactic Acid
-- PIH Red → Azelaic 10% + Adapalene 0.1% + Tinted mineral sunscreen
-- PIH Brown → Tranexamic + Alpha Arbutin + Azelaic 10% + Tinted mineral sunscreen
-- Keloid → Silicon sheets (no active serum)

-- SIMPLE QUERY TO HELP BUILD YOUR IDs MAP:
-- Copy this output and fill in the INSERT below

WITH product_map AS (
  SELECT 
    'Cleanser_Gentle' as category,
    display_name,
    id
  FROM product 
  WHERE display_name ILIKE '%gentle foaming%' OR display_name ILIKE '%cetaphil%foaming%'
  LIMIT 1
  UNION ALL
  SELECT 'Adaptalen_01%', display_name, id FROM product WHERE display_name ILIKE '%Differin%' LIMIT 1
  UNION ALL
  SELECT 'Salicylic_2pct', display_name, id FROM product WHERE display_name ILIKE '%minimalist%2%' LIMIT 1
  UNION ALL
  SELECT 'Glycolic_10pct', display_name, id FROM product WHERE display_name ILIKE '%ordinary%10%' AND display_name ILIKE '%lactic%' LIMIT 1
  UNION ALL
  SELECT 'Lactic_5pct', display_name, id FROM product WHERE display_name ILIKE '%minimalist%5%lactic%' LIMIT 1
  UNION ALL
  SELECT 'Azelaic_10pct', display_name, id FROM product WHERE display_name ILIKE '%ordinary%10%azelaic%' LIMIT 1
  UNION ALL
  SELECT 'Tranexamic', display_name, id FROM product WHERE display_name ILIKE '%fixderma%' OR display_name ILIKE '%skarfix%' LIMIT 1
  UNION ALL
  SELECT 'Moisturizer_Rich', display_name, id FROM product WHERE display_name ILIKE '%moisturizer%rich%' OR display_name ILIKE '%ceramide%marula%' LIMIT 1
  UNION ALL
  SELECT 'Sunscreen_Standard', display_name, id FROM product WHERE display_name ILIKE '%minimalist%spf%' LIMIT 1
)
SELECT * FROM product_map;

-- ============================================================================
-- AFTER YOU HAVE YOUR PRODUCT IDS, RUN THIS SECTION:
-- ============================================================================

-- This is the actual INSERT - customize the UUIDs in the VALUES clause:

-- INSERT INTO public.matrix_entry (
--   concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, 
--   moisturizer_id, sunscreen_id, remarks, created_at, updated_at
-- ) VALUES
-- -- ICE PICK SCARS (all skin types, 3 bands each)
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='IcePick'), 'Dry', 'blue', [cleanser], [adapalene], [salicylic_2pct], [moisturizer_rich], [sunscreen], 'Adapalene 0.1% + 2% Salicylic acid for ice pick scars', NOW(), NOW()),
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='IcePick'), 'Combo', 'blue', [cleanser], [adapalene], [salicylic_2pct], [moisturizer_gelcream], [sunscreen], 'Adapalene + Salicylic for combination ice pick scars', NOW(), NOW()),
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='IcePick'), 'Oily', 'blue', [cleanser], [adapalene], [salicylic_2pct], [moisturizer_oilyfree], [sunscreen], 'Adapalene + Salicylic for oily ice pick scars', NOW(), NOW()),
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='IcePick'), 'Sensitive', 'blue', [cleanser], [adapalene], [salicylic_2pct], [moisturizer_barrier], [sunscreen], 'Gentle adapalene + mild salicylic for sensitive ice pick scars', NOW(), NOW()),
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='IcePick'), 'Normal', 'blue', [cleanser], [adapalene], [salicylic_2pct], [moisturizer_gelcream], [sunscreen], 'Standard adapalene + salicylic protocol', NOW(), NOW()),
-- -- Continue for yellow and red bands...
-- 
-- -- ROLLING SCARS
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='Rolling'), 'Oily', 'blue', [cleanser], [adapalene], [glycolic_10pct], [moisturizer_oilyfree], [sunscreen], 'Adapalene + Glycolic 8-10% for oily rolling scars', NOW(), NOW()),
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='Rolling'), 'Dry', 'blue', [cleanser], [adapalene], [lactic_5pct], [moisturizer_rich], [sunscreen], 'Adapalene + Lactic 5% for dry rolling scars', NOW(), NOW()),
-- -- ... continue for all combinations
--
-- -- PIH RED
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='PostInflammatoryPigmentationRed'), 'Dry', 'blue', [cleanser], [azelaic_10pct], [adapalene], [moisturizer_rich], [tinted_mineral], 'Azelaic 10% + Adapalene for red PIH (dry)', NOW(), NOW()),
-- -- ... continue
--
-- -- PIH BROWN
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='PostInflammatoryPigmentationBrown'), 'Dry', 'blue', [cleanser], [tranexamic], [azelaic_10pct], [moisturizer_rich], [tinted_mineral], 'Tranexamic + Azelaic for brown PIH (dry)', NOW(), NOW()),
-- -- ... continue
--
-- -- KELOID
-- ('postacnescars', (SELECT id FROM concern_subtype WHERE code='Keloid'), 'Dry', 'blue', [cleanser], [silicon_sheets], NULL, [moisturizer_rich], [sunscreen], 'Silicon sheets for keloid/hypertrophic scars', NOW(), NOW()),
-- -- ... continue
--
-- ON CONFLICT (concern, subtype_id, skin_type, band) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After insertion, verify:
SELECT COUNT(*) as total_entries FROM matrix_entry WHERE concern = 'postacnescars';

SELECT 
  cs.code as scar_type,
  COUNT(me.id) as entry_count
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
WHERE me.concern = 'postacnescars'
GROUP BY cs.id, cs.code
ORDER BY cs.code;

-- Test a specific lookup
SELECT 
  p_cleanser.display_name as cleanser,
  p_core.display_name as core_serum,
  COALESCE(p_secondary.display_name, 'N/A') as secondary_serum,
  p_moisturizer.display_name as moisturizer,
  p_sunscreen.display_name as sunscreen
FROM matrix_entry me
LEFT JOIN product p_cleanser ON me.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON me.core_serum_id = p_core.id
LEFT JOIN product p_secondary ON me.secondary_serum_id = p_secondary.id
LEFT JOIN product p_moisturizer ON me.moisturizer_id = p_moisturizer.id
LEFT JOIN product p_sunscreen ON me.sunscreen_id = p_sunscreen.id
WHERE 
  me.concern = 'postacnescars'
  AND me.skin_type = 'Oily'
LIMIT 5;
