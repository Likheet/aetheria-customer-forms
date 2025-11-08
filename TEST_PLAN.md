# Comprehensive Test Plan
**Aetheria Customer Forms - Client Consultation System**
**Date**: 2025-11-08
**Purpose**: Ensure comprehensive test coverage for cleanup and optimization

---

## Test Coverage Goals

| Category | Current | Target (Phase 1) | Target (Final) |
|----------|---------|------------------|----------------|
| Unit Tests | ~5% | 25% | 60% |
| Integration Tests | 0% | 10% | 25% |
| E2E Tests | 0% | 0% | 15% |
| **Overall** | **~5%** | **20-25%** | **60%+** |

---

## Phase 1: Unit Tests

### A. Validator Tests

#### Existing Tests ✅ (3 files, 452 lines)

1. **personalInfo.validator.test.ts** (201 lines)
   - ✅ validateName
   - ✅ validatePhone
   - ✅ validateDateOfBirth
   - ✅ validateGender

2. **products.validator.test.ts** (64 lines)
   - ✅ validateCurrentProducts
   - ✅ validateIrritatingProducts

3. **concerns.validator.test.ts** (187 lines)
   - ✅ validateMainConcerns
   - ✅ validateConcernPriority
   - ✅ validateAcneConcern
   - ✅ validatePigmentationConcern

#### New Validator Tests (4 files)

4. **safetyGates.validator.test.ts** (NEW - ~150 lines)
   ```typescript
   describe('Safety Gates Validation', () => {
     describe('validatePregnancy', () => {
       it('should accept "Yes" or "No"', () => {
         expect(validatePregnancy('Yes')).toEqual({ isValid: true });
         expect(validatePregnancy('No')).toEqual({ isValid: true });
       });

       it('should reject empty string', () => {
         expect(validatePregnancy('')).toEqual({
           isValid: false,
           error: 'Please answer this question'
         });
       });
     });

     describe('validateIsotretinoin', () => {
       it('should accept "Yes" or "No"', () => {
         expect(validateIsotretinoin('Yes')).toEqual({ isValid: true });
       });
     });

     describe('validateSevereCysticAcne', () => {
       it('should accept "Yes" or "No"', () => {
         expect(validateSevereCysticAcne('No')).toEqual({ isValid: true });
       });
     });

     describe('validateAllergyConflict', () => {
       it('should accept "Yes" or "No"', () => {
         expect(validateAllergyConflict('No')).toEqual({ isValid: true });
       });
     });

     describe('validateBarrierStress', () => {
       it('should accept "Yes" or "No"', () => {
         expect(validateBarrierStress('No')).toEqual({ isValid: true });
       });
     });
   });
   ```

5. **skinBasics.validator.test.ts** (NEW - ~180 lines)
   ```typescript
   describe('Skin Basics Validation', () => {
     describe('validateSkinType', () => {
       it('should accept valid skin types', () => {
         const validTypes = ['Oily', 'Dry', 'Combination', 'Normal'];
         validTypes.forEach(type => {
           expect(validateSkinType(type)).toEqual({ isValid: true });
         });
       });

       it('should reject invalid types', () => {
         expect(validateSkinType('Unknown')).toEqual({
           isValid: false,
           error: 'Please select a valid skin type'
         });
       });
     });

     describe('validateOilLevels', () => {
       it('should accept valid oil levels', () => {
         const validLevels = ['Very Oily', 'Slightly Oily', 'Balanced', 'Dry'];
         validLevels.forEach(level => {
           expect(validateOilLevels(level)).toEqual({ isValid: true });
         });
       });
     });

     describe('validateSensitivityTriggers', () => {
       it('should accept empty array (no triggers)', () => {
         expect(validateSensitivityTriggers([])).toEqual({ isValid: true });
       });

       it('should accept valid triggers', () => {
         const triggers = ['Fragrance', 'Sun', 'Weather'];
         expect(validateSensitivityTriggers(triggers)).toEqual({ isValid: true });
       });

       it('should reject invalid triggers', () => {
         expect(validateSensitivityTriggers(['Invalid'])).toEqual({
           isValid: false,
           error: 'Invalid sensitivity trigger'
         });
       });
     });
   });
   ```

