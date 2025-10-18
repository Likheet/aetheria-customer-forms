# Post Acne Scarring Implementation Guide

## Summary

The "Post Acne Scarring" concern has been successfully added to the Aetheria Forms system. Unlike other concerns that rely on machine band readings, post-acne scarring is **purely follow-up based** - it has no connection to machine readings.

## What's Been Implemented

### 1. **Type System Updates** (`src/types.ts`)
- Added `PostAcneScarringSubtype` type with 4 subtypes:
  - `IcePick` - Small, shallow, round or pitted scars
  - `Rolling` - Broad, shallow depressions
  - `PostInflammatoryPigmentation` - Flat or slightly raised dark marks
  - `Keloid` - Raised, thick scars
- Added 4 new fields to `UpdatedConsultData`:
  - `postAcneScarringType`: Selected scar type
  - `postAcneScarringSubtype`: Derived subtype
  - `postAcneScarringSeverity`: Blue/Yellow/Red severity
  - `postAcneScarringColor`: Red/Brown/Both for pigmentation marks

### 2. **Data Layer Updates** (`src/data/concernMatrix.ts`)
- Added `'postacnescars'` to `ConcernKey` type

### 3. **Decision Engine Rules** (`src/lib/decisionRules.ts`)
- Added 4 new decision rules:
  1. `postacne_scar_type_and_severity` - Initial type selection
  2. `postacne_scar_severity_depressed` - Severity for pitted/rolling scars
  3. `postacne_pih_color` - Color selection for post-inflammatory pigmentation
  4. `postacne_keloid_severity` - Severity for keloid/hypertrophic scars
- Added `safety` property to `OutcomeSpec` interface

### 4. **UI & Form Updates** (`src/components/UpdatedConsultForm.tsx`)
- Added "Post Acne Scarring" to main concerns selection (step 19)
- Added icon (purple Sparkles) for the concern
- Implemented 2-step follow-up flow:
  1. **Type Selection**: User selects scar type
  2. **Severity/Color Selection**: Depends on scar type
     - For pigmentation: Asks for color (Red/Brown/Both)
     - For others: Asks for severity (Mild/Moderate/Severe)
- Added full validation logic
- Integrated with form data model

## Supabase Setup Required

You now need to populate the Supabase `concern_matrix` with post-acne scarring products. Here's what to do:

### Step 1: Add Concern Subtypes

Insert into `concern_subtype` table:
```sql
INSERT INTO concern_subtype (concern, code, label, description) VALUES
('postacnescars', 'IcePick', 'Ice Pick Scars', 'Small, shallow, round or pitted scars'),
('postacnescars', 'Rolling', 'Rolling Scars', 'Broad, shallow depressions'),
('postacnescars', 'PostInflammatoryPigmentation', 'Post-inflammatory Pigmentation', 'Flat or slightly raised dark marks'),
('postacnescars', 'Keloid', 'Keloid / Hypertrophic', 'Raised, thick scars');
```

### Step 2: Add Matrix Entries

For each combination of:
- `concern`: 'postacnescars'
- `subtype_id`: One of the 4 subtypes above
- `skin_type`: One of 'Dry', 'Combo', 'Oily', 'Sensitive', 'Normal'
- `band`: One of 'blue' (Mild), 'yellow' (Moderate), 'red' (Severe)

You need to create matrix entries selecting appropriate products for:
- `cleanser_id`: Gentle, non-irritating
- `core_serum_id`: Can be brightening, resurfacing, or supportive depending on severity
- `secondary_serum_id`: Optional complementary serum
- `moisturizer_id`: Soothing, barrier-supportive
- `sunscreen_id`: Essential (UV protection helps with PIH fading)

### Example Product Selections for Scarring

**For Ice Pick & Rolling (Depressed Scars):**
- **Severity: Blue (Mild)**
  - Core: Gentle brightening serum (niacinamide-based)
  - Secondary: Optional hydrating serum
  - Focus: Support + gentle resurfacing

