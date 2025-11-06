# COMPREHENSIVE UI REFACTORING PLAN
## Complete Migration Strategy for Aetheria Customer Forms

**Created:** 2025-11-06
**Scope:** Full UI overhaul with zero breaking changes
**Timeline:** Estimated 3-4 hours of execution

---

## 📊 CURRENT STATE ANALYSIS

### File Statistics
```
UpdatedConsultForm.tsx:     4,023 lines  (CRITICAL - needs refactoring)
RecommendationDisplay.tsx:    702 lines  (needs refactoring)
ConsultantInputForm.tsx:      264 lines  (minor refactoring)
FeedbackForm.tsx:             779 lines  (needs refactoring)
────────────────────────────────────────
TOTAL:                      5,768 lines
```

### Identified Patterns
- **484 hard-coded className strings** in UpdatedConsultForm alone
- **36 useState hooks** causing state management complexity
- **38 switch cases** in renderStep function
- **~200+ duplicated button patterns**
- **Repetitive form step structures**

---

## 🎯 SCOPE OF WORK

### Phase 1: Core Form Steps (Steps 1-19)
**Fixed steps that appear for every user:**

#### A. Personal Information (Steps 1-4)
- [x] Step 1: Name - **DONE** (PersonalInfoSteps.tsx)
- [x] Step 2: Phone - **DONE** (PersonalInfoSteps.tsx)
- [x] Step 3: Date of Birth - **DONE** (PersonalInfoSteps.tsx)
- [x] Step 4: Gender - **DONE** (PersonalInfoSteps.tsx)

#### B. Safety Gates (Steps 5-9)
- [x] Step 5: Pregnancy - **DONE** (SafetyGateSteps.tsx)
- [x] Step 6: Isotretinoin - **DONE** (SafetyGateSteps.tsx)
- [x] Step 7: Severe Cystic Acne - **DONE** (SafetyGateSteps.tsx)
- [x] Step 8: Allergies - **DONE** (SafetyGateSteps.tsx)
- [x] Step 9: Barrier Stress - **DONE** (SafetyGateSteps.tsx)

#### C. Skin Basics (Steps 10-12) - **TO DO**
- [ ] Step 10: Skin Type
- [ ] Step 11: Oil Levels
- [ ] Step 12: Hydration Levels

#### D. Sensitivity Screening (Step 13) - **TO DO**
- [ ] Step 13: 7-question sensitivity assessment

#### E. History & Routine (Steps 14-18) - **TO DO**
- [ ] Step 14: Diagnosed Conditions
- [ ] Step 15: Prescription Treatments
- [ ] Step 16: Professional Treatments
- [ ] Step 17: Current Products (complex - has ProductAutocomplete)
- [ ] Step 18: Irritating Products (TagInput component)

#### F. Main Concerns (Step 19) - **TO DO**
- [ ] Step 19: Concern Selection (multi-select, max 3)

### Phase 2: Dynamic Concern Steps (Steps 20+)
**Generated based on selected concerns:**

#### G. Concern-Specific Follow-ups - **TO DO**
- [ ] Acne Type & Severity (complex - array-based)
- [ ] Pigmentation Type & Severity
- [ ] Fine Lines & Wrinkles Severity
- [ ] Large Pores Severity
- [ ] Bumpy Skin Severity
- [ ] Post Acne Scarring Type & Severity/Color

#### H. Concern Prioritization - **TO DO**
- [ ] Priority ordering (if 2+ concerns selected)

### Phase 3: Preferences & Legal (Variable steps)
- [ ] Routine Steps preference
- [ ] Serum Comfort
- [ ] Legal Disclaimer (5 checkboxes + master)

### Phase 4: Follow-up Questions UI
**Complex reactive questionnaires:**
- [ ] Follow-up question modal/dialog
- [ ] Multi-step follow-up flows
- [ ] Conditional question rendering (Q2a depends on Q2, etc.)

### Phase 5: Other Major Components
- [ ] RecommendationDisplay.tsx (702 lines)
- [ ] FeedbackForm.tsx (779 lines)
- [ ] ConsultantInputForm.tsx (264 lines - minor)

---

## 📋 DETAILED EXECUTION PLAN

### PHASE 1: SKIN BASICS STEPS (Steps 10-12)
**Estimated time: 30 minutes**

