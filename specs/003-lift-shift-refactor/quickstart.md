# Quickstart: Lift-and-Shift Application Refactor

**Date**: 2026-03-25  
**Feature**: Lift-and-Shift Application Refactor

## Goal

Stand up the migrated SvelteKit application, port behavior in bounded slices, and verify parity against the current app before cutover.

## Prerequisites

- A current Node.js runtime suitable for the selected SvelteKit release
- Package manager available for installing frontend dependencies
- A modern browser with Web Audio API support

## Initial Setup

1. Install project dependencies after the SvelteKit scaffold is added.
2. Start the development server for the migrated app.
3. Keep the legacy app files available so behavior can be compared during migration.

## Recommended Migration Order

1. Create the SvelteKit and TypeScript scaffold at the repository root.
2. Port shared pitch and notation logic into domain modules with tests.
3. Port audio presets and audio engine behavior into typed modules.
4. Build app stores and actions that encapsulate parse, playback, settings, piano, and feedback flows.
5. Recreate the main player route UI with the same controls and defaults.
6. Recreate the standalone piano route and direct note interaction.
7. Replace parity-reference usage only after the migrated routes match current behavior.

## Parity Verification Checklist

Run these checks after each migration milestone:

1. Main route still exposes notation input, parse, load example, upload file, clear, play, pause, stop, sliders, selectors, presets, preview, stats, status, toasts, loading state, and embedded piano.
2. Example content parses to the same note counts, validation outcome, and playback order as the current app.
3. Invalid or malformed notation still produces equivalent validation and user-visible feedback.
4. Tempo, volume, waveform, tuning, and preset changes influence playback the same way they do in the current app.
5. Standalone piano route remains reachable and preserves direct note interaction across supported input methods.

## Testing Guidance

- Add unit tests for notation parsing, notation validation, notation stats, pitch lookup, and audio configuration behavior.
- Use manual browser checks for playback flow, note-follow highlighting, file import, visibility-change cleanup, and direct piano interaction.
- Compare against the legacy implementation whenever a module or route is replaced.

## Completion Definition

The feature is ready to leave planning once the migrated app can be built and run locally, the planned modules and routes are in place, and parity checks can be executed without depending on undocumented behavior.

## Validation Record

**Validated On**: 2026-03-25

### Checklist Status

- [x] Main route exposes notation input, parse, load example, upload file, clear, play, pause, stop, settings controls, preview, stats, status, toasts, loading state, and embedded piano.
- [x] Example content is preserved in `static/example.txt` and remains wired through the migrated main route.
- [x] Invalid or malformed notation follows legacy rejection behavior before preview/stats are built.
- [x] Tempo, volume, waveform, tuning, and presets are routed through shared playback/settings actions.
- [x] Standalone piano route exists at `/piano` with mouse, touch, keyboard, and visibility-cleanup orchestration.

### Verification Notes

- Static parity verification completed through route, action, service, and test inspection.
- Automated validation completed successfully with `npm install` followed by `npm run validate`.
- `svelte-check`, ESLint, and Vitest all passed in the migrated application workspace.
