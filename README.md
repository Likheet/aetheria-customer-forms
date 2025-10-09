# Updated Client Consult – Reference & Verification Guide

This document is the working companion to the spreadsheet that defines the consult flow. Update it whenever the sheet changes so the UI (`src/components/UpdatedConsultForm.tsx`), follow-up rules (`src/lib/decisionRules.ts`), and recommendation engine (`src/services/recommendationEngine.ts`) stay in sync.

---

## Automated validation

- `pnpm run test:acne-complete` — runs the TypeScript harness in `scripts/testAcneComplete.ts` to exercise eight end-to-end acne scenarios (machine mismatches, subtype escalations, pregnancy safety, situational flares, and hormonal patterns). Use it after updating decision rules or recommendation logic to confirm the flows stay aligned with the spec.

## 1. Form Flow (Updated Client Consult)

Static questions are grouped into sections; dynamic follow-ups are listed under the trigger that reveals them.

### Section: Personal Information
- Name — “What is your full name?”
- Phone Number — “What is your phone number?”
- Date of Birth — “What is your date of birth?”
- Gender — “What is your gender?” (Male / Female / Other)

### Section 0 — Hard Gates
- Pregnancy Status — “Are you currently pregnant or trying to conceive?” (Yes / No)  
  - Yes → block retinoids, high-dose salicylic acid (>2%), strong peels, and oral tranexamic. Allow azelaic, niacinamide, and vitamin C derivatives (cautiously). Sets `block_retinoids=true`.
- Recent Isotretinoin — “Have you used isotretinoin (Accutane) in the last 6 months?” (Yes / No)  
  - Yes → block retinoid initiation and in-clinic procedures; allow only low-irritant topicals. Sets `procedural_contraindicated=true`.
- Severe Acne Assessment — “Do you currently have severe cystic acne with deep, painful nodules?” (Yes / No)  
  - Yes → refer to dermatologist; recommend soothing barrier care + SPF only. Sets `referral_required=true`.
- Known Allergies — “Do you have any known allergies to skincare ingredients?” (Yes / No)  
  - Yes → block conflicting SKUs and mark `product_allergy_conflict`.
- Skin Barrier Health — “Is your skin currently severely compromised, irritated, or over-exfoliated?” (Yes / No)  
  - Yes → force barrier-first routine (no retinoids/BHA/AHA/BPO). Sets `phase0_required=true`.

### Section A — Skin Basics
- “What do you think your skin type is?” (Normal / Oily / Dry / Combination)
- “How would you describe your skin’s oil levels?” (maps to Sebum band)  
  - Comfortable, no shine or greasiness → Green  
  - Slight shine only in T-zone, not bothersome → Blue  
  - Noticeable shine in multiple areas → Yellow  
  - Very greasy/heavy shine across face, frequent blotting/wash needed → Red
- “How would you describe your skin’s hydration levels?” (maps to Moisture band)  
  - Comfortable, no tightness → Green  
  - Slight tightness or occasional dryness → Blue  
  - Often feels tight, rough, or flaky → Yellow  
  - Always feels very tight, itchy, or cracks/peels → Red
- Sensitivity screening (all customers answer):  
  1. Redness/burning/stinging with skincare products? (Yes / No)  
  2. Ever diagnosed with sensitive skin, rosacea, or eczema? (Yes / No)  
  3. Skin baseline very dry (tight, flaky, rough)? (Yes / No)  
  4. Breakouts or irritation when using actives (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)? (Yes / No)  
  5. Easily irritated by sun, heat, wind, or pollution? (Yes / No)  
  6. Visible broken capillaries or flushing (cheeks, nose, etc.)? (Yes / No)  
  7. Under 20 years of age? (Yes / No)

### Section B — Current Skin History
- Diagnosed skin conditions? (textarea)
- Prescription treatments used? (textarea)
- Professional treatments in the last 6 months? (textarea)

### Section C — Current Skincare Routine
- “What products are you using daily?” → repeated rows capturing product name (autocomplete) + how long (Less than 1 month / 1–3 months / 3–6 months / 6–12 months / 1–2 years / 2+ years)
- “Any product that caused irritation/breakouts/redness?” → tag/chip input

