# ✅ Post Acne Scarring Setup Checklist

## Phase 1: Create Concern Subtypes ⏱️ 5 minutes

**Location**: Supabase SQL Editor  
**File to reference**: START_HERE.md or QUICKSTART_POSTACNESCARS.md

- [ ] Copy the 4-row INSERT from START_HERE.md
- [ ] Paste into Supabase SQL editor
- [ ] Click "Execute" or "Run"
- [ ] Verify: Should show "4 rows" or "0 rows affected"
- [ ] Run: `SELECT id, code FROM concern_subtype WHERE concern = 'postacnescars';`
- [ ] Copy the 4 UUIDs you see

**Save for later**:
```
IcePick_id: [PASTE UUID HERE]
Rolling_id: [PASTE UUID HERE]
PostInflammatoryPigmentation_id: [PASTE UUID HERE]
Keloid_id: [PASTE UUID HERE]
```

---

## Phase 2: Collect Product IDs ⏱️ 5 minutes

**Location**: Supabase SQL Editor  
**File to reference**: SUPABASE_SETUP_POSTACNESCARS.md → Step 2

Run each query and note down product UUIDs:

### Find Cleansers
```sql
SELECT id, display_name FROM product WHERE category ILIKE '%cleanser%' LIMIT 10;
```
- [ ] Pick 1 gentle cleanser
- [ ] Note the UUID: `[PASTE CLEANSER UUID HERE]`

### Find Serums
```sql
SELECT id, display_name FROM product WHERE category ILIKE '%serum%' LIMIT 20;
```
- [ ] Pick BHA serums (if available): `[PASTE UUID]`
- [ ] Pick AHA serums (if available): `[PASTE UUID]`
- [ ] Pick hydrating serum: `[PASTE UUID]`
- [ ] Pick peptide/barrier serum: `[PASTE UUID]`
- [ ] Pick brightening serum (optional): `[PASTE UUID]`

### Find Moisturizers
```sql
SELECT id, display_name FROM product WHERE category ILIKE '%moisturizer%' LIMIT 10;
```
- [ ] Pick light moisturizer: `[PASTE UUID]`
- [ ] Pick balanced moisturizer: `[PASTE UUID]`
- [ ] Pick rich/nourishing moisturizer: `[PASTE UUID]`

### Find Sunscreens
```sql
SELECT id, display_name FROM product WHERE category ILIKE '%sunscreen%' LIMIT 10;
```
- [ ] Pick 1 sunscreen: `[PASTE UUID]`

**Your Product Map** (fill in):
```
cleanser_gentle_id = 
bha_serum_id = 
aha_serum_id = 
hydrating_serum_id = 
peptide_serum_id = 
moisturizer_light_id = 
moisturizer_balanced_id = 
moisturizer_rich_id = 
sunscreen_id = 
```

---

## Phase 3: Insert Matrix Entries ⏱️ 15-20 minutes

**Location**: Supabase SQL Editor  
**File to reference**: QUICKSTART_POSTACNESCARS.md → Phase 3

### Option A: Minimal Setup (Test Only)
- [ ] Copy template from QUICKSTART_POSTACNESCARS.md Phase 3 "Option A"
- [ ] Replace [IcePick_id] with UUID from Phase 1
- [ ] Replace all [product_id] placeholders with UUIDs from Phase 2
- [ ] Paste into Supabase SQL editor
- [ ] Execute
- [ ] Check: Should show "15 rows" (only Ice Pick, all skin types, all bands)

### Option B: Complete Setup (Production)
- [ ] Open SUPABASE_SETUP_POSTACNESCARS.md → Step 4
- [ ] Fill in all 4 subtype IDs and product IDs
- [ ] Customize for each of 4 scar types:
  - [ ] Ice Pick (15 entries)
  - [ ] Rolling (15 entries)
  - [ ] Post-inflammatory Pigmentation (15 entries)
  - [ ] Keloid (15 entries)
- [ ] Paste into Supabase SQL editor
- [ ] Execute
- [ ] Check: Should show "60 rows"

---

## Phase 4: Verify Setup ⏱️ 3 minutes

**Location**: Supabase SQL Editor

### Verify Row Counts
```sql
SELECT COUNT(*) as total FROM matrix_entry WHERE concern = 'postacnescars';
```
- [ ] Should show: 15 (if minimal) or 60 (if complete)

