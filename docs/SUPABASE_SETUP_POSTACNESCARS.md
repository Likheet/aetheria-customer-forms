# Post Acne Scarring - Supabase Setup Guide

**Schema Version**: Your actual Supabase schema (matrix_entry, concern_subtype, etc.)  
**Status**: Ready to execute  
**Estimated Time**: 30-45 minutes  

---

## Overview

You need to:
1. **Insert 4 concern_subtype rows** (one for each scar type)
2. **Insert ~60 matrix_entry rows** (4 subtypes × 5 skin types × 3 bands)

---

## Step 1: Insert Concern Subtypes

First, get the UUIDs for each scar subtype that will be referenced by matrix_entry.

**Execute this query** in your Supabase SQL editor:

```sql
-- Insert the 4 Post Acne Scarring subtypes
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
```

**Verify insertion**:
```sql
SELECT id, concern, code, label FROM concern_subtype WHERE concern = 'postacnescars' ORDER BY code;
```

**Expected output**:
```
id (UUID)                              | concern       | code                           | label
----------------------------------------|---------------|--------------------------------|-----------------------------------
<uuid-1>                              | postacnescars | IcePick                        | Ice Pick Scars
<uuid-2>                              | postacnescars | PostInflammatoryPigmentation   | Post-inflammatory Pigmentation
<uuid-3>                              | postacnescars | Rolling                        | Rolling Scars
<uuid-4>                              | postacnescars | Keloid                         | Keloid / Hypertrophic Scars
```

**Save these UUIDs** — you'll need them for the next step. Store them as:
```
IcePick_UUID = <uuid-1>
PostInflammatoryPigmentation_UUID = <uuid-2>
Rolling_UUID = <uuid-3>
Keloid_UUID = <uuid-4>
```

---

## Step 2: Identify Key Products

Before inserting matrix entries, you need product IDs for each slot. Run these queries to find suitable products:

### Find Cleansers
```sql
SELECT id, display_name, brand, category FROM product 
WHERE category ILIKE '%cleanser%' OR display_name ILIKE '%cleanser%'
ORDER BY brand, display_name
LIMIT 20;
```

**Recommendation**: Pick 1-2 gentle cleansers (for all skin types)
- Example: CeraVe Foaming Cleanser, La Roche-Posay Toleriane

### Find Core Serums (for scarring concerns)

For **Ice Pick / Rolling Scars** (depressed texture):
```sql
-- Resurfacing serums (AHA/BHA for texture improvement)
SELECT id, display_name, brand FROM product 
WHERE ingredient_keywords && '{"AHA","BHA","Glycolic","Salicylic"}'
  OR display_name ILIKE '%AHA%' OR display_name ILIKE '%BHA%'
ORDER BY brand, display_name;
```

For **Pigmentation Scars** (PIH):
```sql
-- Brightening & depigmenting serums
SELECT id, display_name, brand FROM product 
WHERE ingredient_keywords && '{"Vitamin_C","Niacinamide","Tranexamic","Azelaic"}'
  OR display_name ILIKE '%Vitamin C%' OR display_name ILIKE '%Azelaic%'
ORDER BY brand, display_name;
```

For **Keloid / Hypertrophic Scars**:
```sql
-- Anti-inflammatory, silicone-based or barrier-supporting
SELECT id, display_name, brand FROM product 
WHERE ingredient_keywords && '{"Silicone","Allantoin","Centella","Peptides"}'
  OR display_name ILIKE '%Silicone%'
ORDER BY brand, display_name;
```

### Find Secondary Serums (complementary)
```sql
-- Peptides, ceramides, antioxidants for scar healing support
SELECT id, display_name, brand FROM product 
WHERE ingredient_keywords && '{"Peptides","Ceramides","Niacinamide","Squalane"}'
  OR display_name ILIKE '%Peptide%' OR display_name ILIKE '%Ceramide%'
ORDER BY brand, display_name
LIMIT 20;
```

### Find Moisturizers
```sql
SELECT id, display_name, brand FROM product 
WHERE category ILIKE '%moisturizer%' OR display_name ILIKE '%moisturizer%'
ORDER BY brand, display_name
LIMIT 20;
```

### Find Sunscreens
```sql
SELECT id, display_name, brand FROM product 
WHERE category ILIKE '%sunscreen%' OR display_name ILIKE '%spf%'
ORDER BY brand, display_name
LIMIT 20;
```

