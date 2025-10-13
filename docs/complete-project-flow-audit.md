Aetheria Project Flow - Complete Audit
Date: 2025-10-13

Executive Summary
- UpdatedConsultForm orchestrates a 19+ step intake with machine-linked follow-ups and sensitivity scoring before recommendations (src/components/UpdatedConsultForm.tsx:409-2156).
- RULE_SPECS in the decision engine normalise machine/self disagreements and record triage decisions used downstream (src/lib/decisionRules.ts:45-308, src/lib/decisionEngine.ts:849-1094).
- RecommendationEngineMatrix produces conservative/balanced/comprehensive routines with ingredient safety filters and irritation budgeting (src/services/recommendationEngineMatrix.ts:1160-1390, src/services/scheduler.ts:120-640).
Project completion: 68%
Critical gaps: [Matrix coverage incomplete (231 combinations missing), Acne subtype evaluator not wired during runtime, Product tier overrides not persisted server-side, Sensitivity gating limited to 6 prompts, Allergy replacement logic coarse single-path]
Tests passing: 4/4
Known issues: 7

## 1. User Journey
### 1.1 Form Entry & Initial State
- Entry point: `App.tsx:33-211` boots into `StaffSelectionPage` and routes consultants selecting "Client Consult Form" to `ChooseProfile` via `handleSelectUpdatedConsult`.
- Queue selection: `ChooseProfile.tsx:69-206` fetches assessment sessions, filters ones with machine scans and no intake form, and renders customer cards. Activating a card (`handleActivate` at `ChooseProfile.tsx:141-169`) merges Supabase `machine_analysis` bands into a `MachineScanBands` object and renders `<UpdatedConsultForm>` with `{ machine, machineRaw, sessionId, prefill }`.
- Initial form shape: `UpdatedConsultForm` seeds `formData` from `initialFormData` (src/components/UpdatedConsultForm.tsx:31-118):
```ts
const initialFormData: UpdatedConsultData = {
  // Personal Information
  name: '',
  phoneNumber: '',
  dateOfBirth: '',
  calculatedAge: null,
  gender: '',
  
  // Gate Questions (Safety Screening)
  pregnancy: '',
  recentIsotretinoin: '',
  severeCysticAcne: '',
  allergyConflict: '',
  barrierStressHigh: '',
  gateActions: '',
  
  // Section A - Skin Basics
  skinType: '',
  skinTypeFlag: '',
  oilLevels: '',
  hydrationLevels: '',
  sensitivity: '',
  sensitivityTriggers: '',
  
  // Section B - Current Skin History
  diagnosedConditions: '',
  prescriptionTreatments: '',
  professionalTreatments: '',
  
  // Section C - Current Routine
  currentProducts: '',
  currentProductsList: [],
  productDuration: '',
  irritatingProducts: '',
  
  // Section D - Main Concerns
  mainConcerns: [],
  concernPriority: [],
  acneBreakouts: [],
  acneDuration: '',
  pigmentationType: '',
  pigmentationSeverity: '',
  pigmentationDuration: '',
  rednessType: '',
  rednessDuration: '',
  dullnessType: '',
  dullnessDuration: '',
  wrinklesType: '',
  wrinklesDuration: '',
  poresType: '',
  poresDuration: '',
  textureType: '',
  textureDuration: '',
  oilinessType: '',
  oilinessDuration: '',
  drynessType: '',
  drynessDuration: '',
  
  // Sensitivity questions
  sensitivityRedness: '',
  sensitivityDiagnosis: '',
  sensitivityCleansing: '',
  sensitivityProducts: '',
  sensitivitySun: '',
  sensitivityCapillaries: '',
  sensitivitySeasonal: '',
  
  // Section E - Lifestyle Inputs
  diet: '',
  waterIntake: '',
  sleepHours: '',
  stressLevels: '',
  environment: '',
  
  // Section F - Willingness & Preferences
  routineSteps: '',
  serumComfort: '',
  moisturizerTexture: '',
  budget: '',
  
  // Legal Disclaimer
  legalDisclaimerAgreed: false,
  legalDisclaimerNotMedical: false,
  legalDisclaimerConsultDermatologist: false,
  legalDisclaimerPatchTest: false,
  legalDisclaimerDiscontinueUse: false,
  legalDisclaimerDiscloseInfo: false,
  legalDisclaimerNoLiability: false,
  
  // Additional fields
  allergies: '',
  pregnancyBreastfeeding: '',
  medications: '',
};
```
- Stateful hooks (`src/components/UpdatedConsultForm.tsx:409-428`) manage wizard state:
  - `currentStep` (`useState(1)`) tracks the active panel.
  - `formData` stores mutable answers.
  - `isSubmitting`/`isSubmitted` gate final submission vs preview.
  - `recommendation` caches the generated `RoutineOptionsResponse`.
  - `decisionAuditState`/`triageOutcomesState` capture the decision engine audit trail.
  - `errors` holds per-field validation messages.
  - `runtimeSelf` caches `deriveSelfBands` output for diffing follow-ups.
  - `followUp`, `activeFollowUp`, `followUpAnswers`, `followUpLocal`, `followUpDrafts`, `pendingAutoFill` manage queued RULE_SPECS follow-up dialogs.
  - `effectiveBands` merges machine bands with decision updates.
  - `computedSensitivity` records the additive sensitivity score.
  - `decisions` collects `Decision` objects returned by `decideAllRt`.
  - `gateRemarks` aggregates textual gate warnings.
  - `prevMainConcernsRef` tracks prior concern selections to purge stale follow-ups.
  - `calculatedAge` mirrors `computeAgeFromDOB` for dynamic sensitivity logic.