### Section D — Main Concerns (choose up to three)
- Acne (`ACNE`)
- Pigmentation (`PIGMENTATION_UV`)
- Fine lines & wrinkles (aging) (`TEXTURE`)
- Bumpy skin (`TEXTURE`)
- Large pores (`PORES`)

Concern selection injects targeted follow-ups:

#### Acne Concern
- “What kind of breakouts do you usually notice?” (Blackheads / Whiteheads / Red pimples (inflame) / Large painful bumps (refer dermat) / Monthly jawline flares)
- Severity ladders for each subtype:  
  - Blackheads: ≤10 → Blue, 11–30 → Yellow, 30+ → Red  
  - Whiteheads: ≤10 → Blue, 11–20 → Yellow, 20+ → Red  
  - Red pimples: 1–3 → Blue, 4–10 → Yellow, 10+ → Red  
  - Cystic acne: Rare (≤1 in last 2 weeks) → Blue, 1–3 per week → Yellow, ≥4 per week → Red  
  - Hormonal acne: Mild monthly flare (1–3) → Blue, Several lasting ~1 week → Yellow, Multiple cysts lasting >1 week → Red

#### Pigmentation Concern
- “What type do you experience?” (Red / Brown)  
  - Red severity: Light small area → Blue, Moderate several zones → Yellow, Bright/deep widespread → Red  
  - Brown severity: Light patches small area → Blue, Moderate spots/patches in several areas → Yellow, Dark or widespread patches → Red

#### Fine Lines & Wrinkles
- A few fine lines or slight looseness → Blue  
- Wrinkles or sagging across several areas → Yellow  
- Deep wrinkles or obvious sagging → Red

#### Bumpy Skin
- Only noticeable by touch → Blue  
- Uneven or bumpy across areas → Yellow  
- Coarse congestion/bumpy everywhere → Red

#### Large Pores
- Noticeable near the nose or only on close inspection → Blue  
- Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow  
- Large, obvious pores across the face, visible from a distance → Red

> Sensitivity is already captured in Section A, so it isn’t a selectable concern.

### Section E — Lifestyle Inputs
- Diet (Balanced / Oily & spicy / Vegetarian / High sugar)
- Water intake (Low / Medium / High)
- Sleep (Less than 5 / 5–7 / 7+ hours)
- Stress (Low / Medium / High)
- Environment (Polluted city / Humid climate / Dry weather / Indoors A/C / Outdoors sun)

### Section F — Willingness & Preferences
- Routine steps comfortable with (3-step / 4-step / 5+ step)
- Serum comfort (1 / 2 / 3)
- Preferred moisturizer texture (Gel / Lotion / Cream / Rich Balm) REMOVE

### Legal Disclaimer
- Five individual acknowledgements (non-medical advice, consult dermatologist, patch test, discontinue on irritation, accurate disclosure)
- Master acknowledgement auto-checks once all individual boxes are ticked

### Miscellaneous Fields
- Allergies (free text)
- Pregnancy / Breastfeeding (free text)
- Medications (free text)

---

## 2. Rule-Based Follow-ups (Decision Engine)

`src/lib/decisionRules.ts` is the canonical spec for follow-up prompts and machine/customer reconciliation. The UI reads it to show questions; the runtime evaluates outcomes and flags. When the spreadsheet changes, update this file and verify against the tables below.

### Moisture
- `moisture_machineLow_customerNormal`  
  - Trigger: machine Moisture ∈ {red, yellow}, self Moisture ∈ {green, blue}  
  - Outcome: Moisture → Blue (note to keep oil-control if persistent shine)
- `moisture_machineNormal_customerDry`  
  - Trigger: machine Moisture ∈ {green, blue}, self Moisture ∈ {red, yellow}  
  - Questions:  
    - Q2 Tight all day even after moisturizer? (Yes/No)  
    - Q3 Visible flaking/rough patches? (Yes/No)  
    - Q4 Actives/meds in last 4 weeks? (Retinoids, BPO, AHA/BHA, Adapalene, Isotretinoin, None) [multi]
  - Outcomes:  
    - Q2=Yes AND Q3=Yes → Moisture Red (true dry / compromised barrier)  
    - Q2=Yes OR Q3=Yes OR Q4 includes Retinoids/Isotretinoin/Adapalene → Moisture Yellow (barrier repair focus)  
    - Q2=No AND Q3=No AND Q4 excludes Retinoids/Isotretinoin → Moisture Blue (trust machine)

