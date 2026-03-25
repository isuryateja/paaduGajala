# Contract: Standalone Piano Route UI

**Date**: 2026-03-25  
**Feature**: Lift-and-Shift Application Refactor

## Route

`/piano`

## Purpose

Preserve the current standalone piano experience as a dedicated route in the migrated application.

## Required Capabilities

The standalone piano route MUST preserve:

- A dedicated piano page separate from the main notation player
- Direct note triggering from on-screen piano keys
- Visual active-state feedback for pressed keys
- Current supported input methods such as mouse, touch, and mapped keyboard interaction
- Cleanup behavior that prevents misleading active states or stuck direct-play notes

## Input Contract

| Input Method | Required Outcome |
|--------------|------------------|
| Mouse press and release | Starts and stops the matching direct-play note |
| Touch press and release | Starts and stops the matching direct-play note |
| Keyboard-mapped interaction | Starts and stops the matching direct-play note for supported keys |

## Behavioral Guarantees

1. The route must remain independently reachable without going through the main player.
2. Pressing a key must trigger the same note identity and octave meaning as the current piano experience.
3. Releasing a key must clear the corresponding visual active state and direct-play voice.
4. Losing browser visibility or equivalent interruption must clean up held direct-play state safely.

## Shared-State Expectations

1. Piano interaction may reuse shared playback settings where appropriate, but it must not depend on parsed notation being loaded.
2. The standalone route must not remove the embedded-piano capability from the main route.

## Comparison Standard

The current `virtual_piano.html` experience is the parity reference for layout purpose, direct-play behavior, and standalone-route availability until migration is complete.
