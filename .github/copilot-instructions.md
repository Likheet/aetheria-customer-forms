# Aetheria Forms: AI Coding Instructions

**Project**: Skincare consultation intake & recommendation engine with an admin tuning dashboard.  
**Tech Stack**: React 18 + TypeScript + Vite (SPA), Supabase (Postgres), Tailwind CSS + Mantine + shadcn/ui, Lucide icons.

---

## Big Picture Architecture

### Core Responsibility Layers

1. **Decision Engine** (`src/lib/decisionEngine.ts`, ~1200 lines)
   - Rules-based system that maps form answers → skin health bands (green/blue/yellow/red)
   - Categories: Moisture, Grease (oil), Acne, Pores, Texture, Pigmentation, Sensitivity
   - Reconciles **machine readings** (skin analyzer device) with **user self-assessment** to derive final bands
   - Key exports: `deriveSelfBands()`, `decideBandUpdates()`, `decideAllBandUpdates()`, `computeSensitivityFromForm()`, `deriveAcneBandFromTypeSeverity()`
   - Each rule has: trigger condition, optional follow-up questions, and outcome resolver
   
   **Execution Flow**:
   - `deriveSelfBands()` extracts bands from form dropdowns (oil level → sebum band, hydration → moisture band)
   - `decideBandUpdates()` applies individual rules to reconcile machine vs. self readings
   - `decideAllBandUpdates()` orchestrates all rules in sequence, using `elevateBand()` to preserve worst-case
   - `computeSensitivityFromForm()` aggregates 7 sensitivity triggers into a single sensitivity band
   - Output: `effectiveBands` object {moisture, sebum, acne, pores, texture, pigmentation, sensitivity} plus `flags` for downstream decision-making
   
   **Rule Structure** (`Rule` interface):
   ```typescript
   {
     id: string,                    // unique identifier
     scope: Category,               // which band does this rule affect (e.g., 'Acne')
     when: (m, s) => boolean,      // predicate: run if machine/self bands meet condition
     questions?: Question[],        // optional follow-ups to clarify
     decide: (answers, ctx) => Outcome  // compute new band + flags + safety alerts
   }
   ```
   - `when` typically checks for machine/self mismatch (e.g., machine Red but user claims Green)
   - `decide` applies severity thresholds or escalation logic
   - `Outcome` returns: updated band, human-readable verdict, internal flags, and safety alerts

2. **Recommendation Engine** (`src/services/recommendationEngineMatrix.ts`, ~1730 lines)
   - Consumes effective bands + decision flags → product recommendations
   - Queries the **Concern Matrix** (Supabase) for {concern, subtype, skin-type, band} → product slots
   - Generates multi-variant routines (conservative/balanced/comprehensive/barrier-first)
   - Handles ingredient compatibility checks, pregnancy/isotretinoin gates, budget constraints
   - Returns: cleaned products, AM/PM schedules, nightly cost estimates, irritation risk labels
   
   **Main Entry Point**: `generateRecommendations(context: RecommendationContext) → RoutineVariant[]`
   
   **Context Structure**:
   ```typescript
   {
     skinType: string | string[],           // from form selection
     decisionEngine?: {
       effectiveBands: Record<string, Band>,  // output from decision engine
       flags: DecisionEngineFlags             // acneSubtype, hormonal, textureSubtype, etc.
     },
     formData: UpdatedConsultData,           // full form submission
   }
   ```
   
   **Recommendation Generation Steps**:
   1. **Gate checking** — Call `hasSevereCysticGate()`, `hasBarrierStressHighGate()`, etc. to set hard constraints
   2. **Concern prioritization** — Sort `mainConcerns` by `concernPriority` or apply default ordering
   3. **Primary concern lookup** — For top concern, extract subtype from flags (e.g., `acneSubtype: 'Comedonal'`) and band from `effectiveBands`
   4. **Matrix lookup** — Call `lookupMatrixEntry(concern, subtype, skinType, band)` to fetch products for {cleanser, coreSerum, secondarySerum, moisturizer, sunscreen}
   5. **Fallback resolution** — If exact match fails, try broader subtype or skin-type defaults
   6. **Ingredient validation** — Extract tags from each product; check `pairCompatibility()` between serums
   7. **Variant generation** — Create 1–5 routine variants:
      - **Barrier-First** (if barrier gate): cleanser + moisturizer + SPF only
      - **Conservative**: adds 1 serum with lowest irritation
      - **Balanced**: adds 2 compatible serums (core + secondary)
      - **Comprehensive**: adds 3 serums with weekly rotation schedule
      - **Referral** (if cystic acne gate): soothing + SPF only
   8. **Schedule generation** — Call `buildWeeklyPlan()` to create AM/PM step sequences with nightly costs
   9. **Cost aggregation** — Sum nightly actives, estimate weekly spend, flag budget constraints
   10. **Variant filtering** — Mark unavailable variants with `conflictReason` if they violate gates
   
   **Key Output Types**:
   - `ProductRecommendation` — Mapped products + ingredient tags + cost flags
   - `EnhancedRecommendation` — adds schedule, notes, AM/PM arrays, cost breakdown
   - `RoutineVariant` — extends Enhanced, adds type/label/irritationRisk/availability