### Sebum
- `sebum_machineNormal_customerOily`  
  - Trigger: machine Sebum ∈ {green, blue}; self Sebum ∈ {red, yellow}  
  - Questions: Q1 blotting frequency, Q2 shine distribution, Q3 mattifying or clay within 24h, Q5 mattifying primer/powder within 8h  
  - Outcomes:  
    - Q1≥3x/day AND Q2=All over → Sebum Red (true oily)  
    - Q1≥3x/day OR Q2=All over → Sebum Yellow (oily tendency)  
    - Q2=T-zone AND Q1=1–2x/day → Sebum Yellow + `combination-skin`  
    - Q3=Yes OR Q5=Yes → Sebum Blue + `product-film` (cleanse/reset, reassess)  
    - Default → Sebum Blue (machine reading stands)
- `sebum_machineOily_customerNormal`  
  - Trigger: machine Sebum ∈ {yellow, red}; self Sebum ∈ {green, blue}  
  - Questions: Q1 shine within 2–4h; Q2 blackheads/whiteheads; Q3 heavy creams/oils/sunscreens  
  - Outcomes:  
    - Q1=Yes AND Q2=Yes AND Q3=No → Sebum Red (machine correct)  
    - (Q1 XOR Q2)=Yes AND Q3=No → Sebum Yellow (monitor oil)  
    - (Q1 OR Q2)=Yes AND Q3=Yes → Sebum Yellow + `optimize-products`  
    - Q1=No AND Q2=No AND Q3=Yes → Sebum Blue (product-induced shine)  
    - Q1=No AND Q2=No AND Q3=No → Sebum Green (possible lighting artifact)

### Acne – Presence
- `acne_machinePresence_customerNone`  
  - Trigger: machine Acne ∈ {yellow, red}; self claim ∈ {green, blue}  
  - Questions:  
    - Q1 New bumps last 2 weeks? (None / 1–2 / Several)  
    - Q2 Flat red/brown spots without bump? (Yes/No)  
    - Q3 Monthly breakouts around periods/jawline? (Yes/No/NA)  
    - Q4 Frequent tiny bumps/blackheads/whiteheads? (Yes/No)  
    - Q5 Inflamed pimples now? (None / 1–5 / 6–15 / >15)
  - Outcomes:  
    - Q2=Yes & Q5>15 → Acne Red + inflammatory flag + `refer-derm`  
    - Q2=Yes & Q5=6–15 → Acne Red + inflammatory flag  
    - Q2=Yes & Q5=1–5 → Acne Yellow + inflammatory flag  
    - Q2=Yes & Q1∈{None,1–2} & Q5=None → Acne Green + `shift-focus-to-PIH/PIE`  
    - Q5>15 → Acne Red + inflammatory flag + `refer-derm`  
    - Q5=6–15 → Acne Red + inflammatory flag  
    - Q5=1–5 → Acne Yellow + inflammatory flag  
    - Q4=Yes → Acne Yellow + `acne-category:Comedonal`  
    - Q1=Several → Acne Yellow + inflammatory flag  
    - Q1=1–2 OR Q3=Yes → Acne Blue (+ hormonal flag when Q3=Yes)  
    - Default → Acne Green (machine false positive)
- `acne_machineClear_customerPresence`  
  - Trigger: machine Acne ∈ {green, blue}; self claim ∈ {yellow, red}  
  - Questions: Q1 inflamed count; Q2 deep nodules; Q3 comedone count; Q4 trigger flare; Q5 pregnant/breastfeeding  
  - Outcomes:  
    - Q2=Yes OR Q1≥15 → Acne Red + `refer-derm`  
    - Q3≥20 → Acne Red + comedonal congestion  
    - Q1=6–15 & Q2=No → Acne Red + inflammatory flag  
    - Q3=10–20 → Acne Yellow + `acne-category:Comedonal`  
    - Q1=1–5 → Acne Yellow + mild inflammatory flag  
    - Q3∈{None,<10} → Acne Blue + comedonal flag  
    - Q1<5 & Q3<10 & Q4=Yes → Acne Blue + `acne-category:Situational acne`  
    - Q5=Yes → Acne Blue + `pregnancy-filter`  
    - Q1=None & Q3∈{None,<10} & Q4=No → Acne Green (machine false positive)

