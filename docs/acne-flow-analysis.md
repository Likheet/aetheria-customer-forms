## Acne Flow Analysis Report

This document describes the current acne-handling implementation across the codebase (as of this analysis). No code has been modified for this report.

---

### Part 1 · Current Acne Flow Map

```
┌──────────────────────────────┐
| Supabase machine_analysis    |
| (acne_band, acne_details…)   |
└──────────────┬───────────────┘
               | getSessionProfile()
               v
┌──────────────────────────────┐
| newConsultationService.ts    |
| - normalises acne band/details|
└──────────────┬───────────────┘
               | ChooseProfile.handleActivate()
               v
┌──────────────────────────────┐
| ChooseProfile.tsx            |
| - maps bands → MachineScanBands
| - passes machine + machineRaw |
└──────────────┬───────────────┘
               | props
               v
┌──────────────────────────────┐
| UpdatedConsultForm.tsx       |
| - stores machine bands in state
| - renders acne UI/follow-ups  |
└──────────────┬───────────────┘
               | deriveSelfBands / followUpAnswers
               v
┌──────────────────────────────┐
| decisionEngine               |
| • Implementation A (RULES)   |
| • Implementation B (spec)    |
└──────────────┬───────────────┘
               | effectiveBands + flags
               v
┌──────────────────────────────┐
| recommendationEngineMatrix   |
| - inferAcneSubtype(flags, cats)
| - lookupMatrixEntry()        |
└──────────────┬───────────────┘
               | routineToRecommendation()
               v
┌──────────────────────────────┐
| Final routine (AM/PM arrays) |
└──────────────────────────────┘
```

#### Entry Points & Triggers
1. **Machine analysis import**
   - `src/services/newConsultationService.ts:531-577` (`getSessionProfile`)
     - Reads `machine_analysis.acne`, `acne_band`, `acne_details`
     - Normalises using `normalizeMachineAcneBand`, outputs `metrics.acne_band` & `metrics.acne_details`
2. **Consult form pre-fill**
   - `src/components/ChooseProfile.tsx:141-168`
     - Converts Supabase metrics to `MachineScanBands`
     - Stores in `machine` prop for `UpdatedConsultForm`
3. **Customer form interactions**
   - Acne concern selection triggers additional screens within Section D (`UpdatedConsultForm.tsx:1768-1866`)
   - Section 0 hard gate `severeCysticAcne` influences later flags (`UpdatedConsultForm.tsx:1441-1454`)
4. **Follow-up trigger logic**
   - `deriveSelfBands` / `deriveSelfBandsFromForm` (decisionEngine) produce self bands consumed by `getFollowUpQuestions`
   - Spec-based follow-ups invoked via `decideAllBandUpdates` (`src/components/UpdatedConsultForm.tsx:1035-1078`)
5. **Recommendation trigger**
   - On review, `prepareRecommendation` composes `RecommendationContext` with machine/effective bands, flags, acne categories (`UpdatedConsultForm.tsx:1435-1468`)

#### Data Flow Summary
1. **Machine band**
   - Supabase `machine_analysis.acne_band` → `getSessionProfile` → `ChooseProfile.machine.acne` → `UpdatedConsultForm` state (`effectiveBands` initial state) → `deriveEffectiveBands` inside recommendation engine → matrix lookup band parameter.
2. **Customer subtype**
   - Customer selects breakout types (`acneBreakouts[]` in formData) → stored with derived categories via `deriveAcneCategoryLabel` → aggregated as `acneCategories` when generating recommendations (`UpdatedConsultForm.tsx:1435-1444`) → passed into decision engine flags (`acneSubtype` first item) and into recommendation engine for subtype inference (`inferAcneSubtype`, `src/services/recommendationEngineMatrix.ts:851-867`).
3. **Band mutations**
   - `deriveSelfBands` and `deriveSelfBandsFromForm` (decisionEngine) set `self.acne` or `self.acne_claim`
   - Legacy RULES in `decisionEngine.ts:302-400` return hard-coded updates
   - Spec outcomes in `decisionRules.ts:117-205` (via `decideAllBandUpdates`) adjust `effectiveBands.acne`
   - Safety/substitution logic in recommendation engine may override indirectly by notes but does not change bands.