6. **preferences.validator.test.ts** (NEW - ~100 lines)
   ```typescript
   describe('Preferences Validation', () => {
     describe('validateRoutineSteps', () => {
       it('should accept valid routine preferences', () => {
         const valid = ['Simple routine (3-4 products)', 'Standard routine (5-6 products)'];
         valid.forEach(pref => {
           expect(validateRoutineSteps(pref)).toEqual({ isValid: true });
         });
       });

       it('should reject empty string', () => {
         expect(validateRoutineSteps('')).toEqual({
           isValid: false,
           error: 'Please select routine preference'
         });
       });
     });

     describe('validateSerumComfort', () => {
       it('should accept valid comfort levels', () => {
         const valid = ['Yes, comfortable', 'Neutral', 'Prefer lighter options'];
         valid.forEach(level => {
           expect(validateSerumComfort(level)).toEqual({ isValid: true });
         });
       });
     });
   });
   ```

7. **legal.validator.test.ts** (NEW - ~80 lines)
   ```typescript
   describe('Legal Validation', () => {
     describe('validateLegalDisclaimers', () => {
       it('should accept when all 7 disclaimers checked', () => {
         const allChecked = {
           understands_personalized: true,
           understands_not_medical: true,
           understands_patch_test: true,
           understands_gradual_intro: true,
           consents_communication: true,
           confirms_info_accuracy: true,
           accepts_liability: true,
         };
         expect(validateLegalDisclaimers(allChecked)).toEqual({ isValid: true });
       });

       it('should reject if any disclaimer not checked', () => {
         const missing = {
           understands_personalized: true,
           understands_not_medical: false, // Missing
           understands_patch_test: true,
           understands_gradual_intro: true,
           consents_communication: true,
           confirms_info_accuracy: true,
           accepts_liability: true,
         };
         expect(validateLegalDisclaimers(missing)).toEqual({
           isValid: false,
           error: 'All disclaimers must be accepted'
         });
       });

       it('should provide specific error for each missing disclaimer', () => {
         const result = validateLegalDisclaimers({ /* all false */ });
         expect(result.error).toContain('7 disclaimers');
       });
     });
   });
   ```

---

### B. Component Tests

#### Step Component Tests (12 files, ~1,200 lines total)

**Testing Strategy for All Step Components**:
1. Renders with initial formData value
2. Calls updateFormData when user interacts
3. Displays validation error when present
4. Memoization works (no re-render if props unchanged)

**Template**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentStep } from './ComponentStep';

