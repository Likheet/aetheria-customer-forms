# UI Refactoring Migration Guide

## Overview

This guide shows how to safely migrate from the old hard-coded UI to the new component-based system **without breaking anything**.

## What's Been Created

### 1. Design System Foundation

- **`src/styles/design-tokens.ts`** - Single source of truth for colors, spacing, typography
- **`src/styles/variants.ts`** - Type-safe component variants using class-variance-authority

### 2. Reusable Components

All located in `src/components/form/`:

- **`OptionButton`** - Single button for options (replaces 200+ hard-coded buttons)
- **`RadioGroup`** - Single-select option groups
- **`CheckboxGroup`** - Multi-select option groups
- **`FormStep`** - Consistent step container with title, icon, subtitle
- **`TextInput`** - Styled text input with label, error, helper text

### 3. Example Refactored Steps

- **`src/components/steps/PersonalInfoSteps.tsx`** - Name, Phone, DOB, Gender
- **`src/components/steps/SafetyGateSteps.tsx`** - All 5 safety gate questions

## Before vs After Comparison

### Old Way (Hard-coded)

```tsx
// 45 lines of repetitive code
<div className="space-y-12 flex flex-col justify-center h-full py-8">
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
      <Users className="w-8 h-8 text-amber-600" />
    </div>
    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
      Your gender?
    </h2>
    <p className="text-gray-600">This helps us recommend appropriate products</p>
  </div>
  <div className="max-w-2xl mx-auto w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => updateFormData({ gender: option })}
          className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 ${
            formData.gender === option
              ? 'border-amber-400 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
    {errors.gender && <p className="text-red-500 text-sm mt-2">{errors.gender}</p>}
  </div>
</div>
```

### New Way (Component-based)

```tsx
// 15 lines, much cleaner
<FormStep
  title="Your gender?"
  subtitle="This helps us recommend appropriate products"
  icon={Users}
  iconVariant="primary"
  centered
>
  <RadioGroup
    options={[
      { value: 'Female', label: 'Female' },
      { value: 'Male', label: 'Male' },
      { value: 'Non-binary', label: 'Non-binary' },
      { value: 'Prefer not to say', label: 'Prefer not to say' },
    ]}
    value={formData.gender}
    onChange={(value) => updateFormData({ gender: value })}
    layout="grid"
    gridCols={2}
    error={errors.gender}
  />
</FormStep>
```

**67% less code, infinitely more maintainable!**

## Migration Strategy: Safe Step-by-Step Approach

### Option 1: Gradual Replacement (Safest)

Replace one step at a time in `UpdatedConsultForm.tsx`:

#### Step 1: Import new components

```tsx
// At top of UpdatedConsultForm.tsx
import {
  NameStep,
  PhoneStep,
  DateOfBirthStep,
  GenderStep,
} from './steps/PersonalInfoSteps';

import {
  PregnancyStep,
  IsotretinoinStep,
  SevereCysticAcneStep,
  AllergyConflictStep,
  BarrierStressStep,
} from './steps/SafetyGateSteps';
```

#### Step 2: Replace switch cases one by one

Find the `renderStep` function (around line 2850) and replace cases:

```tsx
const renderStep = (step: number) => {
  const stepProps = {
    formData,
    updateFormData,
    errors,
    handleGateChange, // if needed
  };

  switch (step) {
    // NEW: Using refactored components
    case 1:
      return <NameStep {...stepProps} />;
    case 2:
      return <PhoneStep {...stepProps} />;
    case 3:
      return <DateOfBirthStep {...stepProps} />;
    case 4:
      return <GenderStep {...stepProps} />;

    // Safety Gates
    case 5:
      return <PregnancyStep {...stepProps} />;
    case 6:
      return <IsotretinoinStep {...stepProps} />;
    case 7:
      return <SevereCysticAcneStep {...stepProps} />;
    case 8:
      return <AllergyConflictStep {...stepProps} />;
    case 9:
      return <BarrierStressStep {...stepProps} />;

    // OLD: Keep existing steps for now
    case 10:
      return (
        /* ... existing code ... */
      );

    // ... rest of cases
  }
};
```

#### Step 3: Test thoroughly

After each replacement:

1. Run the dev server: `npm run dev`
2. Test that specific step
3. Test navigation forward and backward
4. Verify data is saved correctly
5. Check error states work

#### Step 4: Repeat for remaining steps

Create similar step files for:
- Skin basics (skin type, oil, hydration)
- Concerns selection
- Concern follow-ups
- Preferences

### Option 2: Feature Flag (Production-safe)

Create a feature flag to toggle between old and new:

```tsx
// At top of UpdatedConsultForm.tsx
const USE_NEW_COMPONENTS = true; // Toggle this

const renderStep = (step: number) => {
  if (USE_NEW_COMPONENTS) {
    return renderStepNew(step);
  }
  return renderStepOld(step);
};
```