#### Files & Functions (Acne-related)
| File & Location | Function / Block | Responsibility | Reads / Writes |
| --- | --- | --- | --- |
| `src/services/newConsultationService.ts:531-577` | `getSessionProfile` | Pulls machine metrics, normalises acne band/details | Supabase → `metrics.acne_band`, `metrics.acne_details` |
| `src/components/ChooseProfile.tsx:141-168` | `handleActivate` | Maps metrics to `MachineScanBands`, sets selected profile | `metrics.acne_band` → `machine.acne` |
| `src/components/UpdatedConsultForm.tsx:68-1888` | Form state & render helpers | Collects `acneBreakouts`, severity per selection; toggles categories | Updates `formData.acneBreakouts[]` |
| `src/components/UpdatedConsultForm.tsx:376-411` | Follow-up state declarations | Maintains `followUp`, `followUpAnswers`, `followUpLocal` | Stores follow-up answers (including acne) |
| `src/components/UpdatedConsultForm.tsx:1035-1078` | `recomputeEngine` | Invokes `decideAllRt`; stores `effectiveBands`, `decisionAudit`, `triageOutcomes` | Writes effective bands & decisions |
| `src/components/UpdatedConsultForm.tsx:1428-1468` | `prepareRecommendation` | Builds `RecommendationContext` (effective bands, flags, acne categories) | Writes `acneSubtype` flag and pass-through |
| `src/lib/decisionEngine.ts:162-205` | `deriveSelfBandsFromForm` | Sets `self.acne_claim = 'yellow'` when “Acne” selected | Hard-codes baseline claim |
| `src/lib/decisionEngine.ts:302-400` | RULE `acne_MAcne_CNone` etc. | Legacy evaluation of acne mismatch with direct outcomes | Modifies `updatedBand`, flags via return object |
| `src/lib/decisionEngine.ts:653-807` | `deriveSelfBands` (newer API) | Builds runtime self bands (sets `self.acne = 'yellow'` if “Acne” selected) | Hard-codes baseline band |
| `src/lib/decisionEngine.ts:875-903` | `decideAllBandUpdates` | Applies spec rules (`decisionRules.ts`) to compute effective bands | Writes `effectiveBands.acne`, collects `flags` |
| `src/lib/decisionRules.ts:117-205` | Acne rule specs | Defines match conditions, follow-up questions, outcome flags | Produces `acne-category:*`, `refer-derm`, etc. |
| `src/lib/decisionRulesUtil.ts:18-128` | `getFollowUpQuestions`, helpers | Matches machine/self bands to rules | Determines when acne rules trigger |
| `src/services/recommendationEngineMatrix.ts:851-867` | `inferAcneSubtype` | Derives subtype from decision flags or `acneCategories` | Reads `context.decisionEngine.flags.acneSubtype`, defaults |
| `src/services/recommendationEngineMatrix.ts:918-938` | `collectConcernSelections` | Builds concern list with subtype + band for lookup | Reads `effectiveBands.acne`, `inferAcneSubtype` output |
| `src/data/concernMatrix.ts` | CSV entries | Provides product rows for Acne {Inflammatory, Comedonal, Situational, Hormonal, Nodulocystic, Pregnancy} × band | Data source for matrix lookups |

---

### Part 2 · Overlapping Implementations

#### A. Hard-coded Logic (`src/lib/decisionEngine.ts`)
- **Locations:**  
  - `deriveSelfBandsFromForm` (`:162-205`) sets `self.acne_claim = 'yellow'` when “Acne” is selected.  
  - Legacy RULES array (`:302-400`) includes `acne_MAcne_CNone` and `acne_MClear_CModerateSevere` logic; returns immediate band updates and flags.  
  - Newer `deriveSelfBands` (`:653-807`) also sets `self.acne = 'yellow'` when acne concern present.
