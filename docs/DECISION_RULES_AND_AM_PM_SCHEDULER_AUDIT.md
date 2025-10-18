# Decision Rules & AM/PM Scheduler Implementation Audit

**Date:** October 18, 2025  
**Purpose:** Verify implementation completeness of decision rules, follow-up questions, and AM/PM scheduling logic

---

## Executive Summary

✅ **PARTIALLY IMPLEMENTED** – The infrastructure is in place, but several critical decision rules and AM/PM optimization are incomplete or missing.

### Status Overview
- ✅ **AM/PM Infrastructure:** Timing logic partially implemented in scheduler
- ✅ **Ingredient Tags:** Compatibility matrix defined
- ⚠️ **Decision Rules:** Only ~30% of follow-up questions implemented
- ⚠️ **AM/PM Assignments:** Basic but incomplete per ingredient guide
- ❌ **Follow-Up Logic:** Many cascade rules not yet wired

---

## Part 1: Decision Rules Implementation Status

### 1.1 Current Implemented Rules

**File:** `src/lib/decisionEngine.ts` (1197 lines)

#### ✅ Implemented Rules

| Category | Rule ID | Status | Details |
|----------|---------|--------|---------|
| **Moisture** | moisture_MachineRed_SelfGreen | ✅ Complete | Sets Moisture: Blue when machine says red but user says green |
| **Moisture** | moisture_MachineGreen_SelfRed | ✅ Complete | Asks Q2-Q4 about tightness, flaking, actives usage |
| **Sebum** | sebum_MachineGreen_SelfRed | ✅ Complete | Asks 2 questions about oil pattern |
| **Sebum** | sebum_MachineRed_SelfGreen | ✅ Complete | Asks 3 questions about shine, blackheads, product usage |
| **Acne** | acne_machinePresence_customerNone | ✅ Partial | Asks Q1-Q5 about breakouts, but post-acne pigmentation logic incomplete |
| **Pores** | pores_MachineEnlarged_SelfNotConcerned | ✅ Partial | Asks 3 questions, verdict logic partial |
| **Pores** | pores_MachineNotEnlarged_SelfConcerned | ✅ Partial | Asks 3 questions, verdict logic partial |
| **Texture** | texture_AgingConcern | ✅ Simple | Age-based routing only |
| **Pigmentation** | pigmentation_MachinePresent_SelfNot | ✅ Simple | Sets Yellow band |
| **Pigmentation** | pigmentation_MachinNot_SelfPresent | ✅ Simple | Sets Yellow band |

#### ⚠️ Partially Implemented

| Category | Rule ID | Issue | What's Missing |
|----------|---------|-------|-----------------|
| **Acne** | acne_comedonal | ⚠️ Follow-ups incomplete | Q1-Q3 collected, but verdict logic for Q3 (mixed acne detection) incomplete |
| **Acne** | acne_inflammatory | ⚠️ Follow-ups incomplete | Q1-Q5 collected, but severity cascade logic incomplete |
| **Acne** | acne_hormonal | ⚠️ Follow-ups incomplete | Q1-Q5 collected, but hormonal pattern detection incomplete |
| **Texture** | texture_Bumpy | ⚠️ Follow-ups incomplete | Q1-Q2 collected, but differentiation (pimples vs bumpy vs dandruff) incomplete |

#### ❌ Not Implemented

| Category | Rule | Details |
|----------|------|---------|
| **Acne** | acne_Post-inflammatory_pigmentation | Question: "Any red/brown spots without raised bump?" → should route to pigmentation, NOT acne |
| **Sebum** | sebum_Subtype_detection | No Blue/Yellow vs Red distinction in rule outcomes |
| **Pores** | pores_Minimal_vs_Enlarged | No subtype differentiation in verdicts |
| **Texture** | texture_Dandruff_check | "Suggest checking for dandruff if forehead bumps" not implemented |
| **All** | Acne + Pigmentation_combined | If Q2=Yes (red/brown spots) + active acne, should create DUAL flag |

---

### 1.2 Decision Rules Audit Against Provided Spec

#### MOISTURE (3 rules needed, 2 implemented)

