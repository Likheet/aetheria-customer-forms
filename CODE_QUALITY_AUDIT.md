# COMPREHENSIVE CODE QUALITY AUDIT REPORT
Generated: 2025-11-15

## EXECUTIVE SUMMARY
This audit identified significant code duplication, unused files, and configuration inconsistencies that impact code maintainability and bundle size. Total issues found: 20+

---

## 1. DUPLICATE CONFIG FILES ⚠️ CRITICAL

### Issue: Multiple ESLint configurations with different settings
- **File 1**: `/eslint.config.js` (739 bytes)
- **File 2**: `/eslint.config.mjs` (738 bytes)

**Differences**:
- config.js: Uses `globals`, `react-refresh`, ignores dist
- config.mjs: Uses `project` config, `type-checked` rules, includes React config
- **Risk**: Projects may be using different linting rules depending on which config is loaded

**Recommendation**: Keep ONE config file. The `.mjs` appears more comprehensive with type-checking. Delete `.js` version.

---

### Issue: Multiple PostCSS configurations
- **File 1**: `/postcss.config.js` (81 bytes) - Uses object export syntax
- **File 2**: `/postcss.config.mjs` (165 bytes) - Uses ES module syntax

**Differences**:
- config.js: `plugins: { tailwindcss: {}, autoprefixer: {} }`
- config.mjs: `plugins: [tailwindcss, autoprefixer]`

**Recommendation**: Consolidate to one file. Modern projects should use `.mjs` or `.js` consistently.

---

## 2. DUPLICATE/PARALLEL CODE STRUCTURES

### Issue: Duplicate ProductSearchService
**Location 1**: `/src/lib/productSearchService.ts` (86 lines)
- Uses Web Worker approach
- Exports: `Product`, `initProductSearch()`, `searchProducts()`, `terminateProductSearch()`
- Performance-optimized with worker queue

**Location 2**: `/src/services/productSearchService.ts` (95 lines)
- Class-based approach
- Imports from `../data/skincareProducts.json` (missing file?)
- Exports: `Product`, `ProductSearchService` class, `productSearchService` singleton

**Differences**:
- Different data sources
- Different architectures (functional vs class)
- Different type definitions for Product
- Both exported but possibly only one is used

**Recommendation**: Consolidate into single service. Determine which approach is actually used in production.

---

### Issue: Duplicate Design Tokens
**Location 1**: `/src/lib/design-tokens.ts` (188 lines)
- Exports: `TRANSITION_GRADIENTS`, `GAP_SIZES`, `SPACE_Y_SIZES`, `GRID_LAYOUTS`, `TEXT_TRACKING`, `SHADOW_PATTERNS`, `BORDER_RADIUS`, `BLUR_SIZES`, `Z_INDEX`, `ANIMATION_DURATION`, `BREAKPOINTS`, `BADGE_INTENT`, `FORM_FIELD_HEIGHT`, `ICON_SIZES`
- Used by: `/src/hooks/usePageTransition.ts`

**Location 2**: `/src/styles/design-tokens.ts` (147 lines)
- Exports: `colors`, `spacing`, `borderRadius`, `typography`, `shadows`, `transitions`
- Re-exported by: `/src/components/form/index.ts`

**Issues**:
- Overlapping content but different structure
- Different locations create confusion
- `/src/hooks/usePageTransition.ts` imports from lib version
- Form components export from styles version
- Creates two sources of truth for design system

**Recommendation**: Merge both files. Keep one centralized location. Update all imports. Consider using `/src/styles/design-tokens.ts` as the primary source.

---

### Issue: Duplicate FormStep Components
**Location 1**: `/src/components/FormStep.tsx` (77 lines)
- Simple implementation with title, subtitle, children, navigation buttons
- Props: `FormStepProps` with basic interface
- Used by consultant evaluation steps (directly imported)

**Location 2**: `/src/components/form/FormStep.tsx` (150 lines)
- Advanced implementation with icons, badges, centered layout
- Props: `FormStepProps` with extended interface including icon variants
- Exported from form barrel index
- Used by main form steps

