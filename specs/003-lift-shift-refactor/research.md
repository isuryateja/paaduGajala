# Research: Lift-and-Shift Application Refactor

**Date**: 2026-03-25  
**Feature**: Lift-and-Shift Application Refactor

## Decision 1: Use SvelteKit and TypeScript at the repository root

**Decision**: Introduce the production app as a SvelteKit and TypeScript project in the current repository root rather than creating a second nested app.

**Rationale**:

- The source refactor brief explicitly targets SvelteKit and TypeScript for this phase.
- Keeping the app at the repository root preserves the current deployment shape and reduces long-term duplication.
- A single root app keeps docs, specs, static assets, and the migrated application in one place.

**Alternatives considered**:

- Keep the current single-file HTML architecture: rejected because it does not solve the structural-coupling problem.
- Create a separate nested frontend directory: rejected because it adds migration overhead and a second app boundary without user value.

## Decision 2: Treat the legacy app as the parity reference during migration

**Decision**: Keep the existing `paadugajaala/index.html`, `virtual_piano.html`, `notation_parser.js`, `audio_engine.js`, and `svara_frequencies.js` as the reference implementation until the migrated app reaches parity.

**Rationale**:

- The feature goal is behavior preservation, so a stable comparison target is required.
- The current repo already contains working flows for parsing, playback, and piano interaction.
- Side-by-side comparison lowers the risk of silent regressions while modules are being ported.

**Alternatives considered**:

- Replace the current app in one rewrite step: rejected because parity would be harder to measure and debug.
- Rewrite from the README alone: rejected because the inline code contains behavior details not fully captured in documentation.

## Decision 3: Split responsibilities by dependency direction

**Decision**: Use the dependency flow `routes/components -> app stores and actions -> domain modules -> browser and storage adapters`.

**Rationale**:

- This follows the architecture shape in the lift-and-shift brief.
- It keeps music and playback logic out of Svelte components.
- It provides clean seams for later tala work without forcing future abstractions into this phase.

**Alternatives considered**:

- Keep controller-style classes in route components: rejected because it reproduces the current structural coupling.
- Move all logic into stores only: rejected because it would blur domain behavior and orchestration concerns.

## Decision 4: Port pure logic before UI orchestration

**Decision**: Implement pitch, notation, and audio domain modules before rebuilding the route and component layer.

**Rationale**:

- The main user risks are parser drift, frequency drift, and playback drift.
- Pure logic is easier to compare against current behavior and easier to test with Vitest.
- UI work becomes safer once the underlying rules and return shapes are stable.

**Alternatives considered**:

- Rebuild UI first and stub behavior later: rejected because it delays the highest-risk parity checks.
- Port only the inline code and defer standalone modules: rejected because the inline code is the coupling problem this feature is meant to remove.

## Decision 5: Preserve current routes as `/` and `/piano`

**Decision**: Keep two user-facing routes in the migrated app: the main notation player at `/` and the standalone piano at `/piano`.

**Rationale**:

- The current product already exposes these experiences conceptually.
- The Vercel configuration and README already communicate the two entry points.
- Removing or collapsing the standalone piano would violate the feature boundary.

**Alternatives considered**:

- Move the piano into the main page only: rejected because it would remove the standalone route.
- Add more routes for internal organization: rejected because the phase does not add user-facing information architecture.

## Decision 6: Preserve current notation behavior instead of redesigning the grammar

**Decision**: Keep the accepted notation grammar, validation style, line handling, rhythm markers, and preview expectations equivalent to the current parser behavior.

**Rationale**:

- Existing notation inputs are part of the parity contract.
- The feature explicitly excludes new notation semantics and deep parser redesign.
- Future tala work should build on a stable migrated baseline, not hide parser changes inside this phase.

**Alternatives considered**:

- Redesign notation data structures to be tala-ready now: rejected because it expands scope and risks user-visible drift.
- Simplify validation to reduce migration effort: rejected because it would change feedback behavior.

## Decision 7: Use parity-oriented tests plus manual comparison

**Decision**: Combine Vitest coverage for domain modules with manual parity checks for playback, route behavior, file import, and direct piano interaction.

**Rationale**:

- Parser, frequency, and stats logic can be verified deterministically in tests.
- Audio playback and UI interaction still require human verification against the current experience.
- The feature success criteria require both measurable parity coverage and user-visible regression checks.

**Alternatives considered**:

- Rely only on manual checks: rejected because pure logic regressions are too easy to miss.
- Rely only on automated tests: rejected because current UX and browser audio behavior include interaction details not fully captured by unit tests.

## Decision 8: Keep the phase frontend-only and static-asset based

**Decision**: Continue serving example content and assets as static files and keep the phase free of backend services, accounts, or cloud persistence.

**Rationale**:

- The specification explicitly excludes backend work.
- Current app behavior is entirely client-side.
- Static assets are enough to preserve example loading and route behavior in this phase.

**Alternatives considered**:

- Add API-backed storage for future readiness: rejected because it introduces scope and operational risk without parity value.
- Add broader persistence beyond current behavior: rejected because it would be a net-new feature.

## Implementation Order

1. Add project scaffolding and shared configuration.
2. Port pitch and notation domain logic with tests.
3. Port audio domain logic and settings behavior.
4. Define piano constants, keyboard maps, and interaction orchestration.
5. Build Svelte routes and components around the stabilized modules.
6. Run parity checks against the legacy implementation before cutover.
