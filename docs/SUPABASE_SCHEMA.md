# Aetheria Forms - Supabase Schema Documentation

**Last Updated:** October 18, 2025  
**Project:** Skincare consultation intake & recommendation engine  
**Database:** PostgreSQL (Supabase)

---

## Overview

This document describes the complete Supabase database schema for Aetheria Forms, including all tables, enums, relationships, and business logic. Use this guide to:
- Understand the data model
- Add new concerns or products
- Modify recommendation logic
- Debug data issues

---

## Enum Types

### concern_key
Represents all skincare concerns that can be assessed in the form.

```sql
CREATE TYPE concern_key AS ENUM (
  'acne',
  'pigmentation',
  'pores',
  'texture',
  'sebum',
  'acnescars'
);
```

**Values:**
- `acne` - Breakouts, pimples, comedones
- `pigmentation` - Red marks (PIE), brown marks (PIH), dark spots
- `pores` - Visible pore size and congestion
- `texture` - Bumpy skin, uneven surface, fine lines, wrinkles, aging
- `sebum` - Oil production (grease)
- `acnescars` - Post-acne scarring (ice pick, rolling, keloid, post-inflammatory pigmentation)

### band_color
Health/severity bands representing the degree of concern.

```sql
CREATE TYPE band_color AS ENUM (
  'green',   -- Optimal, no concern
  'blue',    -- Mild, manageable
  'yellow',  -- Moderate, needs attention
  'red'      -- Severe, may need professional help
);
```

**Band Priority:** green (0) → blue (1) → yellow (2) → red (3)

### skin_type_key
Skin type classification for personalized recommendations.

```sql
CREATE TYPE skin_type_key AS ENUM (
  'Dry',
  'Combo',
  'Oily',
  'Sensitive',
  'Normal'
);
```

---

## Tables

### product
Catalog of all skincare products available for recommendations.

```sql
CREATE TABLE product (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE,
  display_name VARCHAR NOT NULL,
  ingredient_keywords TEXT,
  is_referral BOOLEAN DEFAULT FALSE,
  pregnancy_unsafe BOOLEAN DEFAULT FALSE,
  isotretinoin_unsafe BOOLEAN DEFAULT FALSE,
  barrier_unsafe BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Key Columns:**
- `id` - UUID primary key
- `slug` - URL-friendly identifier (e.g., 'differin-gel-adapalene')
- `display_name` - User-facing product name (e.g., 'Differin Gel (Galderma)')
- `ingredient_keywords` - Comma-separated active ingredients (e.g., 'adapalene, retinoid')
- `is_referral` - If TRUE, only appears in referral routines (severe cystic acne)
- `pregnancy_unsafe` - If TRUE, blocked when pregnancy gate is YES
- `isotretinoin_unsafe` - If TRUE, blocked when isotretinoin gate is YES
- `barrier_unsafe` - If TRUE, blocked when barrier stress gate is HIGH

**Examples:**
```
id: 12345678-1234-1234-1234-123456789012
slug: differin-gel-adapalene
display_name: Differin Gel (Galderma)
ingredient_keywords: adapalene, retinoid, vitamin a
pregnancy_unsafe: true
isotretinoin_unsafe: false
barrier_unsafe: false
```

### product_alias
Alternative names for products (for user input matching).

```sql
CREATE TABLE product_alias (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES product(id) ON DELETE CASCADE,
  alias VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP
);
```

**Example:**
- Product: "Differin Gel (Galderma)"
- Aliases: "differin", "adapalene", "differin gel"

### product_tag
Many-to-many relationship between products and ingredient tags.

```sql
CREATE TABLE product_tag (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES product(id) ON DELETE CASCADE,
  tag VARCHAR NOT NULL,  -- e.g., 'retinoids', 'azelaic', 'vitamin_c_ascorbic'
  created_at TIMESTAMP
);
```

**Tag Values:**
- Active treatments: `retinoids`, `vitamin_c_ascorbic`, `vitamin_c_derivative`, `aha`, `bha`, `azelaic`, `benzoyl_peroxide`, `niacinamide`, `tranexamic`
- Passive/supportive: `peptides`, `ceramides`, `silicone`, `clay`, `sunscreen`

### concern_subtype
Lookup table for subtypes within each concern.

```sql
CREATE TABLE concern_subtype (
  id UUID PRIMARY KEY,
  concern concern_key NOT NULL,
  subtype_name VARCHAR NOT NULL,
  subtype_id VARCHAR UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  UNIQUE(concern, subtype_id)
);
```

**Examples for acnescars concern:**

| concern | subtype_id | subtype_name | description |
|---------|-----------|--------------|-------------|
| acnescars | IcePick | Ice Pick / Pitted Scars | Small, deep, narrow scars |
| acnescars | Rolling | Rolling Scars | Broad, shallow depressions |
| acnescars | Keloid | Keloid / Hypertrophic Scars | Raised, thick scars |
| acnescars | PostInflammatoryPigmentation | Post-Inflammatory Pigmentation | Red or brown marks |

**Examples for acne concern:**

| concern | subtype_id | subtype_name |
|---------|-----------|--------------|
| acne | Comedonal | Blackheads & Whiteheads |
| acne | Inflammatory | Red Pimples |
| acne | Nodulocystic | Deep Cystic Acne |
| acne | Hormonal | Hormonal Acne |

### concern_matrix
Core lookup table for product recommendations.

```sql
CREATE TABLE concern_matrix (
  id UUID PRIMARY KEY,
  concern concern_key NOT NULL,
  subtype_id VARCHAR NOT NULL,
  skin_type skin_type_key NOT NULL,
  band band_color NOT NULL,
  cleanser_id UUID REFERENCES product(id),
  core_serum_id UUID REFERENCES product(id) NOT NULL,
  secondary_serum_id UUID REFERENCES product(id),
  moisturizer_id UUID REFERENCES product(id) NOT NULL,
  sunscreen_id UUID REFERENCES product(id) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(concern, subtype_id, skin_type, band),
  FOREIGN KEY (concern, subtype_id) REFERENCES concern_subtype(concern, subtype_id)
);
```

**Key Columns:**
- `concern` + `subtype_id` + `skin_type` + `band` - Composite key for lookups
- `cleanser_id` - Nullable (uses default if not set)
- `core_serum_id` - Primary treatment (NOT NULL)
- `secondary_serum_id` - Optional complementary serum (nullable)
- `moisturizer_id` - Hydration barrier (NOT NULL)
- `sunscreen_id` - UV protection (NOT NULL)

**Example Lookup:**
```
concern: 'acnescars'
subtype_id: 'IcePick'
skin_type: 'Combo'
band: 'yellow'
→ Returns: {cleanser, coreSerum, secondarySerum, moisturizer, sunscreen}
```

### skin_type_defaults
Fallback products when exact matrix entry not found.

```sql
CREATE TABLE skin_type_defaults (
  id UUID PRIMARY KEY,
  skin_type skin_type_key NOT NULL,
  slot VARCHAR NOT NULL,  -- 'cleanser', 'coreSerum', 'moisturizer', 'sunscreen'
  product_id UUID REFERENCES product(id) NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(skin_type, slot)
);
```

**Example:**
```
skin_type: 'Dry'
slot: 'moisturizer'
product_id: <UUID of rich creamy moisturizer>
```

### consultations
Stores consultation session data.

```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  session_id VARCHAR UNIQUE,
  form_data JSONB,  -- Complete form submission
  recommendations JSONB,  -- Recommendation output
  staff_id VARCHAR,
  client_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**form_data includes:**
