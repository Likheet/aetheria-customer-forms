# 🚀 Post Acne Scarring - QUICK START

**Goal**: Set up the Post Acne Scarring concern in your Supabase database in 30 minutes.

---

## Phase 1: Create the Subtypes (5 min)

Open Supabase SQL editor and run:

```sql
INSERT INTO public.concern_subtype (concern, code, label, description, created_at, updated_at)
VALUES
  ('postacnescars', 'IcePick', 'Ice Pick Scars', 'Small, shallow, round or pitted scars', NOW(), NOW()),
  ('postacnescars', 'Rolling', 'Rolling Scars', 'Broad, shallow depressions', NOW(), NOW()),
  ('postacnescars', 'PostInflammatoryPigmentation', 'Post-inflammatory Pigmentation', 'Flat or slightly raised dark marks', NOW(), NOW()),
  ('postacnescars', 'Keloid', 'Keloid / Hypertrophic Scars', 'Raised, thick scars', NOW(), NOW())
ON CONFLICT (concern, code) DO NOTHING;
```

✅ Verify: Should return 4 rows (or 0 if already existed)

---

## Phase 2: Get Product & Subtype IDs (5 min)

Run these queries to copy down the UUIDs:

```sql
-- Get subtype IDs (you'll need these)
SELECT id, code FROM concern_subtype WHERE concern = 'postacnescars' ORDER BY code;

-- Get product IDs (pick one from each category)
SELECT id, display_name FROM product WHERE category ILIKE '%cleanser%' LIMIT 5;
SELECT id, display_name FROM product WHERE category ILIKE '%serum%' LIMIT 10;
SELECT id, display_name FROM product WHERE category ILIKE '%moisturizer%' LIMIT 5;
SELECT id, display_name FROM product WHERE category ILIKE '%sunscreen%' LIMIT 5;
```

Create a mapping like this:
```
IcePick_id: [copy UUID from concern_subtype query]
Rolling_id: [copy UUID]
PostInflammatoryPigmentation_id: [copy UUID]
Keloid_id: [copy UUID]

cleanser_id: [pick one product UUID]
bha_serum_id: [pick one serum UUID]
aha_serum_id: [pick one serum UUID]
moisturizer_light_id: [pick one product UUID]
moisturizer_rich_id: [pick one product UUID]
sunscreen_id: [pick one product UUID]
hydrating_serum_id: [pick one product UUID]
peptide_serum_id: [pick one product UUID]
```

---

## Phase 3: Insert Matrix Entries (20 min)

Open `scripts/postacnescars_matrix_setup.sql` and scroll to **STEP 3: Insert Matrix Entries**.

**Option A: Simple (1 entry per scar type)**

If you just want to test the form working, insert minimal entries:

```sql
INSERT INTO public.matrix_entry (
  concern, subtype_id, skin_type, band,
  cleanser_id, core_serum_id, secondary_serum_id,
  moisturizer_id, sunscreen_id, remarks, created_at, updated_at
) VALUES
-- Ice Pick (all severities, all skin types)
('postacnescars', '[IcePick_id]', 'Dry', 'blue', '[cleanser_id]', '[bha_serum_id]', '[hydrating_serum_id]', '[moisturizer_rich_id]', '[sunscreen_id]', 'Mild BHA + hydration', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Combo', 'blue', '[cleanser_id]', '[bha_serum_id]', '[hydrating_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Mild BHA + light hydration', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Oily', 'blue', '[cleanser_id]', '[bha_serum_id]', '[hydrating_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Mild BHA for oily', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Sensitive', 'blue', '[cleanser_id]', '[aha_serum_id]', '[hydrating_serum_id]', '[moisturizer_rich_id]', '[sunscreen_id]', 'Gentle AHA for sensitive', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Normal', 'blue', '[cleanser_id]', '[bha_serum_id]', '[hydrating_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Regular BHA balanced', NOW(), NOW()),

-- Ice Pick Yellow (moderate)
('postacnescars', '[IcePick_id]', 'Dry', 'yellow', '[cleanser_id]', '[bha_serum_id]', '[peptide_serum_id]', '[moisturizer_rich_id]', '[sunscreen_id]', 'Regular BHA + peptides', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Combo', 'yellow', '[cleanser_id]', '[bha_serum_id]', '[peptide_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Regular BHA moderate', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Oily', 'yellow', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Strong BHA for oily', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Sensitive', 'yellow', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_rich_id]', '[sunscreen_id]', 'Gentle AHA + support', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Normal', 'yellow', '[cleanser_id]', '[bha_serum_id]', '[peptide_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Regular BHA + peptides', NOW(), NOW()),

-- Ice Pick Red (severe)
('postacnescars', '[IcePick_id]', 'Dry', 'red', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_rich_id]', '[sunscreen_id]', 'Strong AHA + barrier + refer', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Combo', 'red', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Strong treatment + refer', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Oily', 'red', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Strong AHA + refer dermatologist', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Sensitive', 'red', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_rich_id]', '[sunscreen_id]', 'Conservative strong + refer', NOW(), NOW()),
('postacnescars', '[IcePick_id]', 'Normal', 'red', '[cleanser_id]', '[aha_serum_id]', '[peptide_serum_id]', '[moisturizer_light_id]', '[sunscreen_id]', 'Strong AHA + refer professional', NOW(), NOW()),

-- [REPEAT PATTERN FOR Rolling (15 more entries), PostInflammatoryPigmentation (15), Keloid (15)]
-- Total: 60 entries (4 subtypes × 5 skin types × 3 bands)

ON CONFLICT (concern, subtype_id, skin_type, band) DO NOTHING;
```