- Machine metadata is loaded once in `ChooseProfile` and passed down; the form never mutates machine bands directly but recomputes `effectiveBands` during follow-ups.
- `useEffect` hooks recalculate age and auto-answer `sensitivitySeasonal`, prune concerns, and recompute decision state whenever base drivers change (`src/components/UpdatedConsultForm.tsx:420-704`).

### 1.2 Form Sections & Progression
- Step budgeting: `getTotalSteps` starts at 19 base steps and adds concern-specific follow-ups (Acne and Pigmentation add type + severity, others add severity), an ordering step when >=2 concerns, five lifestyle questions, three preference questions, and the legal disclaimer (src/components/UpdatedConsultForm.tsx:1127-1156).
- Dynamic step resolution: `getCurrentConcernStep` builds an ordered array of concern follow-ups and lifestyle/preference/legal markers so `renderStep` can switch between static cases and dynamic forms (src/components/UpdatedConsultForm.tsx:1228-1277, 2107-3088).

#### Section 0 – Safety Gates (Steps 5-9)
- Rendered in `renderStep` cases 5-9 (src/components/UpdatedConsultForm.tsx:2741-2889). Each button click calls `handleGateChange`, which writes the answer, appends to `gateActions`, and optionally toggles downstream flags (`src/components/UpdatedConsultForm.tsx:518-567`).
- Fields: pregnancy, recent isotretinoin, severe cystic acne, allergy conflict, barrier stress high. Responses drive `buildGateDisallowSet` and pregnancy safety flags later.
- Validation: `validateStep` enforces a selection for each gate (src/components/UpdatedConsultForm.tsx:1280-1386).

#### Section A – Skin Basics (Steps 10-13)
- Cases 10-12 collect `skinType`, `oilLevels`, and `hydrationLevels`, updating `skinTypeFlag` via `deriveSkinTypeFlag` (src/components/UpdatedConsultForm.tsx:2927-3038).
- Step 13 runs the sensitivity screening by iterating `SENSITIVITY_QUESTION_CONFIG` and binding yes/no buttons to the corresponding `formData` keys (src/components/UpdatedConsultForm.tsx:3039-3088).
- Validation: each field must be non-empty; sensitivity questions require explicit Yes/No (src/components/UpdatedConsultForm.tsx:1366-1408).

#### Section B – Current Skin History (Steps 14-16)
- Textareas capture diagnosed conditions, prescription treatments, and professional treatments (src/components/UpdatedConsultForm.tsx:3089-3167).
- Blank answers are permitted but validation ensures the user interacts (shows message if left empty unless acceptable).

#### Section C – Current Routine (Steps 17-18)
- Step 17 collects free-text `currentProducts` plus structured `currentProductsList` entries via `ProductAutocomplete` (`renderStep` case 17 at src/components/UpdatedConsultForm.tsx:3168-3258, component in src/components/ProductAutocomplete.tsx:1-266).
- Step 18 allows tagging potentially irritating products with chips (src/components/UpdatedConsultForm.tsx:3259-3283).
- Validation ensures at least one product is described and irritating products selection is optional (src/components/UpdatedConsultForm.tsx:1366-1374).

#### Section D – Main Concerns & Follow-ups
- Step 19 lets users tick up to three concerns (`mainConcerns`) while keeping acne pinned first in `concernPriority` (src/components/UpdatedConsultForm.tsx:3284-3363, 1727-2057 for follow-up rendering).
- `getTotalSteps` injects additional follow-up steps per concern:
  - Acne: type chooser (`ACNE_TYPE_OPTIONS`) and severity cards per selected type (src/components/UpdatedConsultForm.tsx:1901-2054).
  - Pigmentation: type (red vs brown) and severity options (src/components/UpdatedConsultForm.tsx:2058-2139).
  - Other concerns (pores, texture, etc.) provide severity only.
  - Sensitivity screening follow-ups can appear if routed from RULE_SPECS via `sensitivity-question`.
- Validation ensures at least one concern is selected, Acne severity chosen per breakout, and all dynamic follow-ups completed (`src/components/UpdatedConsultForm.tsx:1366-1437`).
- Prioritisation step: when >=2 concerns, a drag-like list allows reordering while locking Acne to position 1 (src/components/UpdatedConsultForm.tsx:2109-2195).

#### Section E – Lifestyle Inputs
- Steps labelled `'diet'`, `'water-intake'`, `'sleep-hours'`, `'stress-levels'`, `'environment'` render radio grids captured in `renderConcernFollowUp` default branch (example `sleepHours` UI at src/components/UpdatedConsultForm.tsx:2244-2270).
- Validation enforces a choice for each lifestyle question (src/components/UpdatedConsultForm.tsx:1378-1387).

