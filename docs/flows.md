# Runtime Flow Guide

## Staff Portal Overview
- The application boots into the **staff-selection** route and renders `StaffSelectionPage`.
- Navigation cards (and keyboard shortcuts) point to:
  1. **Client Feedback** – opens the feedback collection flow.
  2. **Consultant Input** – opens the professional evaluation form.
  3. **Updated Client Consult** – opens the new intake/decision-engine flow.
- Pressing `Esc` from any sub-flow triggers `handleGoHome()`, returning to the staff portal. Flow changes use the shared gradient overlay for smooth transitions.

## Feedback Collection Flow
### Entry & Welcome
- Triggered via card/shortcut `1`. `App` sets `currentFlow` to `'feedback'` and displays `FeedbackWelcomePage`.
- Selecting “Begin” fades to the client selection step (`currentFlow = 'client-selection'`).

### Client Selection (`ClientSelectionPage`)
- Fetches data from Supabase via `getRecentConsultationSessions()` (see `src/services/newConsultationService.ts`).
- Offers search by name/phone, manual refresh, loading/error states, and recency chips.
- Choosing a client calls `onSelectClient`, which switches to `'feedback-form'`.

### Feedback Form (`FeedbackForm`)
- Captures ratings, qualitative feedback, staff details, and follow-up preferences.
- Persists data through `submitFeedback()` (`src/services/feedbackService.ts`).
- Success view surfaces a confirmation and a shortcut back to the staff portal.

## Consultant Input Flow
### Entry
- Triggered via card/shortcut `2`. `App` renders `ConsultantInputForm` with `currentFlow = 'consultant-input'`.

### Step Summary
1. **Customer selection** – `CustomerSelection` queries `consultations_without_input` via `getConsultationsWithoutInput()`.
2. **Treatment type** – `TreatmentTypeSelection` gates whether skin, hair, or both track sets appear.
3. **Skin assessments** – Acne, Pigmentation, Texture, Sensitivity steps populate `evaluation` data.
4. **Hair assessments** – Visual Scalp Type, Hair Fall Severity, Density Observation, Texture & Ends.
5. **Unsuitable products & notes** – Dedicated steps collect contraindications and consultant notes.
6. **Submission** – `submitConsultantInput()` stores the structured payload; success view offers a “Back to Staff Portal” button.

## Updated Consultation Flow
### Queue Browsing (`ChooseProfile`)
- Triggered via card/shortcut `3`. `ChooseProfile` loads live queue data from `getFillingQueue()` and allows searching/filtering.
- Selecting an entry fetches machine metrics via `getSessionProfile()` and displays the updated form.

### Updated Form (`UpdatedConsultForm`)
- The primary multi-step intake paired with the decision engine. Uses `saveConsultationData()` and helper logic from `src/lib/decisionEngine.ts` / `decisionRules.ts`.
- Completing the form returns the user to the staff portal; the `UpdatedConsultForm` component emits the final payload to Supabase.

## Shared Behaviours
- **Overlay transitions**: All flow changes use `transitionWithOverlay` for consistent motion design.
- **Escape key**: Globally mapped to `handleGoHome()`.
- **Data services**:
  - Feedback flow → `feedbackService.ts`
  - Consultant input → `consultantInputService.ts`
  - Updated consult + queue → `newConsultationService.ts`
- **Workers**: `src/workers/productSearch.worker.ts` powers the product index used by the updated consult flow; it’s bundled by Vite.
