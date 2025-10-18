# Guide for Future AI Developers

**Read this first if you're being asked to modify or debug the Aetheria Forms project.**

## Quick Start (5 minutes)

1. **Read the copilot instructions** at `.github/copilot-instructions.md` (1200 lines)
2. **Understand the data model** from `docs/SUPABASE_SCHEMA.md`
3. **Check the current database state** at `docs/DATABASE_SNAPSHOT_OCT_2025.md`
4. **Build and test**: `pnpm build && pnpm run test:acne-complete`

Done. You now have full project context.

---

## Architecture Overview (2 minutes)

### What This App Does
Skincare consultation intake form + AI-powered recommendation engine. Patients answer questions → form drives decision engine → generates personalized product recommendations.

### Three Core Components

**1. Decision Engine** (`src/lib/decisionEngine.ts` - 1200 lines)
- Takes form answers + machine readings → produces "effective bands" (blue/yellow/red severity)
- Rules-based system with reconciliation logic
- Outputs: bands, flags, safety alerts

**2. Recommendation Engine** (`src/services/recommendationEngineMatrix.ts` - 1741 lines)
- Takes effective bands → looks up products in matrix → generates routine variants
- Matrix: (concern, subtype, skin_type, band) → 5 product slots
- Outputs: 1-5 routine variants with AM/PM schedules

**3. Form** (`src/components/UpdatedConsultForm.tsx` - 4018 lines)
- Multi-step form that collects all user inputs
- Orchestrates decision engine → recommendation engine
- Displays results with editable follow-ups

**Data Flow:**
```
Form Input → Decision Engine → Effective Bands → 
Recommendation Engine → Matrix Lookup → Routine Variants → Display
```

---

## Finding Things

### "I need to understand how [X] works"

| Need | File | Lines | What It Is |
|------|------|-------|-----------|
| Band logic | `src/lib/decisionEngine.ts` | 1-200 | Band derivation, elevateBand(), reconciliation |
| Acne rules | `src/lib/decisionEngine.ts` | 200-600 | Acne severity thresholds, category logic |
| Sensitivity | `src/lib/decisionEngine.ts` | 600-800 | Sensitivity band computation |
| Post Acne Scarring form | `src/components/UpdatedConsultForm.tsx` | 1427-1445 | getConcernSteps function |
| Scar type selector | `src/components/UpdatedConsultForm.tsx` | 2233-2280 | getConcernOptions case 'Post Acne Scarring' |
| Recommendation flow | `src/services/recommendationEngineMatrix.ts` | 1470-1650 | collectConcernSelections, inferScarSubtype |
| Matrix lookup | `src/services/recommendationEngineMatrix.ts` | 900-1100 | lookupMatrixEntry, fetchMatrixEntry |
| Ingredient compatibility | `src/services/ingredientInteractions.ts` | 1-100 | pairCompatibility, disallow/caution pairs |
| Variant generation | `src/services/recommendationEngineMatrix.ts` | 1300-1450 | buildRoutineVariant, 5 variant types |

### "How do I add [X]?"

| Task | Steps | Key Files |
|------|-------|-----------|
| New concern | 1. Add to concern_key enum (src/data/concernMatrix.ts) 2. Create subtypes in Supabase 3. Populate matrix entries 4. Add form UI (UpdatedConsultForm.tsx) | concernMatrix.ts, UpdatedConsultForm.tsx, Supabase |
| New product | 1. Insert into product table 2. Add product_tag entries 3. Update matrix entries 4. Test with test:acne-complete | Supabase tables, ingredientInteractions.ts |
| New ingredient pair rule | 1. Add to disallow[] or caution[] in ingredientInteractions.ts 2. Re-test recommendation variants | ingredientInteractions.ts |
| New safety gate | 1. Add form field (UpdatedConsultForm.tsx) 2. Add to form_data type 3. Add check function in recommendationEngineMatrix.ts 4. Document here | UpdatedConsultForm.tsx, recommendationEngineMatrix.ts, SUPABASE_SCHEMA.md |

---

## Common Issues & Solutions

### Problem: "Matrix lookup returning undefined"
**Debug Steps:**
1. Check: Does the concern_matrix row exist? 
   ```sql
   SELECT * FROM concern_matrix 
   WHERE concern = 'acnescars' AND subtype_id = 'IcePick' 
   AND skin_type = 'Combo' AND band = 'yellow';
   ```
2. Check: Are product UUIDs valid?
   ```sql
   SELECT * FROM product WHERE id = 'uuid-here';
   ```
3. Check: Is core_serum_id NULL? (Should never be NULL)

### Problem: "Form shows all options concatenated on one line"
**Cause:** Step transition not happening correctly.  
**Solution:** Check getConcernSteps() - does it have both 'type' and 'severity' steps for this concern?  
**Reference:** Oct 18 fix in getConcernSteps() for Post Acne Scarring.