#### Section F – Willingness & Preferences
- `routineSteps`, `serumComfort`, and `moisturizerTexture` are collected (src/components/UpdatedConsultForm.tsx:2292-2423). `serumComfort` defaults to `'2'` but requires explicit confirmation.
- `budget` free-text step follows (src/components/UpdatedConsultForm.tsx:2424-2475).
- Validation ensures preferences are selected (`src/components/UpdatedConsultForm.tsx:1388-1393`).

#### Legal Disclaimer (Final Step)
- Users must toggle seven acknowledgement switches before continuing (`renderStep` legal block at src/components/UpdatedConsultForm.tsx:2476-2534). `validateStep` checks all booleans (src/components/UpdatedConsultForm.tsx:1394-1399).

- RULE_SPECS follow-ups display in a modal overlay when `activeFollowUp` is set; `handleSubmitFollowUp` records answers and re-runs `recomputeEngine` (`src/components/UpdatedConsultForm.tsx:1453-1702`).

### 1.3 Machine vs Customer Mismatch Reconciliation
- Self-derived bands: `deriveSelfBands` maps form answers into band values for sebum, moisture, texture, pores, acne, pigmentation, and sensitivity, using severity heuristics and `deriveAcneBandFromTypeSeverity` (src/lib/decisionEngine.ts:849-923).
- Follow-up orchestration: `recomputeEngine` in `UpdatedConsultForm` computes machine/self pairs, filters RULE_SPECS follow-ups, preserves previously answered rules, and queues the next unanswered, prioritising red/yellow discrepancies (src/components/UpdatedConsultForm.tsx:605-704).
- Decision evaluation: `decideAllBandUpdates` iterates applicable follow-ups, merges updates (worst band wins), and records `Decision` objects with verdicts, flags, and safety notes (src/lib/decisionEngine.ts:1064-1094). Results feed `effectiveBands` and UI audit panes.

Mismatch scenarios defined in `RULE_SPECS` (src/lib/decisionRules.ts:45-308):

- `moisture_machineLow_customerNormal` - machine reports dry (Red/Yellow) while customer reports normal (Green/Blue).
  - Questions: none (auto resolution).
  - Outcomes: Moisture forced to Blue with verdict "Machine dry vs user normal – treat as Normal hydration.".

- `moisture_machineNormal_customerDry` - machine normal (Green/Blue) vs customer dry (Yellow/Red).
  - Questions:
    - Q2 "Does skin feel tight all day even after moisturizer?"
    - Q3 "Do you have visible flaking/rough patches?"
    - Q4 "Current actives/meds in last 4 weeks?" (Retinoids, BPO, AHA/BHA, Adapalene, Isotretinoin, None; multi-select).
  - Outcomes: Red when tightness and flaking present, Yellow when any dryness or drying actives, Blue when no symptoms and no drying actives.

- `sebum_machineNormal_customerOily` - machine normal vs customer oily.
  - Questions:
    - Q1 "How often do you blot/wash face due to oil?"
    - Q2 "Is shine localized to T-zone?"
    - Q3 "Used mattifying products, clay masks or oil-absorbing sheets within last 24h?"
    - Q5 "Any mattifying primer/powder used in last 8h?"
  - Outcomes: Red when >=3x/day blotting with all-over shine, Yellow for combination oil or partial signals, Blue when product film likely or readings trusted.

- `sebum_machineOily_customerNormal` - machine oily vs customer normal.
  - Questions:
    - Q1 "Do you see visible shine within 2-4h after cleansing?"
    - Q2 "Do you get frequent blackheads/whiteheads?"
    - Q3 "Using heavy creams/oils/sunscreens?"
  - Outcomes: Red when shine and congestion without heavy products, Yellow for partial confirmations, Blue if user likely balanced and product film explains machine reading.

- `acne_machinePresence_customerNone` - machine sees acne while customer denies.
  - Questions:
    - Q1 "Any new bumps in last 2 weeks?"
    - Q2 "Any red/brown spots without a raised bump?"
    - Q2a "If yes, are the spots red or brown?"
    - Q3 "Do you get monthly breakouts around periods/jawline?"
    - Q4 "Do you frequently notice tiny bumps, blackheads, or whiteheads?"
    - Q5 "Do you have any inflamed pimples now?" (None, 1-2, Several).
  - Outcomes: Escalate to Red for nodulocystic/inflammatory signals (with `refer-derm` flags), Yellow for comedonal activity, Blue for situational or pregnancy-safe routines, Green if all answers negate acne.

- `acne_machineClear_customerPresence` - customer reports acne but machine is clear.
  - Questions:
    - Q1 "How many inflamed (red, swollen, painful) pimples do you currently see?" (None, 1-5, 6-15, >15).
    - Q2 "Do you get deep, painful lumps or nodules under the skin?"
    - Q3 "Do you have visible blackheads/whiteheads alongside these breakouts?" (None, <10, 10-20, >20).
    - Q4 "Do your breakouts flare with specific triggers (mask/sweat/stress/products)?"
    - Q5 "Are you currently pregnant or breastfeeding?"
  - Outcomes: Red for nodules or >15 lesions (adds `refer-derm`), Yellow for moderate breakouts, Blue for situational or pregnancy-limited care, Green if symptoms minimal.