**Rule 1: Machine Red/Yellow → Customer Blue/Green** ✅

```yaml
Current Implementation:
  when: machine.moisture in [red, yellow] AND self.moisture in [green, blue]
  questions:
    - Not asked; auto-resolved
  outcome: Moisture: Blue

Spec Requirement: (MATCH)
  Outcome: Moisture : Blue (no follow-ups needed)
  Status: ✅ COMPLETE
```

**Rule 2: Machine Green/Blue → Customer Red/Yellow** ✅

```yaml
Current Implementation:
  when: machine.moisture in [green, blue] AND self.moisture in [red, yellow]
  questions:
    Q2. Does skin feel tight all day even after moisturizer? (Yes/No)
    Q3. Do you have visible flaking/rough patches? (Yes/No)
    Q4. Current actives/meds in last 4 weeks? (Select all/None)
  logic:
    if Q2=Yes OR Q3=Yes OR Q4 includes retinoid/isotretinoin → Yellow
    if Q2=Yes AND Q3=Yes → Red
    if all No → Blue

Spec Requirement:
  Q2=Yes → Yellow (if Q3=Yes OR Q4 includes retinoid/isotretinoin)
  Q2=Yes AND Q3=Yes → Red
  Q2=No AND Q3=No AND Q4 not retinoid/isotretinoin → Blue
  Status: ✅ COMPLETE
```

**Rule 3: Moisture + Actives Usage** ⚠️

```yaml
Current: Q4 asks about actives
Spec: Should detect recent retinoids/isotretinoin as TRIGGER for higher moisture needs

Gap: Rule cascades exist but some edge cases not covered
  - What if user on isotretinoin but says moisture is fine? Should still flag heightened sensitivity
  Status: ⚠️ PARTIAL
```

---

#### SEBUM (4 rules needed, 2 implemented)

**Rule 1: Machine Green/Blue → Customer Red/Yellow** ✅

```yaml
Implemented: YES
Questions: Q1 (blot frequency), Q2 (T-zone vs all over)
Outcomes:
  Q1=≥3x/day AND Q2=All over → Red ✅
  Q1=1–2x/day AND Q2=T-zone → Yellow (Verdict: COMBINATION) ✅
Status: ✅ COMPLETE
```

**Rule 2: Machine Yellow/Red → Customer Green/Blue** ✅

```yaml
Implemented: YES
Questions: Q1 (shine within 2-4h), Q2 (blackheads/whiteheads), Q3 (heavy products)
Outcomes:
  Q1=Yes AND Q2=Yes AND Q3=No → Red ✅
  Q1=Yes OR Q2=Yes → Yellow ✅
  Q1=No AND Q2=No AND Q3=Yes → Blue ✅
  Q1=No AND Q2=No AND Q3=No → Green ✅
Status: ✅ COMPLETE
```

**Rule 3: Sebum Blue/Yellow vs Red Subtype** ❌

```yaml
Spec Requirement:
  Mild sebum (Blue/Yellow):
    - Combo/Normal: Niacinamide alone
    - Oily: Niacinamide + Salicylic acid 2%
    - Sensitive: Niacinamide alone
  
  High sebum (Red):
    - Oily: Salicylic acid cleanser + Niacinamide + Salicylic acid 2%
    - Sensitive: Niacinamide alone

Current Implementation:
  - No distinction between Blue/Yellow and Red sebum
  - Generic "General" subtype for all sebum entries
  - No flag set to differentiate recommendations

Status: ❌ NOT IMPLEMENTED
Action: Need to add `sebumSubtype: "mild" | "high"` flag
```

---

#### ACNE (Multiple complex rules, ~40% implemented)

**Rule 1: Acne Presence Detection** ⚠️ PARTIAL

