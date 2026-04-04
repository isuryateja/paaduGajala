## 1. Summary
- Problem:
  The application does not yet provide a dedicated notation-library workspace for browsing, reading, copying, and locally editing kriti notation sourced from repository files.
- Goal:
  Deliver an MVP page named `Svara Grantham` at `/svara-grantham` that loads local `.svara` files, groups them by raga, supports client-side search, displays notation in a manuscript-like workspace, and allows local-only edit, copy, and reset workflows.
- Outcome:
  Users can open a quiet, readable notation library inside Paadu Gajala without any server persistence; maintainers can add or update notation by committing `.svara` files under the designated library directory.

## 2. Scope
- In scope:
  Dedicated `Svara Grantham` route and page chrome; local `.svara` file loading; frontmatter validation; grouping by raga; case-insensitive search by kriti name; auto-selection of the first valid kriti; read-mode workspace; copy current notation body; local edit/save/cancel/reset flows; browser persistence of saved overrides keyed by notation `id`; empty/error states for invalid or missing content; visible disabled `Play`, `Pause`, and `New Notation` actions; manuscript-inspired visual treatment for the library and workspace.
- Out of scope:
  Server-backed save; user accounts; cross-device sync; metadata editing; UI-driven file creation; notation playback; notation import UI; multiple variants per kriti; composer filters; version history; collaborative editing; deep-linking to a selected kriti; unsaved-draft recovery across full page reloads before the user clicks `Save`.

## 3. Actors and Context
- Primary actors/users:
  Learners or readers browsing Carnatic notation; maintainers adding or correcting `.svara` source files in the repo.
- Systems/services involved:
  SvelteKit route at `src/routes/svara-grantham/+page.svelte`; a client-consumable content-loading module; repository-hosted `.svara` files under `src/lib/svara-grantham/`; browser `localStorage`; browser Clipboard API; existing shared app styling and layout primitives.
- Roles and permissions:
  All app users have the same read/copy/local-edit capabilities in the browser. No authenticated roles exist in MVP. Repository maintainers manage source files outside the UI.

## 4. Functional Requirements
- FR-1:
  The system MUST expose a dedicated route at `/svara-grantham` with page header text `Svara Grantham`.
- FR-2:
  The system MUST load notation content only from repository-local `.svara` files stored in `src/lib/svara-grantham/` or an explicitly documented equivalent library directory introduced for this feature.
- FR-3:
  The system MUST treat each `.svara` file as a raw text document containing one YAML frontmatter block followed by a raw notation body.
- FR-4:
  The system MUST validate each `.svara` file for the required metadata fields `id`, `name`, `raga`, `tala`, and `notation_format`.
- FR-5:
  The system MUST accept a notation entry as valid in MVP only when frontmatter exists, all required metadata fields are present and non-empty, `notation_format` equals `pg_v1`, and the notation body contains at least one non-whitespace character.
- FR-6:
  The system MUST skip invalid files from the visible library and MUST NOT allow an invalid file to crash route rendering.
- FR-7:
  The system MUST surface development-time diagnostics for invalid files by using a maintainer-visible warning mechanism such as `console.warn`, including the file path and validation failure reason.
- FR-8:
  The system MUST build an in-memory index of valid notation entries with metadata and raw body separated, without parsing the notation language itself.
- FR-9:
  The system MUST group valid entries by `raga` using metadata values, sort raga groups alphabetically by display value, and sort entries within each raga alphabetically by `name`.
- FR-10:
  The system MUST auto-select the first valid entry in sorted library order when the page loads and at least one valid entry exists.
- FR-11:
  The system MUST render a two-pane desktop layout with a left library browser pane and a right notation workspace pane; mobile may stack the panes vertically while preserving the same feature set.
- FR-12:
  The left pane MUST provide a page-local search input that filters entries by `name` only, case-insensitively, and updates results as the user types.
- FR-13:
  The search filter MUST update only the visible sidebar results and MUST NOT rewrite or mutate source metadata or notation content.
- FR-14:
  When the current search yields no matches, the sidebar MUST display a `No matching kritis` empty state.
- FR-15:
  The left pane MUST display a visible but disabled `New Notation` control that is non-clickable and does not change page state.
- FR-16:
  Clicking a visible library entry MUST load that entry into the notation workspace and clearly highlight the active selection.
- FR-17:
  If the active entry is filtered out by the current search text, the workspace MUST continue showing the currently selected entry until the user selects another entry or clears the filter.