### Verify by Subtype
```sql
SELECT cs.code, COUNT(me.id) as count
FROM matrix_entry me
JOIN concern_subtype cs ON me.subtype_id = cs.id
WHERE me.concern = 'postacnescars'
GROUP BY cs.id, cs.code
ORDER BY cs.code;
```
- [ ] Should show 4 subtypes with count ≥ 3 each

### Verify Products Load
```sql
SELECT 
  p_cleanser.display_name as cleanser,
  p_core.display_name as core_serum,
  p_moisturizer.display_name as moisturizer
FROM matrix_entry me
LEFT JOIN product p_cleanser ON me.cleanser_id = p_cleanser.id
LEFT JOIN product p_core ON me.core_serum_id = p_core.id
LEFT JOIN product p_moisturizer ON me.moisturizer_id = p_moisturizer.id
WHERE me.concern = 'postacnescars'
LIMIT 1;
```
- [ ] Should show 3 product names (not UUIDs)

---

## Phase 5: Test Form ⏱️ 5 minutes

**Location**: Your form in browser

- [ ] Open the Aetheria form
- [ ] Navigate to main concerns (Step 19)
- [ ] [ ] Check "Post Acne Scarring"
- [ ] Advance to next step
- [ ] Select scar type: **"Ice pick / pitted scars"**
- [ ] [ ] Advance to next step
- [ ] Select severity: **"Moderate"**
- [ ] [ ] Continue form completion
- [ ] Submit form
- [ ] [ ] Check browser console (F12) for errors
- [ ] [ ] Recommendations should appear on results page
- [ ] [ ] Products should be from your matrix entries

**Look for**:
- ✅ No red error messages
- ✅ Recommendations section appears
- ✅ 5 products shown (cleanser, 2 serums, moisturizer, sunscreen)
- ✅ Products match database entries

---

## Phase 6: Integration Testing ⏱️ Variable

**File to reference**: POSTACNE_SETUP_COMPLETE.md → Success Criteria

Test all combinations:

### Ice Pick Scars
- [ ] Blue (Mild) skin type Dry
- [ ] Blue (Mild) skin type Oily
- [ ] Yellow (Moderate) skin type Combo
- [ ] Red (Severe) skin type Sensitive

### Rolling Scars
- [ ] Blue (Mild) skin type Oily
- [ ] Yellow (Moderate) skin type Normal
- [ ] Red (Severe) skin type Dry

### Post-inflammatory Pigmentation
- [ ] Red (active) skin type Oily
- [ ] Brown (older) skin type Dry
- [ ] Both (combination) skin type Combo

### Keloid / Hypertrophic Scars
- [ ] Blue (Mild) skin type Sensitive
- [ ] Yellow (Moderate) skin type Normal
- [ ] Red (Severe) skin type Oily

---

## ✅ Completion Checklist

### Frontend Code
- [x] Types defined
- [x] Form UI implemented
- [x] Validation working
- [x] Build passing
- [x] Icons assigned

### Database Setup
- [ ] Phase 1: 4 concern_subtype rows created
- [ ] Phase 2: Product UUIDs collected
- [ ] Phase 3: ~60 matrix_entry rows inserted
- [ ] Phase 4: Verification queries pass
- [ ] Phase 5: Form flow works end-to-end
- [ ] Phase 6: Integration testing complete

### Documentation
- [x] QUICKSTART guide ready
- [x] Detailed setup guide ready
- [x] SQL templates ready
- [x] Navigation index ready

---

## 🎉 Success!

When all Phase 1-5 boxes are checked:
✅ **Post Acne Scarring is live in production**

---

## 📞 If You Get Stuck

| Issue | Check | Solution |
|-------|-------|----------|
| Foreign key error | Product UUIDs | Re-run product queries to verify |
| No rows inserted | Subtype IDs | Verify concern_subtype returned 4 rows |
| Form won't advance | Validation | Check browser console for errors |
| No recommendations | Matrix lookup | Run verification query to confirm data exists |
| Products don't match | Schema | Verify matrix_entry has correct product_ids |

---

**Estimated Total Time: ~45 minutes**

**Ready to begin? Open START_HERE.md and copy the Phase 1 SQL!**