---

## Step 3: Build Your Product Selection Strategy

Based on scarring type and severity, here's the recommended product selection:

### Ice Pick Scars

| Severity | Strategy | Serums |
|----------|----------|--------|
| **Blue (Mild)** | Gentle exfoliation + hydration | 1× mild BHA or gentle AHA |
| **Yellow (Moderate)** | Stronger exfoliation + support | 1× medium-strength AHA, 1× hydrating/soothing |
| **Red (Severe)** | Aggressive resurfacing + barrier | 1× strong AHA/BHA, 1× peptides/ceramides + referral |

### Rolling Scars

| Severity | Strategy | Serums |
|----------|----------|--------|
| **Blue (Mild)** | Micro-exfoliation + support | 1× gentle AHA or BHA |
| **Yellow (Moderate)** | Consistent exfoliation | 1× regular AHA, 1× healing/barrier |
| **Red (Severe)** | Professional treatment + home support | Minimal actives, emphasis on barrier + referral |

### Post-inflammatory Pigmentation (PIH)

| Color/Age | Strategy | Serums |
|-----------|----------|--------|
| **Red (Recent/Active)** | Anti-inflammatory, gentle depigmentation | 1× niacinamide/azelaic, 1× antioxidant |
| **Brown (Older/Pigmented)** | Depigmentation + brightening | 1× vitamin C or tranexamic, 1× niacinamide |
| **Both** | Combination approach | 1× broad-spectrum (azelaic), 1× specific (C or tranexamic) |

### Keloid / Hypertrophic Scars

| Severity | Strategy | Serums |
|----------|----------|--------|
| **Blue (Mild)** | Barrier support + anti-inflammatory | 1× silicone/allantoin, 1× centella/peptides |
| **Yellow (Moderate)** | Enhanced barrier + anti-inflammatory | 1× enriched barrier serum, 1× soothing |
| **Red (Severe)** | Minimal intervention + professional referral | Only soothing/barrier serums, SPF, refer dermatologist |

---

## Step 4: Insert Matrix Entries

Once you've chosen your products, insert them into the matrix_entry table.

### Template Query

Replace the placeholders with actual product UUIDs:

```sql
INSERT INTO public.matrix_entry (
  concern,
  subtype_id,
  skin_type,
  band,
  cleanser_id,
  core_serum_id,
  secondary_serum_id,
  moisturizer_id,
  sunscreen_id,
  remarks,
  created_at,
  updated_at
) VALUES
-- Ice Pick Scars - Blue (Mild)
(
  'postacnescars',
  '<IcePick_UUID>',
  'Dry',
  'blue',
  '<cleanser_gentle_id>',
  '<bha_mild_id>',
  '<hydrating_serum_id>',
  '<moisturizer_rich_id>',
  '<sunscreen_id>',
  'Gentle BHA + hydration for textured improvement',
  NOW(),
  NOW()
),
(
  'postacnescars',
  '<IcePick_UUID>',
  'Combo',
  'blue',
  '<cleanser_gentle_id>',
  '<bha_mild_id>',
  '<hydrating_serum_id>',
  '<moisturizer_balanced_id>',
  '<sunscreen_id>',
  'Gentle BHA + light hydration',
  NOW(),
  NOW()
),
(
  'postacnescars',
  '<IcePick_UUID>',
  'Oily',
  'blue',
  '<cleanser_foaming_id>',
  '<bha_regular_id>',
  '<lightweight_serum_id>',
  '<moisturizer_lightweight_id>',
  '<sunscreen_id>',
  'Regular BHA + oil control',
  NOW(),
  NOW()
),
(
  'postacnescars',
  '<IcePick_UUID>',
  'Sensitive',
  'blue',
  '<cleanser_gentle_id>',
  '<aha_gentle_id>',
  '<soothing_serum_id>',
  '<moisturizer_soothing_id>',
  '<sunscreen_id>',
  'Gentle AHA + soothing for sensitive ice pick scars',
  NOW(),
  NOW()
),
(
  'postacnescars',
  '<IcePick_UUID>',
  'Normal',
  'blue',
  '<cleanser_mild_id>',
  '<bha_regular_id>',
  '<balancing_serum_id>',
  '<moisturizer_balanced_id>',
  '<sunscreen_id>',
  'Regular BHA + balanced support',
  NOW(),
  NOW()
),

-- Ice Pick Scars - Yellow (Moderate) - similar pattern for 5 skin types...
-- [Repeat above pattern for each skin type with Yellow severity]

-- Ice Pick Scars - Red (Severe) - barrier-first approach
-- [Repeat with minimal actives + referral notes]

-- Rolling Scars - Blue/Yellow/Red
-- [Similar 15 entries total]

-- Post-inflammatory Pigmentation - by color + skin type
-- [15 entries with brightening/depigmentation serums]

-- Keloid / Hypertrophic - Blue/Yellow/Red
-- [15 entries with minimal actives for Red band]

ON CONFLICT (concern, subtype_id, skin_type, band) DO NOTHING;
```