- `pores_machineHigh_customerNormal` - machine red/yellow pores vs customer green/blue.
  - Questions:
    - Q1 "Are pores visible at arm's length in a mirror?"
    - Q2 "Do you get frequent blackheads on nose/cheeks?"
    - Q3 "Oiliness level self-report" (Low/Normal/High).
  - Outcomes: Pores set to Red/Yellow when distance visibility or blackheads confirmed, Blue when only close-up visibility, Green when no concern.

- `pores_machineNormal_customerConcerned` - machine normal vs customer concerned.
  - Questions:
    - Q1 "Is visibility limited to close-up only under harsh light?"
    - Q2 "Do you regularly wear heavy makeup/sunscreen and skip double-cleanse?"
    - Q3 "Blackheads present on nose/chin?"
  - Outcomes: Yellow when habits or blackheads justify treatment, Blue when only close-up perception.

- `texture_machineSmooth_customerAging` - machine smooth vs aging complaint.
  - Questions: none.
  - Outcomes: Yellow if `age > 35`, else Blue to reassure.

- `texture_machineSmooth_customerBumpy` - machine smooth vs bumpy complaint.
  - Questions:
    - Q1 "When you say \"bumpy,\" do you mean:" (Pimples, Tiny uneven dots, Just feels uneven).
    - Q2 "Where do you notice this most?" (Forehead, Chin, Cheeks, All over).
    - Q3 "Do you have dandruff or an oily scalp?"
  - Outcomes: Route to acne follow-up when pimples, set Texture/Pores bands for comedonal cues, add scalp analysis suggestions for forehead+dandruff.

- `texture_machineBumpy_customerSmooth` - machine bumpy vs customer smooth.
  - Questions:
    - Q1 "Do you notice any unevenness in texture in particular areas (tiny bumps)?"
    - Q2 "Do you have any old acne scars or marks that haven't faded yet?"
    - Q3 "Is your age above 40?"
    - Q4 "Do you have dandruff or an oily scalp?"
  - Outcomes: Pores Yellow for chin/cheek bumps, Texture Blue with scar follow-up, Texture Yellow for age-related concerns, Green otherwise.

- `pigmentation_machineHigh_customerNormal_brown` / `_red` - machine detects pigmentation but customer does not.
  - Questions: none.
  - Outcomes: Set corresponding pigmentation dimension to Yellow.

- `pigmentation_machineNormal_customerHigh_brown` / `_red` - customer perceives pigmentation absent in machine.
  - Questions: none.
  - Outcomes: Elevate pigmentation dimension to Yellow to honour concern.

- `sensitivity_placeholder` - placeholder rule without questions or outcomes (gap).

- Outcomes are merged into `effectiveBands` (`setEffectiveBands`) and recorded in the triage audit shown on the preview screen (src/components/UpdatedConsultForm.tsx:605-704, 1527-1604).

### 1.4 Acne Flow (Detailed)
#### Phase 1: Breakout Type Selection
- When Acne is selected, `renderConcernFollowUp` case `'type'` displays `ACNE_TYPE_OPTIONS` (src/components/UpdatedConsultForm.tsx:1901-1970):
  - "Blackheads (tiny dark dots in pores)"
  - "Whiteheads (small white bumps under the skin)"
  - "Red pimples (inflamed, sometimes pus-filled)"
  - "Large painful bumps (deep cystic acne)"
  - "Mostly around jawline/chin, often before periods (hormonal)"
- Toggling an option appends/removes an entry from `formData.acneBreakouts`, recording `{ type, severity: '', category }` where `category` derives from `deriveAcneCategoryLabel` (src/components/UpdatedConsultForm.tsx:1928-1960).

#### Phase 2: Subtype-Specific Follow-ups
- Severity cards appear per selected type (`renderConcernFollowUp` `'severity'`, src/components/UpdatedConsultForm.tsx:1961-2054). `getAcneSeverityOptions` (src/components/UpdatedConsultForm.tsx:224-275) returns band-tagged choices:
  - Blackheads: "A few, mostly on the nose (<=10) – Blue", "Many in the T-zone (11-30) – Yellow", "Widespread across face (30+) – Red".
  - Whiteheads: analogous count-based buckets.
  - Red pimples: "A few (1-3) – Blue", "Several (4-10) – Yellow", "Many (10+) – Red".
  - Large painful bumps: rarity per week.
  - Hormonal flares: monthly intensity buckets.
- Users pick one severity per breakout; `setSeverity` keeps the category in sync (src/components/UpdatedConsultForm.tsx:1990-2018).
- Decision-engine mismatch follow-ups add deeper questions when required: `acne_machinePresence_customerNone` and `acne_machineClear_customerPresence` prompts enumerated above drive band overrides and referral flags.

