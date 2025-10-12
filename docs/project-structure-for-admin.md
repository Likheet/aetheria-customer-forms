# Aetheria Forms – Project Structure & Data Flow Summary

_Admin dashboard planning reference (generated October 12, 2025)_

---

## 1. Product Matrix Structure

**Primary file:** `c:\Users\likhe\Desktop\Aetheria\Aetheria\aetheria-forms\src\data\concernMatrix.ts`

### 1.1 Core Types
```ts
// concernMatrix.ts (lines 15-43)
export type ConcernKey = 'acne' | 'pigmentation' | 'pores' | 'texture' | 'sebum' | 'acnescars';
export type SkinTypeKey = 'Dry' | 'Combo' | 'Oily' | 'Sensitive' | 'Normal';
export type BandColor = 'green' | 'blue' | 'yellow' | 'red';

export interface MatrixProduct extends ProductInfo {
  slot: ProductSlot;
  rawName: string;
  isDynamic?: boolean;
}

export interface MatrixEntry {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
  band: BandColor;
  cleanser: MatrixProduct;
  coreSerum: MatrixProduct;
  secondarySerum?: MatrixProduct | null;
  moisturizer: MatrixProduct;
  sunscreen: MatrixProduct;
  remarks?: string;
}
```

### 1.2 Sample Matrix Rows
The CSV-style `RAW_MATRIX` constant captures every routine rule. Example entries:
```csv
Sebum,General,Oily,Yellow,Salicylic acid or foaming cleanser,Niacinamide,Salicylic acid 2%,Oil-free gel,SKINTYPE_DEFAULT,
Acne,Inflammatory,Combo,Yellow,Gentle foaming cleanser,Benzoyl Peroxide 2.5% AM,10% Azelaic Acid,Gel-cream,SKINTYPE_DEFAULT,
AcneScars,PIH,Oily,Yellow,SKINTYPE_DEFAULT,Tranexamic Acid + Alpha Arbutin,Azelaic Acid 10%,SKINTYPE_DEFAULT,Tinted mineral sunscreen,
```
Each row is keyed by `(Concern, Subtype, SkinType, Band)` and points to product slots populated via `createMatrixProduct` (see §2).

### 1.3 Matrix Index & Lookup
```ts
// concernMatrix.ts (lines 700-724)
matrixIndex[concern][subtype][skinType][band] = entry;

export function lookupMatrixEntry(params: {
  concern: ConcernKey;
  subtype: string;
  skinType: SkinTypeKey;
  band: BandColor;
}): MatrixEntry | undefined {
  return matrixIndex[params.concern]?.[params.subtype]?.[params.skinType]?.[params.band];
}
```
`lookupMatrixEntry` is the gateway the recommendation engine uses to find the matched routine template.

---

## 2. Product Registry & Metadata

### 2.1 Product Registration (concernMatrix)
Product metadata lives alongside the matrix in the same file, built via helper factories:
```ts
// concernMatrix.ts (lines 70-120)
registerProduct(['Gentle cleanser', 'Gentle gel', 'Gentle foaming'], {
  name: 'Gentle foaming cleanser',
  ingredientTags: [],
  ingredientKeywords: ['gentle cleanser', 'amino surfactants'],
});

registerProduct(['Foaming', 'Foaming cleanser'], {
  name: 'Foaming cleanser',
  ingredientTags: [],
  ingredientKeywords: ['foaming cleanser'],
});
```
Each alias resolves to a normalized `ProductInfo` object consumed inside the matrix. Ingredient tags connect to the compatibility engine described below.

### 2.2 Ingredient Taxonomy & Interactions
```ts
// src/services/ingredientInteractions.ts (lines 1-52)
export type IngredientTag =
  | 'retinoids' | 'vitamin_c_ascorbic' | 'vitamin_c_derivative'
  | 'niacinamide' | 'aha' | 'bha' | 'azelaic'
  | 'benzoyl_peroxide' | 'peptides' | 'tranexamic'
  | 'ceramides' | 'sunscreen' | 'clay' | 'silicone';

export function pairCompatibility(a: IngredientTag, b: IngredientTag): Compatibility {
  const disallow = [ ['retinoids','vitamin_c_ascorbic'], ['retinoids','aha'], ... ];
  const caution  = [ ['retinoids','azelaic'], ['vitamin_c_ascorbic','peptides'], ... ];
  return 'allow';
}
```
These tags decorate every `MatrixProduct`, enabling conflict checks and safety gates later in the pipeline.