- FR-18:
  The right pane header MUST show the selected entry `name` and a subtitle formatted as `<raga> | <tala>`.
- FR-19:
  The notation display area MUST render only the effective notation body for the selected entry and MUST preserve authored line breaks, blank lines, spacing, punctuation, separators, and future notation syntax exactly as stored.
- FR-20:
  The system MUST NOT interpret the notation body as Markdown, auto-format the notation, normalize whitespace, or rewrite notation tokens before rendering or copying.
- FR-21:
  The notation workspace MUST provide toolbar controls for `Play`, `Pause`, `Copy`, `Edit`, `Reset`, and `New Notation`.
- FR-22:
  `Play`, `Pause`, and `New Notation` MUST remain visible but disabled in MVP, with inactive styling and non-clickable behavior.
- FR-23:
  In read mode, `Copy`, `Edit`, and `Reset` MUST be enabled when a valid entry is selected.
- FR-24:
  Clicking `Copy` MUST copy only the currently effective notation body for the selected entry, with no YAML metadata or wrapper text included.
- FR-25:
  Copy behavior MUST reflect the currently visible notation source of truth: original body when no override exists, saved local override when one exists, and current editor buffer when edit mode is active.
- FR-26:
  Entering edit mode MUST replace the read-only notation display with an editable notation text area containing only the effective notation body for the selected entry.
- FR-27:
  Edit mode MUST display an editing-state indicator and MUST expose `Save`, `Cancel`, and `Reset` behaviors, whether by replacing or supplementing the default toolbar controls.
- FR-28:
  `Save` in edit mode MUST persist the editor content to browser-local storage under the selected notation `id` and MUST immediately make that saved override the effective displayed notation.
- FR-29:
  Saved local overrides MUST survive page refresh in the same browser profile and MUST NOT modify repository source files.
- FR-30:
  `Cancel` in edit mode MUST discard unsaved in-session changes and revert the editor/workspace to the current saved source of truth in this order: saved local override first, original `.svara` body second.
- FR-31:
  `Reset` in read mode MUST remove any saved local override for the selected entry and revert the displayed notation to the original `.svara` body.
- FR-32:
  `Reset` in edit mode MUST remove any saved local override for the selected entry, replace the editor content with the original `.svara` body, and keep the user in edit mode so they can continue editing from the original source.
- FR-33:
  The effective displayed notation MUST always resolve in this order: saved local override by `id`, otherwise original `.svara` body.
- FR-34:
  If the user attempts to switch to another library entry while the active editor buffer has unsaved changes, the system MUST require an explicit discard confirmation before changing selection.
- FR-35:
  If no valid `.svara` files exist, the page MUST present an empty-library state such as `No notation files found` and MUST keep the workspace in a safe non-crashing empty state.
- FR-36:
  The workspace visual design MUST feel like a quiet notation archive or manuscript surface, using warm paper-like surfaces, clear typography hierarchy, restrained separators, and strong distinction between browser and reading panes rather than code-editor styling.
- FR-37:
  The implementation MUST preserve Svelte 5 template reactivity rules for UI state, including avoiding template-bound `Set`/`Map` reads for selection, search, or override indicators.

## 5. Data and Interfaces
- Inputs:
  Raw `.svara` files from the library directory; user search text; selected notation `id`; edit buffer text; local override map read from browser storage; clipboard write requests.
- Outputs:
  Rendered grouped library list; selected notation workspace header; read-only notation view or editable notation textarea; copied notation text; saved override map in browser storage; development warnings for invalid files.
- Data model/entities:
  `SvaraMetadata`:
  `{ id: string; name: string; raga: string; tala: string; notation_format: 'pg_v1' }`
  `SvaraEntry`:
  `{ metadata: SvaraMetadata; body: string; sourcePath: string }`
  `SvaraValidationError`:
  `{ sourcePath: string; reason: 'missing_frontmatter' | 'missing_field' | 'unsupported_format' | 'empty_body' }`
  `SvaraLibraryState`:
  `{ entries: SvaraEntry[]; groupedEntryIds: Record<string, string[]>; selectedId: string | null; searchText: string; mode: 'read' | 'edit'; editBuffer: string; hasUnsavedChanges: boolean; overrides: Record<string, string> }`
- API or event contracts:
  Content loader contract:
  `loadSvaraLibrary(): { entries: SvaraEntry[]; errors: SvaraValidationError[] }`
  Effective body resolver contract:
  `getEffectiveBody(entryId: string, originalBody: string, overrides: Record<string, string>): string`
  Storage contract:
  Persist overrides as JSON in `localStorage` under key `paadugajala:svara-grantham:overrides:v1`.
  Clipboard contract:
  `copyEffectiveNotation(text: string): Promise<{ ok: boolean; error?: string }>`
