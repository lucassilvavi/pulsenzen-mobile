# PulseZen App – AI Handoff / Continuation Guide

Last updated: 2025-08-10
Primary focus this sprint: Prediction (emotional balance) feature UX polish, toast theming, accessibility, test stabilization.

---
## 1. Project Snapshot
- Platform: React Native / Expo (TypeScript) in `pulsezen-app`
- Backend: AdonisJS (TypeScript) in `pulsezen-api`
- State Mgmt: Mostly React Context + local hooks (no Redux/MobX)
- Navigation: Expo Router (file-based in `app/`)
- Testing: Jest + @testing-library/react-native; some suites temporarily skipped.
- Theming: Central tokens in `constants/theme.ts`
- Key Feature Domains:
  - Prediction (emotional balance scoring + factors + interventions)
  - Journal (entries, CBT analysis modal / cognitive restructuring suggestions)
  - Breathing sessions
  - Music / ambient sounds
  - SOS quick help
  - UI utility: Toast system, ErrorBoundary, PerformanceMonitor

## 2. Recent Changes (Completed)
1. Theming
   - Added `colors.toast` (info|success|warning|error) + integrated in `ToastContext`.
2. Toast System
   - Refactored to consume new tokens; ensured queue logic stable.
3. Prediction Module
   - InterventionsCarousel: wrapped FlatList with `Animated.createAnimatedComponent` to remove VirtualizedList warning.
   - Fixed type import to use `InterventionSuggestion` (removed invalid `PredictionIntervention`).
   - PredictionDetailModal: Added vertical scrolling (`ScrollView`), layout adjustments for suggestions & flexWrap.
   - General style polish (risk palette usage, spacing consistency).
4. Accessibility
   - Reduced motion respected in carousel (scaling disabled when `reduceMotion` true – verify hook).
5. Testing / Stability
   - AuthService test mock fixed and passing.
   - Snapshot & large API client test suites intentionally skipped pending proper provider mocks / implementation alignment.
   - Vector icons mock added to avoid ESM issues.
6. Documentation
   - Test plan drafted (not yet committed as separate file) summarizing scenarios for theming, modal scroll, carousel, services.

## 3. Current State / Open Issues
| Area | Status | Notes |
|------|--------|-------|
| Toast Theming | OK | Visual + queue verified manually; lacks automated tests. |
| Prediction Detail Modal | OK | Scroll fixed; needs test for overflow & long lists. |
| Interventions Carousel | OK | Animation works; add a11y labels & unit test for reduceMotion. |
| Prediction Context Data | Mock | Data comes from `PredictionMock.ts`; real API integration pending. |
| CBT Analysis | Partial | Hooks & modal present; ensure integration path with journal entries. |
| Journal | Basic | Entry screen modifications made; confirm save/update flows. |
| Tests (Skipped) | Pending | `PredictionDashboardScreen.snapshot.test.tsx`, `MoodApiClient.test.ts` skipped. |
| Coverage | Unknown | Run coverage to baseline; aim > 60% short term for new modules. |
| Accessibility | Partial | Need pass over intervention cards, toast live region. |
| Performance | Light | Basic manual check only; no profiling scripts yet. |

## 4. Priority Next Steps (Ordered)
1. Tests
   - Add unit tests for ToastContext (enqueue/dequeue/order + auto-dismiss timer via fake timers).
   - Add integration test for PredictionDetailModal scroll using @testing-library/react-native (render, fireEvent scroll, ensure suggestions visible).
   - Add test for InterventionsCarousel honoring reduceMotion.
2. Accessibility Enhancements
   - Ensure each intervention card has a clear `accessibilityLabel` (emoji + title). Add if missing.
   - Add `accessibilityLiveRegion` / announcement logic for toast messages (focus + screen reader announcement). Consider a platform-specific wrapper.
3. Prediction Data Integration
   - Replace mock in `PredictionMock.ts` with real backend call (once API endpoint is available). Provide fallback to mock if request fails (resilience).
   - Implement refresh & error toast on failure.
4. Re-enable / Refactor Skipped Tests
   - Provide context/provider mocks for snapshot test; adjust unstable UI (dynamic timestamps) with deterministic stubs.
   - Reassess `MoodApiClient` test expectations vs actual API contract; slim down to core endpoints.
5. Journal + CBT
   - Confirm CBT analysis hook invocation path (trigger after entry save?).
   - Add a test generating an entry with negative language and verifying CBT suggestions appear.
6. Performance / Polish
   - Add a lightweight performance test script (measure initial render time & interactions vs threshold).
   - Audit bundle for unnecessary re-renders in carousel (memo item renderer if needed).
7. Documentation
   - Commit the detailed test plan as `docs/TEST_PLAN.md` (can extract from earlier summary).
   - Add architectural overview diagram (context providers & navigation) – optional.