3. **Concern Matrix** (`src/data/concernMatrix.ts`)
   - Runtime-loaded index from Supabase (products, matrix entries, skin-type defaults)
   - Lazy-loading with async cache; survives multiple calls
   - Maps (concern, subtype, skin-type, band) → product selections across 5 slots (cleanser, core serum, secondary, moisturizer, sunscreen)

4. **Admin Dashboard** (`src/admin/`)
   - Three editor tabs: Concern Matrix tuning, Product Catalog, Skin-Type Defaults
   - Read/write directly to Supabase tables; live reload on changes
   - No UI rebuild needed—matrix re-loads on demand

### Data Flow

```
Intake Form (UpdatedConsultForm)
  ↓
Decision Engine (rules → effective bands)
  ↓
Form Data + Bands → Recommendation Context
  ↓
Recommendation Engine (matrix lookup + variant generation)
  ↓
Display Recommendations (RecommendationDisplay) + Save to Supabase
```

### Multi-Step Form Flow

The app runs **four independent flows** from a staff portal:
- **Feedback Collection**: Client ratings/feedback post-consultation
- **Consultant Input**: Professional evaluator assessments (skin + hair + unsuitable products)
- **Updated Consult** (primary): New intake linked to decision engine
- **Admin Console** (internal): Edit matrix, products, defaults

Each flow uses Supabase for session/submission persistence.

---

## Decision Engine Patterns

### Band Derivation

Bands represent health/severity: **green** (optimal) → **blue** (mild) → **yellow** (moderate) → **red** (severe).

**Self-derived bands**: Extract from form answers using mapping tables in `deriveSelfBands()`:
- Oil Levels dropdown → Sebum band: Green=comfortable, Blue=slight T-zone, Yellow=multiple areas, Red=heavy shine
- Hydration dropdown → Moisture band: Green=comfortable, Blue=slight tightness, Yellow=often tight/flaky, Red=always tight/itchy
- Acne presence + severity per type → Acne band: Uses `deriveAcneBandFromTypeSeverity()` with thresholds (blackheads ≤10→Blue, 11–30→Yellow, 30+→Red)
- Pigmentation severity (red/brown) → band per type
- Pores/Texture/Aging concern claims → respective bands

**Machine Readings** (from skin analyzer):
- Raw bands: moisture, sebum, acne, texture, pores, pigmentation
- Optional acne breakdown: detailed breakout counts and categories
- Stored in `MachineScanBands` interface

**Band Elevation Logic** (`elevateBand()`):
```typescript
// BAND_PRIORITY: green=0, blue=1, yellow=2, red=3
// Always pick the higher priority (worse) band
const final = elevateBand(current, candidate);
```

**Machine & Self Reconciliation** (`decideBandUpdates()`):
- Compares machine band vs. self-derived band
- If mismatch detected: applies reconciliation rule (e.g., machine Red + user Green → ask follow-ups → decide on Yellow)
- Logic: "trust machine as ground truth, but verify with user's subjective claim"
- Multiple rules may fire on the same band—use `elevateBand()` in sequence to preserve worst-case
- Result is written into `decisionMap` accumulator

**Full Orchestration** (`decideAllBandUpdates()`):
- Iterates through all rules in sequence
- For each rule: checks `when()` predicate, collects answers if questions present, calls `decide()`
- Accumulates all `Outcome` objects into final `effectiveBands` and `flags`
- Returns `{ effectiveBands, decisions, flags }` for downstream use

### Acne Category Logic

Acne is split into categories:
- **Comedonal**: Blackheads / Whiteheads
- **Inflammatory**: Red pimples
- **Cystic**: Large painful bumps (→ dermatologist referral)
- **Hormonal**: Jawline/cyclical patterns

Each category has **severity thresholds** (e.g., "≤10 blackheads" = Blue, "11–30" = Yellow, "30+" = Red). 
See `deriveAcneBandFromTypeSeverity()` in `decisionEngine.ts` for the full mapping.

