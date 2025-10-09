## System Implementation Report

This document captures how machine-derived skin metrics, form inputs, the decision engine, and the matrix-based recommendation service currently work. File references use `path:line` notation (1-based).

---

### Part 1 · Machine Analysis Integration

- **Ingress path**  
  Machine scans are captured in Supabase tables `assessment_session`, `machine_scan`, and `machine_analysis`. The service `getSessionProfile` (`src/services/newConsultationService.ts:531-576`) joins these tables, normalises acne band details, and returns a flattened `metrics` object alongside customer info.

  ```ts
  // src/services/newConsultationService.ts:531-573
  export async function getSessionProfile(sessionId: string) {
    const session = await supabase.from('assessment_session')
      .select('id, customer:customer_id(...), machine_scan:machine_scan(id)')
      .eq('id', sessionId)
      .single();
    const ma = await supabase.from('machine_analysis').select(...).eq('scan_id', scanId).maybeSingle();
    const metrics = ma ? { ...ma, acne_band: normalizeMachineAcneBand(ma.acne_band) } : null;
    return { session_id: sessionId, ..., metrics };
  }
  ```

- **UI pre-fill**  
  `ChooseProfile` consumes this profile, maps Supabase band columns into the shared `MachineScanBands` type, and passes both the canonical bands (`machine`) and raw metrics (`machineRaw`) to the form (`src/components/ChooseProfile.tsx:148-185`).

  ```ts
  const machine: MachineScanBands = {
    moisture: readBand('moisture_band'),
    sebum: readBand('sebum_band'),
    texture: readBand('texture_band'),
    pores: readBand('pores_band'),
    acne: readBand('acne_band'),
    acneDetails: rawMetrics['acne_details'] ?? undefined,
    pigmentation_brown: readBand('brown_areas_band') ?? readBand('pigmentation_uv_band'),
    pigmentation_red: readBand('redness_band') ?? undefined,
    sensitivity: readBand('sensitivity_band') ?? undefined,
  };
  ```

- **Data structure**  
  `MachineScanBands` is defined in `src/lib/decisionEngine.ts:20-49` and includes moisture, sebum, texture, pores, acne, `pigmentation_brown`, `pigmentation_red`, `sensitivity`, and optional acne detail payload.

- **Storage inside form**  
  `UpdatedConsultForm` initialises `effectiveBands` state from the machine payload (`src/components/UpdatedConsultForm.tsx:385`). Developer-only panels (lines 3245-3290) display machine vs effective bands so consultants can see the live values.

- **Path summary**  
  `machine_analysis` → `newConsultationService.getSessionProfile` → `ChooseProfile.handleActivate` → props `UpdatedConsultForm({ machine, machineRaw })`.

---

### Part 2 · Form to Decision Engine Flow

- **Form storage**  
  Section D selections land in the component-level `formData` state (e.g., `handleConcernToggle` around `UpdatedConsultForm.tsx:3000-3050`). The `mainConcerns`, `concernPriority`, and follow-up answers are preserved in this state until submission.

- **Mismatch detection**  
  The component derives “runtime self bands” (`runtimeSelf`) and requests follow-ups whenever `getFollowUpsRt` detects a machine/self mismatch (`UpdatedConsultForm.tsx:3385-3405`). Internally this calls `getFollowUpQuestions` from the decision engine.

- **Follow-up display**  
  Follow-ups are resolved inside the same screen. When a rule is active, `activeFollowUp` renders an inline card with question buttons (`UpdatedConsultForm.tsx:3438-3515`) instead of navigating to a different step.

- **Evaluation**  
  Anytime answers change, `decideAllRt` (alias of `decideAllBandUpdates`) recomputes the merged bands and stores the resulting decisions (`UpdatedConsultForm.tsx:1056-1078` and again at 1412-1419 for review mode).

- **Passing to recommendation engine**  
  Before generating products, `prepareRecommendation` packages:
  * `decisionEngineInput` containing `effectiveBands` plus flags like `acneSubtype`, `barrierOverride`, and dermatologist referral (`UpdatedConsultForm.tsx:1447-1468`).
  * `formData` essentials (serum comfort, allergies, pregnancy, etc.).
  * `acneCategories` derived from follow-up answers or gate questions (`UpdatedConsultForm.tsx:1435-1444`).
  This object becomes the `RecommendationContext` consumed by `generateRecommendations`.