describe('ComponentStep', () => {
  const defaultProps = {
    formData: {},
    updateFormData: jest.fn(),
    errors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    render(<ComponentStep {...defaultProps} formData={{ field: 'value' }} />);
    expect(screen.getByDisplayValue('value')).toBeInTheDocument();
  });

  it('calls updateFormData on change', () => {
    const updateMock = jest.fn();
    render(<ComponentStep {...defaultProps} updateFormData={updateMock} />);

    const input = screen.getByLabelText(/field name/i);
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(updateMock).toHaveBeenCalledWith({ field: 'new value' });
  });

  it('displays validation error', () => {
    render(<ComponentStep {...defaultProps} errors={{ field: 'Error message' }} />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('does not re-render with same props (memoization)', () => {
    const { rerender } = render(<ComponentStep {...defaultProps} />);
    const element = screen.getByTestId('component-step');

    rerender(<ComponentStep {...defaultProps} />);
    expect(element).toBe(screen.getByTestId('component-step'));
  });
});
```

**Files to Create**:

1. **PersonalInfoSteps.test.tsx** (~120 lines)
   - NameStep
   - PhoneStep
   - DateOfBirthStep
   - GenderStep

2. **SafetyGateSteps.test.tsx** (~150 lines)
   - PregnancyStep
   - IsotretinoinStep
   - SevereCysticAcneStep
   - AllergyConflictStep
   - BarrierStressStep

3. **SkinBasicsSteps.test.tsx** (~120 lines)
   - SkinTypeStep
   - OilLevelsStep
   - HydrationLevelsStep
   - SensitivityScreeningStep

4. **MedicalHistorySteps.test.tsx** (~90 lines)
   - DiagnosedConditionsStep
   - PrescriptionTreatmentsStep
   - ProfessionalTreatmentsStep

5. **ProductSteps.test.tsx** (~80 lines)
   - CurrentProductsStep
   - IrritatingProductsStep

6. **ConcernSteps.test.tsx** (~80 lines)
   - MainConcernsStep
   - ConcernPriorityStep

7. **PreferencesSteps.test.tsx** (~80 lines)
   - RoutineStepsStep
   - SerumComfortStep
   - LegalDisclaimerStep

8. **AcneConcernSteps.test.tsx** (~100 lines)
   - AcneTypeStep
   - AcneSeverityStep

9. **PigmentationConcernSteps.test.tsx** (~100 lines)
   - PigmentationTypeStep
   - PigmentationSeverityStep

10. **ScarringConcernSteps.test.tsx** (~100 lines)
    - ScarringTypeStep
    - ScarringSeverityStep

11. **SimpleConcernSteps.test.tsx** (~120 lines)
    - WrinklesStep
    - PoresStep
    - TextureStep

12. **FormHelpers.test.tsx** (~200 lines)
    - FormStep
    - TextInput
    - TextArea
    - RadioGroup
    - CheckboxGroup
    - OptionButton
    - TagInput

---

### C. Engine/Service Tests

#### Decision Engine Tests (NEW - ~300 lines)

**File**: decisionEngine.test.ts

```typescript
import {
  deriveSelfBands,
  mergeBands,
  computeSensitivityFromForm,
  deriveAcneCategoryLabel,
  getFollowUpQuestions,
} from '../lib/decisionEngine';

describe('Decision Engine', () => {
  describe('deriveSelfBands', () => {
    it('derives acne band from concern selection', () => {
      const formData = {
        mainConcerns: ['Acne'],
        acneTypeSelected: ['Blackheads/whiteheads'],
        // ...
      };
      const bands = deriveSelfBands(formData);
      expect(bands.acne).toBeDefined();
    });

    it('derives pigmentation band from concern', () => {
      const formData = {
        mainConcerns: ['Pigmentation'],
        pigmentationType: 'Brown',
        // ...
      };
      const bands = deriveSelfBands(formData);
      expect(bands.pigmentation).toBeDefined();
    });
  });

  describe('mergeBands', () => {
    it('merges machine and self bands correctly', () => {
      const machineBands = {
        acne: { category: 'Mild Acne', score: 3 },
        pigmentation: null,
      };
      const selfBands = {
        acne: { category: 'Moderate Acne', score: 5 },
        pigmentation: { category: 'Mild Pigmentation', score: 2 },
      };

      const merged = mergeBands(machineBands, selfBands);

      // Machine band takes priority for acne
      expect(merged.acne.category).toBe('Mild Acne');
      // Self band used for pigmentation (no machine data)
      expect(merged.pigmentation.category).toBe('Mild Pigmentation');
    });
  });

  describe('computeSensitivityFromForm', () => {
    it('calculates sensitivity score from triggers', () => {
      const formData = {
        sensitivityTriggers: ['Fragrance', 'Sun', 'Weather'],
      };
      const score = computeSensitivityFromForm(formData);
      expect(score).toBe(3);
    });

    it('returns 0 for no triggers', () => {
      const formData = { sensitivityTriggers: [] };
      expect(computeSensitivityFromForm(formData)).toBe(0);
    });
  });

  describe('deriveAcneCategoryLabel', () => {
    it('derives "Mild Acne" for low severity', () => {
      const formData = {
        acneTypeSelected: ['Blackheads/whiteheads'],
        acneSeverityBlackheads: 'Mild',
      };
      expect(deriveAcneCategoryLabel(formData)).toBe('Mild Acne');
    });

    it('derives "Moderate Acne" for medium severity', () => {
      const formData = {
        acneTypeSelected: ['Papules/pustules'],
        acneSeverityPapules: 'Moderate',
      };
      expect(deriveAcneCategoryLabel(formData)).toBe('Moderate Acne');
    });
  });

  describe('getFollowUpQuestions', () => {
    it('generates follow-up for acne concern', () => {
      const formData = { mainConcerns: ['Acne'] };
      const bands = { acne: { category: 'Mild Acne', score: 3 } };

      const followUps = getFollowUpQuestions(formData, bands);

      expect(followUps).toContainEqual(
        expect.objectContaining({ category: 'acne' })
      );
    });

    it('returns empty array when no concerns', () => {
      const formData = { mainConcerns: [] };
      const bands = {};

      expect(getFollowUpQuestions(formData, bands)).toEqual([]);
    });
  });
});
```

#### Recommendation Engine Tests (NEW - ~250 lines)

**File**: recommendationEngine.test.ts

```typescript
import { generateRecommendations } from '../services/recommendationEngine';

describe('Recommendation Engine', () => {
  describe('generateRecommendations', () => {
    it('generates AM/PM routine', () => {
      const context = {
        effectiveBands: {
          acne: { category: 'Mild Acne', score: 3 },
        },
        computedSensitivity: 2,
        age: 28,
        routineSteps: 'Standard routine (5-6 products)',
      };

      const result = generateRecommendations(context);

      expect(result.amRoutine).toBeDefined();
      expect(result.pmRoutine).toBeDefined();
      expect(result.amRoutine.length).toBeGreaterThan(0);
      expect(result.pmRoutine.length).toBeGreaterThan(0);
    });

    it('respects sensitivity level', () => {
      const context = {
        effectiveBands: { acne: { category: 'Mild Acne', score: 3 } },
        computedSensitivity: 5, // High sensitivity
        age: 28,
      };

      const result = generateRecommendations(context);

      // Should recommend gentle products
      const hasHarshProducts = result.amRoutine.some(
        p => p.name.includes('Strong') || p.name.includes('Intense')
      );
      expect(hasHarshProducts).toBe(false);
    });

    it('handles multiple concerns', () => {
      const context = {
        effectiveBands: {
          acne: { category: 'Moderate Acne', score: 5 },
          pigmentation: { category: 'Mild Pigmentation', score: 2 },
        },
        computedSensitivity: 1,
        age: 32,
      };

      const result = generateRecommendations(context);

      // Should address both concerns
      const products = [...result.amRoutine, ...result.pmRoutine];
      const hasAcneProduct = products.some(p =>
        p.concernsAddressed?.includes('acne')
      );
      const hasPigmentProduct = products.some(p =>
        p.concernsAddressed?.includes('pigmentation')
      );

      expect(hasAcneProduct).toBe(true);
      expect(hasPigmentProduct).toBe(true);
    });

    it('filters out contraindicated products', () => {
      const context = {
        effectiveBands: { acne: { category: 'Mild Acne', score: 3 } },
        computedSensitivity: 1,
        pregnancy: 'Yes', // Contraindication
        age: 28,
      };

      const result = generateRecommendations(context);
      const products = [...result.amRoutine, ...result.pmRoutine];

      // Should not include retinoids
      const hasRetinoid = products.some(p =>
        p.name.toLowerCase().includes('retinol')
      );
      expect(hasRetinoid).toBe(false);
    });
  });
});
```

---

## Phase 2: Integration Tests

### A. Form Flow Tests (5 files, ~800 lines total)

#### 1. UpdatedConsultForm.integration.test.tsx (~200 lines)

```typescript
describe('UpdatedConsultForm - Complete Flow', () => {
  it('completes full form submission', async () => {
    const onComplete = jest.fn();
    render(<UpdatedConsultForm onComplete={onComplete} />);

    // Step 1: Name
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    });
    fireEvent.click(screen.getByText(/next/i));

    // Step 2: Phone
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+919876543210' }
    });
    fireEvent.click(screen.getByText(/next/i));

    // ... continue through all steps

    // Final: Verify completion
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('validates each step before proceeding', () => {
    render(<UpdatedConsultForm />);

    // Try to proceed without filling name
    fireEvent.click(screen.getByText(/next/i));

    // Should show error and stay on same step
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });
});
```

#### 2. DynamicConcernFlow.integration.test.tsx (~200 lines)

```typescript
describe('Dynamic Concern Substeps', () => {
  it('shows acne substeps when acne selected', async () => {
    render(<UpdatedConsultForm />);

    // Navigate to concerns step
    // ... fill previous steps

    // Select acne concern
    fireEvent.click(screen.getByText(/acne/i));
    fireEvent.click(screen.getByText(/next/i));

    // Should show acne type step
    await waitFor(() => {
      expect(screen.getByText(/type.*breakout/i)).toBeInTheDocument();
    });

    // Select multiple types
    fireEvent.click(screen.getByText(/blackheads/i));
    fireEvent.click(screen.getByText(/papules/i));
    fireEvent.click(screen.getByText(/next/i));

    // Should show severity step for blackheads
    await waitFor(() => {
      expect(screen.getByText(/severity.*blackheads/i)).toBeInTheDocument();
    });
  });

  it('shows pigmentation substeps with color selection', () => {
    // Similar test for pigmentation flow
  });

  it('shows scarring substeps with type and color', () => {
    // Similar test for scarring flow
  });

  it('simple concerns (wrinkles, pores) go directly to severity', () => {
    // Test that wrinkles/pores/texture skip type selection
  });
});
```

#### 3. ValidationFlow.integration.test.tsx (~150 lines)

```typescript
describe('Validation Flow', () => {
  it('validates phone number format', () => {
    render(<UpdatedConsultForm />);

    // Navigate to phone step
    // ...

    // Try invalid phone
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '123' }
    });
    fireEvent.click(screen.getByText(/next/i));

    expect(screen.getByText(/valid phone/i)).toBeInTheDocument();

    // Try valid phone
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: '+919876543210' }
    });
    fireEvent.click(screen.getByText(/next/i));

    // Should proceed
    expect(screen.queryByText(/valid phone/i)).not.toBeInTheDocument();
  });

  it('filters wrinkles concern for age <= 25', () => {
    // Enter age 24
    // Navigate to concerns
    // Verify wrinkles not in list
  });

  it('requires acne to be priority #1 if selected', () => {
    // Select multiple concerns including acne
    // Try to prioritize acne as #2
    // Should show error
  });
});
```

#### 4. RecommendationGeneration.integration.test.tsx (~150 lines)

```typescript
describe('Recommendation Generation', () => {
  it('generates recommendations based on concerns', async () => {
    render(<UpdatedConsultForm />);

    // Fill form with acne concern
    // ... complete all steps

    // Should show recommendations
    await waitFor(() => {
      expect(screen.getByText(/recommended.*routine/i)).toBeInTheDocument();
    });

    // Should have AM and PM routines
    expect(screen.getByText(/morning.*routine/i)).toBeInTheDocument();
    expect(screen.getByText(/evening.*routine/i)).toBeInTheDocument();
  });

  it('respects machine scan data when available', () => {
    const machineBands = {
      acne: { category: 'Moderate Acne', score: 6 },
    };

    render(<UpdatedConsultForm machine={machineBands} />);

    // Complete form
    // ...

    // Recommendations should reflect machine data
    // (test by checking specific products)
  });
});
```

#### 5. FormSubmission.integration.test.tsx (~100 lines)

```typescript
describe('Form Submission', () => {
  it('saves data to Supabase on completion', async () => {
    const mockSave = jest.spyOn(consultationService, 'saveConsultationData');

    render(<UpdatedConsultForm />);

    // Complete entire form
    // ...

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          phoneNumber: '+919876543210',
          // ...
        })
      );
    });
  });

  it('shows loading state during submission', () => {
    // Test isSubmitting state
  });

  it('handles submission errors gracefully', () => {
    // Mock error response
    // Verify error message shown
  });
});
```

---

## Phase 3: E2E Tests (Future)

### Using Playwright or Cypress

**Test Scenarios**:
1. Complete client consultation flow (happy path)
2. Form validation errors (unhappy path)
3. Dynamic concern substeps (acne, pigmentation, scarring)
4. Machine scan integration
5. Recommendation display
6. Mobile responsiveness
7. Accessibility (keyboard navigation, screen readers)

**Sample E2E Test**:
```typescript
// e2e/consultation-flow.spec.ts
test('client completes consultation and receives recommendations', async ({ page }) => {
  await page.goto('/');

  // Select "Client Consultation"
  await page.click('text=Client Consultation');

  // Fill name
  await page.fill('input[name="name"]', 'Jane Doe');
  await page.click('button:has-text("Next")');

  // Fill phone
  await page.fill('input[name="phone"]', '+919876543210');
  await page.click('button:has-text("Next")');

  // Continue through all steps...

  // Verify recommendations displayed
  await expect(page.locator('text=Recommended Routine')).toBeVisible();
});
```

---

## Test Execution Plan

### Before Implementation (Baseline)

```bash
# Run existing tests
npm run test

