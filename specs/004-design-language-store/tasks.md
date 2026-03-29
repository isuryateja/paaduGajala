# Tasks: Replace Legacy Design System With a Full UI Overhaul

**Input**: Design documents from `/specs/004-design-language-store/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Validation uses the existing repo checks plus manual verification for responsive layout, component state coverage, accessibility, and functional regression on redesigned surfaces.

**Organization**: Tasks are grouped by user story so the redesign can be delivered in a controlled order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- Runtime styling entry points live in `src/styles/`
- Primary route surfaces live in `src/routes/` and `src/components/`
- Design-definition artifacts live in `design/`
- Feature planning artifacts live in `specs/004-design-language-store/`

## Phase 1: Discovery & Scope Audit

**Purpose**: Inventory current surfaces and legacy artifacts before redesign work begins

- [ ] T001 Audit current UI surfaces in `src/routes/+page.svelte`, `src/routes/piano/+page.svelte`, `src/components/`, and `src/styles/` and classify each as redesign, keep, or legacy-follow-up
- [ ] T002 [P] Audit design artifacts in `design/` and record which files are current-design candidates versus legacy/reference-only artifacts
- [ ] T003 [P] Update `specs/004-design-language-store/quickstart.md` with the agreed redesign audit checklist and validation focus

---

## Phase 2: Design Definition & Ownership

**Purpose**: Define the new design system and make artifact ownership explicit before runtime implementation

**⚠️ CRITICAL**: No UI implementation work should begin until the design-definition direction is clear

- [ ] T004 Create or update the current design-system definition artifacts in `design/` with the new visual direction, foundations, surface rules, and implementation mapping
- [ ] T005 [P] Mark legacy or historical artifacts in `design/DESIGN.md`, `design/code.html`, and related files as superseded, archived, or reference-only where applicable
- [ ] T006 [P] Update `specs/004-design-language-store/data-model.md` and `specs/004-design-language-store/contracts/design-language-store.md` to reflect final artifact ownership and naming rules

**Checkpoint**: The current design source of truth and legacy artifact status are unambiguous

---

## Phase 3: User Story 1 - Clear and inviting notation workflow (Priority: P1) 🎯 MVP

**Goal**: Redesign the main notation-player page so the workflow is clearer and more cohesive

**Independent Test**: Load the main route and verify that title area, notation workspace, piano feedback, playback controls, and status messaging form a clear hierarchy on desktop and mobile

### Implementation for User Story 1

- [ ] T007 [US1] Redesign the page-level layout and hierarchy in `src/routes/+page.svelte`
- [ ] T008 [P] [US1] Redesign shared shell surfaces in `src/components/layout/AppHeader.svelte` and `src/components/layout/AppFooter.svelte` to match the new page direction
- [ ] T009 [P] [US1] Redesign notation workflow surfaces in `src/components/notation/NotationInputCard.svelte`, `src/components/notation/ParsedNotationCard.svelte`, and `src/components/notation/StatisticsCard.svelte`
- [ ] T010 [P] [US1] Redesign primary playback and settings surfaces in `src/components/playback/PlaybackControlsCard.svelte` and `src/components/playback/SettingsCard.svelte`
- [ ] T011 [US1] Redesign piano presentation on the main route in `src/components/piano/PianoCard.svelte`, `src/components/piano/PianoKeyboard.svelte`, and related piano child components
- [ ] T012 [US1] Validate desktop/mobile page hierarchy and workflow clarity in `specs/004-design-language-store/quickstart.md`

**Checkpoint**: The main route reads as a coherent redesigned experience

---

## Phase 4: User Story 2 - New shared design system for primary surfaces (Priority: P2)

**Goal**: Replace legacy shared visual language on the redesigned primary experience

**Independent Test**: Review shared shell, cards, controls, piano states, and feedback surfaces to confirm they use one new design vocabulary rather than legacy `--pg-*` styling

### Implementation for User Story 2

- [ ] T013 [P] [US2] Redefine shared design foundations in `src/styles/tokens.css`, `src/styles/global.css`, and `src/styles/app-theme.css`
- [ ] T014 [P] [US2] Redesign shared feedback surfaces in `src/components/common/ToastContainer.svelte`, `src/components/common/StatusBar.svelte`, and `src/components/layout/LoadingOverlay.svelte`
- [ ] T015 [P] [US2] Redesign shared input and control primitives in `src/components/common/RangeControl.svelte`, `src/components/common/SelectControl.svelte`, and related component styles
- [ ] T016 [US2] Replace legacy visual-language dependencies on in-scope redesigned surfaces and remove or deprecate obsolete `--pg-*` styling where no longer needed
- [ ] T017 [US2] Validate interactive states across hover, focus, active, loading, success, warning, error, and empty states for redesigned surfaces

**Checkpoint**: Shared components and runtime styling support the new system coherently

---

## Phase 5: User Story 3 - Clear ownership in the design workspace (Priority: P3)

**Goal**: Make it obvious which design artifacts are current and which are historical

**Independent Test**: Open the `design/` folder and confirm a collaborator can distinguish active design-definition artifacts from legacy references without reading app code

### Implementation for User Story 3

- [ ] T018 [P] [US3] Add collaborator-facing ownership guidance in `design/` so current versus legacy artifact roles are explicit
- [ ] T019 [US3] Update `README.md` to point contributors to the current design workspace and explain the presence of legacy references
- [ ] T020 [US3] Verify `design/` remains coherent after redesign documentation updates and does not contain contradictory authority signals

**Checkpoint**: The design workspace is understandable and safely maintainable

---

## Phase 6: Validation & Polish

**Purpose**: Confirm the redesign works visually, interactively, and functionally

- [ ] T021 [P] Run repo validation commands and record outcomes against `specs/004-design-language-store/quickstart.md`
- [ ] T022 Perform manual UI verification for the main route across desktop and mobile, including keyboard focus and responsive readability
- [ ] T023 Perform interaction-state and functional regression checks for notation parsing, playback, settings, status/toast/loading, and piano interactions
- [ ] T024 Update `specs/004-design-language-store/quickstart.md` and `specs/004-design-language-store/contracts/theme-consumption.md` with any finalized redesign-state or accessibility notes discovered during implementation

## Dependencies & Execution Order

### Phase Dependencies

- **Discovery & Scope Audit**: No dependencies
- **Design Definition & Ownership**: Depends on discovery and blocks redesign implementation
- **User Story 1**: Depends on design-definition completion
- **User Story 2**: Depends on design-definition completion and should progress alongside or just after User Story 1
- **User Story 3**: Depends on design-definition clarity and can finish alongside runtime work
- **Validation & Polish**: Depends on all desired redesign work being complete

### User Story Dependencies

- **User Story 1 (P1)** establishes the visible redesign outcome for the main page
- **User Story 2 (P2)** turns the redesign into a coherent shared system
- **User Story 3 (P3)** prevents future ambiguity about artifact ownership

### Within Each User Story

- Establish design definition before styling implementation
- Redesign page composition before fine-tuning component details
- Replace legacy shared styling before final cleanup
- Finish documentation after runtime ownership and state rules are clear

### Parallel Opportunities

- `T002` and `T003` can run in parallel with `T001`
- `T005` and `T006` can run in parallel after the design direction is chosen
- `T008`, `T009`, and `T010` can run in parallel once the page composition direction is stable
- `T013`, `T014`, and `T015` can run in parallel across disjoint shared-surface areas
- `T021` can run in parallel with documentation-only cleanup if implementation is complete

## Notes

- The old 004 folder name is retained for continuity, but the feature scope is now a broader redesign
- Tasks intentionally separate design-definition work from runtime implementation to avoid rebuilding around an unclear target
- Suggested MVP scope is **User Story 1** plus the minimum shared-system work needed to support it
