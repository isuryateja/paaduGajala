# Contract: Redesign Runtime Consumption

**Date**: 2026-03-26  
**Feature**: Replace Legacy Design System With a Full UI Overhaul

## Purpose

Define how runtime styling and shared components must adopt the new design system during the overhaul.

## Consumption Scope

This contract applies to shared styling entry points and in-scope shared components used by the primary notation-player experience.

## Required Behaviors

1. Shared styling entry points must implement the new design-system semantics for in-scope redesigned surfaces.
2. The main notation-player route, its shared shell, and its dependent shared components must present one coherent visual language after the overhaul.
3. Interactive states such as hover, focus, active, loading, success, warning, error, and empty states must be visually intentional and consistent across in-scope surfaces.
4. Functional behaviors must remain intact while the visual and layout system changes.

## Covered Runtime Areas

The redesign consumption path MUST support:

- global page background and typography defaults
- shared shell and page-level composition primitives
- card, panel, and control surfaces
- notation input, parsed output, playback controls, settings controls, and piano interactions
- toast, status, and loading feedback surfaces
- any replaced semantics that previously depended on the legacy `--pg-*` visual language

## Validation Expectations

1. Desktop and mobile layouts must remain understandable and usable on the primary route.
2. Keyboard focus and interaction states must remain visible and coherent after the redesign.
3. Removing legacy visual-language dependencies from redesigned surfaces must not break functional flows.

## Failure Conditions

The contract is violated if:

- redesigned surfaces still visibly depend on the legacy `--pg-*` look and feel
- the primary route reads as a mix of new page composition and old shared-component styling
- accessibility or interaction-state clarity is sacrificed during the redesign