# Expected: 3 test files pass
# - personalInfo.validator.test.ts (PASS)
# - products.validator.test.ts (PASS)
# - concerns.validator.test.ts (PASS)
```

### During Implementation

After each optimization:
1. Run tests: `npm run test`
2. Verify all tests pass
3. Add new tests for new code
4. Commit changes

### After Implementation (Full Suite)

```bash
# Run all unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Expected coverage:
# - Statements: 25%+
# - Branches: 20%+
# - Functions: 25%+
# - Lines: 25%+
```

---

## Manual Testing Checklist

After automated tests pass, perform manual testing:

### Critical User Flows

- [ ] Complete form submission (no concerns)
- [ ] Complete form with acne concern (all subtypes)
- [ ] Complete form with pigmentation concern
- [ ] Complete form with scarring concern
- [ ] Complete form with 3 concerns (max)
- [ ] Form validation errors display correctly
- [ ] Phone number validation (all formats)
- [ ] Age-based filtering (wrinkles at age 24 vs 26)
- [ ] Acne priority validation
- [ ] Legal disclaimers (must check all 7)
- [ ] Machine scan data integration
- [ ] Recommendation generation
- [ ] Recommendation display (AM/PM routines)
- [ ] Back navigation preserves data
- [ ] Form submission saves to Supabase

### UI/UX Testing

- [ ] All form steps render correctly
- [ ] Icons display properly
- [ ] Badges show concern names
- [ ] Animations smooth (fade-in, transitions)
- [ ] Error messages clear and helpful
- [ ] Loading states show during submission
- [ ] Success message after completion

### Performance Testing

- [ ] Form renders quickly (<1s initial load)
- [ ] Step transitions smooth (<100ms)
- [ ] No visible lag during typing
- [ ] Memoization prevents unnecessary re-renders

### Responsive Testing

- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)

---

## Success Criteria

### Phase 1 Completion

- ✅ All 7 validator test files exist and pass
- ✅ At least 8 component test files exist and pass
- ✅ Decision engine tests pass
- ✅ Recommendation engine tests pass
- ✅ Test coverage ≥ 20%
- ✅ All existing functionality preserved
- ✅ Manual testing checklist 100% complete

### Future Phases

- Integration tests cover major user flows
- E2E tests cover critical paths
- Test coverage ≥ 60%
- Automated CI/CD pipeline

---

## Tools & Setup

### Testing Framework

Already configured:
- ✅ Vitest 1.0.4
- ✅ @testing-library/react 14.1.2
- ✅ @testing-library/jest-dom 6.1.5
- ✅ @testing-library/user-event 14.5.1
- ✅ jsdom 23.0.1

### Test Commands

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### Configuration

**vitest.config.ts** (already configured):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

---

## Timeline

### Phase 1: Unit Tests (This Session - 2 hours)

- Validator tests: 30 min
- Component tests (8 files): 60 min
- Engine tests: 30 min

### Phase 2: Integration Tests (Future - 2 hours)

- Form flow tests: 60 min
- Validation flow tests: 30 min
- Submission tests: 30 min

### Phase 3: E2E Tests (Future - 3 hours)

- Setup Playwright: 30 min
- Write E2E tests: 120 min
- CI/CD integration: 30 min

---

## Conclusion

This comprehensive test plan ensures that all cleanup and optimization changes preserve existing functionality while improving code quality and maintainability.

**Priority for this session**: Phase 1 unit tests (validators, components, engines)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-08
**Author**: Claude Code Agent