### Problem: "Recommendation doesn't include my newly added concern"
**Debug Steps:**
1. Check: Is concern in form's mainConcerns array?
2. Check: Does normalizeConcernLabel() return a ConcernKey?
3. Check: Are collectConcernSelections() including it?
4. Check: Is there a matrix entry for this concern/subtype/band combo?

### Problem: "Build fails with TypeScript errors"
**Common Causes:**
- Union type from Supabase not narrowing → use `as unknown as` cast
- Missing enum value in Record type → add to CONCERN_PRIORITY, etc.
- FormData field type mismatch → check form_data type definition

---

## Testing Your Changes

### Quick Test (2 minutes)
```bash
pnpm build
```
If this succeeds, you're safe. All TypeScript strict checks pass.

### Full Test Suite (5 minutes)
```bash
pnpm run test:acne-complete
```
Runs 8 acne scenarios (pregnancy gate, isotretinoin, hormonal patterns, etc.). If these pass, decision engine is solid.

### Manual Testing (10 minutes)
```bash
pnpm dev
```
- Fill out form end-to-end
- Check console output for decision engine results
- Verify recommendations appear
- Test all 4 Post Acne Scarring types

### Specific Recommendation Test
Create a test script (`scripts/testPostAcneScarring.ts`):
```typescript
// Select Post Acne Scarring with IcePick + Yellow band
// Call generateRecommendations()
// Verify: products are not undefined, variants are available
```

---

## Code Style & Conventions

### Form Answer Normalization
Always normalize before comparing:
```typescript
const normalized = answer.toLowerCase().trim();
if (normalized.includes('yes') || normalized === 'true') {
  // Handle truthy
}
```

### Band Logic
Always use `elevateBand()` when merging multiple bands - preserves worst-case:
```typescript
const final = elevateBand(current, candidate);  // Returns the worse (higher priority) band
```

### Product Slot Handling
Always check if nullable before use:
```typescript
const secondary = entry?.secondarySerum;  // May be null/undefined
if (!secondary) { /* handle fallback */ }
```

### Supabase Queries
Use explicit type casting for union types from Supabase:
```typescript
const data = (result as unknown as ConcernMatrix[]);
```

---

## Database Structure Quick Reference

**Key Tables:**
- `product` - All products (100+ rows)
- `concern_matrix` - Recommendations lookup (90+ rows for acnescars alone)
- `concern_subtype` - Types within each concern (18 rows)
- `consultations` - Session data (grows with usage)
- `product_tag` - Ingredient compatibility (200+ rows)

**Key Relationships:**
```
Form Answer
  ↓ (normalize)
Concern + Subtype
  ↓ (derive band)
Effective Band
  ↓ (lookup)
concern_matrix entry
  ↓ (extract products)
Product IDs
  ↓ (fetch names & tags)
Recommendation
```

---

## Getting Help

### Read These Files (In Order)
1. `.github/copilot-instructions.md` - Full project spec
2. `docs/SUPABASE_SCHEMA.md` - Database schema & business rules
3. `docs/DATABASE_SNAPSHOT_OCT_2025.md` - Current data state
4. `README.md` - Form flow specification

### Check Code Comments
- `src/lib/decisionEngine.ts` - Comments explain each rule
- `src/services/recommendationEngineMatrix.ts` - Comments explain matrix lookups
- `src/services/ingredientInteractions.ts` - Comment matrix shows all conflicts

### Run Tests
```bash
pnpm run test:acne-complete    # Full decision engine test
pnpm build                      # TypeScript validation
pnpm lint                       # Code style
```

---

## Recent Changes (October 18, 2025)

**Post Acne Scarring Implementation:**
1. ✅ Added 'acnescars' concern with 4 subtypes
2. ✅ Populated 84 concern_matrix entries (6 subtypes × 5 skin types × varying bands)
3. ✅ Fixed getConcernSteps() to include 'type' step for Post Acne Scarring
4. ✅ Updated inferScarSubtype() to read from form data
5. ✅ Added Post Acne Scarring to Remarks display
6. ✅ All builds pass, 0 TypeScript errors

**What Works:**
- Form flow: Type selection → Severity selection ✅
- Decision engine: Recognizes acnescars concern ✅
- Recommendation engine: Looks up products for all scar types ✅
- Display: Shows recommendations with correct products ✅

**What to Test Next:**
- [ ] All 4 scar types generate different products
- [ ] Severity bands affect product selection (blue = gentler, red = stronger)
- [ ] Ingredient compatibility respected across scar type + acne combo
- [ ] Safety gates (pregnancy, etc.) block unsafe products

---

## Contact/Questions

**For ambiguous requirements:** Check copilot-instructions.md lines X-Y for context.  
**For database issues:** Query Supabase dashboard → compare with SUPABASE_SCHEMA.md.  
**For form/UI issues:** Check UpdatedConsultForm.tsx and search for the concern name.  
**For recommendation issues:** Trace through recommendationEngineMatrix.ts workflow.

---

**Remember:** If in doubt, run `pnpm build && pnpm run test:acne-complete`. These will catch 99% of issues immediately.