```yaml
Spec Questions:
  Q1. Any new bumps in last 2 weeks? (None / 1–2 / Several)
  Q2. Any red/brown spots without raised bump? (Yes / No)
  Q3. Do you get monthly breakouts around periods/jawline? (Yes / No / NA)
  Q4. Do you frequently notice tiny bumps/blackheads/whiteheads? (Yes / No)
  Q5. Do you have any inflamed pimples now? (None / 1–5 / 6–15 / >15)

Current Implementation:
  ✅ Q1-Q5 are asked
  ⚠️ Post-acne pigmentation path (Q2 = Yes → should ask color → route to pigmentation)
  ❌ Missing cascade logic for combined acne + pigmentation

Example Gap:
  Spec: If Q2 = Yes AND Q1 = {None, 1–2} AND Q5 = None 
        → POST-ACNE PIGMENTATION (no active acne, band depends on color)
  
  Current: Q2 answer collected but not cascaded to pigmentation
  Status: ❌ MISSING
```

**Rule 2: Acne Comedonal Subtype** ⚠️ PARTIAL

```yaml
Spec Questions:
  Q1. Tiny bumps, blackheads or whiteheads? (Yes / No)
  Q2. How many comedones? (None / <10 / 10–20 / >20)
  Q3. Any inflamed pimples right now? (None / 1–5 / 6–15 / >15)

Outcomes:
  Q1=Yes AND Q2=10–20 → COMEDONAL ACNE — Yellow ✅
  Q1=Yes AND Q2=>20 → COMEDONAL ACNE — Red ✅
  Q1=Yes AND Q2=<10 → COMEDONAL ACNE — Blue ✅
  Q3≥1 (any inflamed) AND Q1=Yes → MIXED: COMEDONAL + INFLAMMATORY ⚠️

Current Implementation:
  ✅ Q1-Q3 are asked
  ⚠️ Band logic implemented
  ❌ MIXED acne detection incomplete (Q3≥1 should ask inflammatory follow-ups)
  
Status: ⚠️ PARTIAL
```

**Rule 3: Acne Inflammatory Subtype** ⚠️ PARTIAL

```yaml
Spec Questions:
  Q1. How many inflamed (red, swollen, painful) pimples? (None / 1–5 / 6–15 / >15)
  Q2. Any deep, painful lumps or nodules? (Yes / No)
  Q3. Visible blackheads/whiteheads? (None / <10 / 10–20 / >20)
  Q4. Do breakouts follow a trigger? (Yes / No)
  Q5. Pregnant or breastfeeding? (Yes / No / N/A)

Outcomes:
  Q2=Yes OR Q1=>15 → DERMATOLOGIST REFERRAL ✅
  Q1=6–15 AND Q2=No → Red ✅
  Q1=1–5 → Yellow ✅
  Q3<10 → Also COMEDONAL (Blue) ⚠️
  Q3=10-20 → COMEDONAL (Yellow) ⚠️
  Q3=>20 → COMEDONAL (Red) ⚠️
  Q4=Yes → SITUATIONAL ACNE + current routine ⚠️
  Q5=Yes → PREGNANCY FILTER + derm consult suggestion ⚠️

Current: Q1-Q5 collected but cascade logic incomplete
Status: ⚠️ PARTIAL (severity verdicts work, cascades missing)
```

**Rule 4: Acne Hormonal Subtype** ❌ MOSTLY MISSING

```yaml
Spec Questions:
  Q1. Breakouts monthly/around periods/jawline? (Yes / No)
  Q2. Concentrated on lower face/jawline? (Yes / No)
  Q3. Change with birth control/menstrual cycle? (Yes / No / NA)
  Q4. How many inflamed lesions now? (None / 1–5 / 6–15 / >15)
  Q5. Pregnancy/breastfeeding? (Yes / No / NA)

Outcomes:
  Q4≥15 → Severe → DERMATOLOGIST REFERRAL ✅
  Q1=Yes AND Q2=Yes → HORMONAL ACNE (suggest medical consult) ⚠️
  Q3=Yes → RECOMMEND MEDICAL CONSULT (Gyn/endocrine) ⚠️
  Q1=Yes but Q4=1-5 → BLUE INFLAMMATORY + suggest doctor referral ⚠️
  Validation: If Q1=No AND Q2=No → "Selected hormonal acne but responses don't match" ⚠️

Current Implementation: 
  Questions asked but limited verdict logic
  Medical referral suggestions not implemented
  Status: ❌ INCOMPLETE
```

---