### Sensitivity
- `sensitivity_placeholder` mirrors the spreadsheet note. The seven sensitivity questions live directly in the form.

### Pores
- `pores_machineHigh_customerNormal`  
  - Trigger: machine Pores ∈ {red, yellow}; self Pores ∈ {green, blue}  
  - Questions: Q1 visible at arm’s length; Q2 blackheads nose/cheeks; Q3 oiliness self-report  
  - Outcomes:  
    - Q1=No & Q2=Yes → Pores Blue + `followup:acne-comedonal`  
    - Q1=Yes & Q3=High → Pores Yellow (trust machine)  
    - Q1=Yes OR Q3=High → Pores Blue (mild support)  
    - Q1=No & Q2=No & Q3∈{Low,Normal} → Pores Green (cosmetic only)
- `pores_machineNormal_customerConcerned`  
  - Trigger: machine Pores ∈ {green, blue}; self Pores ∈ {red, yellow}  
  - Questions: same as above  
  - Outcomes:  
    - Q1=No & Q2=Yes → Pores Red (customer perception validated)  
    - Q1=No & Q2=No & Q3=Yes → Pores Yellow + comedonal follow-up flag  
    - Q1=No & Q2=No → Pores Green (set expectations)  
    - Q1=Yes & Q2=No & Q3=Yes → Pores Yellow (blackhead maintenance)  
    - Q1=Yes & Q2=No & Q3=No → Pores Blue (visible only under harsh light)  
    - Q1=No OR Q2=Yes → Pores Yellow (general pore care)

### Texture
- `texture_machineSmooth_customerAging`  
  - Trigger: machine Texture ∈ {green, blue}; self Texture ∈ {red, yellow}  
  - Outcomes: age > 35 → Texture Yellow (anti-aging routine), otherwise Texture Blue
- `texture_machineSmooth_customerBumpy`  
  - Trigger: machine Texture ∈ {green, blue} (customer reports bumpy)  
  - Questions: Q1 description, Q2 location, Q3 dandruff/oily scalp  
  - Outcomes:  
    - Q1=Pimples/breakouts → route to Acne (`route:acne`)  
    - Q1=Tiny dots & Q2=Forehead & Q3=Yes → Texture Blue + `suggest:scalp-analysis`  
    - Q1=Tiny dots & Q2=Forehead & Q3=No → Texture Blue (localized unevenness)  
    - Q1=Tiny dots & Q2∈{Chin,Cheeks,All over} → Pores Yellow (comedonal congestion)  
    - Q1=Just uneven & Q2=Forehead → Texture Blue + scalp-analysis flag  
    - Q1=Just uneven & Q2∈{Chin,Cheeks,All over} → Texture Yellow (bumpy texture routine)
- `texture_machineBumpy_customerSmooth`  
  - Trigger: machine Texture ∈ {red, yellow}; self Texture ∈ {green, blue}  
  - Questions: Q1 area, Q2 acne scars, Q3 age > 40, Q4 dandruff/oily scalp  
  - Outcomes:  
    - Q1=Forehead & Q4=Yes → Texture Blue + `suggest:scalp-analysis`  
    - Q1∈{Chin,Cheeks,Other} → Pores Yellow (oil-related bumps)  
    - Q2=Yes → Texture Blue + `followup:scar-type`  
    - Q1=No & Q2=No & Q3=Yes → Texture Yellow (anti-aging routine)  
    - Default → Texture Green (no action needed)

### Pigmentation
- `pigmentation_machineHigh_customerNormal_brown` → set Pigmentation (Brown) Yellow when machine shows an issue and customer denies it.  
- `pigmentation_machineNormal_customerHigh_brown` → set Pigmentation (Brown) Yellow when customer reports issue but machine is clear.  
- `pigmentation_machineNormal_customerHigh_red` → set Pigmentation (Red) Yellow when customer reports redness but machine is clear.