### 2.3 Price Tiers & Brand Catalogue
Detailed SKU choices with price tiers are defined in:
`c:\Users\likhe\Desktop\Aetheria\Aetheria\aetheria-forms\src\data\productDatabase.ts`
```ts
export interface ProductOption {
  name: string;
  brand: string;
  tier: 'affordable' | 'mid-range' | 'premium';
}

export const PRODUCT_DATABASE: ProductDatabase = {
  cleanser: {
    'foaming-gel': [
      { name: 'Cetaphil Oily Skin Cleanser', brand: 'Galderma', tier: 'affordable' },
      { name: 'Bioderma Foaming Cleanser', brand: 'NAOS', tier: 'mid-range' },
      { name: "Paula's Choice Foaming Cleanser", brand: 'Unilever', tier: 'premium' },
    ],
    ...
  },
  serum: { 'niacinamide': [...], 'vitamin-c': [...], ... },
  moisturizer: { 'gel': [...], 'rich-cream': [...], ... },
  sunscreen: { 'general': [...] },
};
```
UI components (`RecommendationDisplay.tsx`) select products across these tiers using the `tier` field, supporting budget vs. luxury toggles.

---

## 3. Recommendation Flow

**Entry point:** `c:\Users\likhe\Desktop\Aetheria\Aetheria\aetheria-forms\src\services\recommendationEngineMatrix.ts`

### 3.1 Matrix Access
```ts
// recommendationEngineMatrix.ts (lines 1572-1610)
function fetchMatrixEntry(concern: ConcernSelection, skinType: SkinTypeKey, notes: string[]): MatrixEntry | null {
  const bandsToTry = bandFallbackOrder(concern.band);
  for (const band of bandsToTry) {
    const entry = lookupMatrixEntry({ concern: concern.concern, subtype: concern.subtype, skinType, band });
    if (entry) { ... return entry; }
  }
  // fallbacks to General subtype, then Normal skin type
  return null;
}
```
The engine progressively loosens band/subtype/skin constraints before giving up.

### 3.2 Dynamic Product Resolution
```ts
// recommendationEngineMatrix.ts (lines 432-470)
function resolveRoutineProduct(product: MatrixProduct, slot: ProductSlot, profile: SkinProfile, notes: string[]): MatrixProduct {
  const relevantSlot = slot === 'cleanser' || slot === 'moisturizer' || slot === 'sunscreen';
  const raw = (product.rawName || '').trim().toLowerCase();
  if (!relevantSlot || (raw !== 'as per skin type' && raw !== 'skintype_default')) {
    return cloneProduct(product);
  }
  const resolvedName = resolveAsPerSkinTypeName(slot as 'cleanser' | 'moisturizer' | 'sunscreen', profile, notes);
  const resolved = instantiateProduct(resolvedName, slot);
  return { ...resolved, rawName: resolvedName, isDynamic: true };
}
```
`resolveAsPerSkinTypeName` (lines 402-430) maps the current skin profile (derived from user inputs and decision engine bands) to base product bundles such as `Oily-Hydrated-Yellow`.

### 3.3 Recommendation Output Contract
```ts
// recommendationEngineMatrix.ts (lines 32-118)
export interface ProductRecommendation {
  cleanser: string;
  coreSerum: string;
  secondarySerum: string;
  moisturizer: string;
  sunscreen: string;
  tertiarySerum?: string;
  _keys?: { cleanserType?: string; core?: string; secondary?: string; tertiary?: string; moisturizerType?: string; };
  _flags?: { vc_form?: 'laa' | 'derivative'; core_acid_strength?: 'low' | 'medium' | 'high'; ... };
  _ingredients?: { cleanser: IngredientTag[]; coreSerum: IngredientTag[]; ... };
}

export interface RoutineVariant extends EnhancedRecommendation {
  type: 'conservative' | 'balanced' | 'comprehensive' | 'referral' | 'barrier-first';
  label: string;
  description: string;
  irritationRisk: 'low' | 'moderate' | 'higher';
  recommended?: boolean;
  available: boolean;
  conflictReason?: string;
}

export interface RoutineOptionsResponse {
  routines: RoutineVariant[];
  selectedIndex: number;
}
```
`generateRecommendations(context)` returns a `RoutineOptionsResponse`, combining base routines, safety gate adjustments (pregnancy, isotretinoin, allergies), and serum-comfort variants.

