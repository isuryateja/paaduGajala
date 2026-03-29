# Implementation Plan: Lift-and-Shift Application Refactor

**Branch**: `003-lift-shift-refactor` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-lift-shift-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Migrate the current single-page Paadu Gajaala application into a SvelteKit and TypeScript frontend without changing user-visible behavior. The plan preserves the existing main player and standalone piano flows while splitting inline logic into domain modules, app orchestration, browser adapters, and Svelte UI components so later tala work can build on a stable baseline instead of another rewrite.

## Technical Context

**Language/Version**: TypeScript 5.x, Svelte 5, HTML5, CSS3  
**Primary Dependencies**: SvelteKit, Vite, Vitest, ESLint, Prettier, Web Audio API, native browser APIs  
**Storage**: Static assets for bundled example content; browser memory and lightweight session persistence for UI state; no backend datastore  
**Testing**: Vitest unit tests for domain modules, component and route smoke checks, manual parity verification against the current app  
**Target Platform**: Modern desktop and mobile browsers with Web Audio API support  
**Project Type**: Frontend web application with two user-facing routes and shared domain modules  
**Performance Goals**: Preserve responsive parse and playback interaction, keep direct piano interaction immediate to the user, and maintain visible note-follow synchronization during playback  
**Constraints**: No net-new end-user features, no backend, no tala behavior, no notation redesign, parity must remain checkable throughout the migration  
**Scale/Scope**: One repository-root SvelteKit app, two routes (`/` and `/piano`), shared notation/audio/pitch/piano domain modules, parity coverage for current example and representative notation inputs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution file is still an unfilled template, so there are no enforceable project-specific gates to fail against. For this feature, the working gates are:

- `PASS`: The plan preserves behavior before enhancement.
- `PASS`: The plan keeps the project frontend-only for this phase.
- `PASS`: The plan introduces modular boundaries only where they directly support parity and future maintainability.
- `PASS`: The plan includes explicit parity verification so regressions can be detected before replacement.

Post-design re-check:

- `PASS`: Research, data model, contracts, and quickstart remain consistent with the no-new-functionality boundary.
- `PASS`: No Phase 1 artifact requires backend services, tala semantics, or a redesigned playback model.

## Project Structure

### Documentation (this feature)

```text
specs/003-lift-shift-refactor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── main-player-ui.md
│   ├── notation-parity.md
│   └── piano-route-ui.md
└── tasks.md
```

### Source Code (repository root)

```text
/
├── README.md
├── example.txt
├── audio_engine.js
├── notation_parser.js
├── svara_frequencies.js
├── virtual_piano.html
├── paadugajaala/
│   └── index.html
├── specs/
│   └── 003-lift-shift-refactor/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── svelte.config.js
├── eslint.config.js
├── .prettierrc
├── static/
│   ├── example.txt
│   └── favicon.png
├── src/
│   ├── app.html
│   ├── app.d.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── piano/
│   │       └── +page.svelte
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   ├── notation/
│   │   ├── playback/
│   │   └── piano/
│   ├── app/
│   │   ├── stores/
│   │   ├── actions/
│   │   └── services/
│   ├── domain/
│   │   ├── shared/
│   │   ├── notation/
│   │   ├── pitch/
│   │   ├── audio/
│   │   └── piano/
│   ├── infra/
│   │   ├── browser/
│   │   └── storage/
│   ├── styles/
│   ├── lib/
│   │   ├── utils/
│   │   └── ids/
│   └── tests/
│       ├── notation/
│       ├── pitch/
│       └── audio/
└── vercel.json
```

**Structure Decision**: Migrate in place at the repository root. The new SvelteKit app becomes the production structure, while the current HTML and JS files remain the parity reference during migration until the replacement is verified.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations require justification. The main complexity is controlled migration risk, not architectural exception handling.

## Phase 0: Research & Decisions

See [research.md](./research.md).

The research phase resolves all planning unknowns:

- The migration target remains SvelteKit and TypeScript at the repository root.
- The current inline app logic is split into components, stores, actions, domain modules, and browser adapters.
- Parity verification is treated as a first-class deliverable, not an afterthought.
- The standalone piano remains a dedicated route rather than an embedded-only feature.

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), and [contracts/](./contracts/).

Phase 1 produces:

- A data model for notation state, playback state, settings, piano interaction, and user feedback.
- UI contracts for the main player and standalone piano route.
- A notation parity contract describing accepted input, validation, and preview behavior.
- A quickstart that defines setup and parity verification steps for implementers.

## Implementation Strategy

1. Scaffold the SvelteKit and TypeScript app at the repository root without removing the current reference implementation.
2. Port pure logic first: pitch and notation modules, then audio modules, then piano constants and mappings.
3. Build store and action layers that orchestrate user intent and browser events without leaking music rules into components.
4. Recreate the current main player UI and standalone piano route with Svelte components while preserving labels, controls, defaults, and flow.
5. Add parity-focused tests for parser behavior, note statistics, frequency lookup, and key playback settings.
6. Compare migrated behavior against the current app before removing dependence on legacy inline code.

## Next Step

Phase 2 task generation is ready. Run `/speckit.tasks` to break this plan into implementation tasks.