- Personal info: name, phone, dateOfBirth, gender
- Safety gates: pregnancy, recentIsotretinoin, severeCysticAcne, barrierStressHigh
- Main concerns: mainConcerns (array)
- Concern-specific data:
  - acneBreakouts, acneSeverity
  - pigmentationType, pigmentationSeverity
  - textureType, textureSeverity
  - postAcneScarringType, postAcneScarringSubtype, postAcneScarringSeverity, postAcneScarringColor
  - porenessLevel, sebumLevel, hydrationLevel
- Preferences: preferredRoutineSteps, serumComfortLevel, skinType, concernPriority

### feedback_sessions
Stores user ratings and feedback post-consultation.

```sql
CREATE TABLE feedback_sessions (
  id UUID PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id),
  rating INT,  -- 1-5 scale
  comments TEXT,
  created_at TIMESTAMP
);
```

---

## Data Flow & Business Logic

### Concern Processing

1. **User Input** → Form collects concern selections and severity/type
2. **Normalization** → Input normalized to concern_key (e.g., "Post Acne Scarring" → 'acnescars')
3. **Subtype Extraction** → Determine specific subtype (e.g., IcePick, Rolling, Keloid)
4. **Band Derivation** → Combine machine readings + user self-assessment → band (blue/yellow/red)
5. **Matrix Lookup** → Query concern_matrix for (concern, subtype, skin_type, band)
6. **Recommendation Generation** → Build routine variants with products from lookup

### Recommendation Workflow

```
Form Submission
  ↓
Safety Gate Checks (pregnancy, isotretinoin, cystic acne, barrier stress)
  ↓
Collect Concern Selections (mainConcerns → concern_key array)
  ↓
Prioritize by user order or default priority
  ↓
For each concern:
  - Infer subtype (from form or decision engine flags)
  - Get effective band (from decision engine)
  - Lookup matrix entry: (concern, subtype, skin_type, band)
  - If not found, try fallback skin_type_defaults
  - Extract products for all 5 slots
  ↓
Generate Routine Variants:
  - Barrier-First: cleanser + moisturizer + SPF (if barrier gate)
  - Conservative: 1 serum (lowest irritation)
  - Balanced: 2 compatible serums (recommended)
  - Comprehensive: 3+ serums with weekly rotation
  - Referral: soothing + SPF (if cystic acne gate)
  ↓
Check Ingredient Compatibility:
  - Extract tags from products
  - Check pairCompatibility() for serum combinations
  - Mark unavailable variants if conflicts exist
  ↓
Generate AM/PM Schedules:
  - AM: Cleanser → Serums → Moisturizer → SPF
  - PM: Cleanser → Serums → Moisturizer
  - Rotation: Spread multiple serums across week
  - Rest nights: 2 nights per week (cleanser + moisturizer only)
  ↓
Calculate Nightly Costs:
  - Sum irritation units for each serum
  - Cap at 100 units per night
  - Display budget utilization
  ↓
Save Recommendations to consultations table
```

