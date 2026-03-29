# Implementation Plan: Replace Legacy Design System With a Full UI Overhaul

**Branch**: `004-design-language-store` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-design-language-store/spec.md`

## Summary

Replace the current legacy visual language with a new design system and apply it to the primary app experience. The implementation covers design-definition work in `design/`, redesigned shared theme foundations, and a full overhaul of the main notation-player route plus its dependent shared shell and component surfaces.

## Technical Context

**Language/Version**: TypeScript 5.x, Svelte 5, HTML5, CSS3  
**Primary Dependencies**: SvelteKit, Vite, Vitest, ESLint, Prettier, native browser APIs  
**Storage**: Repository-based design artifacts in `design/`; shared runtime styling in `src/styles/`; no backend datastore  
**Testing**: Existing repo checks (`npm run check`, `npm run lint`, `npm run test`, `npm run validate`) plus manual desktop/mobile, interaction-state, and accessibility verification  
**Target Platform**: Modern desktop and mobile browsers supported by the current SvelteKit app  
**Project Type**: Frontend web application with a repository-hosted design workspace  
**Performance Goals**: No meaningful regression in route rendering or interaction responsiveness while the visual system changes  
**Constraints**: Preserve product functionality while redesigning visuals, keep the `design/` workspace understandable, define one current design source of truth, and explicitly mark legacy artifacts to avoid ambiguity  
**Scale/Scope**: Main notation-player route, shared shell/layout surfaces, shared controls and feedback components, shared styling entry points, and the design artifacts that govern them

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution file remains an unfilled template, so there are no enforceable project-specific gates to fail against. The working gates for this feature are:

- `PASS`: The plan stays within the existing frontend-only architecture.
- `PASS`: The plan treats the redesign as intentional product work rather than a token-only migration.
- `PASS`: The plan preserves runtime behavior while allowing a full visual and layout overhaul.
- `PASS`: The plan includes explicit design ownership, validation, and legacy-archive steps to prevent future ambiguity.

Post-design re-check:

- `PASS`: Research, data model, contracts, and quickstart all align around a new design system rather than preserving the legacy one.
- `PASS`: Phase 1 artifacts define artifact ownership, scope boundaries, and validation expectations for both design and implementation.

## Project Structure

### Documentation (this feature)

```text
specs/004-design-language-store/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── design-language-store.md
│   └── theme-consumption.md
└── tasks.md
```

### Source Code (repository root)

```text
/
├── design/
│   ├── DESIGN.md
│   ├── code.html
│   └── screen.png
├── specs/
│   └── 004-design-language-store/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── notation/
│   │   ├── piano/
│   │   └── playback/
│   ├── routes/
│   │   ├── +page.svelte
│   │   └── piano/
│   │       └── +page.svelte
│   └── styles/
│       ├── global.css
│       ├── tokens.css
│       └── app-theme.css
└── package.json
```

**Structure Decision**: Keep the existing app structure, but redefine ownership. `design/` becomes the place where the new design system and legacy/reference status are documented, while `src/styles/` and shared components implement the approved direction.

## Complexity Tracking

No constitution violations require justification. The main complexity is coordination: the redesign must update page composition, shared surfaces, runtime theme foundations, and artifact ownership together so the app does not end up with a new page layered on top of a legacy component system.

## Phase 0: Research & Decisions

See [research.md](./research.md).

The research phase resolves the core planning questions:

- The feature is a redesign, not a design-token migration.
- The design workspace must distinguish current design definitions from legacy references.
- The redesign must cover both page composition and shared component/system rules.
- The existing app functionality remains intact while the visual and layout system changes.

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), and [contracts/](./contracts/).

Phase 1 produces:

- A data model for current design artifacts, legacy artifacts, redesign scope, and runtime consumers.
- Contracts that define what the current design source of truth must communicate and how shared runtime surfaces adopt it.
- A quickstart that gives implementers an ordered redesign sequence and validation checklist.

## Implementation Strategy

1. Audit current routes, shared components, and design artifacts to classify surfaces as redesign, keep, or legacy/reference-only.
2. Define the new design-system artifacts in `design/`, including ownership rules for current versus legacy materials.
3. Establish the new shared theme foundations in `src/styles/` for colors, typography, spacing, surfaces, motion, and state treatments.
4. Redesign the shared shell and main route composition before refining individual component treatments.
5. Update shared controls, feedback surfaces, and piano interactions to match the new system and state rules.
6. Validate desktop/mobile layouts, interactive states, accessibility treatments, and functional regression across the in-scope experience.

## Next Step

Phase 2 task execution can proceed from [tasks.md](./tasks.md), starting with surface audit and design-definition work before runtime implementation.