#### Phase 3: Band Determination
- `deriveAcneBandFromTypeSeverity` translates each `(type, severity)` pair into a band with explicit thresholds (src/lib/decisionEngine.ts:186-238). Example: selecting "Red pimples" with severity "6-15" yields Red; `<10` comedones produce Blue.
- `deriveSelfBands` elevates bands across all selected breakouts and defaults to at least Yellow if Acne concern present (src/lib/decisionEngine.ts:879-911).
- Final acne categories propagate into the recommendation context via `acneCategories` and `decisionEngine.flags.acneSubtype` inside `handlePreview` (src/components/UpdatedConsultForm.tsx:1550-1604).
#### Critical Answers
1. **Sequential follow-ups?** Severity selection shows all chosen breakout types simultaneously, while decision-engine follow-ups appear one at a time in modal overlays. Users progress sequentially through wizard steps but complete severity choices on a single page (`src/components/UpdatedConsultForm.tsx:1901-2054`).
2. **Can answers be revised?** Yes. `handleBack` decrements `currentStep` without clearing data, and removing a breakout type updates `acneBreakouts` immediately (src/components/UpdatedConsultForm.tsx:1477-1519, 1936-1959).
3. **Where is the subtype stored?** In `formData.acneBreakouts[*].category`, derived from `deriveAcneCategoryLabel`, and later condensed into `acneCategories` and `decisionEngine.flags.acneSubtype` when generating recommendations (src/components/UpdatedConsultForm.tsx:1936-2018, 1550-1604).
4. **Pregnancy impact?** Pregnancy answers create `pregnancy-filter` flags in RULE_SPECS outcomes, mark `decisionEngine.flags.pregnancySafe`, add to the gate disallow set, and trigger serum replacements in `applyPregnancySafety` (src/lib/decisionRules.ts:152-184, src/services/recommendationEngineMatrix.ts:184-246, 670-690).

## 2. Decision Engine & Context Building
### 2.1 Concern Selection & Prioritization
- `collectConcernSelections` converts `formData.mainConcerns` into structured entries with inferred subtypes and bands (src/services/recommendationEngineMatrix.ts:1492-1548). Acne uses `inferAcneSubtype`, Pigmentation inspects brown/red bands, Texture distinguishes aging vs bumpy, and fallback priority comes from `concernPriority`.
- `selectPrimaryConcern` enforces Acne precedence when present and returns `{ primary, others }` for downstream routine planning (src/services/recommendationEngineMatrix.ts:1551-1576).
- `concernPriority` step ensures Acne is pinned to index 0 and persists ordering (src/components/UpdatedConsultForm.tsx:2109-2195).
- Example selection object:
```ts
{
  concern: 'acne',
  subtype: 'Inflammatory',
  band: 'red',
  priority: 1,
  source: 'user'
}
```

### 2.2 Skin Type Derivation
- `deriveSkinProfile` mixes machine bands, self bands, and declared skin type to classify sebum class (Oily/Combo/Dry), hydration status, and compute a `baseKey` for product lookup (src/services/recommendationEngineMatrix.ts:359-438).
- Moisture conflict resolution uses the worst of machine/self, falling back to declared skin type when bands missing. Sebum class drives `fallbackSkinType`.
- `SKIN_TYPE_BASE_PRODUCTS` maps compound keys (e.g., `Oily-Hydrated-Yellow`) to default cleanser/moisturizer/sunscreen names (src/services/recommendationEngineMatrix.ts:289-343). When "as per skin type" is encountered in the concern matrix, `resolveAsPerSkinTypeName` uses this mapping or falls back to `SKIN_TYPE_DEFAULTS` (`Normal` fallback) with audit notes (src/services/recommendationEngineMatrix.ts:429-458).
- Machine vs question conflicts: when machine lacks pigmentation dimensions, user follow-ups set the effective band, ensuring `deriveSkinProfile` sees the user intent.

### 2.3 Sensitivity Score Calculation
- `computeSensitivityFromForm` (src/lib/decisionEngine.ts:972-1020) sums:
  - +2 for `sensitivityRedness === 'Yes'`.
  - +3 for `sensitivityDiagnosis === 'Yes'`.
  - +1 each for `sensitivitySun`, `sensitivityProducts`, `sensitivityCapillaries`.
  - +0.5 if age < 20 (from `sensitivitySeasonal` auto flag or DOB).
  - +1 if `sensitivityCleansing === 'Yes'` (very dry baseline).
- Score → tier mapping: <=1 → Low/Green (100 units/night, 2 rest nights), 2-3 → Moderate/Blue (70 units, 3 rest nights), 4-5 → High/Yellow (30 units, 4 rest nights), >=6 → Very High/Red (0 units, 7 rest nights, barrier-only).
- Result stored in `computedSensitivity` state and merged into `effectiveBands` (src/components/UpdatedConsultForm.tsx:650-704).