#### Step 10: Skin Type
```tsx
// Pattern: RadioGroup with descriptions
Options:
- Normal – Balanced
- Combination – Hydrated
- Combination – Dehydrated
- Oily – Hydrated
- Oily – Dehydrated
- Dry – Dehydrated
```

#### Step 11: Oil Levels
```tsx
// Pattern: RadioGroup with severity mapping
Options:
- Comfortable, no shine or greasiness → Green
- A little shine (T-zone or cheeks) → Blue
- Noticeable shine or grease → Yellow
- Very oily or greasy → Red
```

#### Step 12: Hydration Levels
```tsx
// Pattern: RadioGroup with severity mapping
Options:
- Comfortable, no tightness → Green
- Slight tightness (occasional) → Blue
- Noticeable tightness or flaking → Yellow
- Very tight, flaky, or uncomfortable → Red
```

**New Component Needed:** `SkinBasicsSteps.tsx`

---

### PHASE 2: SENSITIVITY SCREENING (Step 13)
**Estimated time: 20 minutes**

**Pattern:** 7 Yes/No questions in sequence
- Flushing/redness
- Professional diagnosis
- Cleansing sting/burn
- Product irritation
- Sun sensitivity
- Visible capillaries
- Seasonal sensitivity

**Implementation:**
- Single component with question index state
- RadioGroup for each question
- Calculation logic at the end

**New Component Needed:** `SensitivityScreeningStep.tsx`

---

### PHASE 3: HISTORY & ROUTINE (Steps 14-18)
**Estimated time: 45 minutes**

#### Step 14-16: Text Inputs
- Simple text areas for conditions, prescriptions, treatments

#### Step 17: Current Products (COMPLEX)
- Uses `ProductAutocomplete` component
- Array of products with duration
- Needs special handling

#### Step 18: Irritating Products (COMPLEX)
- Uses custom `TagInput` component
- Autocomplete suggestions
- Already implemented in UpdatedConsultForm (lines 1148-1325)

**New Components Needed:**
- `HistorySteps.tsx` (steps 14-16)
- `CurrentProductsStep.tsx` (step 17)
- `IrritatingProductsStep.tsx` (step 18) - extract TagInput

---

### PHASE 4: MAIN CONCERNS (Step 19)
**Estimated time: 20 minutes**

**Pattern:** CheckboxGroup with max 3 selections
```tsx
Concerns:
- Acne
- Pigmentation
- Fine lines & wrinkles
- Large pores
- Bumpy skin
- Post Acne Scarring
```

**New Component Needed:** `MainConcernsStep.tsx`

---

### PHASE 5: CONCERN FOLLOW-UPS (Steps 20+)
**Estimated time: 90 minutes**

**Most Complex Part** - Already partially done in UpdatedConsultForm.tsx

Each concern has custom UI:

#### Acne (Type + Severity)
- Type: Multi-select checkboxes (Blackheads, Whiteheads, etc.)
- Severity: For each selected type, choose severity
- **Already implemented**: lines 2279-2423
- **Extract to:** `AcneConcernSteps.tsx`

#### Pigmentation (Type + Severity)
- Type: Red or Brown
- Severity: Different options based on type
- **Extract to:** `PigmentationConcernSteps.tsx`

#### Post Acne Scarring (Type + Severity/Color)
- Type: Ice pick, Rolling, PIH, Keloid
- Severity/Color: Depends on type selected
- **Already implemented**: lines 2427-2517
- **Extract to:** `ScarringConcernSteps.tsx`

#### Simple Concerns (Severity only)
- Fine Lines, Pores, Bumpy Skin
- Single RadioGroup each
- **Extract to:** `SimpleConcernSteps.tsx`

---

### PHASE 6: PREFERENCES & LEGAL
**Estimated time: 20 minutes**

#### Routine Steps
- How many steps comfortable with (3, 4, 5+)

#### Serum Comfort
- Comfort level with serums

#### Legal Disclaimer
- 5 individual checkboxes
- Master "I agree to all" checkbox

**New Component Needed:** `PreferencesAndLegalSteps.tsx`

---

### PHASE 7: FOLLOW-UP QUESTIONS SYSTEM
**Estimated time: 45 minutes**

**Current Implementation:** Lines 1000-1145 + modal rendering

**Complex reactive system:**
- Machine vs. Customer discrepancy resolution
- Conditional questions (Q2a only if Q2 = Yes)
- Multi-step flows
- Answer persistence