- **Function summary:**
  - `deriveSelfBandsFromForm` & `deriveSelfBands` are used by legacy vs new flows to seed self bands. Both treat acne selection as automatic “yellow”. If acne not selected, they leave `self.acne` undefined (or omit claim).
  - `acne_MAcne_CNone` returns outcomes based on 4 questions (no Q5), sets band and optionally `acne-category:*` flag.
  - `acne_MClear_CModerateSevere` (machine clear vs customer acne) uses 5 questions, sets band and flags like `refer-derm`, `acne-category` variations, `pregnancy-filter`.
- **Band assignment:** Directly via returned `updatedBand` — typically `green`, `blue`, `yellow`, `red` as per responses.
- **Subtype handling:** Flags such as `acne-category:Comedonal` or `acne-category:Mild-Inflammatory`. These are strings parsed later but not consolidated.
- **Trigger conditions:** Occur whenever `getFollowUpQuestions` (legacy path) includes RULES match; relies on `self.acne_claim` / `self.acne` being `yellow` vs machine bands.

#### B. Rules Spec (`src/lib/decisionRules.ts` & `decisionRulesUtil.ts`)
- **Locations:** `decisionRules.ts:117-205` contains acne-related `DecisionRuleSpec` entries.  
- **Structure example (excerpt):**
  ```ts
  {
    id: 'acne_machinePresence_customerNone',
    category: 'Acne',
    machineInput: ['yellow', 'red'],
    customerInput: ['green', 'blue'],
    questions: [
      { id: 'Q1', prompt: 'Any new bumps in last 2 weeks?', options: [...] },
      ...
    ],
    outcomes: [
      { when: 'Q2=Yes AND Q5 in {>15}', updates: ['Acne: Red'], flags: ['acne-category:Inflammatory', 'refer-derm'] },
      ...
    ],
  }
  ```
- **Questions:** Currently defined for two rules (machine present vs customer none; machine clear vs customer present). Questions differ slightly from business requirements (e.g., no Q5 follow-up for pigmentation colour).
- **Outcomes:** Use textual conditions to set `updates` (bands) and `flags` (`acne-category:*`, `refer-derm`, `shift-focus-to-PIH/PIE`, `pregnancy-filter`, `acne-category:Situational acne`).  
- **Conflicts:** This spec is consumed alongside legacy RULES; both can run, producing different results. Additionally, because `deriveSelfBands` sets self acne to yellow, the spec rule `acne_machinePresence_customerNone` never fires when the customer selected “Acne” (self band ceases to be green/blue).

#### C. Consult Form Handling (`src/components/UpdatedConsultForm.tsx`)
- **Locations:**  
  - Concern selection UI (`:1768-1866`) shows multi-select and severity pickers for acne (ACNE_TYPE_OPTIONS).  
  - Follow-up infrastructure (`:376-411`, `:1035-1078`, `:3385-3515`).  
  - Recommendation preparation (`:1435-1468`).
- **Current UI:** Customers choose one or more breakout types (buttons) and provide severity levels per selected type. No single-select `acneBreakoutType`; instead `acneBreakouts[]` (type, severity, derived category).
- **Follow-up rendering:** Uses shared follow-up card with `activeFollowUp` state; renders one question set at a time. There is no chained sequence per rule; each rule’s full question set is shown simultaneously as multi-button inputs.
- **Data storage:** Answers are stored in `followUpLocal` (during editing), then `followUpAnswers[ruleId]` when submitted. Acne breakout selections live in `formData.acneBreakouts`.
- **Submission:** On preview/apply, `acneCategories` derived from chosen breakout categories plus gate flags; these feed into decision-engine flags and recommendation context.
- **Conflicts:** Form collects richer breakout data than either decision-engine implementation consumes. No direct mapping to spec-defined questions; multiple breakout choices conflict with business requirement of mutually exclusive subtype selection.

---

### Part 3 · Functionality Gap Analysis

