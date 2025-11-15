# Routine Generation for Acne Scarring (Keloid) - BASED ON APP LOGIC

## Scenario
**User selects ONLY:** "Post Acne Scarring" concern with "Keloid" subtype

---

## Step 1: Form Collection → What App Captures

User input in the form:
```
mainConcerns: ['Post Acne Scarring']
postAcneScarringSubtype: 'Keloid' (from dropdown: "Raised, thick scars → Keloid / hypertrophic scars")
skinType: 'Dry' (or Combo, Oily, Sensitive, Normal)
```

**Key:** The concern is stored as `'Post Acne Scarring'` in `mainConcerns`, but internally the app **normalizes** it to `'acnescars'` (lowercase, no spaces).

---

## Step 2: Decision Engine - Deriving Bands

### Band Determination for Acne Scarring

**File:** `src/services/recommendationEngineMatrix.ts` lines 1558-1570

```typescript
case 'acnescars':
  subtype = inferScarSubtype(context);
  band = toBandColor(effectiveBands.acne) || 'yellow';
  break;
```

**Key Logic:**
1. **Subtype derivation** → `inferScarSubtype(context)` returns `'Keloid'` (from form field)
2. **Band determination** → Uses `effectiveBands.acne` (from decision engine) **OR defaults to 'yellow'**