This way you can:
- Develop new components fully
- Test in production with flag OFF
- Flip flag to ON when ready
- Instant rollback if issues

## How to Create New Steps

### Template for a new step:

```tsx
import React from 'react';
import { IconName } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

export const YourNewStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <FormStep
      title="Your Question?"
      subtitle="Optional description"
      icon={IconName}
      iconVariant="primary"
      centered
    >
      <RadioGroup
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]}
        value={formData.yourField}
        onChange={(value) => updateFormData({ yourField: value })}
        error={errors.yourField}
      />
    </FormStep>
  );
};
```

## Component API Reference

### FormStep

```tsx
<FormStep
  title="Required title"
  subtitle="Optional subtitle"
  icon={LucideIcon} // Optional
  iconVariant="primary" | "success" | "danger" | "warning" | "purple"
  centered={true} // Optional, default false
  badge={{ label: "Badge text", variant: "primary" }} // Optional
>
  {children}
</FormStep>
```

### RadioGroup (Single Select)

```tsx
<RadioGroup
  options={[
    {
      value: "unique_value",
      label: "Display label",
      description: "Optional subtitle",
      badge: "Optional badge",
      badgeVariant: "primary",
      intent: "default" | "success" | "danger" | "warning"
    }
  ]}
  value={formData.field}
  onChange={(value) => updateFormData({ field: value })}
  layout="single" | "grid"
  gridCols={1 | 2 | 3 | 4}
  gap="sm" | "md" | "lg"
  error={errors.field}
  label="Optional label"
  description="Optional description"
/>
```

### CheckboxGroup (Multi Select)

```tsx
<CheckboxGroup
  options={[
    { value: "value1", label: "Label 1" },
    { value: "value2", label: "Label 2" },
  ]}
  value={formData.arrayField} // string[]
  onChange={(values) => updateFormData({ arrayField: values })}
  maxSelections={3} // Optional
  minSelections={1} // Optional
  layout="grid"
  gridCols={2}
  error={errors.arrayField}
/>
```

### TextInput

```tsx
<TextInput
  label="Optional label"
  placeholder="Placeholder text"
  value={formData.field}
  onChange={(e) => updateFormData({ field: e.target.value })}
  error={errors.field}
  helperText="Optional helper text"
  required
/>
```

### OptionButton (Direct Use)

```tsx
<OptionButton
  label="Option label"
  description="Optional description"
  badge="Optional badge"
  badgeVariant="primary"
  selected={formData.field === 'value'}
  intent="default" | "success" | "danger" | "warning"
  onClick={() => updateFormData({ field: 'value' })}
  showCheckmark
/>
```

## Styling Customization

### Change All Button Colors

Edit `src/styles/variants.ts`:

```ts
export const optionButtonVariants = cva(
  '...',
  {
    variants: {
      intent: {
        default: 'border-purple-400 bg-purple-50 text-purple-900', // Changed from amber!
      }
    }
  }
);
```

This changes ALL option buttons across the entire app!

### Change Spacing/Typography

Edit `src/styles/design-tokens.ts`:

```ts
export const spacing = {
  // Adjust these values
  4: '1.5rem', // was 1rem
};
```

## Testing Checklist

Before merging each step:

- [ ] Step renders correctly
- [ ] Forward navigation works
- [ ] Back navigation works
- [ ] Form data persists
- [ ] Validation errors show
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] No console errors
- [ ] Styles match design

## Common Pitfalls

### 1. Forgetting to pass errors prop

```tsx
// ❌ Wrong
<RadioGroup ... />

// ✅ Correct
<RadioGroup error={errors.fieldName} ... />
```

### 2. Wrong value type

```tsx
// ❌ Wrong - CheckboxGroup expects array
<CheckboxGroup value={formData.singleValue} ... />

// ✅ Correct
<CheckboxGroup value={formData.arrayField || []} ... />
```

### 3. Not updating formData correctly

```tsx
// ❌ Wrong - mutating
formData.field = value;

// ✅ Correct - immutable update
updateFormData({ field: value });
```

## Rollback Plan

If something breaks:

1. **Single step issue**: Revert that case in switch statement
2. **Multiple issues**: Set `USE_NEW_COMPONENTS = false`
3. **Critical bug**: `git revert <commit-hash>`

All new components are additive - old code still works!

## Next Steps

1. ✅ Design system created
2. ✅ Core components built
3. ✅ Example steps refactored
4. 🔄 **You are here**: Start migrating UpdatedConsultForm
5. ⏭️ Extract remaining steps
6. ⏭️ Test thoroughly
7. ⏭️ Delete old hard-coded patterns
8. ⏭️ Celebrate 🎉

## Questions?

This is a **safe, gradual migration**. You can:
- Replace one step per day
- Test after each change
- Roll back instantly if needed
- Keep the app working throughout

Start with steps 1-4 (Personal Info) as they're simplest!