| Feature | Currently Implemented? | Location (if any) | Missing Components |
| --- | --- | --- | --- |
| Machine/customer mismatch detection | **Partial** | Legacy RULE `acne_MAcne_CNone` (`decisionEngine.ts:302-362`); Spec rule `acne_machinePresence_customerNone` (`decisionRules.ts:117-143`) | Self-band never green when concern selected, so mismatch rarely triggers; logic differs from requirements |
| Breakout type question (single choice) | **Partial** | `UpdatedConsultForm.tsx:1782-1840` (multi-select) | Multi-select with severity; no dedicated `acneBreakoutType` field |
| Comedonal subtype follow-up (3 Q) | **Missing** | — | No dedicated flow; only severity step per selection |
| Inflammatory subtype follow-up (5 Q) | **Partial** | Spec rule `acne_MClear_CModerateSevere` has 5 Q but different triggers | Needs separate flow when customer reports acne, not just machine-clear scenario |
| Hormonal subtype follow-up (5 Q) | **Missing** | — | No rule or UI |
| Path A: 5 general questions for non-selectors | **Partial** | Spec rule `acne_machinePresence_customerNone` questions | Flow differs (no pigmentation colour follow-up; doesn’t short-circuit) |
| Path B: Subtype classification | **Missing** | — | No branching from general questions into subtype-specific follow-ups |
| Post-acne pigmentation detection (Q2 logic) | **Partial** | Outcome `shift-focus-to-PIH/PIE` in spec rule | No pigmentation colour capture; remarks not surfaced |
| Pregnancy auto-populate from Section 0 | **Missing** | Inflammatory spec rule asks Q5 directly | No reuse of Section 0 answers |
| Situational acne flag (Q4 trigger) | **Partial** | Spec outcome `acne-category:Situational acne` (`decisionRules.ts:161`) | Not surfaced to recommendation notes |
| Hormonal contradiction handling | **Missing** | — | No validation path |
| Large painful bumps → immediate referral | **Missing** | UI allows selecting in severity step but no immediate flag | Only triggered via mismatch rule when machine clear |
| Matrix lookup with subtype | **Partial** | `inferAcneSubtype` (`recommendationEngineMatrix.ts:851-867`) | Defaults to Inflammatory when flags/categories absent |
| Remarks field population | **Partial** | Notes appended for compatibility/safety; decision remarks not surfaced | No pipeline from decision outcomes to user-visible notes |

---

### Part 4 · Data Structure Inventory

**Machine Analysis (Supabase profile)** – from `getSessionProfile`:
```ts
type MachineAnalysisRow = {
  acne?: number;
  acne_band?: string | null;
  // normalised output extends with:
  acne_details?: { band?: string | null; breakouts?: Array<{ type?: string; severity?: string; category?: string }>; raw?: unknown } | null;
  // other *_band fields omitted here
};
```
Returned `metrics` object keeps raw strings (e.g., `'red'`, `'yellow'`).

**Form State (UpdatedConsultForm)**:
```ts
formData: UpdatedConsultData = {
  mainConcerns: string[],
  concernPriority?: string[],
  acneBreakouts: Array<{ type: string; severity: string; category: AcneCategory }>,
  acneDuration: string,
  severeCysticAcne: string,
  pregnancy: string,
  pregnancyBreastfeeding: string,
  // no dedicated acneBreakoutType field
  // follow-up answers stored separately:
};
followUpAnswers: Record<string, Record<string, string | string[]>>;
followUpLocal: Record<string, string | string[]>; // current edit buffer
```

**Decision Engine Output (`decideAllBandUpdates`)**:
```ts
interface Decision {
  ruleId: string;
  updates: Partial<RuntimeMachineBands>; // { acne?: 'red' | 'yellow' | ... }
  flags?: string[];  // e.g., ['acne-category:Comedonal']
  safety?: string[]; // e.g., ['refer-derm']
}

type RuntimeMachineBands = {
  acne?: 'green' | 'blue' | 'yellow' | 'red';
  // ... other categories
};
```
Flags are plain strings. `acneSubtype` is inferred later; no strongly-typed subtype in decision output.

