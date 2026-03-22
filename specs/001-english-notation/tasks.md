# Tasks: Convert to English Notation

**Feature**: Convert to English Notation  
**Branch**: `001-english-notation`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Generated**: 2026-03-19

---

## Overview

This feature converts all Telugu notation (స, రి, గ, మ, ప, ద, ని) to English notation (S, R1, R2, G1, G2, G3, M1, M2, P, D1, D2, D3, N1, N2, N3) across the entire codebase.

### Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup & Preparation | 1 |
| Phase 2 | Foundational - Frequency Mappings | 2 |
| Phase 3 | US1 - Piano Key Labels (P1) | 2 |
| Phase 4 | US2 - Notation Parser (P1) | 3 |
| Phase 5 | US3 - Output & Examples (P1) | 3 |
| Phase 6 | US4 - Audio Engine (P2) | 2 |
| Phase 7 | Polish & Documentation | 2 |
| **Total** | | **15** |

### Dependency Graph

```
Phase 1: Setup
    |
    v
Phase 2: svara_frequencies.js (Foundational - blocking)
    |
    +---> Phase 3: US1 Piano (can parallel with Phase 4)
    |
    +---> Phase 4: US2 Parser (can parallel with Phase 3)
    |           |
    |           v
    |       Phase 5: US3 Output/Examples
    |
    +---> Phase 6: US4 Audio Engine
    |
    v
Phase 7: Documentation Polish
```

### Parallel Execution Opportunities

- **Phase 3 (US1)** and **Phase 4 (US2)** can run in parallel after Phase 2
- **Phase 6 (US4)** can run in parallel with Phase 3-5
- All tasks within a phase marked with [P] are parallelizable

---

## Phase 1: Setup & Preparation

**Goal**: Verify existing state and prepare for implementation

**Independent Test**: N/A (setup phase)

- [x] T001 Verify current state of all files and identify remaining Telugu references in virtual_piano.html, notation_parser.js, svara_frequencies.js, audio_engine.js, example.txt, and README.md

---

## Phase 2: Foundational - Frequency Mappings

**Goal**: Update svara_frequencies.js to use English notation keys

**Why First**: All other components depend on this for frequency lookups

**Independent Test**: Open browser console, verify `SVARA_FREQUENCIES['S']` returns correct frequency object instead of `SVARA_FREQUENCIES['స']`

- [x] T002 [P] Update SVARA_FREQUENCIES object keys from Telugu (స, రి1, గ1) to English (S, R1, G1, etc.) in svara_frequencies.js
- [x] T003 [P] Update JUST_INTONATION_RATIOS and MELAKARTA_RAGAS references to use English notation in svara_frequencies.js

---

## Phase 3: US1 - Display English Notation on Piano Keys (P1)

**Goal**: Update virtual_piano.html to display English notation on all keys

**User Story**: As a user, I want to see English notation on the virtual piano keys instead of Telugu characters

**Independent Test**: Open virtual_piano.html in browser, verify all keys show S, R, G, M, P, D, N, R1, R2, M1, D1, D2 instead of Telugu characters

- [x] T004 [P] [US1] Update white key labels from Telugu (స, రి, గ, మ, ప, ద, ని) to English (S, R, G, M, P, D, N) in virtual_piano.html
- [x] T005 [P] [US1] Update black key labels from Telugu (రి₁, రి₂, మ₁, ద₁, ద₂) to English (R1, R2, M1, D1, D2) in virtual_piano.html

---

## Phase 4: US2 - Parse English Notation Input (P1)

**Goal**: Rewrite notation_parser.js to accept English notation

**User Story**: As a user, I want to input notation using English characters (S, R1, G1, etc.)

**Independent Test**: Run `parseNotation("S R1 G1 M1 | P D1 N1 ||")` and verify it returns correct parsed notes with English notation