### Editing & Verification Workflow
1. Update `src/lib/decisionRules.ts` to match spreadsheet prompts, options, and logic.  
2. Run `npm run lint` to catch syntax mistakes (lint covers the whole repo; unrelated lint debt may appear).  
3. Spot-check scenarios via `src/lib/decisionEngine.examples.ts` or console logging of `getFollowUpQuestions` / `decideBandUpdates`.  
4. Use `npm run dev` to confirm UI follow-ups in the relevant mismatch scenarios.  
5. Update this README in the same change so future spreadsheet edits are easy to verify.

---

## 3. Product Recommendation Engine Overview (Matrix System)

`src/services/recommendationEngine.ts` now re-exports the matrix-driven engine in `src/services/recommendationEngineMatrix.ts`. The engine resolves every routine by walking a 4D concern matrix (concern → subtype → skin type → band) and then applies safety, compatibility, and scheduling logic before returning structured AM/PM plans.

- **Core data** live in `src/data/concernMatrix.ts`. Each matrix row stores product metadata (name, ingredient tags, usage defaults) per slot.
- **Compatibility** continues to be enforced via `src/services/ingredientInteractions.ts`. Matrix products carry ingredient tags so the serum layering logic can reuse the existing compatibility matrix.
- **Decision inputs** come from the consult form and decision engine. An acne-first override runs before any band comparison.
- **Safety gates** (pregnancy, isotretinoin, barrier compromise, allergies) swap unsafe products for vetted alternatives and append notes so consultants understand what changed.
- **Outputs** include the historical fields plus two new arrays: `am` and `pm`, listing products in application order. These align with the weekly schedule generator (`buildWeeklyPlan`) but are constructed directly inside the recommendation function.

### 3.1 Adding Products to the Concern Matrix

Use `registerProduct` inside `src/data/concernMatrix.ts` to describe aliases, ingredient tags, usage defaults, and any safety flags. Then map raw CSV values to `MatrixProduct`s via the helper functions already in that file.

```ts
// src/data/concernMatrix.ts
registerProduct(['Superhero Retinol 0.3%'], {
  ingredientTags: ['retinoids'],
  ingredientKeywords: ['retinol', 'encapsulated retinoid'],
  defaultUsage: 'pm',
  pregnancyUnsafe: true,
  isotretinoinUnsafe: true,
});

// Add a CSV row (concern, subtype, skin type, band, slots…)
const RAW_MATRIX = `Concern,Subtype,SkinType,Band,Cleanser,CoreSerum,SecondarySerum,Moisturizer,Sunscreen,Remarks
Texture,Aging,Combo,Yellow,Gentle foaming,Superhero Retinol 0.3%,Vitamin C,Gel-cream,SKINTYPE_DEFAULT,Encapsulated retinol upgrade
${RAW_MATRIX}`;
```

Key steps:
1. **Register aliases** with `registerProduct` so ingredient tags and safety flags are available.
2. **Reference the product** in the CSV block. Unknown strings throw during startup, making it obvious when metadata is missing.
3. **Run `pnpm tsc --noEmit`** to ensure the matrix parses correctly.

### 3.2 Updating Ingredient Compatibility Rules

Compatibility remains centralized in `src/services/ingredientInteractions.ts`. To block or caution new pairs, extend the `disallow` or `caution` arrays. Tags referenced here must match the values emitted by `serumKeyToTag`.

```ts
// src/services/ingredientInteractions.ts
const disallow: Array<[IngredientTag, IngredientTag]> = [
  ['retinoids', 'vitamin_c_ascorbic'],
  ['aha', 'bha'],
  ['tranexamic', 'benzoyl_peroxide'], // new block
];

export function serumKeyToTag(key?: string): IngredientTag | null {
  switch ((key || '').toLowerCase()) {
    case 'tranexamic-acid':
      return 'tranexamic';
    // …
  }
}
```

1. Add the tag to `serumKeyToTag` (or the moisturizer/sunscreen tag helpers).
2. Update the compatibility tables.
3. Adjust product metadata in `concernMatrix.ts` so the new tag is emitted.

### 3.3 Acne Priority Override

As soon as the recommendation function receives the concern list, it searches for acne and promotes it to primary, regardless of severity band. The override is implemented in `selectPrimaryConcern`.

```ts
// src/services/recommendationEngineMatrix.ts
function selectPrimaryConcern(concerns: ConcernSelection[], notes: string[]) {
  const acneConcern = concerns.find(c => c.concern === 'acne');
  if (acneConcern) {
    notes.push('Acne priority override applied.');
    const others = concerns.filter(c => c !== acneConcern);
    return { primary: acneConcern, others };
  }
  const [first, ...rest] = concerns;
  return { primary: first ?? null, others: rest };
}
```