*Example mismatch*: Rule `acne_machinePresence_customerNone` (`src/lib/decisionRules.ts:117-145`) triggers when machine bands are yellow/red but self bands are green/blue, prompting the five-question follow-up panel rendered as described above.

---

### Part 3 · Routine Generation Logic

- **Concern ordering**  
  `collectConcernSelections` constructs a list of concern objects with band, subtype, and priority (`src/services/recommendationEngineMatrix.ts:213-277`). Worst band wins, then explicit priority ranks from the form. Acne is auto-promoted if present (`selectPrimaryConcern`, lines 315-327).

- **Primary concern lookup**  
  The primary concern’s matrix row is fetched via `lookupMatrixEntry` (`fetchMatrixEntry`, lines 334-365). `buildRoutineFromEntry` (lines 291-304) instantiates cleanser, *core serum only*, moisturizer, and sunscreen from that row; the matrix’s secondary serum is not applied at this stage.

- **Additional concerns**  
  `augmentSerumsForAdditionalConcerns` iterates over remaining concerns (lines 504-546). For each, it pulls that row’s `secondarySerum` (if any), checks timing, safety gates, and compatibility, then appends it as an extra serum when slots permit.

- **Base products**  
  Cleansers, moisturisers, and sunscreens always come from the primary concern entry (or skin-type fallback if lookup fails). Secondary concerns contribute *only* optional serums; they do not override base products.

---

### Part 4 · Serum Comfort Implementation

- **Source**  
  `serumComfort` is collected in Section F and stored under `formData.serumComfort`. Recommendation logic parses it with `parseInt` and clamps to 1–3 (`src/services/recommendationEngineMatrix.ts:511-515`).