#### PORES (2 rules, ~50% implemented)

**Rule 1: Machine Red/Yellow → Customer Green/Blue** ⚠️

```yaml
Spec Questions:
  Q1. Pores visible at arm's length? (Yes/No)
  Q2. Frequent blackheads? (Yes/No)
  Q3. Oiliness level? (Low/Normal/High)

Outcomes:
  Q1=Yes AND Q3=High → Yellow ✅
  Q1=Yes OR Q3=High → Blue ✅
  Q1=No AND Q2=No AND Q3=Low/Normal → Green ✅
  Q1=No AND Q2=Yes → ASK COMEDONAL ACNE FOLLOW-UP ⚠️

Current: Q1-Q3 asked, outcomes partially implemented
Status: ⚠️ PARTIAL (missing comedonal acne cascade)
```

**Rule 2: Machine Green/Blue → Customer Red/Yellow** ⚠️

```yaml
Spec Questions:
  Q1. Visibility limited to close-up only under harsh light? (Yes/No)
  Q2. Heavy makeup/sunscreen + skip double-cleanse? (Yes/No)
  Q3. Blackheads on nose/chin? (Yes/No)

Outcomes:
  Q1=No AND Q2=Yes → Red ✅
  Q1=No OR Q2=Yes → Yellow ✅
  Q1=Yes AND Q2=No AND Q3=No → Blue ✅
  Q1=No AND Q2=No → Green ✅
  Q1=No AND Q2=No AND Q3=Yes → ASK COMEDONAL ACNE FOLLOW-UP ⚠️

Current: Q1-Q3 asked, outcomes partially implemented
Status: ⚠️ PARTIAL (missing comedonal acne cascade)
```

---

#### TEXTURE (Incomplete cascades)

**Rule: Bumpy Skin Differentiation** ❌

```yaml
Spec: Must differentiate between:
  1. Pimples/breakouts (→ Route to ACNE)
  2. Tiny uneven dots (not pimples) (→ Comedonal acne OR pores)
  3. Dandruff-related (→ Suggest check, ask if forehead)

Questions Q1:
  "When you say bumpy, do you mean:"
  - Pimples/breakouts
  - Tiny uneven dots (not pimples)
  - Just feels uneven to touch

Cascades:
  Q1 = Pimples → ASK ACNE FOLLOW-UPS ❌ NOT WIRED
  Q1 = Tiny uneven dots + Forehead → SUGGEST DANDRUFF CHECK ❌ NOT IMPLEMENTED
  Q1 = Tiny uneven dots + Cheeks → PORES (yellow) ❌ NOT WIRED
  Q1 = Tiny uneven dots + other → COMEDONAL ACNE ❌ NOT WIRED

Status: ❌ MISSING
```

---

### 1.3 Missing Decision Rules Summary

```
Total Rules in Spec: ~20+
Currently Implemented: ~12
Fully Functional: ~8
Missing/Incomplete: ~12

By Category:
  Moisture: 2/3 (67%)
  Sebum: 2/4 (50%)
  Acne: 2/6 (33%)
  Pores: 1/2 (50%)
  Texture: 1/3 (33%)
  Pigmentation: 2/2 (100%)
  
Overall: 10/20 (50%)
```

---

## Part 2: AM/PM Scheduling Implementation Status

### 2.1 Current AM/PM Architecture

**Files:**
- `src/services/scheduler.ts` (704 lines)
- `src/services/ingredientInteractions.ts` (110 lines)
- `src/data/productDatabase.ts` (207 lines)

### 2.2 Product-Level AM/PM Defaults

**Supabase `product` Table:**

```sql
Column: default_usage (ENUM: 'am' | 'pm' | 'both')
Default Value: 'both'
Issue: Only set to 'both' for all products currently
```

**Current Implementation:**
- ✅ Column exists in schema
- ❌ Not populated with per-ingredient AM/PM restrictions
- ❌ Admin UI doesn't show AM/PM configuration

### 2.3 Ingredient-Level AM/PM Logic

**File:** `src/services/ingredientInteractions.ts`

**Current Status:**