### 3.4 Flow Diagram
```
[Form submission + decision engine bands]
        ↓
collectConcernSelections() → selectPrimaryConcern()
        ↓
fetchMatrixEntry() → lookupMatrixEntry()
        ↓
buildRoutineFromEntry() → resolveRoutineProduct()
        ↓
apply safety gates (pregnancy/isotretinoin/allergies)
        ↓
tryAppendSecondarySerum() + variant definitions
        ↓
RoutineOptionsResponse (array of RoutineVariant + selectedIndex)
```

---

## 4. Database Schema (Supabase)

**Migration folder:** `c:\Users\likhe\Desktop\Aetheria\Aetheria\aetheria-forms\supabase\migrations`

### 4.1 Core Tables
- `customer`
- `assessment_session`
- `intake_form`
- `machine_scan`
- `machine_metric`
- `consultant_inputs`

Sample definition (from `create_consultation_tables.sql`):
```sql
create table if not exists assessment_session (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer(id),
  tz text not null default 'Asia/Kolkata',
  location text,
  staff_id uuid,
  created_at timestamptz not null default now()
);
```
`intake_form` stores the raw consultation payload together with trigger-maintained helper columns:
```sql
ALTER TABLE intake_form
ADD COLUMN IF NOT EXISTS skin_type text;
ADD COLUMN IF NOT EXISTS main_concerns text[];
CREATE TRIGGER intake_form_update_columns
  BEFORE INSERT OR UPDATE ON intake_form
  FOR EACH ROW EXECUTE FUNCTION update_intake_columns();
```

### 4.2 Consultant Input Extensions
```sql
CREATE TABLE IF NOT EXISTS consultant_inputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES assessment_session(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  acne_observation text,
  pigmentation_observation text,
  texture_observation text,
  sensitivity_observation text,
  additional_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consultant_inputs_session_unique UNIQUE (session_id)
);
```

### 4.3 Views & RLS
- Views: `v_latest_intake`, `v_customer_history`, `consultations_without_input`
- Row Level Security enabled on all customer-facing tables; policies grant full access to the Supabase service role.

### 4.4 Recommendation Persistence
Currently, routines generated by `recommendationEngineMatrix` are **not persisted** in Supabase. Recommendations are computed on demand from form inputs plus matrix metadata. An admin dashboard would need a new table if historical recommendation snapshots are required.

No dedicated product or matrix tables exist today; the matrix lives entirely in TypeScript.

---

## 5. File & Directory Layout

```
aetheria-forms/
├── app/                         # Next.js (app router) assets & globals
├── docs/                        # Project documentation (this file lives here)
│   ├── flows.md
│   ├── system-implementation-report.md
│   └── project-structure-for-admin.md
├── src/
│   ├── data/
│   │   ├── concernMatrix.ts     # Product matrix & registry (see §§1-2)
│   │   └── productDatabase.ts   # Brand catalogue with pricing tiers
│   ├── services/
│   │   ├── recommendationEngineMatrix.ts  # Routine generation workflow
│   │   ├── ingredientInteractions.ts      # Ingredient compatibility logic
│   │   └── ...
│   ├── components/              # React UI (e.g., RecommendationDisplay.tsx)
│   └── lib/                     # Decision engine, Supabase client helpers
├── scripts/
│   ├── buildProductDatabase.ts
│   ├── testSkinTypeBaseProducts.ts
│   └── ...
├── supabase/
│   └── migrations/              # SQL files defining the production schema
├── package.json
└── README.md
```

---

### Next Steps for Admin Dashboard Design
1. **Matrix Editor:** Build UI forms that map to the `MatrixEntry` contract (Concern → Subtype → Skin Type → Band) and surface dynamic slot flags (`SKINTYPE_DEFAULT`, `As per skin type`).
2. **Product Catalogue Admin:** Expose product aliases and ingredient tags from `registerProduct` plus SKU price tiers from `PRODUCT_DATABASE`.
3. **Recommendation Audit:** Consider persisting snapshots (new table) if admins need historical diffing between generated routines and manual overrides.
4. **Consultation Insights:** Leverage `v_latest_intake` and `consultations_without_input` views to power dashboards for pending consultant actions.

---
*Prepared for the Aetheria team to accelerate admin tooling around product recommendations.*
