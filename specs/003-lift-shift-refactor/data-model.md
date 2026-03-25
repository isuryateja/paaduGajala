# Data Model: Lift-and-Shift Application Refactor

**Date**: 2026-03-25  
**Feature**: Lift-and-Shift Application Refactor

## Entities

### NotationDocument

Represents the editable notation content currently loaded in the main player.

**Attributes**:

- `source` (string): Where the content came from, such as `manual`, `example`, or `file`
- `rawText` (string): The exact notation text currently shown to the user
- `fileName` (string | null): Imported file name when the source is a file
- `isDirty` (boolean): Whether the current text differs from the last parsed text
- `lastParsedAt` (string | null): Timestamp of the last successful parse

**Validation Rules**:

- `rawText` may be empty only in the initial or cleared state
- `source` must match a supported content origin

### ParsedNotationArtifact

Represents the normalized parse result used by preview, stats, validation, and playback.

**Attributes**:

- `nodes` (array): Ordered parsed nodes including svaras, rhythm markers, whitespace, newline, or unknown entries as needed for parity
- `svaraNodes` (array): Parsed musical notes in playback order
- `stats` (object): Summary counts displayed to the user
- `validation` (object): Validity result plus warning and error issues
- `previewText` (string): User-facing parsed or normalized preview text

**Validation Rules**:

- `stats` must be derived from `nodes`
- `validation` must preserve the current app's success, warning, and error style for the same input

### PlaybackSettings

Represents all user-adjustable playback controls that influence audio behavior.

**Attributes**:

- `tempoBpm` (number): Current tempo value
- `volume` (number): Current volume value on a normalized scale
- `waveform` (string): Selected waveform
- `tuning` (string): Selected tuning mode
- `preset` (string | null): Selected named preset, if any

**Validation Rules**:

- `tempoBpm` must remain within the supported slider range
- `volume` must remain within the supported slider range
- `waveform` and `tuning` must match supported option sets

### PlaybackSession

Represents the current playback lifecycle for parsed notation.

**Attributes**:

- `status` (string): `ready`, `parsed`, `playing`, or `paused`
- `currentIndex` (number): Current note index in playback order
- `highlightedNodeId` (string | null): Currently followed note or preview target
- `startedAt` (string | null): Playback start timestamp
- `pausedAt` (string | null): Playback pause timestamp
- `sequenceLength` (number): Number of playable note items in the active sequence

**State Transitions**:

1. `ready -> parsed` after successful parse
2. `parsed -> playing` when playback begins
3. `playing -> paused` when playback pauses
4. `paused -> playing` when playback resumes
5. `playing|paused -> ready|parsed` when playback stops or content is cleared

### PianoInteractionState

Represents direct piano use on either the main player or the standalone piano route.

**Attributes**:

- `routeMode` (string): `embedded` or `standalone`
- `activeKeys` (array): Keys currently visually active
- `heldVoices` (array): Active direct-play voices keyed by note and octave
- `keyboardEnabled` (boolean): Whether keyboard mapping is currently active

**Validation Rules**:

- A held voice must correspond to an active key
- Releasing a key must remove both the active key state and its held voice

### FeedbackState

Represents user-visible status messaging and transient application feedback.

**Attributes**:

- `loading` (boolean): Whether the loading overlay is visible
- `statusText` (string): Current readiness or playback status message
- `statusTone` (string): `ready`, `success`, `warning`, `error`, or playback-specific display tone
- `toasts` (array): Active transient notifications

**Validation Rules**:

- `loading` must be false once bootstrap completes successfully
- Status and toast updates must reflect the same user-visible moments as the current app

### ParityScenario

Represents a reusable comparison case between the legacy implementation and the migrated implementation.

**Attributes**:

- `name` (string): Scenario identifier
- `inputText` (string | null): Notation input used for the comparison
- `entryRoute` (string): `/` or `/piano`
- `expectedControls` (array): Controls that must remain present
- `expectedOutcome` (object): Expected parse, playback, or interaction behavior

**Purpose**:

- Supports measurable parity verification during development and release review

## Relationships

```text
NotationDocument
    ->
ParsedNotationArtifact
    ->
PlaybackSession

PlaybackSettings
    ->
PlaybackSession

PianoInteractionState
    ->
FeedbackState

ParityScenario
    -> compares ->
NotationDocument / ParsedNotationArtifact / PlaybackSession / PianoInteractionState
```

## Derived Views

- Main player view derives its controls, preview, stats, and status from `NotationDocument`, `ParsedNotationArtifact`, `PlaybackSettings`, `PlaybackSession`, and `FeedbackState`.
- Standalone piano view derives its keyboard, active-state styling, and direct-play behavior from `PianoInteractionState` and `PlaybackSettings`.

## Validation Summary

1. Clearing the notation resets `NotationDocument`, `ParsedNotationArtifact`, and `PlaybackSession` to parity-safe defaults.
2. Example loading and file import must replace the active `NotationDocument` without changing the parse workflow.
3. Playback cannot enter `playing` without a valid active `ParsedNotationArtifact`.
4. Status text, preview highlighting, and toast behavior must stay synchronized with parse and playback transitions.
5. Direct piano interaction must stop active voices when keys are released or when browser visibility changes require cleanup.
