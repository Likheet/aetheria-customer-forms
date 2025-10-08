# Updated Client Consult – Reference & Verification Guide

This document is the working companion to the spreadsheet that defines the consult flow. Update it whenever the sheet changes so the UI (`src/components/UpdatedConsultForm.tsx`), follow-up rules (`src/lib/decisionRules.ts`), and recommendation engine (`src/services/recommendationEngine.ts`) stay in sync.

---

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
- “What kind of breakouts do you usually notice?” (Blackheads / Whiteheads / Red pimples / Large painful bumps / Monthly jawline flares)
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
- Preferred moisturizer texture (Gel / Lotion / Cream / Rich Balm)

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

## 3. Product Recommendation Engine Overview

`src/services/recommendationEngine.ts` converts the form + decision output into specific products and schedules.

- **Inputs**:  
  - `effectiveBands` from the decision engine (worst-wins after follow-ups)  
  - Decision history per rule (for flags/A/B testing)  
  - Form data (gates, concerns, budget, serum comfort, etc.)
- **Safety Gates**: Pregnancy, isotretinoin, barrier stress, and allergy entries build a disallow set of actives so retinoids, strong acids, or BPO are removed automatically when unsafe.
- **Concern Prioritisation**: `extractActiveConcerns` + `findPrimaryConcern` pick the highest-severity concern (worst band wins, filtered by the client’s selected priorities). Each concern maps to helper routines (`getAcneRecommendation`, `getSebumRecommendation`, `getPigmentationRecommendation`, `getTextureRecommendation`, `getPoresRecommendation`).
- **Product Selection**: Helpers choose SKUs from `PRODUCT_DATABASE` based on concern, price tier (derived from `budget`), skin type, and safety. Returns cleanser, core serum, optional secondary serum, moisturizer, and sunscreen. Internal metadata (`_keys`, `_flags`) preserves the chosen active families.
- **Adjustments**: `adjustForIsotretinoinAndAllergies` swaps out unsafe items post-selection. Serum counts respect `serumComfort` and compatibility from `ingredientInteractions`.
- **Scheduling**: When product keys are available, `buildWeeklyPlan` (in `src/services/scheduler.ts`) generates AM/PM schedules plus a customer-facing summary, with barrier-first variants when required.
- **Fallbacks**: If no concern-specific match exists, the engine falls back to skin-type defaults, then to a general gentle routine so recommendations are never empty.

When the spreadsheet changes:
1. Confirm concern categories in the sheet still map to existing helper functions; add new helpers if a new concern appears.  
2. Extend safety logic if new gates or contraindications exist.  
3. Update this README with any new recommendation rules or terminology so manual verification remains quick.

---

Keeping the README, spreadsheet, and codebase aligned ensures edits propagate predictably. Whenever the spreadsheet changes, update `decisionRules.ts`, validate flows, refresh this README, and run the usual checks before shipping. *** End Patch