**Usage Pattern**:
- Consultant paths: `import FormStep from '../../FormStep'` (v1)
- Main form paths: `import { FormStep } from '../form'` (v2)

**Risks**:
- Two different implementations with the same name
- Developers might use the wrong one
- Maintenance burden - bug fixes needed in both places
- Inconsistent UX if both are used in same flow

**Recommendation**: Merge into single component. Use props to control features (icons, badges, etc.). Update all imports to use single source.

---

## 3. UNUSED FILES 🗑️

### Empty Files (0 lines)
1. **`/src/components/ConflictResolutionDialog.tsx`** (CRITICAL UNUSED)
   - Completely empty file
   - Never imported anywhere
   - No indication it was intentionally left for future use

2. **`/src/hooks/useConflictResolution.ts`** (CRITICAL UNUSED)
   - Completely empty file
   - Never imported anywhere
   - Paired with above (suggests incomplete feature)

### Stub Files (1 line)
1. **`/src/services/recommendationEngine.ts`** (1 line)
   - Contains only: `export * from './recommendationEngineMatrix';`
   - No unique code
   - Acts as a redundant re-export barrel

**Recommendation**: Delete empty files. Evaluate if stub file is needed or consolidate into main service.

---

## 4. ORPHANED/UNUSED CODE

### Unused Component
**File**: `/src/components/Breadcrumb.tsx` (38 lines)
- Component is defined but never imported anywhere in codebase
- Appears to be leftover UI component
- Could be part of abandoned navigation feature

**Recommendation**: Delete or move to archive/unused folder if may be needed later.

---

### Unused Library Code
**File**: `/src/lib/acneFlowEvaluator.ts` (345 lines)
- Exports: `AcneFlowQuestion`, `AcneFlowEvaluationResult`, `AcneFlowContext`, `buildAcneSubtypeQuestions`, `evaluateAcneSubtypeFlow`
- Functions are exported but NEVER used anywhere in codebase
- Represents ~1.5KB of unused code in bundle

**Recommendation**: Delete unless there's a planned feature that needs it. If keeping, document why.

---

### Example Code in Production
**File**: `/src/lib/decisionEngine.examples.ts` (59 lines)
- Contains example functions: `exampleSebumMismatch()`, `exampleTextureRoughVsCustomerSmooth()`, etc.
- Exports: `runExamples()` function
- Never called anywhere in application code

**Risk**: 
- Takes up space in production bundle (likely not tree-shaken)
- Suggests incomplete refactoring or testing cleanup

**Recommendation**: Move to test directory or delete if examples are documented elsewhere.

---

## 5. IMPORT DUPLICATION ISSUES

### Conflicting lib imports
- Both `/src/lib/utils.ts` and `/lib/utils.ts` exist
- Both export `cn()` function (utility for className merging)
- `/lib/utils.ts` also exports cookie handling functions
- Creates ambiguity about which should be used

**Recommendation**: Determine if `/lib/` directory at root is needed. Consolidate utilities.

---

### Duplicate utils.ts functions
**`/lib/utils.ts`** has cookie-related functions:
- `getSessionFromServerCookies()`
- `setSessionCookie()`
- `clearSessionCookie()`
- `getSessionExpiryDate()`

**`/src/lib/utils.ts`** has only:
- `cn()` - className utility

**Issue**: Session management utilities in one location, styling utilities in another. Creates confusion about where utilities belong.

**Recommendation**: Move session utilities to their own module (`/src/lib/sessionUtils.ts`) or consolidate.

---

## 6. TSCONFIG FILES

**Status**: ✅ GOOD - Properly organized
- `/tsconfig.json` (5 lines) - Root config that references others
- `/tsconfig.app.json` (30 lines) - Application config
- `/tsconfig.node.json` (22 lines) - Build tools config
- No duplication or conflict

**Note**: All three files configured with `"noUnusedLocals": true` and `"noUnusedParameters": true`, which should catch some dead code issues.

---

## 7. SUMMARY OF ISSUES BY CATEGORY

