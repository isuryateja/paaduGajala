<svelte:head>
  <title>Paadu Gajala - Raga Nirmana</title>
</svelte:head>

<script lang="ts">
  import ReferenceChrome from '../../components/layout/ReferenceChrome.svelte';
  import { SVARA_NAMES } from '../../domain/pitch/svara.constants';
  import {
    filterRagasBySvaraSequences,
    matchesRagaSequences,
    searchableRagaLibrary
  } from '../../domain/raga/raga-library';

  type BuilderId = 'arohanam' | 'avarohanam';

  interface SwaraTile {
    label: string;
    tone: 'rust' | 'rust-light' | 'blue-light' | 'blue-dark' | 'blue-soft';
  }

  interface DraggedSvaraPayload {
    svara: string;
  }

  interface WindowWithWebkitAudio extends Window {
    webkitAudioContext?: typeof AudioContext;
  }

  const swaraPalette: SwaraTile[] = [
    { label: 'S', tone: 'rust' },
    { label: 'R1', tone: 'rust-light' },
    { label: 'R2', tone: 'rust-light' },
    { label: 'R3', tone: 'rust-light' },
    { label: 'G1', tone: 'blue-soft' },
    { label: 'G2', tone: 'blue-soft' },
    { label: 'G3', tone: 'blue-soft' },
    { label: 'M1', tone: 'blue-light' },
    { label: 'M2', tone: 'blue-light' },
    { label: 'P', tone: 'rust' },
    { label: 'D1', tone: 'blue-dark' },
    { label: 'D2', tone: 'blue-dark' },
    { label: 'D3', tone: 'blue-dark' },
    { label: 'N1', tone: 'rust-light' },
    { label: 'N2', tone: 'rust-light' },
    { label: 'N3', tone: 'rust-light' },
    { label: "S'", tone: 'rust' }
  ];

  const allowedSwaraTokens = swaraPalette.map((tile) => tile.label);

  const swaraPitchOffsets: Record<string, number> = {
    S: 0,
    "S'": 12,
    R1: 1,
    R2: 2,
    R3: 3,
    G1: 2,
    G2: 3,
    G3: 4,
    M1: 5,
    M2: 6,
    P: 7,
    D1: 8,
    D2: 9,
    D3: 10,
    N1: 9,
    N2: 10,
    N3: 11
  };

  const totalRagas = searchableRagaLibrary.length;

  let activeBuilder: BuilderId = 'arohanam';
  let arohanamSelection: string[] = [];
  let avarohanamSelection: string[] = [];
  let selectedArohanamIndex = -1;
  let selectedAvarohanamIndex = -1;
  let hoveredBuilder: BuilderId | null = null;
  let activityNote = 'Start with a swara and watch the raga field tighten in real time.';
  let audioContext: AudioContext | null = null;

  $: sequenceFilters = {
    arohanam: arohanamSelection,
    avarohanam: avarohanamSelection
  };

  $: matchingRagas = filterRagasBySvaraSequences(sequenceFilters);

  $: exactRagas =
    arohanamSelection.length > 0 && avarohanamSelection.length > 0
      ? matchingRagas.filter((raga) => matchesRagaSequences(raga, sequenceFilters, 'exact'))
      : [];

  $: exactMatchLookup = Object.fromEntries(exactRagas.map((raga) => [raga.name, true]));

  $: totalSelections = arohanamSelection.length + avarohanamSelection.length;

  $: statusTitle =
    totalSelections === 0
      ? 'All ragas available'
      : matchingRagas.length === 0
        ? 'No matching ragas'
        : exactRagas.length === 1
          ? 'Raga identified'
          : exactRagas.length > 1
            ? 'Same scale, different identity'
            : matchingRagas.length <= 3
              ? 'Close cluster'
              : 'Keep building';

  $: statusCopy =
    totalSelections === 0
      ? 'Every scale is currently in play. Add swaras to either path to begin the elimination.'
      : matchingRagas.length === 0
        ? 'This combination does not appear in the current library. Remove or reorder a few swaras and try again.'
        : exactRagas.length === 1
          ? `${exactRagas[0].name} matches both paths exactly.`
          : exactRagas.length > 1
            ? 'Multiple ragas still share this completed scale. The identity needs more musical context than scale alone.'
            : `${matchingRagas.length} ragas still match this construction.`;

  $: resultsEyebrow =
    totalSelections === 0 ? 'Showing the full registered library' : 'Filtered continuously from your current build';

  $: arohanamSlots = Array.from({ length: Math.max(8, arohanamSelection.length + 2) }, (_, index) => index);
  $: avarohanamSlots = Array.from({ length: Math.max(8, avarohanamSelection.length + 2) }, (_, index) => index);

  function setActiveBuilder(builder: BuilderId): void {
    activeBuilder = builder;
    hoveredBuilder = null;
  }

  function updateBuilderSelection(builder: BuilderId, nextSelection: string[]): void {
    if (builder === 'arohanam') {
      arohanamSelection = nextSelection;
      if (selectedArohanamIndex >= nextSelection.length) {
        selectedArohanamIndex = nextSelection.length - 1;
      }
      return;
    }

    avarohanamSelection = nextSelection;
    if (selectedAvarohanamIndex >= nextSelection.length) {
      selectedAvarohanamIndex = nextSelection.length - 1;
    }
  }

  function insertSvara(builder: BuilderId, svara: string, index?: number): void {
    const current = builder === 'arohanam' ? arohanamSelection : avarohanamSelection;
    const insertionIndex = typeof index === 'number' ? Math.max(0, Math.min(index, current.length)) : current.length;
    const nextSelection = [...current.slice(0, insertionIndex), svara, ...current.slice(insertionIndex)];

    updateBuilderSelection(builder, nextSelection);
    activeBuilder = builder;

    if (builder === 'arohanam') {
      selectedArohanamIndex = insertionIndex;
    } else {
      selectedAvarohanamIndex = insertionIndex;
    }

    activityNote = `${svara} added to ${builder === 'arohanam' ? 'Arohanam' : 'Avarohanam'}.`;
    playSvaraTone(svara);
  }

  function handleSwaraTap(svara: string): void {
    insertSvara(activeBuilder, svara);
  }

  function clearBuilder(builder: BuilderId): void {
    updateBuilderSelection(builder, []);
    activeBuilder = builder;

    if (builder === 'arohanam') {
      selectedArohanamIndex = -1;
    } else {
      selectedAvarohanamIndex = -1;
    }

    activityNote = `${builder === 'arohanam' ? 'Arohanam' : 'Avarohanam'} cleared.`;
  }

  function selectSequenceSlot(builder: BuilderId, index: number): void {
    activeBuilder = builder;

    if (builder === 'arohanam') {
      selectedArohanamIndex = index < arohanamSelection.length ? index : -1;
      return;
    }

    selectedAvarohanamIndex = index < avarohanamSelection.length ? index : -1;
  }

  function moveSelected(builder: BuilderId, direction: -1 | 1): void {
    const current = builder === 'arohanam' ? arohanamSelection : avarohanamSelection;
    const selectedIndex = builder === 'arohanam' ? selectedArohanamIndex : selectedAvarohanamIndex;

    if (selectedIndex < 0) {
      return;
    }

    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= current.length) {
      return;
    }

    const nextSelection = [...current];
    const [selectedSvara] = nextSelection.splice(selectedIndex, 1);
    nextSelection.splice(nextIndex, 0, selectedSvara);
    updateBuilderSelection(builder, nextSelection);
    activeBuilder = builder;

    if (builder === 'arohanam') {
      selectedArohanamIndex = nextIndex;
    } else {
      selectedAvarohanamIndex = nextIndex;
    }

    activityNote = `${selectedSvara} moved ${direction < 0 ? 'left' : 'right'} in ${builder === 'arohanam' ? 'Arohanam' : 'Avarohanam'}.`;
  }

  function removeSelected(builder: BuilderId): void {
    const current = builder === 'arohanam' ? arohanamSelection : avarohanamSelection;
    const selectedIndex = builder === 'arohanam' ? selectedArohanamIndex : selectedAvarohanamIndex;

    if (selectedIndex < 0) {
      return;
    }

    const removedSvara = current[selectedIndex];
    const nextSelection = current.filter((_, index) => index !== selectedIndex);
    updateBuilderSelection(builder, nextSelection);
    activeBuilder = builder;

    if (builder === 'arohanam') {
      selectedArohanamIndex = Math.min(selectedIndex, nextSelection.length - 1);
    } else {
      selectedAvarohanamIndex = Math.min(selectedIndex, nextSelection.length - 1);
    }

    activityNote = `${removedSvara} removed from ${builder === 'arohanam' ? 'Arohanam' : 'Avarohanam'}.`;
  }

  function handleDragStart(event: DragEvent, svara: string): void {
    const payload: DraggedSvaraPayload = { svara };
    event.dataTransfer?.setData('application/json', JSON.stringify(payload));
    event.dataTransfer?.setData('text/plain', svara);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  function clearHoveredBuilder(): void {
    hoveredBuilder = null;
  }

  function handleBuilderDragOver(event: DragEvent, builder: BuilderId): void {
    event.preventDefault();
    hoveredBuilder = builder;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  function handleBuilderDrop(event: DragEvent, builder: BuilderId, index?: number): void {
    event.preventDefault();

    const rawPayload = event.dataTransfer?.getData('application/json');
    hoveredBuilder = null;

    if (!rawPayload) {
      return;
    }

    const payload = JSON.parse(rawPayload) as DraggedSvaraPayload;
    if (!allowedSwaraTokens.includes(payload.svara) && !SVARA_NAMES.includes(payload.svara as (typeof SVARA_NAMES)[number])) {
      return;
    }

    insertSvara(builder, payload.svara, index);
  }

  function playSvaraTone(svara: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    const browserWindow = window as WindowWithWebkitAudio;
    const AudioContextCtor = window.AudioContext ?? browserWindow.webkitAudioContext;

    if (!AudioContextCtor) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioContextCtor();
    }

    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const semitoneOffset = swaraPitchOffsets[svara] ?? 0;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(220 * 2 ** (semitoneOffset / 12), now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.028, now + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
  }
</script>

<ReferenceChrome activeTab="theory">
  <div class="raga-nirmana-page">
    <section class="hero">
      <div class="hero-orb hero-orb-rust" aria-hidden="true"></div>
      <div class="hero-orb hero-orb-blue" aria-hidden="true"></div>
      <div class="hero-orb hero-orb-cloud" aria-hidden="true"></div>

      <p class="eyebrow">Musical Construction Engine</p>
      <h1>Raga Nirmāṇa</h1>
      <p class="hero-copy">
        Build from swaras. Watch the field narrow. Discover the raga by shaping both melodic paths yourself.
      </p>
    </section>

    <section class="workspace cardless-shell">
      <div class="workspace-panel swara-bank">
        <div class="panel-label">Swara Bank</div>
        <div class="bank-header">
          <div>
            <h2>Floating circles, immediate filtering</h2>
            <p>Click to append to the active line, or drag a swara directly into a slot.</p>
          </div>

          <div class="active-builder-chip">
            <span class="material-symbols-outlined">gesture_select</span>
            <span>Appending to {activeBuilder === 'arohanam' ? 'Arohanam' : 'Avarohanam'}</span>
          </div>
        </div>

        <div class="swara-bank-grid">
          {#each swaraPalette as tile, index}
            <button
              type="button"
              class={`swara-tile ${tile.tone}`}
              style={`animation-delay: ${index * 120}ms;`}
              draggable="true"
              aria-label={`Add ${tile.label} to ${activeBuilder}`}
              on:click={() => handleSwaraTap(tile.label)}
              on:dragstart={(event) => handleDragStart(event, tile.label)}
              on:dragend={clearHoveredBuilder}
            >
              {tile.label}
            </button>
          {/each}
        </div>
      </div>

      <div class="builder-grid">
        <section
          class:hovered-builder={hoveredBuilder === 'arohanam'}
          class:active-builder={activeBuilder === 'arohanam'}
          class="workspace-panel builder-panel"
          aria-label="Arohanam builder"
          on:dragover={(event) => handleBuilderDragOver(event, 'arohanam')}
          on:dragleave={clearHoveredBuilder}
          on:drop={(event) => handleBuilderDrop(event, 'arohanam')}
        >
          <div class="panel-label panel-label-secondary">Arohanam (Ascending)</div>

          <div class="builder-topline">
            <div>
              <h2>Construct the climb</h2>
              <p>Start with S and build upward in order. Partial lines still narrow the library.</p>
            </div>

            <div class="builder-actions">
              <button
                class:secondary={activeBuilder !== 'arohanam'}
                class="mini-control builder-activate"
                type="button"
                on:click={() => setActiveBuilder('arohanam')}
              >
                {activeBuilder === 'arohanam' ? 'Active line' : 'Build here'}
              </button>
              <button class="builder-clear ghost mini-control" type="button" on:click={() => clearBuilder('arohanam')}>
                <span class="material-symbols-outlined">restart_alt</span>
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div class="builder-slots" role="list">
            {#each arohanamSlots as slotIndex}
              {@const currentSvara = arohanamSelection[slotIndex]}
              <button
                type="button"
                class:filled={Boolean(currentSvara)}
                class:selected-slot={selectedArohanamIndex === slotIndex}
                class="slot"
                aria-label={currentSvara ? `Selected svara ${currentSvara}` : 'Empty arohanam slot'}
                on:click={() => selectSequenceSlot('arohanam', slotIndex)}
                on:dragover={(event) => handleBuilderDragOver(event, 'arohanam')}
                on:dragleave={clearHoveredBuilder}
                on:drop={(event) => handleBuilderDrop(event, 'arohanam', slotIndex)}
              >
                {#if currentSvara}
                  <span>{currentSvara}</span>
                {:else if slotIndex === arohanamSelection.length}
                  <span class="material-symbols-outlined">add</span>
                {/if}
              </button>
            {/each}
          </div>

          <div class="builder-caption">
            <span>Sequence</span>
            <p>{arohanamSelection.length > 0 ? arohanamSelection.join(' · ') : 'Select swaras to begin the ascent.'}</p>
          </div>

          <div class="builder-controls">
            <button
              class="secondary mini-control"
              type="button"
              disabled={selectedArohanamIndex <= 0}
              on:click={() => moveSelected('arohanam', -1)}
            >
              Move left
            </button>
            <button
              class="secondary mini-control"
              type="button"
              disabled={selectedArohanamIndex < 0 || selectedArohanamIndex >= arohanamSelection.length - 1}
              on:click={() => moveSelected('arohanam', 1)}
            >
              Move right
            </button>
            <button
              class="secondary mini-control"
              type="button"
              disabled={selectedArohanamIndex < 0}
              on:click={() => removeSelected('arohanam')}
            >
              Remove
            </button>
          </div>
        </section>

        <section
          class:hovered-builder={hoveredBuilder === 'avarohanam'}
          class:active-builder={activeBuilder === 'avarohanam'}
          class="workspace-panel builder-panel"
          aria-label="Avarohanam builder"
          on:dragover={(event) => handleBuilderDragOver(event, 'avarohanam')}
          on:dragleave={clearHoveredBuilder}
          on:drop={(event) => handleBuilderDrop(event, 'avarohanam')}
        >
          <div class="panel-label panel-label-secondary">Avarohanam (Descending)</div>

          <div class="builder-topline">
            <div>
              <h2>Shape the return</h2>
              <p>Descending contours matter just as much. Use this line to separate similar scales.</p>
            </div>

            <div class="builder-actions">
              <button
                class:secondary={activeBuilder !== 'avarohanam'}
                class="mini-control builder-activate"
                type="button"
                on:click={() => setActiveBuilder('avarohanam')}
              >
                {activeBuilder === 'avarohanam' ? 'Active line' : 'Build here'}
              </button>
              <button class="builder-clear ghost mini-control" type="button" on:click={() => clearBuilder('avarohanam')}>
                <span class="material-symbols-outlined">restart_alt</span>
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div class="builder-slots" role="list">
            {#each avarohanamSlots as slotIndex}
              {@const currentSvara = avarohanamSelection[slotIndex]}
              <button
                type="button"
                class:filled={Boolean(currentSvara)}
                class:selected-slot={selectedAvarohanamIndex === slotIndex}
                class="slot"
                aria-label={currentSvara ? `Selected svara ${currentSvara}` : 'Empty avarohanam slot'}
                on:click={() => selectSequenceSlot('avarohanam', slotIndex)}
                on:dragover={(event) => handleBuilderDragOver(event, 'avarohanam')}
                on:dragleave={clearHoveredBuilder}
                on:drop={(event) => handleBuilderDrop(event, 'avarohanam', slotIndex)}
              >
                {#if currentSvara}
                  <span>{currentSvara}</span>
                {:else if slotIndex === avarohanamSelection.length}
                  <span class="material-symbols-outlined">add</span>
                {/if}
              </button>
            {/each}
          </div>

          <div class="builder-caption">
            <span>Sequence</span>
            <p>{avarohanamSelection.length > 0 ? avarohanamSelection.join(' · ') : 'Add the descent to resolve the identity.'}</p>
          </div>

          <div class="builder-controls">
            <button
              class="secondary mini-control"
              type="button"
              disabled={selectedAvarohanamIndex <= 0}
              on:click={() => moveSelected('avarohanam', -1)}
            >
              Move left
            </button>
            <button
              class="secondary mini-control"
              type="button"
              disabled={selectedAvarohanamIndex < 0 || selectedAvarohanamIndex >= avarohanamSelection.length - 1}
              on:click={() => moveSelected('avarohanam', 1)}
            >
              Move right
            </button>
            <button
              class="secondary mini-control"
              type="button"
              disabled={selectedAvarohanamIndex < 0}
              on:click={() => removeSelected('avarohanam')}
            >
              Remove
            </button>
          </div>
        </section>
      </div>

      <section class="feedback-bar" aria-live="polite">
        <div class="feedback-copy">
          <span class="material-symbols-outlined">music_note</span>
          <div>
            <p class="feedback-title">{statusTitle}</p>
            <p class="feedback-body">{statusCopy}</p>
          </div>
        </div>

        <div class="feedback-metrics">
          <div class="feedback-count">{matchingRagas.length} / {totalRagas}</div>
          <div class="feedback-note">{activityNote}</div>
        </div>
      </section>
    </section>

    <section class="results-section">
      <div class="results-header">
        <div>
          <p class="results-label">Raga Library</p>
          <h2>Real-time elimination, not search</h2>
        </div>

        <p class="results-copy">{resultsEyebrow}</p>
      </div>

      {#if matchingRagas.length > 0}
        <div class="results-grid">
          {#each matchingRagas as raga}
            <article class:exact-card={Boolean(exactMatchLookup[raga.name])} class="result-card">
              <div class="result-topline">
                <div>
                  <h3>{raga.name}</h3>
                  <p>{raga.type}{raga.parent_raga ? ` · Janya of ${raga.parent_raga}` : ''}</p>
                </div>

                {#if exactMatchLookup[raga.name]}
                  <span class="result-badge">Exact Scale</span>
                {:else if matchingRagas.length <= 3}
                  <span class="result-badge subtle">Close Match</span>
                {/if}
              </div>

              <dl class="result-notation">
                <div>
                  <dt>Aro</dt>
                  <dd>{raga.arohanam}</dd>
                </div>
                <div>
                  <dt>Ava</dt>
                  <dd>{raga.avarohanam}</dd>
                </div>
              </dl>

              <div class="result-meta">
                {#if raga.mela_number}
                  <span>Mela {raga.mela_number}</span>
                {/if}
                <span>{exactMatchLookup[raga.name] ? 'Raga Identified' : 'Still in contention'}</span>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <span class="material-symbols-outlined">library_music</span>
          <h3>No matching ragas. Try adjusting swaras.</h3>
          <p>Keep the order strict. A small removal or reorder often brings the library back into view.</p>
        </div>
      {/if}
    </section>
  </div>
</ReferenceChrome>

<style>
  .raga-nirmana-page {
    display: grid;
    gap: 2rem;
    padding-bottom: 2rem;
  }

  .hero {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    padding: 3.2rem 1.5rem 1.6rem;
    text-align: center;
    background:
      radial-gradient(circle at 15% 20%, rgba(166, 90, 58, 0.1), transparent 18rem),
      radial-gradient(circle at 80% 30%, rgba(111, 163, 184, 0.13), transparent 22rem),
      linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(246, 243, 236, 0.94));
    box-shadow: inset 0 0 0 1px rgba(220, 218, 211, 0.72);
  }

  .hero h1 {
    position: relative;
    z-index: 1;
    font-size: clamp(2.5rem, 5vw, 4.2rem);
    font-weight: 900;
    letter-spacing: -0.08em;
  }

  .eyebrow {
    position: relative;
    z-index: 1;
    color: var(--accent-secondary);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .hero-copy {
    position: relative;
    z-index: 1;
    width: min(44rem, 100%);
    margin: 0.7rem auto 0;
    color: var(--text-muted);
    font-size: 0.98rem;
  }

  .hero-orb {
    position: absolute;
    border-radius: 999px;
    opacity: 0.24;
    filter: blur(0.5px);
  }

  .hero-orb-rust {
    top: 2rem;
    left: 1rem;
    width: 3rem;
    height: 3rem;
    background: rgba(166, 90, 58, 0.24);
  }

  .hero-orb-blue {
    top: 4rem;
    right: 14%;
    width: 4rem;
    height: 4rem;
    background: rgba(111, 163, 184, 0.26);
  }

  .hero-orb-cloud {
    right: 1rem;
    bottom: 1.5rem;
    width: 2.7rem;
    height: 2.7rem;
    background: rgba(151, 189, 204, 0.36);
  }

  .workspace,
  .results-section {
    display: grid;
    gap: 1.5rem;
  }

  .cardless-shell {
    padding: 0;
  }

  .workspace-panel,
  .feedback-bar,
  .result-card,
  .empty-state {
    position: relative;
    overflow: hidden;
    border-radius: 1.75rem;
    background: rgba(255, 255, 255, 0.68);
    box-shadow: 0 18px 38px rgba(31, 42, 48, 0.08);
    backdrop-filter: blur(12px);
  }

  .workspace-panel::after,
  .feedback-bar::after,
  .result-card::after,
  .empty-state::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(220, 218, 211, 0.82);
    border-radius: inherit;
    pointer-events: none;
  }

  .workspace-panel > *,
  .feedback-bar > *,
  .result-card > *,
  .empty-state > * {
    position: relative;
    z-index: 1;
  }

  .swara-bank,
  .builder-panel {
    padding: 1.5rem;
  }

  .panel-label {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.84);
    color: var(--accent-secondary);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .panel-label-secondary {
    color: var(--accent);
  }

  .bank-header,
  .builder-topline,
  .results-header,
  .feedback-bar,
  .result-topline,
  .result-meta {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }

  .bank-header,
  .builder-topline {
    align-items: flex-start;
    margin-top: 1rem;
  }

  .bank-header h2,
  .builder-topline h2,
  .results-header h2 {
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: -0.05em;
  }

  .bank-header p,
  .builder-topline p,
  .results-copy,
  .feedback-body,
  .builder-caption p,
  .result-topline p,
  .empty-state p {
    color: var(--text-muted);
  }

  .active-builder-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.75rem 1rem;
    border-radius: 999px;
    background: rgba(111, 163, 184, 0.12);
    color: var(--accent-secondary);
    font-size: 0.82rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .swara-bank-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.85rem;
    margin-top: 1.5rem;
  }

  .swara-tile {
    min-width: 3.3rem;
    min-height: 3.3rem;
    width: 3.3rem;
    height: 3.3rem;
    padding: 0;
    border-radius: 999px;
    font-family: 'Sora', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 10px 24px rgba(31, 42, 48, 0.14);
    animation: drift 5.6s ease-in-out infinite;
  }

  .swara-tile.rust {
    background: linear-gradient(180deg, #a65a3a, #8f4728);
  }

  .swara-tile.rust-light {
    background: linear-gradient(180deg, #c0866b, #a86b51);
  }

  .swara-tile.blue-light {
    background: linear-gradient(180deg, #6fa3b8, #5a8da3);
  }

  .swara-tile.blue-dark {
    background: linear-gradient(180deg, #3e6f8e, #2f5c78);
  }

  .swara-tile.blue-soft {
    background: linear-gradient(180deg, #97bdcc, #80aab9);
  }

  .builder-grid {
    display: grid;
    gap: 1.5rem;
  }

  .builder-panel {
    transition:
      transform 180ms ease,
      box-shadow 180ms ease,
      background-color 180ms ease;
  }

  .builder-panel.active-builder {
    transform: translateY(-1px);
    box-shadow: 0 22px 48px rgba(31, 42, 48, 0.12);
  }

  .builder-panel.hovered-builder {
    background: rgba(246, 243, 236, 0.92);
  }

  .builder-clear.mini-control {
    padding-inline: 0.95rem;
  }

  .builder-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    justify-content: flex-end;
  }

  .builder-activate {
    background: var(--surface-contrast);
  }

  .builder-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-top: 1.35rem;
  }

  .slot {
    min-width: 3.35rem;
    min-height: 3.35rem;
    width: 3.35rem;
    height: 3.35rem;
    padding: 0;
    border-radius: 999px;
    background: rgba(220, 218, 211, 0.28);
    color: rgba(113, 120, 124, 0.6);
    box-shadow: inset 0 0 0 2px rgba(192, 200, 204, 0.34);
    font-size: 0.88rem;
    font-weight: 800;
  }

  .slot.filled {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 243, 236, 0.95));
    color: var(--text-strong);
    box-shadow:
      inset 0 0 0 1px rgba(192, 200, 204, 0.45),
      0 10px 18px rgba(31, 42, 48, 0.08);
  }

  .slot.selected-slot {
    background: rgba(111, 163, 184, 0.16);
    color: var(--accent-secondary);
    box-shadow:
      inset 0 0 0 2px rgba(47, 101, 120, 0.28),
      0 12px 20px rgba(31, 42, 48, 0.08);
  }

  .builder-caption {
    display: grid;
    gap: 0.3rem;
    margin-top: 1.2rem;
  }

  .builder-caption span,
  .results-label {
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .builder-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-top: 1rem;
  }

  .mini-control {
    min-height: 2.35rem;
    padding: 0.6rem 0.9rem;
    font-size: 0.84rem;
    font-weight: 700;
  }

  .feedback-bar {
    align-items: center;
    padding: 1.15rem 1.25rem;
  }

  .feedback-copy {
    display: flex;
    gap: 0.9rem;
    align-items: center;
  }

  .feedback-copy .material-symbols-outlined {
    color: var(--accent-secondary);
  }

  .feedback-title {
    color: var(--text-strong);
    font-size: 1rem;
    font-weight: 800;
  }

  .feedback-metrics {
    display: grid;
    justify-items: end;
    gap: 0.2rem;
  }

  .feedback-count {
    color: var(--accent);
    font-size: 1.3rem;
    font-weight: 900;
    letter-spacing: -0.05em;
  }

  .feedback-note {
    color: var(--text-muted);
    font-size: 0.82rem;
    text-align: right;
  }

  .results-section {
    gap: 1.25rem;
  }

  .results-header {
    align-items: end;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(220, 218, 211, 0.82);
  }

  .results-grid {
    display: grid;
    gap: 1rem;
  }

  .result-card {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.84);
  }

  .result-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 1.2rem;
    bottom: 1.2rem;
    width: 0.3rem;
    border-radius: 999px;
    background: rgba(166, 90, 58, 0.34);
  }

  .result-card.exact-card::before {
    background: #a65a3a;
  }

  .result-card.exact-card {
    background:
      linear-gradient(180deg, rgba(255, 250, 247, 0.96), rgba(246, 243, 236, 0.98));
    box-shadow: 0 24px 48px rgba(166, 90, 58, 0.12);
  }

  .result-topline {
    align-items: flex-start;
  }

  .result-topline h3 {
    font-size: 1.45rem;
    font-weight: 800;
    line-height: 1.05;
  }

  .result-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    background: rgba(166, 90, 58, 0.12);
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .result-badge.subtle {
    background: rgba(111, 163, 184, 0.12);
    color: var(--accent-secondary);
  }

  .result-notation {
    display: grid;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  .result-notation div {
    display: grid;
    grid-template-columns: 2.8rem 1fr;
    gap: 0.8rem;
    align-items: start;
  }

  .result-notation dt {
    color: var(--accent-secondary);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .result-notation dd {
    margin: 0;
    color: var(--text-strong);
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .result-meta {
    align-items: center;
    margin-top: 1rem;
    color: var(--text-muted);
    font-size: 0.76rem;
    font-weight: 700;
  }

  .empty-state {
    display: grid;
    justify-items: center;
    gap: 0.6rem;
    padding: 2.5rem 1.5rem;
    text-align: center;
  }

  .empty-state .material-symbols-outlined {
    color: var(--accent-secondary);
    font-size: 2rem;
  }

  .empty-state h3 {
    font-size: 1.35rem;
    font-weight: 800;
  }

  @keyframes drift {
    0%,
    100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-4px);
    }
  }

  @media (min-width: 768px) {
    .hero {
      padding: 3.6rem 2.5rem 1.9rem;
    }

    .swara-bank-grid {
      justify-content: flex-start;
    }

    .results-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1040px) {
    .builder-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .results-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .hero {
      padding-top: 2.8rem;
    }

    .bank-header,
    .builder-topline,
    .results-header,
    .feedback-bar,
    .result-topline,
    .result-meta {
      flex-direction: column;
      align-items: flex-start;
    }

    .feedback-metrics {
      justify-items: start;
    }

    .feedback-note {
      text-align: left;
    }
  }
</style>