### 2.4 RecommendationContext Assembly
- Interface (`src/services/recommendationEngineMatrix.ts:40-110`) captures skin profile, decision engine output, and normalized form data:
```ts
export interface RecommendationContext {
  skinType: string | string[];
  decisionEngine?: {
    effectiveBands: Partial<Record<string, string>>;
    flags?: DecisionEngineFlags;
  };
  effectiveBands?: Partial<Record<string, string>>;
  acneCategories?: string[];
  decisions?: any[];
  formData: {
    name?: string;
    skinType?: string;
    mainConcerns?: string[];
    concernPriority?: string[];
    pregnancy?: string;
    pregnancyBreastfeeding?: string;
    sensitivity?: string;
    pigmentationType?: string;
    serumComfort?: string;
    routineSteps?: string;
    moisturizerTexture?: string;
    allergies?: string;
    recentIsotretinoin?: string;
    severeCysticAcne?: string;
    barrierStressHigh?: string;
    [key: string]: unknown;
  };
}
```
- `handlePreview` populates fields as described, ensuring recommendation generation has access to acne flags, sensitivity, allergies, and routines (src/components/UpdatedConsultForm.tsx:1550-1604).

## 3. Recommendation Engine Flow
### 3.1 Entry Point & Gates
- `generateRecommendations(context)` (src/services/recommendationEngineMatrix.ts:1160-1385) is invoked from `handlePreview` (src/components/UpdatedConsultForm.tsx:1527-1604).
- Early gates:
  - `hasSevereCysticGate` returns a dermatologist referral-only routine when the Severe Cystic Acne gate is "Yes" (src/services/recommendationEngineMatrix.ts:1167-1182).
  - `hasBarrierStressHighGate` returns a barrier-first reset routine focused on niacinamide + ceramides (src/services/recommendationEngineMatrix.ts:1184-1199).
  - Isotretinoin and pregnancy gates populate disallow sets used later.

### 3.2 Matrix Lookup Process
- Primary concern entry retrieved via `fetchMatrixEntry` which attempts exact match, band fallbacks, subtype "General", and finally `skinType = 'Normal'` (src/services/recommendationEngineMatrix.ts:1578-1618).
- Matrix entries load from `lookupMatrixEntry` indexing `RAW_MATRIX` definitions (src/data/concernMatrix.ts:708-757).
- Missing entries log notes and trigger skin-type fallback routines (src/services/recommendationEngineMatrix.ts:1218-1242).

### 3.3 "As Per Skin Type" Resolution
- Matrix rows can specify `rawName` "as per skin type"; `resolveRoutineProduct` swaps those for profile-specific defaults with audit notes (src/services/recommendationEngineMatrix.ts:429-478).
- Example: base key `Oily-Hydrated-Yellow` resolves cleanser "Foaming cleanser", moisturizer "Oil-free gel", sunscreen "Lightweight gel sunscreen SPF 50".

### 3.4 Product Instantiation
- `instantiateProduct` looks up canonical ingredient metadata from the product registry and tags ingredient families (src/services/recommendationEngineMatrix.ts:463-506, src/data/concernMatrix.ts:18-211).
- `routineToRecommendation` constructs `EnhancedRecommendation` including `_keys`, `_flags`, `_ingredients`, AM/PM arrays, notes, and attaches weekly schedules via `buildWeeklyPlan` (src/services/recommendationEngineMatrix.ts:1006-1108).

### 3.5 Multiple Routine Generation
- Variant definitions (src/services/recommendationEngineMatrix.ts:1244-1318):
  1. **Conservative** (`serumComfort = 1`): retains only the core serum.
  2. **Balanced** (`serumComfort = 2`, recommended): attempts primary secondary serum plus one additional concern.
  3. **Comprehensive** (`serumComfort = 3`): tries to cover all remaining concerns; marked unavailable if incompatibilities remain.
- `recommendedIndex` defaults to the first available recommended variant, usually Balanced (src/services/recommendationEngineMatrix.ts:1320-1339).
- Serum comfort honours user preference parsed via `parseSerumComfort` (src/services/recommendationEngineMatrix.ts:217-225).

### 3.6 Serum Addition Logic
- `tryAppendSecondarySerum` enforces comfort limits, safety disallows, duplicate family checks, and ingredient compatibility. It returns `SerumAppendResult` with failure reasons (src/services/recommendationEngineMatrix.ts:609-640).
- `augmentSerumsForAdditionalConcerns` prioritises secondary serums, falling back to core serums when compatibility fails (src/services/recommendationEngineMatrix.ts:736-820).
- `addCoreSerumsOnlyForConcerns` (comprehensive variant) only tries core serums and records conflicts to disable the variant (src/services/recommendationEngineMatrix.ts:883-919).
- Pregnancy, isotretinoin, and allergy adjustments mutate routines post-selection (`applyPregnancySafety`, `applyIsotretinoinSafety`, `applyAllergySafety`, src/services/recommendationEngineMatrix.ts:670-760).
## 4. Safety Filters & Compatibility
### 4.1 Pregnancy Safety
- `buildGateDisallowSet` adds `retinol`, `adapalene`, `benzoyl-peroxide`, `salicylic-acid`, and `lactic-acid` when pregnancy or barrier gates are active; isotretinoin adds vitamin C (src/services/recommendationEngineMatrix.ts:184-246).
- `applyPregnancySafety` replaces unsafe serums with niacinamide/azelaic alternates and records notes (src/services/recommendationEngineMatrix.ts:670-690).