If acne is absent, worst-band logic (red → yellow → blue → green) governs the selection. All triggered rules append to the `notes` array returned with every recommendation.

### 3.4 Safety Gates & Substitutions

Safety gates run after the primary routine is assembled. Each gate swaps unsafe items for alternative matrix products and documents the change.

```ts
// src/services/recommendationEngineMatrix.ts
function applyPregnancySafety(routine: RoutineState, context: RecommendationContext, notes: string[]) {
  if (!isPregnancySafe(context)) return;
  const replaceIfUnsafe = (product: MatrixProduct, target: 'core' | number) => {
    const tags = product.ingredientTags;
    if (tags.includes('retinoids') || tags.includes('benzoyl_peroxide') || tags.includes('bha')) {
      const safe = instantiateProduct('Azelaic acid 10%', product.slot);
      replaceSerum(target, routine, safe, notes, 'Pregnancy safety');
    }
  };
  replaceIfUnsafe(routine.coreSerum, 'core');
  routine.secondarySerums.forEach((serum, idx) => replaceIfUnsafe(serum, idx));
}
```

Related helpers (`applyIsotretinoinSafety`, `applyAllergySafety`, and the barrier-first routine) normalise cleansers, moisturisers, and serums while logging explanatory notes so consultants can explain the substitutions.

### 3.5 AM/PM Routing

AM/PM arrays are generated directly from product tags. Retinoids and peptides remain PM-only, while vitamin C (L-AA) and tranexamic acid default to AM. Sunscreen only appears in AM.

```ts
// src/services/recommendationEngineMatrix.ts
function serumTiming(product: MatrixProduct): 'am' | 'pm' | 'both' {
  if (product.ingredientTags.includes('retinoids')) return 'pm';
  if (product.ingredientTags.includes('vitamin_c_ascorbic') || product.ingredientTags.includes('tranexamic')) return 'am';
  if (product.ingredientTags.includes('azelaic') || product.ingredientTags.includes('niacinamide')) return 'both';
  // …
}

function buildAmPmRoutines(routine: RoutineState) {
  const serums = [routine.coreSerum, ...routine.secondarySerums];
  const am = [routine.cleanser.name, ...serums.filter(s => ['am', 'both'].includes(serumTiming(s))).map(s => s.name), routine.moisturizer.name, routine.sunscreen.name];
  const pm = [routine.cleanser.name, ...serums.filter(s => ['pm', 'both'].includes(serumTiming(s))).map(s => s.name), routine.moisturizer.name];
  return { am, pm };
}
```

These arrays are always cleanser → serums → moisturizer (+ sunscreen in AM), so downstream UI can render a consistent stacked routine without re-deriving timing rules.

### 3.6 Troubleshooting Missing Matrix Entries

Missing matrix data bubbles up via `notes` and throws during parsing when possible. Use the following checklist when a concern returns an unexpected fallback:

```ts
// src/services/recommendationEngineMatrix.ts
const entry = fetchMatrixEntry(primary, skinType, notes);
if (!entry) {
  notes.push(`Matrix entry missing for ${primary.concern} ${primary.subtype}.`);
  routine = buildSkinTypeFallbackRoutine(skinType, notes);
}
```

1. **Check `notes`** in the result. A message like “Matrix entry missing for acne hormonal (Combo)” points to the exact key.
2. **Verify CSV rows** in `concernMatrix.ts`. Ensure the concern, subtype, skin type, and band string match the engine’s normalized keys.
3. **Confirm product aliases** are registered via `registerProduct`. Unknown product strings throw a build-time error.
4. **Run `pnpm tsc --noEmit`** after changes—the matrix parser executes at module load and will throw if the CSV contains invalid data.

Keeping these sections updated ensures that consultants, developers, and QA engineers can add new content confidently without breaking the recommendation flow.

---

Keeping the README, spreadsheet, and codebase aligned ensures edits propagate predictably. Whenever the spreadsheet changes, update `decisionRules.ts`, validate flows, refresh this README, and run the usual checks before shipping. 
*** End Patch