- Validation rules:
  `id` must be unique across valid entries and URL-safe using lowercase letters, numbers, and hyphens; duplicate valid `id` values are treated as invalid files for MVP.
  `name`, `raga`, and `tala` must be trimmed, non-empty strings after frontmatter parsing.
  `notation_format` must equal `pg_v1` exactly.
  `body` must preserve raw content after the frontmatter separator and remain non-empty after checking for at least one non-whitespace character.
  Storage writes must store only notation body overrides keyed by `id`, never metadata.

## 6. Flow and Logic
- Main flow:
  On route load, the page reads all candidate `.svara` files, validates them, logs warnings for invalid files, sorts valid entries, initializes the override map from `localStorage`, auto-selects the first valid entry, resolves its effective notation body, and renders the library plus workspace in read mode.
  On library selection, the page resolves the selected entry, computes its effective body from override-or-original precedence, and updates the workspace header and notation surface.
  On edit, the page seeds the edit buffer from the effective body and switches the workspace to edit mode.
  On save, the page writes the edit buffer into the override map and `localStorage`, exits edit mode, and shows the saved override as the new effective notation.
  On reset, the page removes the selected entry’s override from the override map and `localStorage`, then reverts to the original body.
- Alternate flows:
  If there are no valid files, render the empty-library state and disable read/edit actions that require a selected entry.
  If search text yields no visible entries, show the search-empty state in the sidebar while leaving the current workspace selection untouched.
  If clipboard write fails, keep the current workspace intact and show user-facing failure feedback without losing selection or edits.
  If `localStorage` is unavailable, read mode, copy, and edit mode still work for the current session, but saved overrides are treated as non-persistent and the user receives a lightweight warning only when a save is attempted.
- State transitions:
  `empty` -> `read` when at least one valid entry loads.
  `read` -> `edit` when the user clicks `Edit`.
  `edit(clean)` -> `edit(dirty)` when the textarea content differs from the current saved source of truth.
  `edit(*)` -> `read` on `Save` or `Cancel`.
  `read` or `edit` -> `read` with original content after `Reset` outside edit mode; `edit` with original buffer after `Reset` in edit mode.
- Business rules:
  The source of truth for display, copy, and post-save rendering is always `overrides[id] ?? originalBody`.
  Search scope is limited to `name`; `raga`, `tala`, and notation body text are not searched in MVP.
  The system does not persist unsaved dirty buffers across route changes or page reloads.
  Section labels such as `PALLAVI`, `ANUPALLAVI`, and `CHARANAM` are part of the raw notation body and require no special parsing beyond preserving their formatting.

## 7. Edge Cases and Failure Handling
- Edge cases:
  Duplicate valid `id` values across files.
  Files with frontmatter but blank notation bodies.
  Files with extra unknown metadata fields.
  Search text that hides the currently selected entry.
  Reset while editing after both saved overrides and new unsaved changes exist.
  Very long notation bodies requiring independent scrolling inside the workspace.
  Case differences in `raga` values such as `Shree` versus `shree`; MVP treats metadata values literally for grouping and sorting.
- Error conditions:
  Missing frontmatter, missing required metadata, unsupported `notation_format`, duplicate `id`, or empty body mark a file invalid and exclude it from the visible library.
  Clipboard permission denial or browser failure returns a non-fatal copy error.
  Storage quota or unavailable `localStorage` returns a non-fatal save persistence error.
  Dirty-edit selection change without confirmation is blocked.
- Retries/timeouts/fallbacks:
  No network retries are required because all content is local.
  Clipboard failures may be retried by the user via the `Copy` button.
  When `localStorage` reads fail or JSON is corrupted, fall back to an empty override map and ignore the invalid stored payload.

## 8. Non-Functional Requirements
- Performance:
  Initial library loading and grouping should complete during normal route initialization without noticeable lag for an MVP-sized library of up to 200 `.svara` files.
  Search result updates should feel immediate as the user types and should avoid unnecessary full-page rerenders.
- Reliability:
  Invalid source files, clipboard failures, and storage failures must remain isolated and must not break route rendering or selection state for valid entries.
  The route must behave deterministically for sorting, selection, override resolution, and reset behavior.