**Strategy:**
- Extract to `FollowUpQuestionsModal.tsx`
- Keep logic intact but clean up UI
- Use RadioGroup/CheckboxGroup components

---

### PHASE 8: OTHER COMPONENTS

#### RecommendationDisplay.tsx (702 lines)
**Estimated time: 60 minutes**

**Patterns identified:**
- Product card displays
- Routine step visualization
- Schedule calendar view
- Price tier toggle
- Variant selection

**Refactor using:**
- Card variants from our system
- Badge components
- Consistent spacing

**New file:** `RecommendationDisplay.v2.tsx` (gradual migration)

#### FeedbackForm.tsx (779 lines)
**Estimated time: 45 minutes**

**Similar to UpdatedConsultForm** - likely has:
- Multiple steps
- Hard-coded styling
- Form validation

**Refactor using:**
- FormStep component
- RadioGroup/CheckboxGroup
- TextInput

#### ConsultantInputForm.tsx (264 lines)
**Estimated time: 20 minutes**

**Smaller component** - quick wins:
- Replace button patterns
- Use Card components
- Consistent styling

---

## 🔧 ADDITIONAL COMPONENTS TO CREATE

### 1. ProgressBar Component
```tsx
<ProgressBar current={5} total={25} />
```
**Used in:** UpdatedConsultForm navigation

### 2. NavigationButtons Component
```tsx
<NavigationButtons
  onBack={handleBack}
  onNext={handleNext}
  backLabel="Previous"
  nextLabel="Continue"
  showBack={currentStep > 1}
  nextDisabled={!isValid}
/>
```

### 3. SectionHeader Component
```tsx
<SectionHeader
  icon={Shield}
  title="Section A – Skin Basics"
  description="Help us understand your skin type"
/>
```

### 4. ErrorSummary Component
```tsx
<ErrorSummary errors={errors} />
```

### 5. Badge Component (enhance existing)
```tsx
<Badge variant="concern" concern="acne">Acne</Badge>
```

---

## 🧪 TESTING STRATEGY

### Unit Testing Checklist
For each refactored step:
- [ ] Renders correctly
- [ ] Props are passed
- [ ] Validation works
- [ ] Error states display
- [ ] onChange updates formData
- [ ] Keyboard navigation
- [ ] Screen reader accessible

### Integration Testing Checklist
- [ ] Forward navigation works
- [ ] Back navigation works
- [ ] Data persists between steps
- [ ] Step skipping logic (e.g., pregnancy for males)
- [ ] Dynamic step calculation
- [ ] Follow-up questions trigger correctly
- [ ] Concern-based routing

### E2E Testing Scenarios
1. **Happy Path:** Complete entire form with valid data
2. **Validation:** Try to proceed with empty required fields
3. **Edge Cases:**
   - Select 3 concerns, then deselect one
   - Change gender after pregnancy question
   - Fill form, go back, change answers
4. **Mobile:** Test on small screen
5. **Keyboard:** Tab through entire form
6. **Screen Reader:** NVDA/VoiceOver compatibility

---

## 📦 FILE STRUCTURE (After Refactoring)

```
src/
├── components/
│   ├── form/                         # ✅ DONE - Reusable components
│   │   ├── OptionButton.tsx
│   │   ├── RadioGroup.tsx
│   │   ├── CheckboxGroup.tsx
│   │   ├── FormStep.tsx
│   │   ├── TextInput.tsx
│   │   ├── ProgressBar.tsx          # TO CREATE
│   │   ├── NavigationButtons.tsx    # TO CREATE
│   │   ├── SectionHeader.tsx        # TO CREATE
│   │   └── index.ts
│   │
│   ├── steps/                        # Form step components
│   │   ├── PersonalInfoSteps.tsx    # ✅ DONE (Steps 1-4)
│   │   ├── SafetyGateSteps.tsx      # ✅ DONE (Steps 5-9)
│   │   ├── SkinBasicsSteps.tsx      # TO CREATE (Steps 10-12)
│   │   ├── SensitivityScreeningStep.tsx  # TO CREATE (Step 13)
│   │   ├── HistorySteps.tsx         # TO CREATE (Steps 14-16)
│   │   ├── CurrentProductsStep.tsx  # TO CREATE (Step 17)
│   │   ├── IrritatingProductsStep.tsx    # TO CREATE (Step 18)
│   │   ├── MainConcernsStep.tsx     # TO CREATE (Step 19)
│   │   └── PreferencesAndLegalSteps.tsx  # TO CREATE
│   │
│   ├── concerns/                     # Concern-specific follow-ups
│   │   ├── AcneConcernSteps.tsx     # TO CREATE
│   │   ├── PigmentationConcernSteps.tsx  # TO CREATE
│   │   ├── ScarringConcernSteps.tsx # TO CREATE
│   │   ├── SimpleConcernSteps.tsx   # TO CREATE (Pores, Texture, Wrinkles)
│   │   └── ConcernPriorityStep.tsx  # TO CREATE
│   │
│   ├── UpdatedConsultForm.tsx       # REFACTOR - Main orchestrator (4023 → ~800 lines)
│   ├── RecommendationDisplay.tsx    # REFACTOR (702 → ~300 lines)
│   ├── FeedbackForm.tsx             # REFACTOR (779 → ~400 lines)
│   ├── ConsultantInputForm.tsx      # REFACTOR (264 → ~150 lines)
│   └── FollowUpQuestionsModal.tsx   # TO EXTRACT
│
└── styles/
    ├── design-tokens.ts              # ✅ DONE
    └── variants.ts                   # ✅ DONE
```