### Safety Gates

Hard stops before recommendation (stored in `formData`):
- `pregnancy` = "Yes" → block retinoids, high-dose actives; flag `pregnancyBreastfeeding` for filtering
- `recentIsotretinoin` = "Yes" → block initiation, in-clinic procedures
- `severeCysticAcne` = "Yes" → refer dermatologist, recommend only soothing/SPF
- `barrierStressHigh` = "Yes" → force phase-0 barrier recovery (no actives)
- `allergyConflict` = "Yes" + allergies listed → block conflicting SKUs

Check these gates in `recommendationEngineMatrix.ts` functions like `hasSevereCysticGate()`.

---

## Recommendation Engine Patterns

### Matrix Lookups

The concern matrix is keyed as:
```
concern (acne|pigmentation|pores|texture|sebum|acnescars)
  → subtype (e.g., "Comedonal", "Hormonal", "Brown patches")
    → skin_type (Dry|Combo|Oily|Sensitive|Normal)
      → band (green|blue|yellow|red)
        → { cleanser, coreSerum, secondarySerum, moisturizer, sunscreen }
```

**Key function**: `lookupMatrixEntry(concern, subtype, skinType, band)` → `MatrixEntry | undefined`

**Lookup Strategy**:
1. Try exact match: (concern, subtype, skinType, band)
2. If not found, try fallback subtype (e.g., broader category)
3. If still not found, try skin-type defaults via `skin_type_defaults` table
4. If all fail, return undefined (variant marked as unavailable)

**Lazy Loading**:
- `loadConcernMatrixData()` is async and called on first recommendation request
- Uses a state machine: idle → loading → loaded or error
- Caches all products, aliases, tags, matrix entries in-memory
- Call `isConcernMatrixLoaded()` before rendering recommendations or `getConcernMatrixLoadError()` for error handling

### Product Slots & Ingredient Tags

**5-Slot Routine Structure**:
- **Cleanser**: Morning/evening face wash
- **Core Serum**: Primary active (retinoid, Vitamin C, BHA, etc.)
- **Secondary Serum**: Optional complementary active (azelaic, niacinamide, etc.)
- **Moisturizer**: Hydration barrier (may contain peptides/ceramides)
- **Sunscreen**: UV protection (AM only, non-negotiable)

**Ingredient Tags** (from `ingredientInteractions.ts`, used for compatibility):
- **Active Treatments**: `retinoids`, `vitamin_c_ascorbic`, `vitamin_c_derivative`, `aha`, `bha`, `azelaic`, `benzoyl_peroxide`, `niacinamide`, `tranexamic`
- **Passive/Supportive**: `peptides`, `ceramides`, `silicone`, `clay`, `sunscreen`