## 5. Environment Setup (New Machine)
### Prerequisites
- Node LTS (check `.nvmrc` or use current Node 18+ if unspecified)
- Yarn or npm (project currently uses npm scripts; prefer `npm ci` for clean install)
- Expo CLI (`npx expo start` works without global install)
- Docker (for backend Postgres if using API locally)

### Steps
1. Clone repository (both folders):
   - `pulsezen-app` (mobile)
   - `pulsezen-api` (backend)
2. Install dependencies:
   - `cd pulsezen-app && npm ci`
   - `cd ../pulsezen-api && npm ci`
3. Start backend (if needed):
   - In `pulsezen-api`, run: `npm run docker:up` (starts Postgres) then `npm run dev:api` (or provided script).
4. Seed / Mock Data:
   - Prediction currently uses local mock; no seed required unless exploring other modules.
5. Start app:
   - `cd pulsezen-app` → `npx expo start -c` (clear cache first time on new machine)
6. Run tests:
   - `npm test`
7. Optional coverage:
   - `npm test -- --coverage`

## 6. Key Files To Inspect First
| Purpose | File |
|---------|------|
| Theme tokens | `constants/theme.ts` |
| Toast System | `modules/ui/toast/ToastContext.tsx` |
| Prediction Context | `modules/prediction/context/PredictionContext.tsx` |
| Prediction Mock Data | `modules/prediction/services/PredictionMock.ts` |
| Dashboard Screen | `modules/prediction/components/PredictionDashboardScreen.tsx` |
| Modal | `modules/prediction/components/PredictionDetailModal.tsx` |
| Carousel | `modules/prediction/components/InterventionsCarousel.tsx` |
| CBT Hook | `modules/cbt/hooks/useCBTAnalysis.ts` |
| CBT Modal | `modules/cbt/components/CBTAnalysisModal.tsx` |
| Journal Entry Screen | `modules/journal/pages/JournalEntryScreen.tsx` |
| Skipped Tests | `__tests__/prediction/PredictionDashboardScreen.snapshot.test.tsx`, `__tests__/api/MoodApiClient.test.ts` |

## 7. Data Shapes (Essential)
- Prediction Current Score (`current`): `{ score: number (0-1), label: string, level: 'low'|'medium'|'high'|..., confidence: number (0-1) }`
- Factors: `{ id: string, label: string, description: string, weight: number (0-1), suggestion: string }[]`
- Interventions (`InterventionSuggestion`): `{ id: string, emoji: string, title: string, action?: string }[]`

## 8. Testing Strategy (Planned Additions)
- New unit test file: `__tests__/ui/ToastContext.test.tsx`
- New integration test: `__tests__/prediction/PredictionDetailModal.scroll.test.tsx`
- Add utilities for provider wrapping (`test-utils/renderWithProviders.tsx` if not existing)

## 9. Risk & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Skipped suites hide regressions | Medium | Re-enable with proper mocks soon (priority). |
| Mock-only prediction data | Medium | Implement real API call behind feature flag. |
| Accessibility gaps (toasts, carousel cards) | Low-Med | Add labels & announcements early. |
| Unprofiled performance | Low now | Add simple profiling when features stabilize. |

## 10. Definition of Done (Upcoming Sprint Slice)
A. ToastContext covered by tests (enqueue, dismiss, announcement) – 80% branch coverage
B. Modal scroll test ensures suggestions visible (≥ 1 suggestion element toBeVisible)
C. Carousel respects reduceMotion test
D. Snapshot test re-enabled with stable mocks
E. Real prediction fetch behind env flag (fallback to mock)

## 11. Quick Task Backlog (Actionable Tickets)
1. `feat(prediction): add real fetch with fallback` (est. S)
2. `test(ui): add ToastContext tests` (S)
3. `test(prediction): modal scroll & reduceMotion` (S)
4. `chore(prediction): re-enable dashboard snapshot with provider mocks` (S)
5. `a11y(toast|carousel): labels + live region` (S)
6. `docs: add TEST_PLAN.md` (XS)
7. `refactor(journal): ensure CBT hook invoked on save` (M if missing)

## 12. Conventions / Notes
- Prefer functional components + hooks; avoid class components.
- Maintain token usage (avoid inline literal colors when a token exists).
- When adding tests for context, isolate timers with `jest.useFakeTimers();` and advance with `jest.advanceTimersByTime(ms)`.
- For Animated lists, ensure changes use `useNativeDriver` where possible & honor reduceMotion.

## 13. Handoff Summary
You can safely proceed with adding tests and integrating real prediction data. UI baseline is stable; focus on strengthening correctness (tests), accessibility, and preparing for backend integration of the prediction endpoint.

---
Questions or ambiguities to resolve early:
1. Exact backend contract for prediction endpoint (fields, naming) – currently inferred.
2. Are intervention actions (navigation/deep links) planned? If yes, define schema now.
3. Decide on persistence strategy for journal & CBT results (local vs server sync).

End of document.