- Security/privacy/compliance:
  No server persistence or external transmission is allowed for notation content or local edits.
  Browser persistence is limited to notation body overrides stored on the same device in `localStorage`.
- Accessibility:
  Search, selection, copy, edit, save, cancel, and reset controls must be keyboard reachable.
  Disabled controls must expose disabled semantics to assistive technology.
  The notation workspace must maintain readable contrast and preserve focus visibility in both read and edit modes.
  The notation display and editor must use typography and spacing appropriate for long-form reading rather than compressed code styling.
- Observability (logs/metrics/traces/alerts):
  Console warnings for invalid source files are required in development.
  No analytics, telemetry, or alerting integration is required in MVP.

## 9. Dependencies and Constraints
- External dependencies:
  Browser `localStorage`; browser Clipboard API; SvelteKit/Vite file-loading support for raw source files; an explicit YAML/frontmatter parsing approach chosen by implementation.
- Technical constraints:
  The feature must be implemented within the existing Svelte 5 and SvelteKit architecture.
  The notation body must remain raw text throughout load, display, copy, save, and reset flows.
  Template-driven state must follow Svelte 5 reactivity guidance; use `Record<string, T>` or rune-backed objects instead of relying on template-bound `Set`/`Map`.
  The feature must not introduce server endpoints or require backend storage.
- Operational constraints:
  Maintainers add or update notation only by editing `.svara` files in the repository.
  The app must continue to work if the library contains zero valid files.

## 10. Rollout and Migration
- Release strategy:
  Ship as a single feature route behind normal application navigation or direct URL access.
  Seed the route with at least one valid `.svara` file before marking the feature complete for product review.
- Backward compatibility:
  Existing routes and notation-player flows remain unchanged.
  No existing persisted browser state must be broken by this feature because it uses a new namespaced storage key.
- Data migration:
  None required for server data.
  If the override storage schema changes later, version the key suffix rather than mutating prior stored payloads in place.
- Rollback plan:
  Remove the route and related feature modules; because persistence is local-only, stale override data may remain in the browser but will become unused once the route is removed.

## 11. Acceptance Criteria
- AC-1:
  Given at least one valid `.svara` file exists in the library directory, when the user opens `/svara-grantham`, then the page loads without error, shows `Svara Grantham`, groups entries by raga, and auto-selects the first valid kriti.
- AC-2:
  Given multiple valid entries across multiple ragas, when the library renders, then raga groups appear in alphabetical order and entries within each group appear in alphabetical order by `name`.
- AC-3:
  Given the user types into the search input, when the text matches one or more kriti names ignoring case, then only matching entries remain visible in the sidebar and the results update live.
- AC-4:
  Given the user types search text that matches no kriti names, when the filter is applied, then the sidebar shows `No matching kritis` and the page does not crash.
- AC-5:
  Given a selected valid entry, when the workspace renders in read mode, then the header shows the kriti `name` and `<raga> | <tala>` and the notation body appears with its authored whitespace preserved exactly.
- AC-6:
  Given the selected entry has no local override, when the user clicks `Copy`, then the clipboard receives only the original notation body with no metadata.
- AC-7:
  Given the selected entry has a saved local override, when the user clicks `Copy`, then the clipboard receives only the overridden notation body with its formatting preserved.
- AC-8:
  Given the user enters edit mode and changes the notation body, when they click `Save`, then the updated body becomes the visible notation and remains present after a page refresh in the same browser profile.
- AC-9:
  Given the user has unsaved changes in edit mode, when they click `Cancel`, then the unsaved changes are discarded and the workspace returns to the current saved source of truth.
- AC-10:
  Given the selected entry has a saved local override, when the user clicks `Reset` from read mode, then the override is removed and the original `.svara` body becomes visible.
- AC-11:
  Given the selected entry has a saved local override and the user is editing, when they click `Reset`, then any saved override is removed and the editor resets to the original `.svara` body while remaining editable.
- AC-12:
  Given the user is on the route, when they inspect the toolbar and sidebar controls, then `Play`, `Pause`, and `New Notation` are visible but disabled and cannot be activated.
- AC-13:
  Given one or more `.svara` files are invalid, when the route loads, then valid entries still render normally, invalid entries are omitted, and invalid files do not break the page.
- AC-14:
  Given no valid `.svara` files exist, when the route loads, then the page shows a `No notation files found` empty state and remains stable.
- AC-15:
  Given the user has unsaved edits and clicks another kriti, when the selection-change prompt appears and the user chooses to stay, then the current edit session remains intact and selection does not change.