**Recommendation Context** (`src/services/recommendationEngineMatrix.ts:45-70`):
```ts
interface RecommendationContext {
  skinType: string | string[];
  decisionEngine?: {
    effectiveBands: Partial<Record<string, string>>;
    flags?: {
      acneSubtype?: string;
      // acneHormonal?: boolean; dermatologistReferral?: boolean; barrierOverride?: boolean;
    };
  };
  effectiveBands?: Partial<Record<string, string>>;
  acneCategories?: string[];
  formData: { mainConcerns?: string[]; serumComfort?: string; severeCysticAcne?: string; ... };
}
```

**Matrix Lookup** (`lookupMatrixEntry` in `src/data/concernMatrix.ts:695-716`):
```ts
lookupMatrixEntry({
  concern: 'acne' | ...,
  subtype: string,    // e.g., 'Inflammatory'
  skinType: 'Dry' | 'Combo' | 'Oily' | 'Sensitive' | 'Normal',
  band: 'blue' | 'yellow' | 'red' | 'green',
});
```
Subtype passed from `inferAcneSubtype`. Bands use effective bands (fallback to blue). Matrix contains rows for Comedonal, Inflammatory, Situational, Hormonal (blue only), Nodulocystic (red), Pregnancy (blue). Missing yellow/red hormonal rows.

---

### Part 5 · Follow-Up Question System

- **Infrastructure**:  
  - State: `followUp`, `activeFollowUp`, `followUpAnswers`, `followUpLocal`, `followUpDrafts` (`UpdatedConsultForm.tsx:376-411`).  
  - When `followUp` is set, `setActiveFollowUp` renders the card (`renderStep` and conditional block around `:3385-3515`). Only one follow-up rendered at a time, but multiple rule cards are listed in the sidebar allowing editing.
  - Answers are stored as button clicks toggling entries in `followUpLocal`; once the user confirms, answers persist in `followUpAnswers[ruleId]` (`UpdatedConsultForm.tsx:792-807`).
- **Multi-step support**: Questions within a rule are displayed simultaneously; there is no per-question branching. Each rule resolves in one modal interaction.
- **Example (Sebum mismatch)**:  
  - UI uses same card; buttons call `toggleFollowUpOption`.  
  - Completion pushes answers to `followUpAnswers` and recomputes engine outputs (`recomputeEngine`).  
  - Validation ensures each question has an answer before submitting (`UpdatedConsultForm.tsx:764-773`, `1526-1535`).
- **Limitations**: No sequencing; no dynamic follow-up (e.g., showing extra question when selecting specific option). Storing answers per rule but not flattening to dedicated formData fields.

---

### Part 6 · Conflicts & Blockers

**Conflict 1 · Self-band assignment**
- Implementation A (`deriveSelfBands`, `deriveSelfBandsFromForm`) sets acne bands/claims to yellow whenever “Acne” is selected.  
- Implementation B (spec rule `acne_machinePresence_customerNone`) expects self band to be green/blue to trigger mismatch.  
- Result: Path A rarely fires if customer selected the concern; machine/customer reconciliation is bypassed.  
- Lines: `decisionEngine.ts:162-205`, `653-807` vs `decisionRules.ts:117-143`.

**Conflict 2 · Dual rule engines**
- Legacy RULES (`decisionEngine.ts:302-400`) and spec rules (`decisionRules.ts`) run concurrently.  
- They can emit different bands/flags for the same answers, leading to ambiguous `effectiveBands` depending on which path is consumed.  
- This complicates testing and makes it unclear which implementation is authoritative.

**Conflict 3 · Form vs spec questions**
- Form collects breakout types/severity via `acneBreakouts[]`, whereas spec rules expect Q1–Q5 answers. No code maps form fields to spec expectations.  
- Conversely, spec outcomes (e.g., `shift-focus-to-PIH/PIE`) aren’t surfaced in the form UI or notes.

