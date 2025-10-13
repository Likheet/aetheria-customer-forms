# Admin Dashboard Integration

This note explains how the internal "Recommendation Command Studio" is wired into the Aetheria forms app, what data each tab touches, and the visual refinements applied during the latest pass.

## Entry Points and Routing
- The dashboard is launched from the staff lounge via the `Product & Matrix Studio` option in `src/components/StaffSelectionPage.tsx`.
- Choosing that option triggers `handleSelectAdmin` inside `App.tsx`, which switches the active flow to the `AdminDashboard` while keeping the Mantine provider tree intact.
- The `onClose` callback funnels operators back to the lounge through the existing `handleGoHome` helper, so no new routing plumbing is required.

## Dashboard Shell
- `AdminDashboard.tsx` controls the shell: gradient backdrop, masthead, and a Mantine `Tabs` switcher.
- A high-contrast `Paper` wrapper now frames the tab content, and each panel lives inside a `ScrollArea` capped at `calc(100vh - 320px)` so headers stay visible on shorter screens.
- The masthead copy outlines the console's purpose and keeps a `Back to lounge` action aligned with Mantine's gradient buttons.

## Tab Overview

### Concern Matrix (`MatrixEditor.tsx`)
- Reads three Supabase tables in parallel: `product`, `matrix_entry`, and `concern_subtype`.
- Product options are grouped by category, and edits are staged in a local draft map before `update` calls are fired against `matrix_entry`.
- The refreshed styling moves to slate toned cards and bordered tables so slot selections stand out against the darker shell.

### Product Library (`ProductCatalogManager.tsx`)
- Loads the `product` catalogue, exposing embedded tokens (tier and subcategory markers) for quick filtering.
- Supports search, tier/category filters, and inline create or edit flows that round-trip through Supabase `insert`, `update`, and `delete` calls.
- UI changes mirror the rest of the dashboard: a slate filter card, brighter hover states, and a deeper container backdrop for readability.

### Skin-type Defaults (`SkinTypeDefaultsEditor.tsx`)
- Surfaces the `skin_type_default` table so each skin type and slot can point to a fallback product.
- Uses the shared product list in its selects and persists changes with `upsert(..., { onConflict: 'skin_type,slot' })`.
- Adopted the same contrast tweaks as the other panels for consistent legibility.

## Shared Data Flow
- All tabs rely on the Supabase client exported from `src/admin/lib/supabase.ts`.
- Recommendation logic asserts the concern matrix is loaded (`assertConcernMatrixLoaded` in `src/services/recommendationEngineMatrix.ts`), so dashboard edits feed directly into routine generation.
- CLI tooling (`scripts/testAcneComplete.ts`) bootstraps the same dataset via `loadConcernMatrixData()` to keep automated checks in sync with the admin view.

## Visual Refresh Highlights
- The page background now uses a higher-contrast slate gradient and glassmorphism cards with defined borders.
- Scrollable bodies keep long forms (especially the matrix) workable without losing the tab chrome.
- Tables, hover states, and badges were tuned for better contrast against the darker palette.

## Operational Notes
- Confirm `.env` carries valid Supabase keys; every tab performs live read/write operations.
- When testing, run the Vite dev server, cycle through all tabs, and exercise save/reset paths to ensure Supabase round-trips succeed without console warnings.