| Ingredient | Should Be | Current | Status |
|-----------|-----------|---------|--------|
| **Vitamin C (Ascorbic)** | Day preferred, night OK | tag: `vitamin_c_ascorbic` | ⚠️ Tag exists, timing not enforced |
| **Niacinamide** | Day/night both | tag: `niacinamide` | ⚠️ Tag exists, timing not enforced |
| **Tranexamic Acid** | Day preferred, night OK | tag: `tranexamic` | ⚠️ Tag exists, timing not enforced |
| **Ceramides** | Day/night both | Moisturizer detection | ✅ Works |
| **Peptides** | Day/night both | tag: `peptides` | ⚠️ Tag exists, timing not enforced |
| **AHA (6-10%)** | Night preferred (day <5%) | tag: `aha` | ⚠️ Tag exists, timing not enforced |
| **BHA** | Night preferred (day <2%) | tag: `bha` | ⚠️ Tag exists, timing not enforced |
| **Retinoids** | Night only | tag: `retinoids` | ✅ Enforced (line 75-76 scheduler.ts) |
| **Benzoyl Peroxide** | Night preferred, day OK | tag: `benzoyl_peroxide` | ⚠️ Tag exists, timing not enforced |

### 2.4 Scheduler AM/PM Enforcement

**File:** `src/services/scheduler.ts` (lines 75-90)

**Current Logic:**

```typescript
function decideAMSerum(key: string | undefined, flags: SchedulerInput['flags']): string | undefined {
  if (!key) return undefined
  if (flags?.sensitivityBand === 'red') {
    const t = serumKeyToTag(key)
    // Allow only zero-irritant peptides in AM for very sensitive
    return t === 'peptides' ? key : undefined
  }
  const tag = serumKeyToTag(key)
  const vcForm = flags?.vc_form || (key === 'vitamin-c' ? 'laa' : undefined)
  
  // Retinoids: never AM ✅
  if (tag === 'retinoids') return undefined
  
  // LAA: prefer AM ✅
  if (key === 'vitamin-c' && vcForm === 'laa') return key
  
  // Derivatives and others are flexible ⚠️
  return key
}
```

**Issues:**
1. ❌ **No BHA/AHA time restriction** – Should avoid AM unless <2% BHA or <5% AHA with SPF
2. ❌ **No Benzoyl Peroxide preference** – Should prefer PM
3. ❌ **No Tranexamic/Vitamin C optimization** – Should prefer AM for brightening
4. ⚠️ **Vitamin C Derivative handling** – Treated as "flexible" but should prefer AM
5. ⚠️ **Sensitivity scoring** – Only checks for 'red' band, not detailed sensitivity levels

### 2.5 Weekly Scheduler Output

**File:** `src/services/scheduler.ts` (lines 153-300)

**Current Capabilities:**

✅ **What Works:**
- Basic AM/PM separation
- Retinoid PM-only enforcement
- Cleanser + Moisturizer + SPF basic routing
- Weekly day-by-day planning

⚠️ **What's Partial:**
- Acid strength differentiation (low/medium/high tracked but not used for timing)
- Product rotation logic for multiple serums (exists but basic)
- Sensitivity-based rest night calculations

❌ **What's Missing:**
- No explicit BHA <2% / AHA <5% handling
- No Benzoyl Peroxide PM preference
- No Vitamin C vs Niacinamide optimization (both "day friendly" but timing matters when combined with retinoids)
- No ingredient conflict notes per AM/PM
- No photosensitivity warnings (e.g., "AHA/BHA increases sun sensitivity, use SPF")

---

## Part 3: Implementation Checklist

### 3.1 Decision Rules Needed