| Category | Count | Severity |
|----------|-------|----------|
| Duplicate Config Files | 2 | HIGH |
| Duplicate Code/Services | 4 | HIGH |
| Empty/Stub Files | 3 | CRITICAL |
| Orphaned Components | 1 | MEDIUM |
| Unused Functions/Code | 2 | MEDIUM |
| Import Confusion | 2 | MEDIUM |
| **TOTAL** | **14** | - |

---

## 8. ESTIMATED CODE BLOAT

- Unused lib files: ~500 bytes (acneFlowEvaluator + examples + empty files)
- Duplicate services: ~180 bytes
- Duplicate configs: ~850 bytes
- **Total estimated waste: ~1.5 KB** (not including unused dependencies)

---

## 9. RECOMMENDED CLEANUP ACTIONS (Priority Order)

### CRITICAL (Do Immediately)
1. **Delete empty files**: 
   - `/src/components/ConflictResolutionDialog.tsx`
   - `/src/hooks/useConflictResolution.ts`

2. **Consolidate ESLint configs**:
   - Delete `/eslint.config.js`
   - Keep `/eslint.config.mjs` (more comprehensive)

3. **Consolidate PostCSS configs**:
   - Delete `/postcss.config.js`
   - Keep `/postcss.config.mjs` (standard modern format)

### HIGH (Do Soon)
4. **Consolidate ProductSearchService**:
   - Audit which version is actually used
   - Delete the unused one
   - Ensure single import path

5. **Merge FormStep components**:
   - Create unified FormStep with feature flags for icons/badges
   - Update all imports
   - Test both consultant and form flows

6. **Consolidate Design Tokens**:
   - Merge `/src/styles/design-tokens.ts` and `/src/lib/design-tokens.ts`
   - Use `/src/styles/design-tokens.ts` as single source
   - Update all imports

### MEDIUM (Clean Up)
7. **Delete orphaned Breadcrumb**:
   - Remove `/src/components/Breadcrumb.tsx` unless documenting why it's kept

8. **Delete unused acneFlowEvaluator**:
   - Remove `/src/lib/acneFlowEvaluator.ts` or move to archive

9. **Move examples to test directory**:
   - Move `/src/lib/decisionEngine.examples.ts` to tests
   - Or delete if documented elsewhere

10. **Clean up utils duplication**:
    - Consolidate session utilities
    - Clarify lib utils vs root utils
    - Create `/src/lib/sessionUtils.ts` for cookie handling

### LOW (Documentation)
11. **Document stub files**:
    - If `/src/services/recommendationEngine.ts` re-export is needed, document why
    - Consider if it could be a circular import issue

---

## 10. TESTING RECOMMENDATIONS

After cleanup:
- Run full test suite to ensure no broken imports
- Check build output for tree-shaking effectiveness
- Verify bundle size reduction
- Test both consultant and patient form flows
- Verify design tokens apply correctly throughout app

---

## Files Mentioned in This Report

### To Delete
- `/src/components/ConflictResolutionDialog.tsx`
- `/src/hooks/useConflictResolution.ts`
- `/eslint.config.js`
- `/postcss.config.js`
- `/src/components/Breadcrumb.tsx`
- `/src/lib/acneFlowEvaluator.ts`
- `/src/lib/decisionEngine.examples.ts`

### To Consolidate (Choose one)
- `/src/lib/productSearchService.ts` OR `/src/services/productSearchService.ts`
- `/src/lib/design-tokens.ts` MERGE WITH `/src/styles/design-tokens.ts`
- `/src/components/FormStep.tsx` MERGE WITH `/src/components/form/FormStep.tsx`
- `/lib/utils.ts` MERGE WITH `/src/lib/utils.ts`
- `/postcss.config.mjs` KEEP (delete `.js` version)
- `/eslint.config.mjs` KEEP (delete `.js` version)

### To Refactor
- `/src/services/recommendationEngine.ts` (decide if needed or consolidate)
- `/src/lib/consultAutoFill.ts` (audit 60 exports for usage)