- [x] T006 [US2] Replace SVARA_CHARS and SVARA_NAMES mappings from Telugu to English notation in notation_parser.js
- [x] T007 [US2] Update extractSvara function to parse English notation with octave suffixes (., ') instead of Telugu combining characters in notation_parser.js
- [x] T008 [US2] Update all example functions and documentation comments to use English notation in notation_parser.js

---

## Phase 5: US3 - Output English Notation (P1)

**Goal**: Ensure all output uses English notation and update examples

**User Story**: As a user, I want all output (display, export, generated notation) to use English notation

**Independent Test**: Verify example.txt contains only English notation and README.md examples use English notation

- [x] T009 [P] [US3] Convert all examples in example.txt from Telugu notation to English notation
- [x] T010 [P] [US3] Update any output generation functions in notation_parser.js to output English notation with ASCII suffixes
- [x] T011 [P] [US3] Update paadugajaala/index.html to use English notation labels and examples

---

## Phase 6: US4 - Audio Engine Uses English Notation (P2)

**Goal**: Update audio_engine.js to accept English notation for playback

**User Story**: As a developer, I want the audio engine to accept English notation for playing svaras

**Independent Test**: Call `engine.playSvara('S', 'madhya', 1.0)` and verify it plays correct frequency (261.63 Hz)

- [x] T012 [P] [US4] Update ratioMap and semitoneMap in audio_engine.js to use English notation keys (S, R1, G1, etc.)
- [x] T013 [P] [US4] Update all example functions and documentation in audio_engine.js to use English notation

---

## Phase 7: Polish & Documentation

**Goal**: Final verification and documentation updates

**Independent Test**: Global search for Telugu characters returns no results in source files

- [x] T014 Update README.md to document English notation usage and provide migration guide from Telugu
- [x] T015 [P] Verify no Telugu references remain in any user-facing files (virtual_piano.html, notation_parser.js, svara_frequencies.js, audio_engine.js, example.txt, README.md)

---

## Implementation Strategy

### MVP Scope

**Minimum Viable Product**: Complete Phase 2 (svara_frequencies.js) + Phase 3 (piano labels) + Phase 4 (parser)

This delivers:
- Frequency mappings work with English notation
- Users can see English labels on piano
- Users can input English notation

### Incremental Delivery

1. **Sprint 1**: Phase 1-2 (Setup + Foundational)
   - Unblocks all other work
   - Verify frequency lookups work

2. **Sprint 2**: Phase 3-4 (US1 + US2 in parallel)
   - Piano labels (user-facing)
   - Parser (user input)
   - Both can be developed and tested independently

3. **Sprint 3**: Phase 5-6 (US3 + US4 in parallel)
   - Examples and output
   - Audio engine integration

4. **Sprint 4**: Phase 7 (Polish)
   - Documentation
   - Final verification

### Testing Approach

- **Manual Browser Testing**: Open HTML files, verify visual labels
- **Console Validation**: Test parser and frequency lookups
- **Audio Testing**: Verify correct frequencies play
- **Global Search**: `grep -r "స\|రి\|గ\|మ\|ప\|ద\|ని" --include="*.js" --include="*.html"` should return no matches

---

## Task Checklist Summary

### By User Story

| Story | Tasks | Description |
|-------|-------|-------------|
| Setup | T001 | Verify state |
| Foundational | T002-T003 | Frequency mappings |
| US1 (P1) | T004-T005 | Piano labels |
| US2 (P1) | T006-T008 | Parser |
| US3 (P1) | T009-T011 | Output/Examples |
| US4 (P2) | T012-T013 | Audio engine |
| Polish | T014-T015 | Documentation |

### Parallel Tasks

- T002, T003 (Phase 2)
- T004, T005 (Phase 3)
- T009, T010, T011 (Phase 5)
- T012, T013 (Phase 6)
- T015 (Phase 7)

### Dependencies

- T002, T003 → T004-T013 (frequency mappings required)
- T006-T008 → T010 (parser must work before output)
- All tasks → T015 (final verification)