### Helper: Get All Your Product IDs at Once

```sql
-- Run this to get a complete product map
SELECT 'Cleanser_Gentle' as category, display_name, id FROM product WHERE display_name ILIKE '%CeraVe Foaming%'
UNION ALL
SELECT 'BHA', display_name, id FROM product WHERE ingredient_keywords && '{"BHA"}'
UNION ALL
SELECT 'AHA', display_name, id FROM product WHERE ingredient_keywords && '{"AHA"}'
UNION ALL
SELECT 'Vitamin_C', display_name, id FROM product WHERE ingredient_keywords && '{"Vitamin_C"}'
UNION ALL
SELECT 'Niacinamide', display_name, id FROM product WHERE ingredient_keywords && '{"Niacinamide"}'
UNION ALL
SELECT 'Moisturizer', display_name, id FROM product WHERE category ILIKE '%moisturizer%'
UNION ALL
SELECT 'Sunscreen', display_name, id FROM product WHERE category ILIKE '%sunscreen%'
ORDER BY category, display_name;
```

---

## Step 5: Verify Your Matrix Population

After insertion, verify the data:

```sql
-- Count entries by subtype
SELECT 
  cs.label,
  COUNT(me.id) as entry_count,
  COUNT(DISTINCT me.skin_type) as skin_types_covered,
  COUNT(DISTINCT me.band) as bands_covered
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
WHERE me.concern = 'postacnescars'
GROUP BY cs.id, cs.label
ORDER BY cs.label;

-- Expected output (assuming you populated all combinations):
-- label                           | entry_count | skin_types_covered | bands_covered
-- Ice Pick Scars                  | 15          | 5                  | 3
-- Keloid / Hypertrophic Scars     | 15          | 5                  | 3
-- Post-inflammatory Pigmentation  | 15          | 5                  | 3
-- Rolling Scars                   | 15          | 5                  | 3
-- ─────────────────────────────────────────────────────────────────────────────
-- TOTAL                           | 60          | 5                  | 3
```

### Detailed Verification

```sql
-- Check for any missing combinations
SELECT 
  cs.code,
  st.skin_type,
  bc.band,
  COUNT(me.id) as entries
FROM 
  (SELECT 'Dry' as skin_type UNION SELECT 'Combo' UNION SELECT 'Oily' UNION SELECT 'Sensitive' UNION SELECT 'Normal') st,
  (SELECT 'blue' as band UNION SELECT 'yellow' UNION SELECT 'red') bc,
  (SELECT 'IcePick' as code UNION SELECT 'Rolling' UNION SELECT 'PostInflammatoryPigmentation' UNION SELECT 'Keloid') cs
LEFT JOIN matrix_entry me ON 
  me.concern = 'postacnescars' 
  AND me.subtype_id = (SELECT id FROM concern_subtype WHERE code = cs.code)
  AND me.skin_type = st.skin_type::skin_type_key
  AND me.band = bc.band::band_color
GROUP BY cs.code, st.skin_type, bc.band
HAVING COUNT(me.id) = 0
ORDER BY cs.code, st.skin_type, bc.band;

-- If this returns results, those are the missing combinations you need to fill
```

### Verify Product Relationships

```sql
-- Check that all foreign keys are valid
SELECT 
  COUNT(*) as total_entries,
  COUNT(CASE WHEN cleanser_id IS NULL THEN 1 END) as missing_cleansers,
  COUNT(CASE WHEN core_serum_id IS NULL THEN 1 END) as missing_core_serums,
  COUNT(CASE WHEN moisturizer_id IS NULL THEN 1 END) as missing_moisturizers,
  COUNT(CASE WHEN sunscreen_id IS NULL THEN 1 END) as missing_sunscreens
FROM matrix_entry
WHERE concern = 'postacnescars';

-- All counts should be 0 for NULL columns (except secondary_serum_id which can be NULL)
```