**Compatibility Matrix** (`pairCompatibility(a, b)` → 'allow' | 'disallow' | 'caution'`):

*Disallow pairs (cannot layer same day)*:
- retinoid + Vitamin C ascorbic (pH + oxidation issues)
- retinoid + AHA/BHA (irritation stacking)
- retinoid + benzoyl peroxide (destabilization)
- Vitamin C ascorbic + AHA/BHA (pH conflict)
- AHA + BHA (double exfoliation)

*Caution pairs (split AM/PM or space out)*:
- retinoid + azelaic (can work together but risk irritation; better as AM/PM split)
- Vitamin C + peptides (low pH destabilizes peptides)
- AHA/BHA + peptides (exfoliation damages peptides)

*Allowed*: All others, including vitamin C derivatives with most ingredients

**Extracting & Checking Tags**:
```typescript
const tags = product._ingredients?.[slot] || [];  // from MatrixProduct
const conflict = pairCompatibility(tag1, tag2);
if (conflict === 'disallow') { /* skip this variant */ }
if (conflict === 'caution') { /* add warning note */ }
```

### Routine Variants & Irritation Budgeting

**Variant Types** (generated in `generateRecommendations()`):

| Variant | Serums | Irritation Risk | Use Case |
|---------|--------|-----------------|----------|
| Barrier-First | 0 (only wash+moisturize+SPF) | Low | Compromised barrier, new customers |
| Conservative | 1 (core, lowest irritation) | Low | Sensitive skin, first-time actives |
| Balanced | 2 (core + secondary, compatible) | Moderate | Typical recommendation, most customers |
| Comprehensive | 3 (core + secondary + tertiary, rotated) | Higher | Advanced users, multiple concerns |
| Referral | 0 (soothing only, no actives) | None | Severe cystic acne, dermatologist path |

**AM/PM Scheduling** (via `buildWeeklyPlan()` in `scheduler.ts`):
- **AM**: Cleanser → Serums (if compatible) → Moisturizer → SPF
- **PM**: Cleanser → Serums → Moisturizer
- **Rotation**: If 3+ serums, spread across week (e.g., Mon/Wed/Fri vs Tue/Thu/Sat)
- **Rest nights**: Build in "off nights" for sensitive/high-irritation routines
- **Cost tracking**: Nightly totals aggregated for budget feedback

**Conflict Marking**:
- If `barrierStressHigh` gate: mark Balanced/Comprehensive as unavailable
- If `pregnancyBreastfeeding` gate: mark any variant with pregnancy-unsafe products as unavailable
- Set `conflictReason` string for UI display ("Barrier stress detected—recommend Barrier-First variant")

### Variant Availability & Gate Logic

**Hard Gates** (checked in `hasSevereCysticGate()`, `hasBarrierStressHighGate()`, etc.):
- `severeCysticAcne` → only Referral available (soothing + SPF)
- `barrierStressHigh` → only Barrier-First available
- `pregnancy` + active is pregnancy-unsafe → skip that variant
- `recentIsotretinoin` + isotretinoin-unsafe product → skip variant
- `allergyConflict` + listed allergen in product ingredients → skip product

**Variant Selection Logic**:
- Generate all 5 variants in parallel
- Mark those that violate gates as `available: false`
- At least one variant should remain available (usually Barrier-First or Referral)
- Return array sorted by `recommended` flag and irritation risk

---

## Key Files by Function

| Purpose | File | Key Exports |
|---------|------|-------------|
| Form data types | `src/types.ts`, `lib/types.ts` | `UpdatedConsultData`, `AcneCategory` |
| Band logic & rules | `src/lib/decisionEngine.ts` | `deriveSelfBands()`, `decideBandUpdates()`, `computeSensitivityFromForm()` |
| Ingredient pairs | `src/services/ingredientInteractions.ts` | `pairCompatibility()`, `serumKeyToTag()` |
| Concern matrix index | `src/data/concernMatrix.ts` | `loadConcernMatrixData()`, `lookupMatrixEntry()`, `isConcernMatrixLoaded()` |
| Recommendation logic | `src/services/recommendationEngineMatrix.ts` | `generateRecommendations()`, `RoutineVariant[]`, `EnhancedRecommendation` |
| Supabase queries | `src/services/newConsultationService.ts` | `getFillingQueue()`, `saveConsultationData()` |
| Admin UI | `src/admin/MatrixEditor.tsx`, `ProductCatalogManager.tsx` | Tab-based editors; direct Supabase writes |
| Intake form | `src/components/UpdatedConsultForm.tsx` | Multi-step form + decision engine orchestration (3800+ lines) |
| Form utilities | `src/lib/consultAutoFill.ts` | Auto-populate from machine scan results |

---

## Developer Workflows

### Running Tests

```bash
pnpm run test:acne-complete
```
Executes `scripts/testAcneComplete.ts`—a TypeScript harness covering 8+ acne scenarios (machine mismatch, pregnancy, isotretinoin, hormonal patterns, etc.). Run after changes to decision rules or recommendation logic to confirm alignment with the spec.

### Building & Bundling

```bash
pnpm build
```
Runs `buildProductIndex.ts` (pre-bundles product data) then `vite build`. The product index is a JSON file parsed at startup; this script ensures it's up-to-date before bundling.

Alternatively: `pnpm run build:products` to rebuild the index without a full Vite build.

### Linting & Unused Code Detection

- `pnpm lint` — ESLint (supports React plugins + TypeScript)
- `pnpm knip` — Dead code detection (checks `src/`, `app/`, `components/`)
- `pnpm tsprune` — Find unused TypeScript exports

### Vite Dev Server

```bash
pnpm dev
```
Starts HMR dev server on default port. Vite config pre-bundles `lucide-react` to prevent ad-blocker issues.

---

## Project-Specific Conventions

### Form Answer Normalization

When comparing form answers to decision rules, always normalize:
```typescript
const normalized = answer.toLowerCase().trim();
// Match common variants: "Yes", "yes", "YES", "TRUE" → treat as truthy
// "Red", "SEVERE", "Dark" → extract band color via regex or containsBand()
```

### Supabase Client Usage

- **Client-side** (`lib/supabase/client.ts`): Browser context, needs session
- **Server actions** (`lib/supabase/server.ts`): Next.js server context (not currently in use; this is a Vite SPA)

For this project: import from `src/lib/supabase` (browser client) in components and services.

### Route/Navigation Patterns

Navigation uses the `AppFlow` state machine in `App.tsx`:
```typescript
type AppFlow = 'staff-selection' | 'feedback' | 'client-selection' | 'feedback-form' | 'consultant-input' | 'updated-consult' | 'machine-intake' | 'admin-dashboard';
```

Transitions trigger `transitionWithOverlay()` (gradient + fade) for motion design. Press `Esc` to return to staff portal (`handleGoHome()`).

### Sensitive Data Handling

Consultation data (name, phone, form answers, product recommendations) is stored in Supabase `consultations` and related tables. No client-side caching; always fetch fresh from server to avoid stale state.

---

## Integration Points & External Dependencies

### Supabase Schema

Key tables:
- `product` — Product catalog (id, slug, display_name, ingredient_keywords, pregnancy_unsafe, isotretinoin_unsafe, barrier_unsafe, notes)
- `product_alias` — Alternative names for products
- `product_tag` — Many-to-many: product ↔ ingredient tags
- `concern_matrix` — Rows: {concern, subtype_id, skin_type, band, cleanser_id, core_serum_id, secondary_serum_id, moisturizer_id, sunscreen_id}
- `concern_subtype` — Lookups for acne subtypes, pigmentation types, etc.
- `skin_type_defaults` — {skin_type, slot, product_id} for fallback recommendations
- `consultations` — Session records with form_data, recommendations, staff metadata
- `feedback_sessions` — Rating/feedback capture

### UI Libraries

- **Mantine**: Data pickers (`@mantine/dates`), hooks
- **shadcn/ui**: Card, Button, Badge, Tabs, ScrollArea, Collapsible, Dialog (Radix-based)
- **Lucide React**: Icons (pre-bundled in Vite config)
- **Tailwind CSS**: Styling (JIT compiled)

### Path Aliases

TypeScript `@/` → `src/` (configured in `tsconfig.app.json` and Vite).

---

## Debugging Tips

1. **Decision Engine Output**: Add `console.log()` calls inside `decideAllBandUpdates()` to trace rule execution order and band merges.

2. **Matrix Lookups**: If a recommendation is missing products, check:
   - Is the concern/subtype/band combination defined in Supabase?
   - Are products flagged as `is_referral: true`? (These appear in referral-only routines.)
   - Did `loadConcernMatrixData()` complete? Call `isConcernMatrixLoaded()` or `getConcernMatrixLoadError()`.

3. **Ingredient Compatibility**: Test `pairCompatibility()` directly; see `ingredientInteractions.ts` for the full matrix.

4. **Form State**: `UpdatedConsultForm` maintains a large `formData` object. Use React DevTools to inspect it step-by-step as the user progresses.

5. **Supabase Connection**: Check browser DevTools Network tab; all queries should be POST to `supabase.co` endpoint with the API key in headers.

---

## Updating the Spec

The **README.md** (lines 1–410) is the authoritative spec for the form flow. When updating:
1. Modify the markdown section (Questions, Options, Follow-ups, Severity bands)
2. Update `UpdatedConsultForm.tsx` (the UI)
3. Update `src/lib/decisionEngine.ts` (decision rules)
4. Update Supabase `concern_subtype` table (severity breakpoints)
5. Run `pnpm run test:acne-complete` to verify all 8 scenarios still work

---

## Quick Reference: Editing Recommendations

**Adding a new concern**:
1. Add to `ConcernKey` type in `src/data/concernMatrix.ts`
2. Create subtypes in Supabase `concern_subtype` table
3. Populate matrix rows for each (subtype, skin-type, band) combination
4. Add follow-up questions in `src/lib/decisionEngine.ts` (Rule)
5. Add concern selector in `UpdatedConsultForm.tsx`

**Tweaking ingredient safety**:
1. Edit `disallow[]` or `caution[]` pairs in `src/services/ingredientInteractions.ts`
2. Regenerate recommendations (decision engine re-runs on form change)

**Updating pregnancy/isotretinoin gates**:
1. Check `hasSevereCysticGate()`, `hasBarrierStressHighGate()`, etc. in `recommendationEngineMatrix.ts`
2. Add corresponding form field if needed
3. Update safety gate logic in recommendation variant generation

**Adjusting routine variants**:
1. Edit variant generation in `generateRecommendations()` function
2. Modify irritation risk thresholds or serum count rules
3. Test with `pnpm run test:acne-complete`
