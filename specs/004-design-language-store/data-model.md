# Data Model: Replace Legacy Design System With a Full UI Overhaul

**Date**: 2026-03-26  
**Feature**: Replace Legacy Design System With a Full UI Overhaul

## Overview

This feature does not introduce user data or backend persistence. Its data model defines the repository artifacts and runtime surface groups needed to establish a new design system, apply it to the main app experience, and distinguish current design sources from legacy references.

## Entities

### 1. Current Design System Definition

**Purpose**: The active design-definition artifact set stored in `design/` that describes the new visual direction and how runtime styling should interpret it.

**Required Fields / Sections**:

- `metadata`: feature name, status, scope, and artifact ownership notes
- `principles`: high-level visual direction, interaction goals, and page-composition intent
- `foundations`: semantic rules for color, typography, spacing, radius, elevation, motion, and state feedback
- `surfaces`: shell, page, card, panel, control, and feedback surface conventions
- `components`: reusable expectations for primary shared UI elements and state variations
- `implementation-map`: how current runtime styling files and in-scope components consume the system

**Validation Rules**:

- The current definition must be clearly identified as authoritative.
- Shared semantic roles must use one canonical naming scheme.
- Artifact sections must support both design review and implementation work.

### 2. Legacy Design Artifact

**Purpose**: Any historical design document, reference mock, or superseded styling guidance retained for context but not used as the active source of truth.

**Required Fields / Sections**:

- artifact purpose
- legacy/reference-only status
- relationship to the current design system
- caveat that it must not drive new implementation decisions unless explicitly re-adopted

**Validation Rules**:

- A legacy artifact must be obviously non-authoritative.
- A collaborator should be able to tell within minutes whether an artifact is current or historical.

### 3. Primary Route Surface Group

**Purpose**: The set of user-visible surfaces that define the main redesign target.

**Included Surfaces**:

- shared shell/header/footer context
- page title/hero area
- notation input area
- piano display and active-note feedback
- playback and settings controls
- status, toast, loading, empty, and parsed-output treatments

**Validation Rules**:

- Surface relationships must create a clear hierarchy on desktop and mobile.
- In-scope surfaces must follow the same design-system rules for state treatments and spacing.

### 4. Shared Theme Consumer

**Purpose**: Runtime styling entry points and reusable components that implement the new system.

**Observed Examples**:

- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/styles/app-theme.css`
- shared layout, notation, playback, piano, and common-feedback components

**State Transitions**:

1. `audited`: current usage is classified as keep, redesign, or legacy
2. `defined`: new semantic rules are documented
3. `implemented`: runtime styling and components adopt the new system
4. `validated`: responsive, state, accessibility, and functional checks pass
5. `retired`: obsolete legacy styling rules are removed or clearly deprecated

## Relationships

- The **Current Design System Definition** governs the redesign of in-scope runtime surfaces.
- A **Legacy Design Artifact** may remain in the repo, but only as non-authoritative context.
- The **Primary Route Surface Group** is the main consumer and validation target for the new system.
- A **Shared Theme Consumer** implements the system in code and must not fall back to the retired legacy visual language.

## Migration Notes

- The existing `design/` artifacts are useful as historical input, but they no longer define the target product look by default.
- The legacy `--pg-*` theme vocabulary should be treated as a retirement target for redesigned surfaces.
- Because the app is frontend-only, the main risks are incomplete surface coverage, inconsistent state styling, and accessibility regressions rather than data corruption.
