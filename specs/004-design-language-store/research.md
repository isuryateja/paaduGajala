# Research: Replace Legacy Design System With a Full UI Overhaul

**Date**: 2026-03-26  
**Feature**: Replace Legacy Design System With a Full UI Overhaul

## Decision 1: Treat 004 as a redesign, not a store migration

**Decision**: The feature will redefine the product’s visual system and primary page composition rather than preserving the current design language and merely moving it into a centralized store.

**Rationale**: The current planning artifacts were built around preventing token drift, but the actual product need is to replace the existing design direction. Keeping the migration framing would produce implementation work that is internally consistent but aimed at the wrong goal.

**Alternatives considered**:

- Keep the original scope and only centralize design tokens: rejected because it would preserve the legacy visual system the redesign is meant to replace.
- Redesign only the page while leaving the shared design system untouched: rejected because the page would quickly drift away from the rest of the app.

## Decision 2: Keep `design/` as the ownership boundary, but clarify artifact roles

**Decision**: The top-level `design/` folder remains the design workspace, but it must clearly separate current design-definition artifacts from legacy references and mock inputs.

**Rationale**: The repository already uses `design/` as the obvious collaboration space. The problem is not location; it is ambiguous artifact ownership. Clarifying roles prevents outdated mockups or prose docs from becoming accidental sources of truth.

**Alternatives considered**:

- Move design definition into `src/`: rejected because it hides product-design context inside implementation code.
- Leave `design/` unchanged and rely on convention: rejected because the current ambiguity is already causing planning drift.

## Decision 3: Redesign the system and the main route together

**Decision**: The overhaul will cover shared theme foundations and the main notation-player route in the same feature.

**Rationale**: The existing page experience is composed from shared cards, controls, shell surfaces, and piano states. Replacing only the route composition without redesigning those shared surfaces would produce a partial and unstable result.

**Alternatives considered**:

- Redesign shared styles first and the page later: rejected because it delays validation of the most important user-facing outcome.
- Redesign only the page shell and leave components for later: rejected because the page would still read as a legacy interface underneath the new layout.

## Decision 4: Preserve behavior, not visuals

**Decision**: The overhaul is free to replace the existing visual identity and layout patterns, but it must preserve the current core product behaviors unless a later feature explicitly changes them.

**Rationale**: The user experience should look and feel new, while notation parsing, playback, settings, and piano interactions continue to function as they do today. This keeps risk centered on presentation rather than feature semantics.

**Alternatives considered**:

- Preserve current visuals for safety: rejected because it conflicts with the redesign objective.
- Redesign and alter core interaction semantics at the same time: rejected because it increases scope and makes regressions harder to isolate.

## Decision 5: Validate the overhaul against usability and accessibility, not visual parity

**Decision**: Success will be judged by hierarchy, coherence, responsiveness, state clarity, and accessibility rather than by matching the old UI.

**Rationale**: A redesign should intentionally break with the old presentation. Validation therefore needs to prove the new design works well, not that it resembles the replaced system.

**Alternatives considered**:

- Keep theme-parity checks from the original plan: rejected because parity is not a meaningful redesign target.
- Rely only on subjective visual review: rejected because accessibility and interaction-state clarity need explicit acceptance criteria.