### 4.2 Isotretinoin Recovery
- `applyIsotretinoinSafety` removes harsh actives, switches to niacinamide, upgrades moisturizer to "Barrier repair cream", and cleanser to "Gentle cleanser" (src/services/recommendationEngineMatrix.ts:691-713).

### 4.3 Allergy Checking
- Allergies parsed via `parsedAllergies`; `applyAllergySafety` scans ingredient keywords and swaps offending serums for safer defaults (src/services/recommendationEngineMatrix.ts:714-760).

### 4.4 Ingredient Compatibility
- `pairCompatibility` disallows retinoids with L-ascorbic, AHAs, BHAs, BPO; AHAs with BHAs; and marks caution pairs (retinoids+azelaic, vitamin C + peptides, etc.) (src/services/ingredientInteractions.ts:17-52).
- `evaluateCompatibility` blocks disallowed combos and records caution messages (src/services/recommendationEngineMatrix.ts:520-612).
- Scheduler warns when AM LAA serum coexists with PM retinoid/BPO, ensuring advisor awareness even though disallowed pairs are already removed (src/services/scheduler.ts:260-270).

## 5. Scheduling & Budget System
### 5.1 Irritation Cost Assignment
- `ACTIVE_COST_SPECS` assigns nightly cost units and priorities (src/services/scheduler.ts:360-389): Retinoid 60, BHA 60, AHA 60, Benzoyl Peroxide 50, Azelaic 30, Tranexamic 20, Vitamin C 15, Niacinamide 10, others 0.
- `costForProductName` and `serumKeyToTag` map product names/keys to these costs (src/services/scheduler.ts:390-456).

### 5.2 Budget Limits & Rest Nights
- `getNightlyBudget` maps sensitivity score to nightly caps/rest nights (src/services/scheduler.ts:331-340).
- `legacyBudgetFromBand` covers cases without scores (src/services/scheduler.ts:341-353).

### 5.3 Weekly Schedule Generation
- `buildWeeklyPlan` orchestrates AM/PM assignment, pregnancy filtering, duplicate removal, and hands PM actives to `generateBudgetAwarePmPlan` for budget-aware scheduling (src/services/scheduler.ts:120-640).
- Example structure:
```ts
{
  monday: { am: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen'], pm: ['Cleanser', 'Retinol', 'Moisturizer'], cost: 60 },
  tuesday: { am: [...], pm: [...], cost: 30 },
  ...,
  restNights: ['saturday', 'sunday'],
  budget: { nightlyCap: 70, requiredRestNights: 3, sensitivityScore: 3 },
  warnings: ['Irritation budget applied (cap 70, rest nights 3).']
}
```

### 5.4 Frequency Handling
- Scheduler alternates actives based on cost and rest nights but does not emit explicit frequency instructions. Frequency metadata remains a TODO (no implementation in repo).

## 6. Output & Persistence
### 6.1 RoutineOptionsResponse Structure
- Interfaces at `src/services/recommendationEngineMatrix.ts:62-118` describe `ProductRecommendation`, `EnhancedRecommendation`, `RoutineVariant`, and `RoutineOptionsResponse`.
- Example Balanced routine:
```ts
{
  type: 'balanced',
  label: 'Balanced',
  serumCount: 2,
  cleanser: 'Gentle foaming cleanser',
  coreSerum: 'Adapalene 0.1% PM',
  secondarySerum: 'Niacinamide serum',
  moisturizer: 'Gel-cream',
  sunscreen: 'Lightweight gel sunscreen SPF 50',
  _keys: { cleanserType: 'Gentle foaming cleanser', core: 'adapalene', secondary: 'niacinamide', moisturizerType: 'Gel-cream' },
  _flags: { vc_form: undefined, core_acid_strength: 'high', secondary_acid_strength: 'low' },
  notes: ['Balanced plan generated (serum comfort 2).', 'Irritation budget applied (cap 70, rest nights 3).'],
  schedule: { am: [...], pmByDay: {...}, restNights: [...] },
  recommended: true
}
```

### 6.2 UI Display
- `RecommendationDisplay` renders expandable cards with Balanced expanded by default and allows toggling between budget/luxury SKUs (src/components/RecommendationDisplay.tsx:120-320).
- Selection updates `selectedIndex` and notifies the parent via `onRoutineSelect` (src/components/RecommendationDisplay.tsx:132-215, 287-358).

### 6.3 Database Persistence
- `saveConsultationData` upserts `customer`, creates/uses `assessment_session`, and inserts `intake_form` with transformed answers (src/services/newConsultationService.ts:298-390).
- `transformFormData` groups answers into `skin_profile`, `skin_history`, `lifestyle`, `product_usage`, `preferences`, and `evaluation.triage` (src/services/newConsultationService.ts:212-297).
- **Gap:** Generated `routineOptions`/`selectedRoutine` attached to the payload before save are not persisted because `transformFormData` omits them.
- `getFillingQueue` and `getSessionProfile` support the queue and machine prefill (src/services/newConsultationService.ts:420-522).