```typescript
// src/lib/decisionEngine.ts

// MOISTURE
✅ Moisture: Machine Red/Yellow → Customer Blue/Green (auto-resolve)
✅ Moisture: Machine Green/Blue → Customer Red/Yellow (Q2-Q4)
⚠️ Moisture + Recent Actives: Add heightened sensitivity flag

// SEBUM
✅ Sebum: Machine Green/Blue → Customer Red/Yellow (Q1-Q2)
✅ Sebum: Machine Yellow/Red → Customer Green/Blue (Q1-Q3)
❌ Sebum Subtype: Mild vs High differentiation
   - Need flag: sebumSubtype: 'mild' | 'high'
   - Mild: Blue/Yellow with gentle treatment
   - High: Red with stronger actives

// ACNE
✅ Acne Basic Detection (Q1-Q5)
❌ Acne → Post-Acne Pigmentation Cascade
   - If Q2=Yes (red/brown spots) + Q1=None + Q5=None → Route to pigmentation
   - Ask follow-up: "What color are the spots? Red or Brown?"
❌ Acne → Comedonal vs Inflammatory differentiation
   - Current: Basic logic
   - Needed: More sophisticated mixed acne detection
❌ Acne Hormonal Pattern Detection
   - Q1=Yes AND Q2=Yes → Suggest medical consult
❌ Acne Situational Detection
   - Q4=Yes → Flag for situational acne routine + existing acne type
❌ Acne Pregnancy Gate
   - Q5=Yes → Set pregnancySafe flag + suggest derm if moderate/severe

// PORES
⚠️ Pores: Machine Large → Ask comedonal cascade
   - If Q2=Yes (blackheads) → Ask "How many blackheads? (<10 / 10-20 / >20)"
⚠️ Pores: Machine Small → Ask comedonal cascade
   - If Q3=Yes (blackheads) → Ask comedonal questions

// TEXTURE
❌ Texture Bumpy: Differentiate between pimples/dots/dandruff
   - Q1 answer determines routing:
     - Pimples → Acne follow-ups
     - Tiny dots + Forehead → Dandruff check
     - Tiny dots + Other → Pores (yellow) or Comedonal acne
❌ Texture Aging: Age-based or visible aging concerns
   - Current: Only age>35 check
   - Needed: Q about fine lines, loss of elasticity

// PIGMENTATION
✅ Pigmentation: Machine Present → Set Yellow (both PIE/PIH)
✅ Pigmentation: Machine Not Present → Set Yellow
❌ Pigmentation Type: Red vs Brown differentiation
   - Need to ask: "What color are your marks? Red, Brown, or Mixed?"
   - Route to PIE or PIH based on answer
```

### 3.2 AM/PM Scheduler Enhancements

```typescript
// src/services/scheduler.ts

// ADD: Ingredient-specific AM/PM rules
❌ BHA: If <2%, allow AM with SPF. If ≥2%, PM only.
❌ AHA: If <5%, allow AM with SPF. If ≥5%, PM only.
❌ Benzoyl Peroxide: Prefer PM, can do AM if low concentration.
❌ Tranexamic Acid: Prefer AM for synergy with sunscreen.
❌ Vitamin C Derivatives: Prefer AM for brightening + antioxidant protection.

// ADD: Concentration awareness
⚠️ Current flags track acid_strength: 'low' | 'medium' | 'high'
   - Use this to determine AM eligibility

// ADD: Photosensitivity warnings
❌ If AHA/BHA in routine → Add note: "Increases sun sensitivity. Use SPF."
❌ If Retinoid in routine → Add note: "Use SPF50+. Sun exposure can cause irritation/hyperpigmentation."

// ADD: Ingredient synergy optimization
❌ If Vitamin C + Retinoid → Prefer separate AM/PM (morning VC, evening retinoid)
❌ If Niacinamide + Retinoid → Can combine (caution pair, but generally safe)
❌ If Azelaic + Retinoid → Can combine but better split AM/PM

// ADD: Sensitivity-based rest days
✅ Current: Calculates rest nights for sensitivity_band='red'
⚠️ Needed: Gradual phase-in for new actives (first week: 2x weekly, then 3-5x)

// ADD: Cost optimization per AM/PM
⚠️ Current: Calculates nightly costs
❌ Needed: Separate AM cost (usually lower, more hydration-focused)
```

### 3.3 Supabase Schema Updates Needed