**Critical:** When ONLY acne scarring is selected (NOT "Acne" itself):
- `effectiveBands.acne` is typically **undefined** or **green** (since user didn't select "Acne" concern)
- Falls back to **'yellow'** as default
- This is intentional: scars are moderate by default unless machine scan indicates worse

---

## Step 3: Concern Selection & Primary Routing

**File:** `src/services/recommendationEngineMatrix.ts` lines 1531-1588

```typescript
function collectConcernSelections(context): ConcernSelection[] {
  // Normalized concern label mapping
  const concern = normalizeConcernLabel('Post Acne Scarring');  // → 'acnescars'
  
  // For acnescars concern:
  const subtype = inferScarSubtype(context);  // → 'Keloid'
  const band = toBandColor(effectiveBands.acne) || 'yellow';  // → 'yellow'
  
  selections.push({
    concern: 'acnescars',
    subtype: 'Keloid',
    band: 'yellow',
    priority: 999,  // acnescars has default priority
    source: 'user'
  });
  
  return selections;  // Single item: [{concern: 'acnescars', subtype: 'Keloid', band: 'yellow', ...}]
}
```

Then:

```typescript
function selectPrimaryConcern(concerns): { primary, others } {
  // Only concern is acnescars
  const [first, ...rest] = concerns;
  return { 
    primary: {concern: 'acnescars', subtype: 'Keloid', band: 'yellow'}, 
    others: [] 
  };
}
```

**Result:**
- **Primary concern:** `acnescars` / `Keloid` / `yellow`
- **Secondary concerns:** None (empty)

---

## Step 4: Matrix Entry Lookup

**File:** `src/services/recommendationEngineMatrix.ts` line 1208-1220

```typescript
const entry = fetchMatrixEntry(primaryConcern, skinType, sharedNotes);
```

Expands to:

```
lookupMatrixEntry(
  concern: 'acnescars',
  subtype: 'Keloid',
  skinType: 'Dry' (or user's selection),
  band: 'yellow'
)
```

**Database Query (from earlier results):**

```sql
SELECT cleanser, core_serum, secondary_serum, moisturizer, sunscreen
FROM matrix_entry 
WHERE concern = 'acnescars' 
  AND subtype_id = (SELECT id FROM concern_subtype WHERE label = 'Keloid')
  AND skin_type = 'Dry'
  AND band = 'yellow';
```

**Result (from our earlier query):**
```
id: 245016bf-4673-47cc-8d8b-6b6cb7fda05e
concern: acnescars
subtype: Keloid
skin_type: Dry
band: yellow
remarks: Keloid moderate: Moisturizer support
cleanser: Salicylic acid cleanser
core_serum: Silicone scar sheets
secondary_serum: NULL
moisturizer: Gel-cream moisturizer
sunscreen: Tinted mineral sunscreen SPF 50
```

---

## Step 5: Routine Variant Generation

**File:** `src/services/recommendationEngineMatrix.ts` lines 1223-1390

### Base Routine (Built from Matrix Entry)

```typescript
const baseRoutine = buildRoutineFromEntry(entry, skinProfile, sharedNotes);
```

**Output:**
```typescript
{
  cleanser: {
    name: 'Salicylic acid cleanser',
    slug: 'salicylic-acid-cleanser',
    // ... other fields
  },
  coreSerum: {
    name: 'Silicone scar sheets',
    slug: 'silicone-scar-sheets',
    // ... other fields
  },
  secondarySerums: [],  // Empty: matrix had NULL
  moisturizer: {
    name: 'Gel-cream moisturizer',
    slug: 'gel-cream-moisturizer',
    // ... other fields
  },
  sunscreen: {
    name: 'Tinted mineral sunscreen SPF 50',
    slug: 'tinted-mineral-sunscreen-spf-50',
    // ... other fields
  }
}
```

### Variant Generation

Three variants are created:

#### **Variant 1: Conservative**
- **Serums:** Core only (Silicone scar sheets)
- **Irritation Risk:** Low
- **Full Routine:**
  - Cleanser: Salicylic acid cleanser
  - Core Serum: Silicone scar sheets
  - Moisturizer: Gel-cream moisturizer
  - Sunscreen: Tinted mineral sunscreen SPF 50

#### **Variant 2: Balanced** (RECOMMENDED)
- **Serums:** Core only (no secondary available)
- **Irritation Risk:** Moderate
- **Full Routine:**
  - Cleanser: Salicylic acid cleanser
  - Core Serum: Silicone scar sheets
  - Moisturizer: Gel-cream moisturizer
  - Sunscreen: Tinted mineral sunscreen SPF 50
- **Note:** "No secondary serum defined for primary concern acnescars Keloid" (since matrix had NULL)

#### **Variant 3: Comprehensive**
- **Serums:** Tries to add from other concerns (none exist, so same as Balanced)
- **Irritation Risk:** Higher
- **Full Routine:** Same as Balanced
- **Note:** "Comprehensive variant would layer multiple treatments, but only one serum available"

---

## Step 6: AM/PM Scheduling

**File:** `src/services/scheduler.ts`

For each variant, the scheduler creates:

```typescript
buildWeeklyPlan({
  cleanser: ...,
  coreSerum: { name: 'Silicone scar sheets', ... },
  secondarySerums: [],
  moisturizer: ...,
  sunscreen: ...,
  ...
})
```

**AM Routine (Monday-Sunday):**
1. Cleanser (Salicylic acid cleanser)
2. Moisturizer (Gel-cream moisturizer)
3. Sunscreen (Tinted mineral sunscreen SPF 50)

**PM Routine (Monday-Sunday):**
1. Cleanser (Salicylic acid cleanser)
2. Core Serum (Silicone scar sheets) - applied PM every night
3. Moisturizer (Gel-cream moisturizer)

**Cost Breakdown:**
- Silicone scar sheets: ~2-3 USD per application
- Nightly cost: ~2-3 USD
- Weekly cost: ~14-21 USD
- Budget note: "Moderate cost for scar treatment; can space applications"

---

## Step 7: Final Recommendation Output

**User sees 3 routine options:**

### Option 1: Conservative
- **Label:** "Conservative"
- **Description:** "Keeps to a single gentle serum for barrier stability and easy adherence."
- **Irritation Risk:** Low
- **Recommended:** ❌ No
- **Available:** ✅ Yes

### Option 2: Balanced (DEFAULT SELECTED)
- **Label:** "Balanced"
- **Description:** "Core treatment plus one support serum for the next most pressing concern."
- **Irritation Risk:** Moderate
- **Recommended:** ✅ Yes
- **Available:** ✅ Yes
- **Notes:**
  - "Balanced plan generated (serum comfort 2)."
  - "No secondary serum defined for primary concern acnescars Keloid."
  - "No compatible secondary serum available for the primary concern."

### Option 3: Comprehensive
- **Label:** "Comprehensive"
- **Description:** "Layered routine addressing up to three priorities when tolerance allows."
- **Irritation Risk:** Higher
- **Recommended:** ❌ No
- **Available:** ✅ Yes
- **Notes:**
  - "Comprehensive variant would require multiple compatible serums, but only one available."

---

## Summary: The Routine Flow

### Input
```
User selects: "Post Acne Scarring" → "Keloid"
Skin Type: Dry
```

### Processing
1. Form normalizes to concern `'acnescars'`, subtype `'Keloid'`, band `'yellow'` (default)
2. App looks up matrix entry: `acnescars / Keloid / Dry / yellow`
3. Finds: Cleanser (Salicylic acid), Core (Silicone scar sheets), Moisturizer (Gel-cream), Sunscreen (Tinted SPF 50)
4. Generates 3 routine variants (Conservative, Balanced, Comprehensive)
5. All variants include same products (no secondary available)
6. Schedules AM/PM application with cost estimates

### Output (Balanced/Default)
```
AM:
  1. Salicylic acid cleanser
  2. Gel-cream moisturizer
  3. Tinted mineral sunscreen SPF 50

PM (Every Night):
  1. Salicylic acid cleanser
  2. Silicone scar sheets (core)
  3. Gel-cream moisturizer

Weekly Cost: $14-21 (silicone sheets)
Estimated Duration: 8-12 weeks for visible improvement
Dermatologist Referral: Not required (preventative care level)
```

---

## KEY INSIGHTS

✅ **What Works:**
- Keloid scar subtype is **properly mapped** in database (12 matrix entries across skin types/bands)
- **Salicylic acid cleanser** is included to help prevent future breakouts
- **Silicone scar sheets** are proven treatment for raised scars (mechanical barrier + hydration)
- **Gel-cream moisturizer** (Dry skin appropriate) supports healing
- **Tinted SPF 50** prevents hyperpigmentation during scar remodeling

⚠️ **Limitations:**
- **No secondary serum** available for acnescars/Keloid combination (matrix design allows only 1 active per concern)
- **No active treatment** beyond silicone (retinoids, Vitamin C not used; would be recommended by dermatologist anyway)
- **All 3 variants identical** - difference is only in descriptive text, not actual products
- **Salicylic acid cleanser** daily use might be excessive for Keloid (designed for comedonal acne, not scars)

💡 **Better Recommendation Strategy** (if user had multiple concerns):
- If selected "Acne + Acne Scarring" → Route to Acne primary, then add scar support
- If selected "Pigmentation + Acne Scarring" → Route based on priority (Acne usually higher)
- If selected "Acne Scarring only" → Current flow is correct
