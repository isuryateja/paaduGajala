<svelte:head>
  <title>Paadu Gajala - Svara Grantham</title>
</svelte:head>

<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { onMount } from 'svelte';
  import ReferenceChrome from '../../components/layout/ReferenceChrome.svelte';
  import { pushToast } from '../../app/stores/ui.store';
  import {
    buildSvaraRagaGroups,
    getEffectiveSvaraBody,
    getFirstSvaraEntryId,
    loadSvaraLibrary
  } from '../../domain/svara-grantham/svara-grantham.library';

  import { readSvaraGranthamOverrides, writeSvaraGranthamOverrides } from '../../infra/storage/svara-grantham-overrides';

  const libraryResult = loadSvaraLibrary();
  const libraryEntries = libraryResult.entries;
  const initialSelectedId = getFirstSvaraEntryId(libraryEntries);

  let searchText = $state('');
  let selectedId = $state<string | null>(initialSelectedId);
  let mode = $state<'read' | 'edit'>('read');
  let editBuffer = $state('');
  let overrides = $state<Record<string, string>>({});

  let selectedEntry = $derived(
    selectedId ? libraryEntries.find((entry) => entry.metadata.id === selectedId) ?? null : null
  );
  let groupedEntries = $derived(buildSvaraRagaGroups(libraryEntries, searchText));
  let selectedOriginalBody = $derived(selectedEntry ? selectedEntry.body : '');
  let selectedEffectiveBody = $derived(
    selectedEntry ? getEffectiveSvaraBody(selectedEntry.metadata.id, selectedEntry.body, overrides) : ''
  );
  let hasSelectedOverride = $derived(selectedEntry ? overrides[selectedEntry.metadata.id] !== undefined : false);
  let visibleNotationBody = $derived(mode === 'edit' ? editBuffer : selectedEffectiveBody);
  let hasUnsavedChanges = $derived(mode === 'edit' && editBuffer !== selectedEffectiveBody);
  let emptyLibrary = $derived(libraryEntries.length === 0);
  let searchEmpty = $derived(!emptyLibrary && groupedEntries.length === 0);

  onMount(() => {
    overrides = readSvaraGranthamOverrides();

    if (dev) {
      for (const error of libraryResult.errors) {
        console.warn(`[Svara Grantham] Skipped invalid file "${error.sourcePath}": ${error.detail}`);
      }
    }
  });

  /** Non-standard Safari/iOS attribute — set via action so Svelte HTML types stay clean (PGF-005). */
  function disableAutocorrect(node: HTMLElement) {
    node.setAttribute('autocorrect', 'off');
  }

  function selectEntry(nextId: string): void {
    if (selectedId === nextId) {
      return;
    }

    if (mode === 'edit' && hasUnsavedChanges && browser) {
      const shouldDiscard = window.confirm(
        'Discard the unsaved notation changes for the current kriti and open another one?'
      );
      if (!shouldDiscard) {
        return;
      }
    }

    selectedId = nextId;
    mode = 'read';
    editBuffer = '';
  }

  function startEditing(): void {
    if (!selectedEntry) {
      return;
    }

    editBuffer = selectedEffectiveBody;
    mode = 'edit';
  }

  function cancelEditing(): void {
    mode = 'read';
    editBuffer = '';
  }

  function saveEditing(): void {
    if (!selectedEntry) {
      return;
    }

    const nextOverrides = {
      ...overrides,
      [selectedEntry.metadata.id]: editBuffer
    };

    overrides = nextOverrides;
    mode = 'read';
    editBuffer = '';

    if (writeSvaraGranthamOverrides(nextOverrides)) {
      pushToast('Local notation saved on this device.', 'success');
      return;
    }

    pushToast('Saved for this session, but browser storage is unavailable.', 'warning');
  }

  function resetSelectedNotation(): void {
    if (!selectedEntry) {
      return;
    }

    const nextOverrides = { ...overrides };
    delete nextOverrides[selectedEntry.metadata.id];
    overrides = nextOverrides;
    const persisted = writeSvaraGranthamOverrides(nextOverrides);

    if (mode === 'edit') {
      editBuffer = selectedOriginalBody;
    }

    pushToast(
      persisted ? 'Restored the original notation.' : 'Restored the original view for this session.',
      persisted ? 'info' : 'warning'
    );
  }

  async function copyNotation(): Promise<void> {
    if (!selectedEntry || visibleNotationBody.length === 0) {
      return;
    }

    const copied = await copyText(visibleNotationBody);
    pushToast(copied ? 'Notation copied.' : 'Copy failed in this browser.', copied ? 'success' : 'error');
  }

  async function copyText(text: string): Promise<boolean> {
    if (!browser) {
      return false;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to the document-based copy path.
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.append(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch {
      return false;
    }
  }
</script>

<ReferenceChrome activeTab="svara-grantham">
  <section class="svara-grantham-page">
    <div class="page-intro">
      <div class="intro-copy">
        <p class="eyebrow">Notation Library</p>
        <h1>Svara Grantham</h1>
        <p class="intro-lede">
          Browse kritis by raga, read them on a paper-like working surface, and keep your own local notation edits without touching the source archive.
        </p>
      </div>

      <div class="intro-strip">
        <span>Local library</span>
        <span>Client-side edits</span>
        <span>Raw notation preserved</span>
      </div>
    </div>

    <section class="grantham-layout">
      <aside class="library-pane" aria-label="Svara Grantham library">
        <div class="pane-header">
          <div>
            <p class="pane-label">Library Browser</p>
            <h2>Raga Shelves</h2>
          </div>

          <button class="ghost new-notation-button" type="button" disabled>
            <span class="material-symbols-outlined">add_notes</span>
            <span>New Notation</span>
          </button>
        </div>

        <label class="search-field">
          <span class="search-label">Search Kriti</span>
          <span class="search-input-wrap">
            <span class="material-symbols-outlined">search</span>
            <input bind:value={searchText} type="text" placeholder="Search by kriti name" />
          </span>
        </label>

        {#if emptyLibrary}
          <div class="sidebar-empty">
            <p class="empty-title">No notation files found</p>
            <p class="empty-copy">Add valid `.svara` files under the local library directory to populate this archive.</p>
          </div>
        {:else if searchEmpty}
          <div class="sidebar-empty">
            <p class="empty-title">No matching kritis</p>
            <p class="empty-copy">Try a different kriti name or clear the search to browse the full archive.</p>
          </div>
        {:else}
          <div class="raga-groups">
            {#each groupedEntries as group}
              <section class="raga-group">
                <header class="raga-group-header">
                  <h3>{group.raga}</h3>
                  <span>{group.entries.length}</span>
                </header>

                <div class="raga-entry-list">
                  {#each group.entries as entry}
                    <button
                      aria-pressed={selectedId === entry.metadata.id}
                      class:active={selectedId === entry.metadata.id}
                      class="kriti-entry"
                      type="button"
                      onclick={() => selectEntry(entry.metadata.id)}
                    >
                      <span class="entry-copy">
                        <strong>{entry.metadata.name}</strong>
                        <small>{entry.metadata.tala}</small>
                      </span>

                      {#if overrides[entry.metadata.id] !== undefined}
                        <span class="entry-badge">Local</span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </section>
            {/each}
          </div>
        {/if}
      </aside>

      <section class="workspace-pane" aria-label="Notation workspace">
        <div class="workspace-shell">
          <div class="workspace-header">
            {#if selectedEntry}
              <div>
                <p class="pane-label">Notation Workspace</p>
                <div class="workspace-title-row">
                  <h2>{selectedEntry.metadata.name}</h2>
                  {#if hasSelectedOverride}
                    <span class="override-chip">Local Override</span>
                  {/if}
                  {#if mode === 'edit'}
                    <span class="editing-chip">Editing</span>
                  {/if}
                </div>
                <p class="workspace-subtitle">
                  {selectedEntry.metadata.raga} | {selectedEntry.metadata.tala}
                </p>
              </div>

              <div class="workspace-toolbar">
                <button class="secondary toolbar-button" type="button" disabled>
                  <span class="material-symbols-outlined">play_arrow</span>
                  <span>Play</span>
                </button>
                <button class="secondary toolbar-button" type="button" disabled>
                  <span class="material-symbols-outlined">pause</span>
                  <span>Pause</span>
                </button>

                {#if mode === 'edit'}
                  <button class="secondary toolbar-button" type="button" onclick={copyNotation}>
                    <span class="material-symbols-outlined">content_copy</span>
                    <span>Copy</span>
                  </button>
                  <button class="accent toolbar-button" type="button" onclick={saveEditing}>
                    <span class="material-symbols-outlined">save</span>
                    <span>Save</span>
                  </button>
                  <button class="ghost toolbar-button" type="button" onclick={cancelEditing}>
                    <span class="material-symbols-outlined">close</span>
                    <span>Cancel</span>
                  </button>
                  <button class="ghost toolbar-button" type="button" onclick={resetSelectedNotation}>
                    <span class="material-symbols-outlined">history</span>
                    <span>Reset</span>
                  </button>
                {:else}
                  <button class="secondary toolbar-button" type="button" onclick={copyNotation}>
                    <span class="material-symbols-outlined">content_copy</span>
                    <span>Copy</span>
                  </button>
                  <button class="accent toolbar-button" type="button" onclick={startEditing}>
                    <span class="material-symbols-outlined">edit</span>
                    <span>Edit</span>
                  </button>
                  <button class="ghost toolbar-button" type="button" onclick={resetSelectedNotation}>
                    <span class="material-symbols-outlined">history</span>
                    <span>Reset</span>
                  </button>
                  <button class="ghost toolbar-button" type="button" disabled>
                    <span class="material-symbols-outlined">add_notes</span>
                    <span>New Notation</span>
                  </button>
                {/if}
              </div>
            {:else}
              <div>
                <p class="pane-label">Notation Workspace</p>
                <h2>Archive Ready for Source Files</h2>
                <p class="workspace-subtitle">Add a valid `.svara` file to open the manuscript surface.</p>
              </div>
            {/if}
          </div>

          {#if selectedEntry}
            <div class="notation-panel">
              {#if mode === 'edit'}
                <label class="editor-panel">
                  <span class="editor-label">Notation Body</span>
                  <textarea
                    bind:value={editBuffer}
                    class="notation-editor"
                    spellcheck="false"
                    autocapitalize="off"
                    autocomplete="off"
                    use:disableAutocorrect
                  ></textarea>
                </label>

                <div class="editor-footnote">
                  <span>Only the notation body is editable in this MVP.</span>
                  <span class:dirty={hasUnsavedChanges}>
                    {hasUnsavedChanges ? 'Unsaved changes' : 'No unsaved changes'}
                  </span>
                </div>
              {:else}
                <div class="notation-paper-wrap">
                  <div class="paper-pin" aria-hidden="true"></div>
                  <article class="notation-paper">
                    <pre>{visibleNotationBody}</pre>
                  </article>
                </div>
              {/if}
            </div>
          {:else}
            <div class="workspace-empty">
              <p class="empty-title">No notation files found</p>
              <p class="empty-copy">This page becomes active as soon as the local library contains at least one valid `.svara` file.</p>
            </div>
          {/if}
        </div>
      </section>
    </section>
  </section>
</ReferenceChrome>

<style>
  .svara-grantham-page {
    display: grid;
    gap: 2rem;
    padding-bottom: 3rem;
  }

  .page-intro {
    display: grid;
    gap: 1.35rem;
    padding: 0.6rem 0 0.2rem;
  }

  .intro-copy {
    max-width: 44rem;
    display: grid;
    gap: 0.95rem;
  }

  .eyebrow,
  .pane-label,
  .search-label {
    color: var(--accent-secondary);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  h1 {
    font-size: clamp(2.8rem, 5vw, 4.6rem);
    line-height: 0.95;
  }

  .intro-lede {
    max-width: 38rem;
    color: var(--text-body);
    font-size: 1.05rem;
  }

  .intro-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .intro-strip span {
    border-radius: 999px;
    border: 1px solid rgba(47, 101, 120, 0.14);
    background: rgba(255, 255, 255, 0.7);
    padding: 0.45rem 0.9rem;
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 700;
  }

  .grantham-layout {
    display: grid;
    grid-template-columns: minmax(17.5rem, 22rem) minmax(0, 1fr);
    gap: 1.4rem;
    align-items: start;
  }

  .library-pane,
  .workspace-shell {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(47, 101, 120, 0.1);
    border-radius: 2rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(246, 243, 236, 0.96)),
      linear-gradient(135deg, rgba(47, 101, 120, 0.03), rgba(146, 74, 44, 0.03));
    box-shadow: 0 28px 60px rgba(31, 42, 48, 0.08);
  }

  .library-pane {
    display: grid;
    gap: 1.25rem;
    padding: 1.45rem;
    min-height: 52rem;
  }

  .workspace-pane {
    min-width: 0;
  }

  .workspace-shell {
    min-height: 52rem;
    background:
      linear-gradient(180deg, rgba(255, 254, 250, 0.88), rgba(240, 233, 220, 0.92)),
      radial-gradient(circle at top left, rgba(146, 74, 44, 0.05), transparent 24%);
  }

  .workspace-shell::before,
  .library-pane::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.22)),
      repeating-linear-gradient(
        90deg,
        rgba(28, 28, 24, 0.016) 0,
        rgba(28, 28, 24, 0.016) 1px,
        transparent 1px,
        transparent 14px
      );
    opacity: 0.45;
    pointer-events: none;
  }

  .pane-header,
  .workspace-header {
    position: relative;
    z-index: 1;
  }

  .pane-header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 1rem;
  }

  .pane-header h2,
  .workspace-header h2 {
    font-size: 1.55rem;
    line-height: 1.05;
  }

  .new-notation-button {
    min-height: 2.6rem;
    padding-inline: 0.95rem;
  }

  .search-field {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.65rem;
  }

  .search-input-wrap {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 0.65rem;
    border: 1px solid rgba(47, 101, 120, 0.12);
    border-radius: 1.2rem;
    background: rgba(255, 255, 255, 0.86);
    padding: 0.82rem 0.95rem;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  .search-input-wrap span {
    color: rgba(47, 101, 120, 0.62);
  }

  .search-input-wrap input {
    border: 0;
    background: transparent;
    padding: 0;
    box-shadow: none;
  }

  .search-input-wrap input:focus-visible {
    outline: none;
  }

  .raga-groups {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 1.15rem;
    align-content: start;
  }

  .raga-group {
    display: grid;
    gap: 0.75rem;
  }

  .raga-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px solid rgba(47, 101, 120, 0.08);
  }

  .raga-group-header h3 {
    font-size: 1rem;
    letter-spacing: -0.03em;
  }

  .raga-group-header span {
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 700;
  }

  .raga-entry-list {
    display: grid;
    gap: 0.5rem;
  }

  .kriti-entry {
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 0;
    border-radius: 1.2rem;
    background: rgba(255, 255, 255, 0.66);
    padding: 0.9rem 0.95rem;
    color: var(--text-strong);
    box-shadow: inset 0 0 0 1px rgba(47, 101, 120, 0.08);
  }

  .kriti-entry:hover:not(:disabled) {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.9);
  }

  .kriti-entry.active {
    background: linear-gradient(135deg, rgba(47, 101, 120, 0.96), rgba(23, 64, 76, 0.92));
    color: #fcf9f2;
    box-shadow:
      0 12px 30px rgba(31, 42, 48, 0.16),
      inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }

  .entry-copy {
    display: grid;
    justify-items: start;
    gap: 0.2rem;
    text-align: left;
  }

  .entry-copy strong {
    font-size: 0.96rem;
  }

  .entry-copy small {
    color: inherit;
    opacity: 0.7;
    font-size: 0.73rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .entry-badge {
    border-radius: 999px;
    background: rgba(146, 74, 44, 0.14);
    padding: 0.28rem 0.6rem;
    color: var(--accent-strong);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .kriti-entry.active .entry-badge {
    background: rgba(255, 255, 255, 0.14);
    color: #fcf9f2;
  }

  .sidebar-empty,
  .workspace-empty {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.45rem;
    align-content: start;
    border-radius: 1.5rem;
    background: rgba(255, 255, 255, 0.54);
    padding: 1.2rem;
    box-shadow: inset 0 0 0 1px rgba(47, 101, 120, 0.08);
  }

  .empty-title {
    color: var(--text-strong);
    font-size: 1rem;
    font-weight: 700;
  }

  .empty-copy {
    color: var(--text-muted);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .workspace-header {
    position: sticky;
    top: 0;
    display: grid;
    gap: 1.15rem;
    padding: 1.5rem 1.6rem 1.1rem;
    background: linear-gradient(180deg, rgba(252, 249, 242, 0.95), rgba(252, 249, 242, 0.86));
    border-bottom: 1px solid rgba(47, 101, 120, 0.08);
    backdrop-filter: blur(10px);
  }

  .workspace-title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
    margin-top: 0.2rem;
  }

  .workspace-subtitle {
    margin-top: 0.35rem;
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .override-chip,
  .editing-chip {
    border-radius: 999px;
    padding: 0.32rem 0.75rem;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .override-chip {
    background: rgba(47, 101, 120, 0.1);
    color: var(--accent-secondary);
  }

  .editing-chip {
    background: rgba(146, 74, 44, 0.12);
    color: var(--accent-strong);
  }

  .workspace-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .toolbar-button {
    min-height: 2.7rem;
    padding-inline: 0.95rem;
  }

  .notation-panel {
    position: relative;
    z-index: 1;
    padding: 1.4rem 1.6rem 1.8rem;
  }

  .notation-paper-wrap {
    position: relative;
    padding-top: 0.65rem;
  }

  .paper-pin {
    position: absolute;
    top: 0;
    left: 3rem;
    width: 1rem;
    height: 1rem;
    border-radius: 999px;
    background: linear-gradient(180deg, #ad7f55, #7b5c3d);
    box-shadow:
      0 6px 14px rgba(31, 42, 48, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.34);
    z-index: 2;
  }

  .notation-paper {
    position: relative;
    min-height: 38rem;
    max-height: 48rem;
    overflow: auto;
    border-radius: 1.6rem;
    background:
      linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(246, 239, 226, 0.98)),
      repeating-linear-gradient(
        180deg,
        transparent 0,
        transparent 2.15rem,
        rgba(47, 101, 120, 0.055) 2.15rem,
        rgba(47, 101, 120, 0.055) 2.2rem
      );
    padding: 2.3rem 2rem 2.4rem 2.5rem;
    box-shadow:
      0 30px 60px rgba(31, 42, 48, 0.1),
      inset 0 0 0 1px rgba(47, 101, 120, 0.08);
  }

  .notation-paper::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 1.4rem;
    width: 2px;
    background: linear-gradient(180deg, rgba(146, 74, 44, 0.2), rgba(146, 74, 44, 0.08));
  }

  .notation-paper pre,
  .notation-editor {
    margin: 0;
    color: #352a1d;
    font-family: 'Sora', sans-serif;
    font-size: 1rem;
    line-height: 2.2rem;
    letter-spacing: 0.01em;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .editor-panel {
    display: grid;
    gap: 0.7rem;
  }

  .editor-label {
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .notation-editor {
    min-height: 38rem;
    border-radius: 1.5rem;
    border: 1px solid rgba(47, 101, 120, 0.1);
    background:
      linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(246, 239, 226, 0.98)),
      repeating-linear-gradient(
        180deg,
        transparent 0,
        transparent 2.15rem,
        rgba(47, 101, 120, 0.055) 2.15rem,
        rgba(47, 101, 120, 0.055) 2.2rem
      );
    padding: 1.6rem 1.5rem 1.8rem;
    resize: vertical;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.46);
  }

  .editor-footnote {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.8rem;
    margin-top: 0.75rem;
    color: var(--text-muted);
    font-size: 0.82rem;
  }

  .editor-footnote .dirty {
    color: var(--accent-strong);
    font-weight: 700;
  }

  @media (max-width: 1023px) {
    .grantham-layout {
      grid-template-columns: 1fr;
    }

    .library-pane,
    .workspace-shell {
      min-height: 0;
    }

    .notation-paper,
    .notation-editor {
      min-height: 28rem;
      max-height: none;
    }
  }

  @media (max-width: 639px) {
    .page-intro {
      gap: 1rem;
    }

    h1 {
      font-size: 2.55rem;
    }

    .library-pane,
    .workspace-header,
    .notation-panel {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .library-pane {
      padding-top: 1.1rem;
      padding-bottom: 1.1rem;
    }

    .workspace-header {
      padding-top: 1.2rem;
    }

    .notation-paper {
      padding-left: 1.65rem;
      padding-right: 1.1rem;
    }

    .paper-pin {
      left: 2rem;
    }

    .workspace-toolbar {
      gap: 0.5rem;
    }

    .toolbar-button {
      flex: 1 1 calc(50% - 0.5rem);
      min-width: 0;
    }
  }
</style>