**Blockers to targeted changes**
- Modifying `deriveSelfBands` to stop auto-setting yellow would affect any code using `self.acne` or `self.acne_claim` (legacy rule matching, consult autofill). Need to audit all consumers before adjusting.
- Adding `acneSubtype` as a first-class property affects recommendation engine inference, matrix lookups, scheduling notes, and any stored analytics relying on current categories.
- Several therapeutic notes assume yellow = user selection; changing baseline may require updates to UI validations and analytics dashboards.

---

### Part 7 · Dependencies & Side Effects

**Consumers of `effectiveBands.acne`:**
- `collectConcernSelections` (`recommendationEngineMatrix.ts:918-937`) – chooses primary concern band.
- `inferAcneSubtype` fallback uses band when building scar concern (line 957).  
- Display in consult form developer panel (`UpdatedConsultForm.tsx:3289-3324`).  
- Scripts/tests (`scripts/recommendationReportScenario.ts`, `scripts/matrixSmokeTest.ts`).  
Changing band derivation affects primary concern selection, matrix lookup, and AM/PM plan generation.

**Consumers of `flags.acneSubtype`:**
- `inferAcneSubtype` reads `context.decisionEngine.flags.acneSubtype` (line 852).  
- Recommendation context fosters additional booleans (`acneHormonal`, `dermatologistReferral`) used for notes or gating.  
- Currently, subtype defaults to first acne category or flags text; inconsistent values (e.g., `'situational acne'`, `'mild inflammatory'`) can cause misaligned matrix lookups.

**Call chains:**
- `UpdatedConsultForm` → `decideAllRt` (`decisionEngine.decideAllBandUpdates`) → (spec or legacy rules) → `effectiveBands + decisions` → `prepareRecommendation` → `generateRecommendations` → `lookupMatrixEntry` → scheduler.  
- Any change to early steps ripples through entire recommendation pipeline.

---

### Part 8 · Recommended Refactor Strategy

**Phase 1 · Documentation & Data Prep (Low risk)**
1. Add explicit fields to `formData` for acne subtype intent (`acneBreakoutPrimary`, `acneFollowUpAnswers`) without altering behaviour.
2. Extend decision engine outputs to carry structured metadata (e.g., `decisionAudit` remark fields) for reference purposes only.
3. Audit all references to `self.acne`/`self.acne_claim` to prepare for changing baseline logic.

**Phase 2 · Consolidate Logic (Moderate risk)**
1. Choose one source of truth — recommended to keep `decisionRules` (spec) and retire legacy RULES in `decisionEngine.ts`.  
2. Gradually migrate hard-coded RULES to spec format. Disable duplicated logic behind feature flags to test results safely.
3. Update form handling so breakout selections feed into the spec rule answers, not bespoke arrays.

**Phase 3 · Behavioural Changes (High risk)**
1. Modify `deriveSelfBands` to leave acne undefined when customer selects it; ensure all consumers handle undefined gracefully.
2. Implement new follow-up flows (Path A/B) with sequential UI, gating, and error handling. Store subtype in a canonical field (`flags.acneSubtype`).  
3. Update matrix inference: ensure subtype strings map exactly to matrix rows; add missing hormonal rows or fallback logic.

**Phase 4 · Integration & QA**
1. Update recommendation notes/safety gating to reflect new flags (pregnancy safe, situational triggers, dermatologist referral).  
2. Add automated scenario tests (see Testing Checklist in requirements) covering mismatch, subtype flows, pregnancy behaviour, referral gating.  
3. Document final flow in README and internal knowledge base; remove developer-only panels or align them with new data fields.

Each phase should include regression checks on related concerns (sebum, pigmentation) because follow-up infrastructure is shared.

---

### Key Takeaways

- Acne logic currently lives in three overlapping systems with inconsistent triggers and outcomes.  
- Baseline band assignment forces acne mismatch rules to skip, limiting reconciliation.  
- Form UI collects multi-select breakout data but doesn't integrate with decision rules; subtypes default to `Inflammatory` during matrix lookup.  
- A staged refactor is required: first align data structures, then consolidate rule evaluation, finally implement the desired business flow.
