# Contract: Main Player UI

**Date**: 2026-03-25  
**Feature**: Lift-and-Shift Application Refactor

## Route

`/`

## Purpose

Preserve the current main notation-player experience while changing only internal structure.

## Required UI Regions

The main route MUST expose these user-visible regions:

- Header
- Notation input area
- Parse and content-loading actions
- Playback controls
- Playback settings controls
- Embedded piano section
- Parsed notation preview
- Statistics panel
- Status indicator
- Toast container
- Loading overlay
- Footer

## Required Controls

| Control | Type | Required Behavior |
|---------|------|-------------------|
| Notation input | Multiline text input | Accept current supported notation text |
| Parse | Action button | Triggers parse and validation flow |
| Load Example | Action button | Loads bundled example content |
| Upload File | File action | Imports text content from a supported local file |
| Clear | Action button | Resets notation, preview, and related state |
| Play | Action button | Starts playback from the current parsed content |
| Pause | Action button | Pauses active playback |
| Stop | Action button | Stops playback and clears active follow state |
| Tempo | Range control | Preserves current default and supported range |
| Volume | Range control | Preserves current default and supported range |
| Waveform | Selector | Preserves current selectable waveform values |
| Tuning | Selector | Preserves current selectable tuning values |
| Presets | Preset actions | Applies current named sound presets |

## Behavioral Guarantees

1. Parsing MUST update preview, statistics, and status feedback in the same workflow position as the current app.
2. Playback MUST use the currently selected settings values.
3. Pause and stop MUST update both playback controls and visible follow state.
4. Clear MUST return the route to its reset-safe state without leaving stale preview or playback status behind.
5. Embedded piano interaction MUST continue to trigger direct note playback without requiring route navigation.

## Display Guarantees

1. Labels, route purpose, and task flow must remain familiar to current users.
2. The loading overlay must appear only during bootstrap or equivalent blocked states.
3. Toast and status feedback must remain visible when parse, playback, or settings actions require user feedback.

## Failure Handling

| Scenario | Required Response |
|----------|-------------------|
| Invalid notation | Show validation feedback consistent with the current app |
| Unsupported file content | Surface user-visible failure feedback without corrupting current state |
| Playback attempt without valid parsed content | Prevent playback and preserve clear user feedback |
| Browser audio restrictions | Keep user-visible state understandable and recoverable after interaction |