---

## Step 6: Testing the Integration

Once matrix entries are populated, test that the form can find them:

### Frontend Test

1. Open the form in your browser
2. Select "Post Acne Scarring" from main concerns (step 19)
3. Answer "What type of marks...?" → select Ice Pick Scars
4. Answer severity question → select Moderate
5. **Expected**: Form advances, no errors in console

### Backend Test

```sql
-- Simulate a user selecting Ice Pick Scars - Moderate severity
-- skin_type = 'Oily'
SELECT 
  me.id,
  p_cleanser.display_name as cleanser,
  p_core.display_name as core_serum,
  p_secondary.display_name as secondary_serum,
  p_moisturizer.display_name as moisturizer,
  p_sunscreen.display_name as sunscreen,
  me.remarks
FROM matrix_entry me
LEFT JOIN product p_cleanser ON me.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON me.core_serum_id = p_core.id
LEFT JOIN product p_secondary ON me.secondary_serum_id = p_secondary.id
LEFT JOIN product p_moisturizer ON me.moisturizer_id = p_moisturizer.id
LEFT JOIN product p_sunscreen ON me.sunscreen_id = p_sunscreen.id
WHERE 
  me.concern = 'postacnescars'
  AND me.subtype_id = (SELECT id FROM concern_subtype WHERE code = 'IcePick')
  AND me.skin_type = 'Oily'
  AND me.band = 'yellow';

-- Expected: 1 row with 5 products and a remark like "Regular BHA + enhanced support"
```

---

## Step 7: Final Checklist

Before marking complete:

- [ ] 4 concern_subtype rows inserted (verify UUIDs obtained)
- [ ] All product UUIDs identified for each slot
- [ ] ~60 matrix_entry rows inserted (4 × 5 × 3)
- [ ] Verification queries show no missing combinations
- [ ] Foreign key checks pass (no NULL product IDs)
- [ ] Frontend form loads without errors
- [ ] Recommendation generation test passes

---

## Troubleshooting

### "Foreign key violation" error
**Cause**: Product ID doesn't exist  
**Solution**: Re-run product lookup queries; verify UUIDs before insertion

### Matrix entries not appearing
**Cause**: concern_subtype IDs mismatched  
**Solution**: Re-query concern_subtype table to get correct UUIDs; rebuild matrix entries

### Form advances but no recommendations
**Cause**: concern_matrix.ts can't find matrix entries  
**Solution**: Check that concern_matrix data loading is complete; check browser console for errors

---

## Quick Reference: Product Selection by Scenario

| Scenario | Cleanser | Core Serum | Secondary | Moisturizer | Sunscreen |
|----------|----------|-----------|-----------|------------|-----------|
| **Ice Pick - Blue** | Gentle | Mild BHA | Hydrating | Light | Regular |
| **Ice Pick - Yellow** | Gentle | Regular BHA | Soothing | Rich | Regular |
| **Ice Pick - Red** | Gentle | Strong AHA | Peptides | Rich | Mineral |
| **Rolling - Blue** | Gentle | Mild AHA | Hydrating | Light | Regular |
| **Rolling - Yellow** | Gentle | Regular AHA | Barrier | Balanced | Regular |
| **Rolling - Red** | Gentle | None | Peptides | Rich | Mineral |
| **PIH Red** | Gentle | Niacinamide | Antioxidant | Light | Mineral |
| **PIH Brown** | Gentle | Vitamin C | Niacinamide | Balanced | Mineral |
| **PIH Both** | Gentle | Azelaic | Brightening | Balanced | Mineral |
| **Keloid - Blue** | Gentle | Silicone/Allantoin | Centella | Light | Regular |
| **Keloid - Yellow** | Gentle | Barrier Serum | Soothing | Rich | Regular |
| **Keloid - Red** | Gentle | None | None | Rich | Mineral |

---

## Next Steps After Setup

1. ✅ Verify matrix population (Step 5)
2. ✅ Run integration tests (Step 6)
3. 📱 Test full user flow end-to-end
4. 📊 Collect feedback from first users
5. 🔄 Adjust product selections based on feedback

---

**Need help?** Check:
- Supabase SQL editor docs for INSERT/UPDATE syntax
- Your product table schema to ensure category/ingredient_keywords values
- Browser console (F12) for frontend errors during testing
