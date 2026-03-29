# Contract: Notation Parity

**Date**: 2026-03-25  
**Feature**: Lift-and-Shift Application Refactor

## Purpose

Define the accepted notation and parse-result expectations that must remain equivalent after migration.

## Accepted Input Capabilities

The migrated parser MUST continue to support:

- English svara notation already accepted by the current app
- Current octave marker handling
- Current rhythm marker handling
- Current line-based input behavior
- Current example content behavior
- Current validation style for supported and unsupported input

## Parse Outputs

The migrated app MUST produce artifacts equivalent to the current app for the same input in these areas:

- Playable note order
- Validation result type and issue style
- Parsed note count and statistics
- Preview-ready content for user display
- Highlightable playback sequence

## Input Sources

| Source | Requirement |
|--------|-------------|
| Manual entry | Must preserve current parsing workflow |
| Bundled example | Must preserve current example-loading and parse results |
| Imported text file | Must preserve current import and parse behavior |

## Validation Contract

1. Inputs that currently parse successfully MUST continue to parse successfully.
2. Inputs that currently trigger warnings or errors MUST continue to produce equivalent warning or error outcomes.
3. Unsupported or malformed content MUST NOT be silently normalized into a different musical meaning.

## Preview and Statistics Contract

1. Parsed preview content MUST remain aligned with the same parse result the player uses for playback.
2. Statistics shown to the user MUST derive from the same parsed content and remain equivalent to current counts for the same input.

## Comparison Standard

The current implementation in `paadugajaala/index.html`, `notation_parser.js`, and the bundled example content is the parity reference for this contract until migration is complete.