```sql
-- Update product defaults for all ingredients
UPDATE product SET default_usage = 'am' 
WHERE slug LIKE '%vitamin-c%' OR slug LIKE '%tranexamic%' OR slug LIKE '%niacinamide%';

UPDATE product SET default_usage = 'pm' 
WHERE slug LIKE '%retinol%' OR slug LIKE '%adapalene%' OR slug LIKE '%glycolic%' OR slug LIKE '%salicylic%';

UPDATE product SET default_usage = 'both' 
WHERE slug LIKE '%peptide%' OR slug LIKE '%ceramide%' OR slug LIKE '%cleanser%' OR slug LIKE '%moisturizer%' OR slug LIKE '%sunscreen%';

-- Add metadata columns for scheduler optimization
ALTER TABLE product ADD COLUMN IF NOT EXISTS acid_strength TEXT;
-- Values: NULL (not an acid), 'low' (<2% BHA, <5% AHA), 'medium', 'high'

ALTER TABLE product ADD COLUMN IF NOT EXISTS photosensitivity_warning BOOLEAN DEFAULT FALSE;
-- TRUE for: AHA, BHA, Retinoids, Benzoyl Peroxide

ALTER TABLE product ADD COLUMN IF NOT EXISTS am_pm_notes TEXT;
-- Examples: "Prefer AM with sunscreen", "Night only", "Can use both"
```

### 3.4 Form Updates Needed

```typescript
// src/components/UpdatedConsultForm.tsx

// ADD: Sebum severity question (if sebum concern selected)
❌ "How severe is your oiliness?" 
   → Mild (slight T-zone), Moderate (multiple areas), Severe (all-day)

// ADD: Pigmentation color question (if pigmentation concern selected)
❌ "What color are your marks?"
   → Red/Pink, Brown/Dark, Mixed

// ADD: Acne type differentiation (if acne + bumpy selected)
❌ "Is the bumpy texture from:"
   → Active pimples/breakouts, Tiny non-inflamed dots, Doesn't feel raised (scars)

// ADD: Acne + Hormonal pattern detection
❌ If acne selected: "Do breakouts follow a pattern? Monthly, around periods, etc.?"

// ADD: Display AM/PM information in recommendations
⚠️ Currently: Shows AM/PM schedule but no rationale
   Needed: Add tooltips explaining "Why PM?" for each ingredient
```

---

## Part 4: Testing & Validation

### 4.1 Scenarios to Test

```
Decision Rules Testing:
❌ Scenario: Moisture Machine Red + Customer Green + uses retinoids
   Expected: Auto-resolve to Blue + flag heightened sensitivity
   Current: Should work but not tested

❌ Scenario: Acne Machine Present + Customer None + Reports red/brown marks
   Expected: Post-acne pigmentation path with color cascade
   Current: Incomplete

❌ Scenario: Texture Bumpy Machine Red + Customer Green + Forehead location
   Expected: Suggest dandruff check
   Current: Not implemented

❌ Scenario: Acne Female + Reports jawline breakouts + Q4=1-5 + Q3=Yes (cycle change)
   Expected: HORMONAL ACNE flag + suggest medical consult
   Current: Incomplete

AM/PM Scheduler Testing:
❌ Scenario: Recommendation includes 2% Salicylic acid serum
   Expected: PM only routing (even though 2% is borderline)
   Current: Might appear in AM

❌ Scenario: Recommendation includes Vitamin C + Retinoid
   Expected: Separate AM (VC) and PM (Retinoid)
   Current: Might get same-day layering

❌ Scenario: AHA 6% + BHA 2% in same routine
   Expected: Separate days or phases
   Current: Might suggest both PM same day

❌ Scenario: Benzoyl Peroxide 2.5% + high sensitivity
   Expected: PM only, with extended rest days
   Current: Might allow AM on sensitive skin
```

---

## Part 5: Implementation Priority & Timeline

### Phase 1: High Priority (1-2 weeks)

1. **Add Missing Decision Rule Cascades** (3-4 days)
   - Implement Acne → Post-Acne Pigmentation path
   - Add Sebum Subtype detection (Mild vs High)
   - Wire Pores → Comedonal acne cascade

2. **Enhance AM/PM Scheduler** (2-3 days)
   - Add BHA/AHA concentration-aware timing
   - Add Benzoyl Peroxide PM preference
   - Add photosensitivity warnings