---

## ⚠️ RISK MITIGATION

### High-Risk Areas
1. **Follow-up questions logic** - Complex state dependencies
2. **Dynamic step calculation** - Math must be perfect
3. **ProductAutocomplete** - External component integration
4. **DatePicker** - Mantine component with custom styling
5. **Concern array handling** - Acne breakouts are array-based

### Mitigation Strategy
- **Git branching:** Work in feature branch, can revert
- **Feature flags:** Toggle old vs new implementation
- **Incremental testing:** Test each phase before moving on
- **Fallback ready:** Keep old code commented until confident

### Rollback Plan
```bash
# If something breaks badly:
git log --oneline  # Find last good commit
git revert <commit-hash>
git push
```

---

## 📈 SUCCESS METRICS

### Code Quality
- [ ] UpdatedConsultForm: < 1000 lines (from 4023)
- [ ] Hard-coded classNames: < 50 (from 484)
- [ ] useState hooks: < 15 (from 36)
- [ ] Component files: ~25 modular files
- [ ] Code duplication: < 5%

### Performance
- [ ] Build time: No regression
- [ ] Bundle size: Similar or smaller (tree-shaking)
- [ ] Runtime performance: No degradation

### Developer Experience
- [ ] Change button style: 1 edit (from 200+)
- [ ] Add new step: < 50 lines (from 150+)
- [ ] Time to find bug: < 5 minutes (from 30+)

### User Experience
- [ ] Zero visual regressions
- [ ] Zero functional regressions
- [ ] Improved accessibility
- [ ] Mobile responsive

---

## 🎯 EXECUTION PHASES

### Phase 1 (Steps 1-9) ✅ COMPLETE
- Personal Info
- Safety Gates
**Time: DONE** | **Risk: LOW** | **Lines saved: ~430**

### Phase 2 (Steps 10-13) - NEXT
- Skin Basics
- Sensitivity Screening
**Time: 50 min** | **Risk: LOW** | **Lines saved: ~200**

### Phase 3 (Steps 14-19)
- History & Routine
- Main Concerns
**Time: 65 min** | **Risk: MEDIUM** | **Lines saved: ~300**

### Phase 4 (Steps 20+)
- Concern Follow-ups
- Priority
- Preferences
- Legal
**Time: 110 min** | **Risk: HIGH** | **Lines saved: ~800**

### Phase 5
- Follow-up Questions
- Navigation
- Progress
**Time: 45 min** | **Risk: MEDIUM** | **Lines saved: ~200**

### Phase 6
- Other components
- Final testing
- Cleanup
**Time: 125 min** | **Risk: LOW** | **Lines saved: ~1000**

**TOTAL ESTIMATED TIME: ~6 hours**
**TOTAL LINES SAVED: ~2,930 lines**

---

## ✅ APPROVAL TO PROCEED

This plan covers:
- ✅ Every step in UpdatedConsultForm.tsx (1-38+)
- ✅ All major components (Recommendation, Feedback, Consultant)
- ✅ Comprehensive testing strategy
- ✅ Risk mitigation and rollback plan
- ✅ Clear success metrics
- ✅ Realistic time estimates

**Ready to execute?** Type "YES" to begin full migration.
