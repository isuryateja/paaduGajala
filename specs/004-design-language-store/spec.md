# Feature Specification: Replace Legacy Design System With a Full UI Overhaul

**Feature Branch**: `[004-design-language-store]`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "We need to ditch the current design system and do a complete overhaul of the page and shared UI surfaces."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Make the notation workflow clear and inviting (Priority: P1)

As a learner using the notation player, I want the main page to feel visually clear, modern, and intentionally organized so that I can understand what to do first, what is currently active, and how notation, playback, and piano feedback relate to each other.

**Why this priority**: The main route is the primary product experience. If the redesign does not improve the notation workflow, the overhaul does not deliver user value.

**Independent Test**: Open the main route on desktop and mobile and verify that the page establishes a clear hierarchy for the title area, notation input, piano feedback, playback controls, and status messaging without relying on the legacy visual system.

**Acceptance Scenarios**:

1. **Given** a user lands on the main route, **When** the redesigned page loads, **Then** the page presents a clear hero/title area, a readable notation workspace, visible playback actions, and supporting status information in a cohesive layout.
2. **Given** a user interacts with notation parsing and playback, **When** they use the redesigned controls, **Then** active, empty, loading, success, warning, and error states remain understandable and visually consistent.

---

### User Story 2 - Establish a new shared design system for primary app surfaces (Priority: P2)

As a maintainer, I want the app’s primary shared surfaces to use a new design system so that the main route, shared shell, controls, and feedback components look like one product instead of a mix of legacy patterns.

**Why this priority**: A page overhaul will drift quickly unless the underlying shared styles and component rules are replaced alongside the page layout.

**Independent Test**: Review the main route, shared header/footer shell, and shared controls/components to confirm they use the new design vocabulary rather than the legacy `--pg-*` visual language.

**Acceptance Scenarios**:

1. **Given** shared app surfaces such as cards, controls, status feedback, and piano interactions, **When** the overhaul is complete, **Then** they use the new color, typography, spacing, surface, and state conventions defined for this feature.
2. **Given** a maintainer adds or adjusts a shared style after the overhaul, **When** they consult the design workspace and runtime theme entry points, **Then** they can identify the current design system without referring to legacy styling guidance.

---

### User Story 3 - Clarify design ownership and archive legacy references (Priority: P3)

As a collaborator working in the repository, I want the `design/` folder to clearly distinguish the new design source of truth from legacy references so that I can tell which artifacts are current, which are historical, and how they map to implementation.

**Why this priority**: The current workspace mixes design guidance, a mock HTML reference, and runtime styling assumptions. A full overhaul needs clearer ownership to prevent the next round of drift.

**Independent Test**: Open the `design/` folder and confirm the current design-system artifacts are easy to identify, while superseded references are explicitly marked as legacy or reference-only.

**Acceptance Scenarios**:

1. **Given** a collaborator opens the `design/` folder, **When** they inspect its contents, **Then** they can identify the current design-definition artifacts for the overhaul and understand the purpose of each artifact.
2. **Given** the previous design language and mock references are still present for historical context, **When** a collaborator views them, **Then** they are clearly marked as non-authoritative and cannot be mistaken for the active design source.

### Edge Cases

- What happens if a shared component surface is not redesigned when the main page is updated? The feature must either redesign that surface now or explicitly classify it as out of scope so the visual system remains coherent.
- What happens when a legacy styling token is still referenced after the overhaul? The implementation must either replace it with a new semantic role or mark the consumer as a known follow-up gap before sign-off.
- What happens if the desktop layout succeeds but mobile collapses into an unusable stack? The redesign is incomplete until the primary flow remains understandable on small screens.
- What happens if the new visuals improve aesthetics but reduce accessibility? The feature must treat readable contrast, focus visibility, and interaction clarity as acceptance requirements, not polish items.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST define a new design system for the primary app experience and retire the current legacy visual language as the active product standard.
- **FR-002**: The system MUST redesign the main notation-player page to improve hierarchy, readability, and workflow clarity across the title area, notation workspace, piano feedback, playback controls, and status messaging.
- **FR-003**: The system MUST apply the new design system to primary shared surfaces used by the main route, including shell, cards, controls, feedback treatments, and interactive piano states.
- **FR-004**: The system MUST document the current design-system source of truth inside the `design/` folder and clearly describe how it maps to runtime styling.
- **FR-005**: The system MUST explicitly mark prior design documents, mock references, or legacy theme artifacts as archived, superseded, or reference-only where they remain in the repository.
- **FR-006**: The system MUST define design-system rules for colors, typography, spacing, surfaces, state feedback, and component interaction states used by the redesigned surfaces.
- **FR-007**: The system MUST support responsive behavior for the redesigned primary route on desktop and mobile viewports.
- **FR-008**: The system MUST preserve functional behavior for notation input, parse flow, playback controls, settings, and piano interactions while the visuals and layout are overhauled.
- **FR-009**: The system MUST include accessibility-focused treatment for contrast, focus visibility, keyboard usability, and readable type hierarchy on the redesigned surfaces.
- **FR-010**: The system MUST remove or stop relying on the legacy `--pg-*` visual language for in-scope redesigned surfaces.

### Key Entities *(include if feature involves data)*

- **Current Design System Definition**: The active set of design artifacts in `design/` that describe the new visual direction, semantic roles, and implementation mapping for the overhaul.
- **Legacy Design Artifact**: Any prior design guidance, mockup, or styling vocabulary retained only for historical or reference purposes.
- **Primary Route Surface**: The main notation-player page and its shared shell, cards, controls, piano section, and feedback treatments.
- **Shared Theme Consumer**: Any runtime styling entry point or reusable component that adopts the new design system during this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time reviewer can open the main route and identify the page hierarchy, primary actions, and supporting feedback areas within 30 seconds on both desktop and mobile.
- **SC-002**: The main route and its shared shell/components no longer present the legacy `--pg-*` visual language on in-scope redesigned surfaces.
- **SC-003**: The `design/` folder clearly identifies the current design-system source of truth and marks legacy references in a way that a collaborator can understand within 2 minutes.
- **SC-004**: The redesigned surfaces pass manual checks for readable contrast, visible focus treatment, keyboard navigation clarity, and responsive usability.
- **SC-005**: Functional notation parsing, playback, settings, toast/status/loading feedback, and piano interactions continue to work after the visual overhaul.

## Assumptions

- The current "Rhythmic Rail" direction is treated as legacy input rather than a binding target for the new design system.
- The main notation-player route and the shared shell/components it depends on are the minimum in-scope surfaces for this overhaul.
- The feature directory name `004-design-language-store` is retained for continuity even though the feature intent has changed to a broader redesign.