---

## Common Operations

### Add a New Product

1. **Create product record:**
```sql
INSERT INTO product (id, slug, display_name, ingredient_keywords, pregnancy_unsafe)
VALUES (
  'new-uuid',
  'new-product-slug',
  'New Product Name (Brand)',
  'ingredient1, ingredient2, ingredient3',
  false
);
```

2. **Add tags (if applicable):**
```sql
INSERT INTO product_tag (id, product_id, tag)
VALUES ('tag-uuid', 'new-uuid', 'retinoids');
```

3. **Add to matrix entries:**
```sql
UPDATE concern_matrix 
SET core_serum_id = 'new-uuid' 
WHERE concern = 'acne' AND subtype_id = 'Comedonal' AND skin_type = 'Oily' AND band = 'blue';
```

### Add New Concern Subtype

1. **Add to concern_subtype:**
```sql
INSERT INTO concern_subtype (id, concern, subtype_name, subtype_id, description)
VALUES (
  'subtype-uuid',
  'acne',
  'New Acne Type',
  'NewType',
  'Description of the new acne type'
);
```

2. **Create matrix entries for all combinations:**
```sql
-- For each skin_type (Dry, Combo, Oily, Sensitive, Normal)
-- And each band (green, blue, yellow, red)
-- Create rows with appropriate products
INSERT INTO concern_matrix (...)
VALUES (...);
```

### Modify Recommendation for Specific Case

Example: Change product for "acne, Comedonal, Oily, yellow" band:

```sql
UPDATE concern_matrix
SET core_serum_id = 'product-uuid'
WHERE concern = 'acne' 
  AND subtype_id = 'Comedonal' 
  AND skin_type = 'Oily' 
  AND band = 'yellow';
```

---

## Constraints & Validation

### Data Integrity
- Enum types enforce valid values at database level
- Foreign keys prevent orphaned records
- Unique constraints prevent duplicates
- NOT NULL constraints ensure required data

### Business Rules
- Core products (core_serum_id, moisturizer_id, sunscreen_id) are always required
- Secondary serum can be NULL (optional)
- Cleanser can be NULL (falls back to defaults)
- Band must align with decision engine logic (green < blue < yellow < red in priority)
- Subtype must exist in concern_subtype before referencing in concern_matrix

### Safety Gates
- `pregnancy = 'Yes'` → Block all products with `pregnancy_unsafe = true`
- `recentIsotretinoin = 'Yes'` → Block all with `isotretinoin_unsafe = true`
- `severeCysticAcne = 'Yes'` → Only show Referral variant
- `barrierStressHigh = 'Yes'` → Only show Barrier-First variant

---

## Migration History

| Date | Change | Impact |
|------|--------|--------|
| Oct 18, 2025 | Added acnescars concern with IcePick, Rolling, Keloid, PostInflammatoryPigmentation subtypes | Supports Post Acne Scarring form flow |
| Oct 18, 2025 | Created 84 matrix entries across 6 subtypes × 5 skin types × varying bands | Full product recommendations for all scar types |
| Oct 18, 2025 | Linked Silicon Sheets product for Keloid scarring | Keloid variant now has valid core serum |

---

## Debugging Tips

**Issue:** Matrix lookup returning undefined for a concern/subtype/skin-type/band combo
- Check: Does the row exist in concern_matrix?
- Check: Are the concern and subtype_id values exactly correct (case-sensitive)?
- Check: Do products exist and have valid UUIDs?

**Issue:** Product not appearing in recommendations
- Check: Is it tagged with correct ingredient tags?
- Check: Does it have `is_referral = true` (if so, only shows in referral routines)?
- Check: Are safety gates blocking it (pregnancy_unsafe, etc.)?

**Issue:** Recommendation shows "unavailable" variant
- Check: Are all required products present in the matrix entry?
- Check: Do product tags conflict (incompatible ingredients)?
- Check: Are safety gates preventing the variant?

---

## How AI Can Use This

Future developers/AI can:
1. Read this doc to understand data model immediately
2. Check constraint tables to avoid duplicates
3. Add new concerns by following "Add New Concern Subtype" pattern
4. Debug recommendations by tracing through the workflow
5. Modify products safely knowing all business rules
6. Extend with new gates/rules by documenting here first

---

**Questions?** See code comments in `decisionEngine.ts` and `recommendationEngineMatrix.ts` for detailed logic.