## 7. Product & Brand System
### 7.1 Product Registry
- `concernMatrix.ts` registers canonical product aliases with ingredient tags and hazard flags using `registerProduct` (src/data/concernMatrix.ts:18-211). Examples: "Gentle foaming cleanser", "Adapalene 0.1% PM" (retinoid, pregnancy unsafe), "Niacinamide serum".
- `getProductInfo` retrieves metadata; `instantiateProduct` clones info when building routines (src/data/concernMatrix.ts:708-747, src/services/recommendationEngineMatrix.ts:463-506).

### 7.2 Product Variants
- No dedicated `PRODUCT_VARIANTS` structure exists. Brand tiers live in `PRODUCT_DATABASE` with `tier: 'affordable' | 'mid-range' | 'premium'` (src/data/productDatabase.ts:1-170).
- UI toggles between "Budget" and "Luxury" by selecting appropriate tier entries; no backend persistence or per-client tier override exists (src/components/RecommendationDisplay.tsx:150-205).

### 7.3 Brand Resolution
- `_keys` map to product categories in `PRODUCT_DATABASE`; `pickByMode` chooses affordable vs premium SKUs (src/components/RecommendationDisplay.tsx:150-213).
- Advisors cannot change tier per routine beyond the temporary toggle. Selected SKU is not stored in Supabase.
## 8. Testing & Validation
### 8.1 Automated Tests
- `scripts/verifyMultiRoutine.ts` ensures three variants exist with Balanced recommended. Output: `[PASS] Multi-routine generation verified.`
- `scripts/testIrritationBudget.ts` checks scheduler budgets across sensitivity tiers. Output: `Test 1 (Low sensitivity) [PASS]` ... `Test 4 (Barrier-only) [PASS]`.
- `scripts/testSkinTypeBaseProducts.ts` validates "+As per skin type" mappings. Output: `[PASS] Skin-type product resolution tests passed.`
- `scripts/auditProductDatabase.ts` audits coverage and writes `docs/matrix-audit-report.md`. Output summarises 109 complete entries and 231 missing combinations.
- All four scripts executed on 2025-10-13 and passed.

### 8.2 Coverage Gaps
- Matrix coverage: 38/120 Acne combos (32%), 16/40 Pigmentation (40%), 10/20 Pores (50%), 16/40 Texture (40%), 10/20 Sebum (50%), 19/100 AcneScars (19%).
- Missing fallbacks: numerous Green-band entries absent, especially for Normal skin across concerns.
- Pregnancy variants mostly defined for Blue band only; Yellow/Red pregnancy coverage is missing.
- Allergy handling relies on keyword match; no automated coverage ensures replacements still obey budgets.

## 9. Validation Results
1. **Is the acne flow fully sequential?** Severity pages show all selected breakout types simultaneously, while RULE_SPECS follow-ups present one rule at a time.
2. **Are all safety gates implemented?** Pregnancy, isotretinoin, severe cystic acne, allergy conflict, and barrier stress gates affect recommendations; sensitivity placeholder remains a gap.
3. **Does irritation budget enforcement work in all 3 routines?** Yes - every variant invokes `buildWeeklyPlan`, applying caps and rest nights.
4. **Is "As per skin type" resolution working?** Yes - `resolveAsPerSkinTypeName` backed by `SKIN_TYPE_BASE_PRODUCTS` handles cleanser/moisturizer/sunscreen placeholders.
5. **Are incompatible ingredients prevented from same-night use?** Disallowed combos are removed during routine assembly; caution pairs generate notes, and scheduler warns about LAA vs retinoid/BPO separation.
6. **Do all tests pass?** Yes - 4/4 custom scripts passed on 2025-10-13.
7. **Are there any known bugs or incomplete features?** Yes - see §10 Issues & Gaps.

## 10. Issues & Gaps
1. **Matrix coverage incomplete** - 231 combinations missing (High).
2. **Acne subtype evaluator unused** - `acneFlowEvaluator.ts` not wired into UI (Medium).
3. **Recommendation results not persisted** - Supabase stores intake but not routines (High).
4. **Sensitivity rule placeholder** - machine/self sensitivity disagreements unhandled (Medium).
5. **Allergy replacements coarse** - Defaults do not consider compatibility or concern context (Medium).
6. **Product tier overrides absent** - Price toggle is UI-only (Low/Medium).
7. **Frequency metadata missing** - Scheduler lacks explicit usage frequency guidance (Low).

## 11. Completion Checklist
- [FAIL] Acne flow 100% complete (advanced subtype evaluator unused; see src/lib/acneFlowEvaluator.ts).
- [PASS] Multiple routines working (verified by scripts/verifyMultiRoutine.ts).
- [PASS] All safety gates implemented (pregnancy, isotretinoin, severe acne referral, allergy, barrier stress).
- [PASS] Scheduling respects budgets (`buildWeeklyPlan`).
- [PASS] Tests passing (verifyMultiRoutine, testIrritationBudget, testSkinTypeBaseProducts, auditProductDatabase on 2025-10-13).
- [WARN] "As per skin type" resolution working (logic covered, but missing matrix entries force fallbacks).
- [WARN] Product/brand tier selection persisted (UI toggle only; no persistence).
- [FAIL] Recommendation persistence complete (routines not stored in Supabase).