- **Severity: Yellow (Moderate)**
  - Core: Resurfacing serum (AHA or BHA)
  - Secondary: Brightening serum (Vitamin C or tranexamic acid)
  - Focus: Active treatment

- **Severity: Red (Severe)**
  - Core: Strong resurfacing + brightening combo
  - Note: May need to refer to professional treatments (laser, microneedling)
  - Focus: Supportive routine while considering professional help

**For Post-Inflammatory Pigmentation:**
- **Red Marks (Recent/Active):**
  - Core: Anti-inflammatory + soothing serum (azelaic, niacinamide)
  - Secondary: Supportive hydrating serum
  - Focus: Reduce inflammation

- **Brown Marks (Older/Pigmented):**
  - Core: Depigmenting serum (Vitamin C, tranexamic, kojic acid)
  - Secondary: Brightening serum
  - Focus: Target pigmentation

- **Both Red & Brown:**
  - Core: Multi-action (azelaic or niacinamide + brightening)
  - Secondary: Complementary treatment

**For Keloid / Hypertrophic:**
- **Severity: Blue (Mild)**
  - Core: Supportive serum
  - Focus: Prevent worsening

- **Severity: Yellow (Moderate)**
  - Core: Supportive + gentle smoothing serum
  - Note: Consider professional treatments

- **Severity: Red (Severe)**
  - Primarily refer to dermatologist
  - Routine: Supportive soothing products only

### Step 3: Insert Matrix Entries

Example SQL (you'll need to expand for all combinations):
```sql
INSERT INTO concern_matrix 
(concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id)
VALUES 
-- Ice Pick / Rolling - Blue (Mild)
('postacnescars', 'IcePick', 'Combo', 'blue', <cleanser_id>, <gentle_brightening_id>, <hydrating_id>, <moisturizer_id>, <spf_id>),
('postacnescars', 'Rolling', 'Combo', 'blue', <cleanser_id>, <gentle_brightening_id>, <hydrating_id>, <moisturizer_id>, <spf_id>),

-- Post-inflammatory Pigmentation - Brown (Yellow severity)
('postacnescars', 'PostInflammatoryPigmentation', 'Combo', 'yellow', <cleanser_id>, <depigmenting_id>, <brightening_id>, <moisturizer_id>, <spf_id>),

-- ... more entries for each combination
;
```

## Form Flow

Once Supabase is set up, the user flow is:

1. **Concern Selection**: User selects "Post Acne Scarring" ✓
2. **Type Selection**: User picks their scar type ✓
3. **Severity/Color Selection**: 
   - If pigmentation → asks for color ✓
   - If depressed/keloid → asks for severity ✓
4. **Recommendation Generation**: System looks up matrix entries and generates routine ✓

## Flags & Safety Alerts

The decision engine will set these flags for tracking:
- `scarringSubtype:IcePick` / `Rolling` / `PostInflammatoryPigmentation` / `Keloid`
- `scarnessLevel:Blue` / `Yellow` / `Red`
- `scarringNeeds:smoothing-polishing` / `active-treatment` / `professional-treatment` / `professional-treatment-urgent`
- `pihColor:Red` / `Brown` / `Both`
- `refer-professional-scars` (for Red severity)

## Testing Checklist

- [ ] User can select "Post Acne Scarring" from main concerns
- [ ] Type selection screen shows all 4 scar types
- [ ] Post-inflammatory pigmentation routes to color selection
- [ ] Other scars route to severity selection
- [ ] Form validation works for all paths
- [ ] Recommendations generate successfully for at least one matrix entry
- [ ] Severity Blue/Yellow/Red maps correctly to different routines
- [ ] UI displays purple icon and colors correctly

## Notes

- Post acne scarring doesn't interact with machine bands at all
- It's independent of skin type basics (moisture, sebum, etc.)
- The concern can coexist with "Acne" if user still has active breakouts + scars
- Recommendations should emphasize that severe scarring (Red) may require professional treatments like laser or microneedling