**Option B: Complete (all 60 entries)**

Use the detailed template in `SUPABASE_SETUP_POSTACNESCARS.md` to customize all 60 entries.

---

## Phase 4: Verify (3 min)

Run this to confirm:

```sql
-- Should show 60 total (or however many you inserted)
SELECT COUNT(*) FROM matrix_entry WHERE concern = 'postacnescars';

-- Should show 4 subtypes with 15 entries each
SELECT 
  cs.code,
  COUNT(me.id) as entry_count
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
WHERE me.concern = 'postacnescars'
GROUP BY cs.id, cs.code
ORDER BY cs.code;

-- Should return products for a specific lookup
SELECT 
  p_cleanser.display_name as cleanser,
  p_core.display_name as core_serum,
  p_moisturizer.display_name as moisturizer,
  p_sunscreen.display_name as sunscreen
FROM matrix_entry me
LEFT JOIN product p_cleanser ON me.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON me.core_serum_id = p_core.id
LEFT JOIN product p_moisturizer ON me.moisturizer_id = p_moisturizer.id
LEFT JOIN product p_sunscreen ON me.sunscreen_id = p_sunscreen.id
WHERE 
  me.concern = 'postacnescars'
  AND me.skin_type = 'Oily'
  AND me.band = 'blue'
LIMIT 1;
```

✅ All three queries should return results.

---

## Phase 5: Test the Form (5 min)

1. Open your form in browser
2. Select **"Post Acne Scarring"** from main concerns
3. Answer **"What type of marks..."** → pick Ice Pick Scars
4. Answer **"How noticeable?"** → pick Moderate
5. Complete the form submission
6. **Expected**: Recommendations appear with products from your matrix entries

---

## 🎯 Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Create subtypes | 5 min |
| 2 | Collect product IDs | 5 min |
| 3 | Insert matrix entries | 15-20 min |
| 4 | Verify data | 3 min |
| 5 | Test form | 5 min |
| **Total** | **Complete setup** | **~35 min** |

---

## 📋 Checklist

- [ ] Phase 1: Subtypes created (4 rows in concern_subtype)
- [ ] Phase 2: Product & subtype UUIDs collected
- [ ] Phase 3: Matrix entries inserted (60 rows)
- [ ] Phase 4: Verification queries return results
- [ ] Phase 5: Form flow works end-to-end
- [ ] ✅ Post Acne Scarring is live!

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Foreign key violation" | Check product IDs exist in product table; verify UUIDs are correct |
| "Duplicate key error" | Matrix entries already exist; use ON CONFLICT DO NOTHING clause |
| No products showing in form | Verify concern_matrix.ts can find matrix_entry rows; check browser console |
| Form won't advance past scarring | Check validation: type must be selected AND (severity OR color) must be selected |

---

## 📚 Reference Files

- **SUPABASE_SETUP_POSTACNESCARS.md** ← Detailed guide with explanations
- **scripts/postacnescars_matrix_setup.sql** ← Full SQL with helper queries
- **IMPLEMENTATION_COMPLETE.md** ← Feature overview

---

**Status**: Ready to execute 🚀

Copy the Phase 1 query to Supabase SQL and get started!
