# Quickstart: Replace Legacy Design System With a Full UI Overhaul

**Date**: 2026-03-26  
**Feature**: Replace Legacy Design System With a Full UI Overhaul

## Goal

Define a new design system, apply it to the primary notation-player experience, and clearly separate current design-definition artifacts from superseded legacy references.

## Prerequisites

- Node.js 20+ and npm, matching the repository's current toolchain
- Existing project dependencies installed
- Ability to run repo validation commands and inspect the app in desktop and mobile browser layouts

## Recommended Implementation Order

1. Audit the current main route, shared components, shared styles, and design artifacts to classify each surface or document as redesign, keep, or legacy.
2. Define the current design-system artifacts in `design/` and explicitly mark any retained historical references.
3. Update shared styling foundations in `src/styles/` to establish the new semantic design vocabulary.
4. Redesign shared shell and page-level composition on the main route.
5. Redesign shared controls, piano states, and feedback surfaces that support the main route workflow.
6. Remove or deprecate legacy visual-language dependencies from in-scope redesigned surfaces.

## Validation Checklist

Run these checks after each redesign milestone:

1. The `design/` folder clearly identifies current versus legacy artifacts.
2. The main route shows a clear visual hierarchy on desktop and mobile.
3. Shared shell, cards, controls, and feedback surfaces read as one design system rather than mixed old/new styles.
4. Focus visibility, readable contrast, and keyboard usability remain intact.
5. Notation parsing, playback, settings, toast/status/loading feedback, and piano interactions still behave correctly.

## Suggested Verification Commands

1. `npm run check`
2. `npm run lint`
3. `npm run test`
4. `npm run validate`

## Manual Verification Focus

- Main route composition and hierarchy on desktop and mobile
- Header, footer, card, panel, and page-shell consistency
- Notation input, parsed output, playback, settings, and piano interaction states
- Toast, status, loading, empty, and error/success feedback treatments
- Keyboard focus, contrast, and responsive readability

## Completion Definition

Implementation is complete when the main notation-player experience and its shared supporting surfaces present the new design system coherently, the `design/` workspace explains current versus legacy artifacts, and the overhaul passes functional and accessibility-oriented validation.