3. **Update Supabase Product Defaults** (1 day)
   - Populate default_usage for all 88 products
   - Add acid_strength metadata
   - Add photosensitivity_warning flags

### Phase 2: Medium Priority (1-2 weeks)

4. **Add Form Questions** (2-3 days)
   - Sebum severity differentiation
   - Pigmentation color question
   - Acne type/trigger clarification
   - Hormonal pattern detection

5. **Improve Decision Logic** (2-3 days)
   - Texture bumpy differentiation (pimples vs dots vs dandruff)
   - Acne hormonal pattern validation
   - Acne pregnancy gate implementation
   - Situational acne routing

### Phase 3: Nice-to-Have (1 week)

6. **Scheduler Optimization** (2-3 days)
   - Cost breakdown per AM vs PM
   - Phase-in recommendations for new actives
   - Ingredient synergy notes
   - Rest day budgeting per sensitivity

7. **Admin UI Enhancements** (2-3 days)
   - Product AM/PM configuration
   - Acid strength management
   - Photosensitivity warning display
   - Test/validate rule outcomes

---

## Part 6: Code Examples

### Example: Missing Sebum Subtype Logic

```typescript
// ADD to src/services/recommendationEngineMatrix.ts

function inferSebuSubtype(context: RecommendationContext): 'mild' | 'high' {
  const effectiveBands = deriveEffectiveBands(context);
  const sebumBand = toBandColor(effectiveBands.sebum);
  
  // Check for high sebum indicators
  const sebumSeverity = context.decisionEngine?.flags?.sebumSeverity; // "mild" | "high"
  if (sebumSeverity === 'high') return 'high';
  if (sebumSeverity === 'mild') return 'mild';
  
  // Fallback to band
  if (sebumBand === 'red') return 'high';
  if (sebumBand === 'blue' || sebumBand === 'yellow') return 'mild';
  return 'mild';
}

// Then in collectConcernSelections():
case 'sebum':
  subtype = inferSebuSubtype(context); // ← NOW RETURNS 'mild' or 'high'
  band = toBandColor(effectiveBands.sebum) || 'blue';
  break;
```

### Example: Missing AM/PM BHA Logic

```typescript
// UPDATE in src/services/scheduler.ts

function decideAMSerum(key: string | undefined, flags: SchedulerInput['flags']): string | undefined {
  if (!key) return undefined;
  
  const tag = serumKeyToTag(key);
  
  // Retinoids: never AM ✅
  if (tag === 'retinoids') return undefined;
  
  // BHA: Only AM if <2% and high SPF present
  if (tag === 'bha') {
    const strength = flags?.secondary_acid_strength || flags?.core_acid_strength;
    if (strength === 'high' || strength === 'medium') return undefined; // PM only
    if (strength === 'low') return key; // OK for AM with SPF
    return undefined; // Default to PM for BHA
  }
  
  // AHA: Only AM if <5% and high SPF present
  if (tag === 'aha') {
    const strength = flags?.secondary_acid_strength || flags?.core_acid_strength;
    if (strength === 'high' || strength === 'medium') return undefined; // PM only
    if (strength === 'low') return key; // OK for AM with SPF
    return undefined; // Default to PM for AHA
  }
  
  // Vitamin C derivatives: prefer AM
  if (key === 'vitamin-c') return key;
  
  // Tranexamic: prefer AM
  if (tag === 'tranexamic') return key;
  
  // Others flexible
  return key;
}
```

---

## Summary Table

| Component | Current | Needed | Priority | Effort |
|-----------|---------|--------|----------|--------|
| Decision Rules | 50% | 100% | High | 3-4 days |
| AM/PM Scheduler | 40% | 100% | High | 2-3 days |
| Product Defaults | 0% | 100% | High | 1 day |
| Form Questions | 50% | 100% | Medium | 2-3 days |
| Admin UI | 10% | 100% | Medium | 2-3 days |
| Testing | 20% | 100% | High | 2-3 days |
| **Total** | **32%** | **100%** | — | **12-16 days** |

---

**Document Version:** 1.0  
**Last Updated:** October 18, 2025  
**Status:** Implementation audit complete, detailed action items documented