- **Behaviour**  
  - Comfort **1**: `augmentSerumsForAdditionalConcerns` exits early (line 512) so the routine contains only the primary concern’s core serum.
  - Comfort **2**: One extra serum slot (core + one secondary). The function sets `slotsRemaining = serumComfort - 1`, so only the highest-priority additional concern can contribute.
  - Comfort **3**: Up to two additional serums (primary core + up to two secondary serums drawn from concerns #2 and #3, subject to compatibility and availability).
  - The matrix secondary for Priority #1 is **never** automatically added; the current design assumes the core serum is the single guaranteed product.

---

### Part 5 · Routine Variations

- The system outputs **one** routine per request. `generateRecommendations` returns a single `EnhancedRecommendation` object with AM/PM arrays (`src/services/recommendationEngineMatrix.ts:760-805`). There is no branching into Option A/B/C at present.
- AM/PM timing for serums is governed by `serumTiming` (`src/services/recommendationEngineMatrix.ts:549-573`) and the scheduler. The weekly plan builder (`src/services/scheduler.ts:101-216`) now respects explicit “AM”/“PM” markers and generates a unified weekly cadence.

---

### Part 6 · Compatibility & Safety

- **Compatibility checks**  
  When considering an additional serum, `evaluateCompatibility` (`src/services/recommendationEngineMatrix.ts:364-384`) compares ingredient tags pairwise against `pairCompatibility`. A hard conflict skips the serum and appends a note (e.g., “Skipped Vitamin C serum: …”).
  *No alternate serum is attempted*—if the matrix secondary clashes, that concern contributes nothing.

- **Safety gates**  
  `applyPregnancySafety`, `applyIsotretinoinSafety`, and `applyAllergySafety` (lines 386-474) inspect current serums and swap unsafe ones with hard-coded substitutes (usually niacinamide or azelaic acid). These replacements happen **after** compatibility filtering and again update the notes array for traceability.

- **Scheduler safeguards**  
  The weekly scheduler also strips retinoids from AM routines and honours explicit AM/PM markers (`src/services/scheduler.ts:73-216`), ensuring timing instructions stay consistent.

---

### Part 7 · End-to-End Scenario

**Inputs**

- Machine: acne red (43), sebum red (43), pigmentation_uv yellow (57 → brown band), pores blue (72).
- Customer: Oily skin, self-claims mild acne (blue), main concerns `['Acne','Pigmentation','Large pores']`, serum comfort 3, pregnancy `No`, allergies `[]`.

**Automated run**

Script `scripts/recommendationReportScenario.ts` reproduces the flow. Key excerpts:

```text
=== Derived Self Bands ===
{ sebum: 'blue', moisture: 'green', acne: 'yellow', pores: 'yellow', pigmentation_brown: 'yellow' }

=== Follow-up Questions Triggered ===
- Sebum mismatch (machine oily vs customer normal)
- Pores mismatch (machine blue vs user concern)
```

No acne follow-up was triggered because the form auto-sets `self.acne = 'yellow'` whenever “Acne” is selected, so the rule `acne_machinePresence_customerNone` never activates. Consequently `decideAllBandUpdates` returned `effectiveBands.acne = 'red'` and `decisions = []`.

**Matrix rows consulted**

- Primary: Acne · Inflammatory · Oily · **Red** (core = BPO 2.5%, cleanser = gel, moisturiser = oil-free gel, sunscreen = gel SPF).
- Secondary: Pigmentation · PIH · Oily · Yellow (secondary serum = Vitamin C) — later skipped for compatibility.
- Tertiary: Pores · General · Oily · Blue (secondary serum = null).

**Final recommendation object (abridged)**

```json
{
  "primaryConcern": "Acne (red)",
  "am": [
    "Gel-based cleanser",
    "Benzoyl Peroxide 2.5%",
    "Oil-free gel moisturizer",
    "Lightweight gel sunscreen SPF 50"
  ],
  "pm": [
    "Gel-based cleanser",
    "Oil-free gel moisturizer"
  ],
  "notes": [
    "Acne priority override applied.",
    "Skipped Vitamin C serum: Vitamin C serum conflicts with Benzoyl Peroxide 2.5%.",
    "No secondary serum defined for pores General."
  ]
}
```

The weekly scheduler now keeps “Benzoyl Peroxide 2.5% AM” exclusively in morning slots and “Adapalene 0.1% PM” exclusively in evening slots (validated via `scripts/matrixSmokeTest.ts`).

---

### Part 8 · Gap Analysis

| Area | Status | Notes |
| --- | --- | --- |
| **Machine → Decision mismatch (Acne)** | **Missing** | Because selecting “Acne” forces `self.acne = 'yellow'` (`deriveSelfBands`, `src/lib/decisionEngine.ts:163-190`), the rule intended for machine=red vs customer=blue never fires. Scenario expectation (“acne_machinePresence_customerNone”) is not met. |
| **Primary concern secondary serum** | **Missing** | `buildRoutineFromEntry` ignores the matrix `secondarySerum`, so Priority #1 contributes only the core serum. |
| **Additional concern fallback** | **Partial** | If a secondary concern’s serum conflicts with the primary core, the system drops it without considering alternative actives for that concern. |
| **Follow-up answering UX** | **Implemented** | Inline modal present, but multiple follow-ups can pile up; no prioritisation yet. |
| **Serum comfort tiers** | **Implemented** | Slots honoured (primary + up to comfort−1 extras). |
| **Safety gates** | **Implemented** | Pregnant/isotretinoin/allergy swaps happen, but replacements are limited to baked-in substitutes (no matrix-level alternates). |
| **Matrix error reporting** | **Partial** | Notes capture fallbacks, but there’s no surfaced UI error when a combination is missing (just a log entry in `notes`). |

---

### Part 9 · Relevant Files

- `src/components/UpdatedConsultForm.tsx` — Main consult workflow, form data capture, follow-up UI, recommendation trigger.
- `src/lib/decisionEngine.ts` — Machine/self band derivation, follow-up rule engine, decision aggregation.
- `src/lib/decisionRules.ts` — Declarative rule catalogue (machine vs customer logic).
- `src/services/newConsultationService.ts` — Supabase accessors for machine scans and session profiles.
- `src/components/ChooseProfile.tsx` — Staff queue and bridge into the consult form.
- `src/data/concernMatrix.ts` — Matrix data ingestion, product metadata registry, matrix lookup helper.
- `src/services/recommendationEngineMatrix.ts` — Core recommendation logic (concern prioritisation, serum layering, safety adjustments).
- `src/services/ingredientInteractions.ts` — Ingredient compatibility table (`pairCompatibility`).
- `src/services/scheduler.ts` — Weekly AM/PM routine builder, now respecting explicit AM/PM markers.
- `scripts/recommendationReportScenario.ts` & `scripts/matrixSmokeTest.ts` — Diagnostic scripts used for this report (scenario reproduction, AM/PM timing validation).

---

### Overall

The matrix-based engine, safety gates, and AM/PM scheduling are wired through end-to-end. Key follow-up logic, however, still needs refinement—most notably, acne machine/customer mismatches are suppressed by baseline “concern = yellow” logic. Addressing that and enabling matrix-based fallbacks for incompatible secondary serums would bring behaviour closer to the intended business rules.