## 12. Implementation Plan
- Task breakdown:
  Create the feature spec-aligned content directory and add at least one valid sample `.svara` file.
  Implement `svara-grantham` domain types plus a content-loading module that reads raw files, splits frontmatter/body, validates metadata, resolves duplicates, and returns entries plus warnings.
  Implement browser-storage helpers for reading, writing, and deleting local notation overrides under the new storage key.
  Implement the `/svara-grantham` page state and UI, including search, grouped sidebar, selection, read mode, edit mode, discard confirmation, copy behavior, and empty states.
  Apply feature-specific styling that matches the manuscript/archive direction while respecting the current design-language work.
  Add automated tests for loader validation, storage behavior, effective body precedence, route rendering, and edit/reset flows.
- Suggested order:
  1. Define data contracts and loader validation.
  2. Add storage helper and effective-body resolver.
  3. Build route state and read-mode UI.
  4. Add edit/save/cancel/reset flows and dirty-state guard.
  5. Polish visual design and accessibility.
  6. Add and pass tests, then run `npm run validate`.
- Risks and mitigations:
  Risk:
  Raw-text file loading for `.svara` may be awkward if the file import strategy is chosen late.
  Mitigation:
  Decide the loading mechanism first and keep the loader contract isolated from the page component.
  Risk:
  Losing unsaved edits on selection change can frustrate users.
  Mitigation:
  Implement an explicit dirty-state confirmation before selection changes.
  Risk:
  Svelte 5 reactivity pitfalls can cause stale selection or override indicators.
  Mitigation:
  Keep template-bound state in plain objects or rune-backed structures, not `Set`/`Map`.

## 13. Testing Plan
- Unit tests:
  Validate frontmatter splitting, required field checks, duplicate `id` rejection, unsupported `notation_format` rejection, empty-body rejection, and effective-body precedence logic.
  Validate storage helper behavior for read, write, delete, corrupted JSON fallback, and unavailable storage fallback.
- Integration tests:
  Render the route with a representative valid library and verify raga grouping, alphabetical sorting, default selection, search filtering, and empty states.
  Verify copy, edit, save, cancel, reset, and dirty-selection-guard flows against the route state.
- End-to-end tests:
  Manual browser verification on desktop and mobile-sized viewports for long notation scrolling, keyboard access, disabled controls, and refresh persistence of saved overrides.
- Negative/failure tests:
  Invalid `.svara` files should be skipped without crashing.
  Clipboard failure should show non-fatal feedback.
  Storage failure should not break the current session.
  Zero-valid-file libraries should render the empty-library state safely.

## 14. Assumptions and Open Questions
- Assumptions:
  Assumption (low):
  Selection persistence across page reloads is not required in MVP; only saved notation overrides persist.
  Assumption (medium):
  Switching entries with unsaved edits requires a discard confirmation even though the original brief did not spell out that interaction.
  Assumption (low):
  Extra unknown YAML metadata fields may be retained in source files but are ignored by MVP rendering.
  Assumption (medium):
  Literal `raga` metadata values drive grouping, so canonicalization of alternate spellings or casing is a future enhancement.
  Assumption (low):
  A lightweight inline disabled-state hint such as muted styling and optional tooltip text is sufficient to communicate that `Play`, `Pause`, and `New Notation` are future functionality.
- Open questions:
  Should the route be linked from the global app navigation in this same feature, or is direct URL access sufficient for the first release?
  Should the feature include a persistent visual badge indicating that the active notation contains local overrides, or is that deferred unless needed by design review?
  Should there be a browser `beforeunload` warning for dirty unsaved edits, or is the entry-switch confirmation enough for MVP?
- Decision owners:
  Product/design owner for navigation exposure and override indicator.
  Engineering owner for file-loading strategy and parser dependency choice.

## 15. Definition of Done
- Completion checklist:
  A route exists at `/svara-grantham` and renders the feature without crashing.
  Valid `.svara` files load from the repository library directory and invalid files are skipped safely.
  Grouping, sorting, search, selection, read mode, copy, edit, save, cancel, and reset behaviors match this spec.
  Saved local overrides persist in browser storage and never modify source files.
  Disabled `Play`, `Pause`, and `New Notation` controls are visible and inactive.
  Empty-library and search-empty states are implemented.
  Automated tests cover loader validation, storage precedence, and primary UI flows.
  Visual review confirms the page feels like a readable Carnatic notation archive rather than a raw code editor.
  `npm run validate` passes before merge.
