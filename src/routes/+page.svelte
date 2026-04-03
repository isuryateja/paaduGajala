<svelte:head>
  <title>Paadu Gajala - Notation Player</title>
</svelte:head>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { bootstrapApp } from '../app/services/app-bootstrap';
  import { createPlaybackPianoVisualizer, mainPlayerHandlers } from '../app/services/main-player-page';
  import PlaybackNotationHighlighter from '../components/notation/PlaybackNotationHighlighter.svelte';
  import { getVisualizerMedia } from '../app/services/visualizer-state';
  import { resolveManualPianoPointerKey } from '../app/services/manual-piano-hit-test';
  import { notationStore } from '../app/stores/notation.store';
  import { playbackStore } from '../app/stores/playback.store';
  import { settingsStore } from '../app/stores/settings.store';
  import { uiStore } from '../app/stores/ui.store';
  import { startPianoNote, stopPianoNote, releaseAllPianoNotes } from '../app/actions/piano.actions';
  import { MAX_TEMPO } from '../domain/shared/constants';
  import type { ActivePianoKeys } from '../domain/piano/piano.types';
  import { filterRagas, formatRagaNotation } from '../domain/raga/raga-library';
  import type { RagaLibraryEntry } from '../domain/raga/raga-library';

  type ManualOctave = '1' | '2' | '3';

  interface WhiteKey {
    note: string;
    octave: ManualOctave;
    label: string;
    secondaryLabel?: string;
    divider?: boolean;
  }

  interface BlackKey {
    note: string;
    octave: ManualOctave;
    left: number;
    label: string;
    secondaryLabel?: string;
  }

  const navItems = [
    { href: '/', label: 'Swara to Sruti', active: true },
    { href: '/sruti-to-swara', label: 'Sruti to Swara', active: false },
    { href: '/theory', label: 'Theory', active: false }
  ];

  const instrumentOptions = [
    { value: 'veena', label: 'Saraswati Veena' },
    { value: 'flute', label: 'Bamboo Flute' },
    { value: 'violin', label: 'Solo Violin' },
    { value: 'harmonium', label: 'Harmonium' }
  ];

  const whiteKeys: WhiteKey[] = [
    { note: 'n1', octave: '1', label: 'N1.', secondaryLabel: 'D2.' },
    { note: 'n3', octave: '1', label: 'N3.' },
    { note: 's', octave: '2', label: 'S', divider: true },
    { note: 'r2', octave: '2', label: 'R2', secondaryLabel: 'G1' },
    { note: 'g3', octave: '2', label: 'G3' },
    { note: 'm1', octave: '2', label: 'M1' },
    { note: 'p', octave: '2', label: 'P' },
    { note: 'd2', octave: '2', label: 'D2', secondaryLabel: 'N1' },
    { note: 'n3', octave: '2', label: 'N3' },
    { note: 's', octave: '3', label: "S'", divider: true },
    { note: 'r2', octave: '3', label: "R2'", secondaryLabel: "G1'" }
  ];

  const blackKeys: BlackKey[] = [
    { note: 'n2', octave: '1', left: 9.09, label: 'N2.', secondaryLabel: 'D3.' },
    { note: 'r1', octave: '2', left: 27.27, label: 'R1' },
    { note: 'g2', octave: '2', left: 36.36, label: 'G2', secondaryLabel: 'R3' },
    { note: 'm2', octave: '2', left: 54.55, label: 'M2' },
    { note: 'd1', octave: '2', left: 63.64, label: 'D1' },
    { note: 'n2', octave: '2', left: 72.73, label: 'N2', secondaryLabel: 'D3' },
    { note: 'r1', octave: '3', left: 90.91, label: "R1'" }
  ];
  const blackKeyWidthPercent = 5.25;
  const blackKeyHeightPercent = 54;

  let teardown = () => {};
  let releasePlaybackVisualizer = () => {};
  let droneEnabled = true;
  let reverbLevel = 42;
  let notationPanelElement: HTMLElement | null = null;
  let notationTextarea: HTMLTextAreaElement | null = null;
  let pianoKeybed: HTMLDivElement | null = null;
  let playbackActiveKeys: ActivePianoKeys = {};
  let ragaSearchText = '';
  let ragaSearchOpen = false;
  let activeRagaIndex = 0;
  const activeManualKeyCounts = new Map<string, number>();
  const activeManualPointers = new Map<number, string>();
  const maxVisibleRagas = 6;

  $: matchingRagas = filterRagas(ragaSearchText).slice(0, maxVisibleRagas);
  $: if (matchingRagas.length === 0) {
    activeRagaIndex = -1;
  } else if (activeRagaIndex < 0 || activeRagaIndex >= matchingRagas.length) {
    activeRagaIndex = 0;
  }

  onMount(() => {
    teardown = bootstrapApp();
    releasePlaybackVisualizer = createPlaybackPianoVisualizer((activeKeys) => {
      playbackActiveKeys = activeKeys;
    });

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (notationPanelElement && target && !notationPanelElement.contains(target)) {
        ragaSearchOpen = false;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  });

  onDestroy(() => {
    activeManualKeyCounts.clear();
    activeManualPointers.clear();
    releaseAllPianoNotes();
    releasePlaybackVisualizer();
    teardown();
  });

  $: transportIcon = $playbackStore.status === 'playing' ? 'pause' : 'play_arrow';
  $: transportLabel =
    $playbackStore.status === 'playing' ? 'Pause playback' : $playbackStore.status === 'paused' ? 'Resume playback' : 'Play';
  $: visualizerMedia = getVisualizerMedia($playbackStore.status, $uiStore.status);

  function getManualKeyId(note: string, octave: ManualOctave): string {
    return `${note}:${octave}`;
  }

  function getManualKeyElement(note: string, octave: ManualOctave): HTMLButtonElement | null {
    if (!pianoKeybed) return null;
    return pianoKeybed.querySelector<HTMLButtonElement>(`[data-note="${note}"][data-octave="${octave}"]`);
  }

  function applyManualKeyPressStyles(el: HTMLElement): void {
    const isBlack = el.classList.contains('black-key');
    if (isBlack) {
      el.style.background = '#566066';
      el.style.boxShadow = '1px 2px 3px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 3px rgba(255,255,255,0.08)';
      el.style.transform = 'translateX(-50%) translateY(1px)';
    } else {
      el.style.background = '#ece5d9';
      el.style.boxShadow = 'inset 0 4px 12px rgba(123,108,84,0.14), inset 0 -1px 0 rgba(0,0,0,0.04)';
      el.style.transform = 'translateY(2px)';
    }
  }

  function clearManualKeyPressStyles(el: HTMLElement): void {
    el.style.background = '';
    el.style.boxShadow = '';
    el.style.transform = '';
  }

  function pressManualKey(note: string, octave: ManualOctave, el: HTMLElement): void {
    const key = getManualKeyId(note, octave);
    const existingCount = activeManualKeyCounts.get(key) ?? 0;
    activeManualKeyCounts.set(key, existingCount + 1);
    if (existingCount > 0) return;

    applyManualKeyPressStyles(el);
    void startPianoNote(note, octave);
  }

  function releaseManualKey(note: string, octave: ManualOctave): void {
    const key = getManualKeyId(note, octave);
    const existingCount = activeManualKeyCounts.get(key) ?? 0;
    if (existingCount === 0) return;
    if (existingCount > 1) {
      activeManualKeyCounts.set(key, existingCount - 1);
      return;
    }

    activeManualKeyCounts.delete(key);
    const el = getManualKeyElement(note, octave);
    if (el) {
      clearManualKeyPressStyles(el);
    }
    stopPianoNote(note, octave);
  }

  function resolveManualPointerKey(event: PointerEvent): WhiteKey | BlackKey | null {
    if (!pianoKeybed) return null;

    return resolveManualPianoPointerKey({
      clientX: event.clientX,
      clientY: event.clientY,
      keybedRect: pianoKeybed.getBoundingClientRect(),
      whiteKeys,
      blackKeys,
      blackKeyWidthPercent,
      blackKeyHeightPercent
    }) as WhiteKey | BlackKey | null;
  }

  function handleKeybedPointerDown(event: PointerEvent): void {
    if (!pianoKeybed) return;
    const key = resolveManualPointerKey(event);
    if (!key) return;

    const el = getManualKeyElement(key.note, key.octave);
    if (!el) return;

    activeManualPointers.set(event.pointerId, getManualKeyId(key.note, key.octave));
    pianoKeybed.setPointerCapture(event.pointerId);
    pressManualKey(key.note, key.octave, el);
    event.preventDefault();
  }

  function releaseManualPointer(pointerId: number): void {
    const key = activeManualPointers.get(pointerId);
    if (!key) return;
    activeManualPointers.delete(pointerId);
    const [note, octave] = key.split(':') as [string, ManualOctave];
    releaseManualKey(note, octave);
  }

  function handleKeybedPointerUp(event: PointerEvent): void {
    releaseManualPointer(event.pointerId);
  }

  function handleKeybedPointerCancel(event: PointerEvent): void {
    releaseManualPointer(event.pointerId);
  }

  function handleKeybedLostPointerCapture(event: PointerEvent): void {
    releaseManualPointer(event.pointerId);
  }

  function handleManualKeyButtonDown(event: KeyboardEvent, note: string, octave: ManualOctave): void {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    const el = event.currentTarget as HTMLElement;
    pressManualKey(note, octave, el);
    event.preventDefault();
  }

  function handleManualKeyButtonUp(event: KeyboardEvent, note: string, octave: ManualOctave): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    releaseManualKey(note, octave);
    event.preventDefault();
  }

  function handleTransport(): void {
    if ($playbackStore.status === 'playing') {
      mainPlayerHandlers.pausePlayback();
      return;
    }

    if ($playbackStore.status === 'paused') {
      void mainPlayerHandlers.resumePlayback();
      return;
    }

    void mainPlayerHandlers.startPlayback();
  }

  function openRagaSearch(): void {
    ragaSearchOpen = true;
    if (matchingRagas.length > 0 && activeRagaIndex < 0) {
      activeRagaIndex = 0;
    }
  }

  function updateRagaSearch(value: string): void {
    ragaSearchText = value;
    ragaSearchOpen = true;
    activeRagaIndex = 0;
  }

  function clearRagaSearch(): void {
    ragaSearchText = '';
    ragaSearchOpen = false;
    activeRagaIndex = 0;
  }

  function selectRaga(raga: RagaLibraryEntry): void {
    ragaSearchText = raga.name;
    ragaSearchOpen = false;
    activeRagaIndex = 0;
    mainPlayerHandlers.setNotationText(formatRagaNotation(raga));
    notationTextarea?.focus();
  }

  function handleRagaSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      ragaSearchOpen = false;
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!ragaSearchOpen) {
        openRagaSearch();
        return;
      }

      if (matchingRagas.length > 0) {
        activeRagaIndex = (activeRagaIndex + 1 + matchingRagas.length) % matchingRagas.length;
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!ragaSearchOpen) {
        openRagaSearch();
        return;
      }

      if (matchingRagas.length > 0) {
        activeRagaIndex = (activeRagaIndex - 1 + matchingRagas.length) % matchingRagas.length;
      }
      return;
    }

    if (event.key === 'Enter' && ragaSearchOpen && activeRagaIndex >= 0 && matchingRagas[activeRagaIndex]) {
      event.preventDefault();
      selectRaga(matchingRagas[activeRagaIndex]);
    }
  }
</script>

<div class="reference-page">
  <header class="reference-header">
    <div class="header-inner">
      <a class="brand-link" href="/" aria-label="Paadu Gajala home">
        <img class="brand-logo" src="/site_logo.png" alt="Paadu Gajala" />
      </a>

      <nav class="desktop-nav" aria-label="Primary">
        {#each navItems as item}
          <a href={item.href} class:active={item.active} class="desktop-link">{item.label}</a>
        {/each}
      </nav>

      <div class="account-slot" aria-hidden="true">
        <span class="material-symbols-outlined">account_circle</span>
      </div>
    </div>
  </header>

  <main class="reference-main">
    <div class="top-panels">
      {#if $playbackStore.status === 'playing'}
        <section class="notation-panel">
          <PlaybackNotationHighlighter nodes={$notationStore.parsed} highlightedIndex={$playbackStore.currentIndex} />
        </section>
      {:else}
        <section class="notation-panel" bind:this={notationPanelElement}>
          <div class="panel-header">
            <h2>Notation Input</h2>

            <div class="utility-actions">
              <label class="utility-button">
                <span class="material-symbols-outlined icon-sm">upload_file</span>
                <span>Upload File</span>
                <input type="file" accept=".txt" on:change={(event) => void mainPlayerHandlers.handleNotationFileSelection(event)} />
              </label>

              <button class="utility-button" type="button" on:click={() => void mainPlayerHandlers.loadExampleNotation()}>
                <span class="material-symbols-outlined icon-sm">auto_awesome</span>
                <span>Load Example</span>
              </button>

              <div class="raga-search-control">
                <div class="raga-search-input-wrap">
                  <span class="material-symbols-outlined raga-search-icon">search</span>
                  <input
                    aria-controls="raga-search-results"
                    aria-expanded={ragaSearchOpen}
                    aria-label="Search ragas"
                    class="raga-search-input"
                    placeholder="Raga Search"
                    role="combobox"
                    type="text"
                    value={ragaSearchText}
                    on:click={openRagaSearch}
                    on:focus={openRagaSearch}
                    on:input={(event) => updateRagaSearch((event.currentTarget as HTMLInputElement).value)}
                    on:keydown={handleRagaSearchKeydown}
                  />

                  {#if ragaSearchText}
                    <button class="raga-search-clear" type="button" aria-label="Clear raga search" on:click={clearRagaSearch}>
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  {/if}
                </div>
              </div>
            </div>
          </div>

          <div class="manuscript-field">
            <label for="notation-input">Swaram Manuscript</label>
            <textarea
              bind:this={notationTextarea}
              id="notation-input"
              placeholder="Enter swara notation (e.g., S R G M P D N S')..."
              value={$notationStore.rawText}
              on:focus={() => {
                ragaSearchOpen = false;
              }}
              on:input={(event) => mainPlayerHandlers.setNotationText((event.currentTarget as HTMLTextAreaElement).value)}
            ></textarea>

            {#if ragaSearchOpen}
              <div class="raga-search-overlay" id="raga-search-results" role="listbox" aria-label="Matching ragas">
                <div class="raga-search-results-heading">Matching Ragas</div>

                {#if matchingRagas.length > 0}
                  <div class="raga-search-results">
                    {#each matchingRagas as raga, index}
                      <button
                        type="button"
                        class:active={index === activeRagaIndex}
                        class="raga-search-option"
                        role="option"
                        aria-selected={index === activeRagaIndex}
                        on:click={() => selectRaga(raga)}
                      >
                        <span class="raga-option-name">{raga.name}</span>
                        <span class="raga-option-meta">{raga.type}</span>
                      </button>
                    {/each}
                  </div>
                {:else}
                  <div class="raga-search-empty">No ragas match "{ragaSearchText.trim()}".</div>
                {/if}
              </div>
            {/if}
          </div>

          <div class="parse-action">
            <button class="parse-button" type="button" on:click={mainPlayerHandlers.parseCurrentNotation}>Parse</button>
          </div>
        </section>
      {/if}

      <section class="tuning-panel">
        <h2>Tone &amp; Tuning</h2>

        <div class="tuning-stack">
          <div class="field-stack">
            <label class="micro-label" for="instrument-select">Primary Instrument</label>
            <select
              id="instrument-select"
              value={$settingsStore.preset}
              on:change={(event) => mainPlayerHandlers.applyPreset((event.currentTarget as HTMLSelectElement).value)}
            >
              {#each instrumentOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <div class="toggle-row">
            <span>Shruti (Drone)</span>
            <button
              type="button"
              class:off={!droneEnabled}
              class="toggle-button"
              aria-label="Toggle shruti drone"
              aria-pressed={droneEnabled}
              on:click={() => {
                droneEnabled = !droneEnabled;
              }}
            >
              <span class="toggle-knob"></span>
            </button>
          </div>

          <div class="field-stack">
            <div class="range-header">
              <label class="micro-label" for="reverb-range">Reverb</label>
              <span class="range-chip">{reverbLevel}%</span>
            </div>
            <input
              id="reverb-range"
              type="range"
              min="0"
              max="100"
              value={reverbLevel}
              on:input={(event) => {
                reverbLevel = Number((event.currentTarget as HTMLInputElement).value);
              }}
            />
          </div>
        </div>
      </section>
    </div>

    <div class="transport-band">
      <div class="transport-panel">
        <button class="play-button" type="button" aria-label={transportLabel} on:click={handleTransport}>
          <span class="material-symbols-outlined filled">{transportIcon}</span>
        </button>

        <div class="tempo-panel">
          <div class="range-header">
            <span class="micro-label">Tempo (BPM)</span>
            <span class="tempo-value">{$settingsStore.tempo}</span>
          </div>
          <input
            type="range"
            min="40"
            max={MAX_TEMPO}
            value={$settingsStore.tempo}
            on:input={(event) => mainPlayerHandlers.updateTempo(Number((event.currentTarget as HTMLInputElement).value))}
          />
        </div>

        <div class="volume-panel">
          <span class="material-symbols-outlined volume-icon">volume_down</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round($settingsStore.volume * 100)}
            on:input={(event) => mainPlayerHandlers.updateVolume(Number((event.currentTarget as HTMLInputElement).value) / 100)}
          />
          <span class="material-symbols-outlined volume-icon">volume_up</span>
        </div>

        <div class="tala-panel">
          <span class="micro-label">Tala Type</span>
          <span class="tala-value">Adi Tala</span>
        </div>
      </div>

      <div
        class="visualizer-shell"
        role="img"
        aria-label={visualizerMedia.alt}
        style={`background-image: url('${visualizerMedia.src}');`}
      ></div>
    </div>

    <section class="piano-section">
      <div class="section-topline">
        <div class="section-title">
          <div class="accent-bar"></div>
          <h2>Virtual Swara Piano</h2>
        </div>
        <div class="octave-badge">Locked Compact Range</div>
      </div>

      <div class="piano-frame">
        <div
          bind:this={pianoKeybed}
          class="piano-keybed"
          on:pointerdown={handleKeybedPointerDown}
          on:pointerup={handleKeybedPointerUp}
          on:pointercancel={handleKeybedPointerCancel}
          on:lostpointercapture={handleKeybedLostPointerCapture}
        >
          {#each whiteKeys as key}
            <button
              aria-label={key.secondaryLabel ? `${key.label} or ${key.secondaryLabel}` : key.label}
              aria-pressed={!!playbackActiveKeys[`${key.note}:${key.octave}`]}
              class:divider={key.divider}
              class:playback-active={!!playbackActiveKeys[`${key.note}:${key.octave}`]}
              class="white-key"
              data-note={key.note}
              data-octave={key.octave}
              type="button"
              on:keydown={(e) => handleManualKeyButtonDown(e, key.note, key.octave)}
              on:keyup={(e) => handleManualKeyButtonUp(e, key.note, key.octave)}
              on:blur={() => releaseManualKey(key.note, key.octave)}
            >
              <span class="swara-label">{key.label}</span>
              {#if key.secondaryLabel}
                <span class="swara-name">{key.secondaryLabel}</span>
              {/if}
            </button>
          {/each}

          {#each blackKeys as key}
            <button
              aria-label={key.secondaryLabel ? `${key.label} or ${key.secondaryLabel}` : key.label}
              aria-pressed={!!playbackActiveKeys[`${key.note}:${key.octave}`]}
              class:playback-active={!!playbackActiveKeys[`${key.note}:${key.octave}`]}
              class="black-key"
              data-note={key.note}
              data-octave={key.octave}
              style={`left:${key.left}%;width:${blackKeyWidthPercent}%;height:${blackKeyHeightPercent}%`}
              type="button"
              on:keydown={(e) => handleManualKeyButtonDown(e, key.note, key.octave)}
              on:keyup={(e) => handleManualKeyButtonUp(e, key.note, key.octave)}
              on:blur={() => releaseManualKey(key.note, key.octave)}
            >
              <span class="swara-label">{key.label}</span>
              {#if key.secondaryLabel}
                <span class="swara-name">{key.secondaryLabel}</span>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <footer class="reference-footer">
    <div class="footer-inner">
      <a class="brand-link footer-brand-link" href="/" aria-label="Paadu Gajala home">
        <img class="brand-logo footer-brand-logo" src="/site_logo.png" alt="Paadu Gajala" />
      </a>

      <div class="footer-links">
        <a href="/">Terms of Berth</a>
        <a href="/">Privacy Policy</a>
        <a href="/">Contact Station Master</a>
      </div>

      <div class="footer-meta">© 1994 The Rhythmic Rail Conservatory</div>
    </div>
  </footer>

  <nav class="mobile-dock" aria-label="Mobile shortcuts">
    <div class="mobile-item active">
      <span class="material-symbols-outlined">library_music</span>
      <span>Lessons</span>
    </div>
    <div class="mobile-item">
      <span class="material-symbols-outlined">settings_input_component</span>
      <span>Practice</span>
    </div>
    <div class="mobile-item">
      <span class="material-symbols-outlined">music_note</span>
      <span>Ragas</span>
    </div>
    <div class="mobile-item">
      <span class="material-symbols-outlined">person</span>
      <span>Profile</span>
    </div>
  </nav>
</div>

<style>
  :global(body) {
    background: var(--bg-canvas);
  }

  .reference-page {
    position: relative;
    min-height: 100vh;
    background: var(--bg-canvas);
    color: var(--text-strong);
    font-family: 'Inter', sans-serif;
    padding-bottom: 6.5rem;
  }

  .reference-header {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid #f1eee7;
    background: #fcf9f2;
  }

  .header-inner,
  .reference-main,
  .footer-inner {
    width: min(1280px, calc(100vw - 3rem));
    margin: 0 auto;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.25rem 0;
  }

  .brand-link,
  .footer-brand-link {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
  }

  .brand-logo,
  .footer-brand-logo {
    display: block;
    width: auto;
    object-fit: contain;
  }

  .brand-logo {
    height: 3.75rem;
  }

  .footer-brand-logo {
    height: 4.5rem;
  }

  .desktop-nav {
    display: none;
    align-items: center;
    gap: 2.5rem;
  }

  .desktop-link {
    color: rgba(47, 101, 120, 0.6);
    font-family: 'Montserrat', sans-serif;
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding-bottom: 0.25rem;
    transition: color 180ms ease;
  }

  .desktop-link:hover {
    color: #924a2c;
  }

  .desktop-link.active {
    color: #2f6578;
    border-bottom: 2px solid #924a2c;
  }

  .account-slot {
    color: #2f6578;
    font-size: 2rem;
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 500,
      'GRAD' 0,
      'opsz' 24;
  }

  .filled {
    font-variation-settings:
      'FILL' 1,
      'wght' 500,
      'GRAD' 0,
      'opsz' 40;
  }

  .icon-sm {
    font-size: 1rem;
  }

  .reference-main {
    display: grid;
    gap: 2.25rem;
    padding: 2rem 0 0;
  }

  .top-panels {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .notation-panel,
  .tuning-panel,
  .transport-panel,
  .visualizer-shell,
  .piano-frame {
    position: relative;
    overflow: hidden;
  }

  .notation-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    border: 1px solid #ebe8e1;
    border-radius: 1.5rem;
    background: #f6f3ec;
    box-shadow: 0 4px 12px rgba(31, 42, 48, 0.04);
  }

  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .notation-panel h2,
  .tuning-panel h2,
  .piano-section h2 {
    margin: 0;
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.32rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }

  .utility-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .utility-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 2.55rem;
    padding: 0.6rem 1rem;
    border: 1px solid rgba(47, 101, 120, 0.1);
    border-radius: 0.75rem;
    background: rgba(170, 218, 254, 0.5);
    color: #2f6578;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: none;
    box-shadow: none;
  }

  .utility-button input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .manuscript-field {
    position: relative;
  }

  .raga-search-control {
    display: flex;
    min-width: min(22rem, 100%);
    flex: 1 1 19rem;
    align-items: stretch;
  }

  .raga-search-input-wrap {
    display: flex;
    min-height: 2.55rem;
    width: 100%;
    align-items: center;
    gap: 0.45rem;
    border: 1px solid rgba(47, 101, 120, 0.1);
    border-radius: 0.75rem;
    background: rgba(170, 218, 254, 0.5);
    padding: 0.6rem 1rem;
    box-shadow: none;
  }

  .raga-search-input-wrap:focus-within {
    border-color: rgba(47, 101, 120, 0.42);
    box-shadow: 0 0 0 1px rgba(47, 101, 120, 0.12);
  }

  .raga-search-icon,
  .raga-search-clear {
    color: rgba(47, 101, 120, 0.72);
  }

  .raga-search-icon {
    font-size: 1rem;
  }

  .raga-search-input {
    width: 100%;
    border: none;
    background: transparent;
    color: #2f6578;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .raga-search-input::placeholder {
    color: #2f6578;
    font-weight: 700;
    opacity: 1;
  }

  .raga-search-input:focus {
    outline: none;
  }

  .raga-search-clear {
    display: inline-flex;
    min-width: 1.7rem;
    min-height: 1.7rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(111, 163, 184, 0.14);
  }

  .raga-search-clear .material-symbols-outlined {
    font-size: 1rem;
  }

  .manuscript-field label {
    position: absolute;
    left: 1rem;
    top: -0.55rem;
    z-index: 2;
    padding: 0 0.5rem;
    background: #f6f3ec;
    color: #6fa3b8;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .manuscript-field textarea {
    min-height: 13rem;
    border: 1px solid #ebe8e1;
    border-radius: 1.5rem;
    background: rgba(229, 226, 219, 0.3);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    color: #1c1c18;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 1.05rem;
    line-height: 1.7;
    resize: none;
  }

  .manuscript-field textarea:focus {
    outline: none;
    border-color: #6fa3b8;
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(47, 101, 120, 0.15);
  }

  .raga-search-overlay {
    position: absolute;
    top: 1.1rem;
    right: 1.25rem;
    z-index: 4;
    display: grid;
    width: min(22rem, calc(100% - 2.5rem));
    gap: 0.8rem;
    border: 1px solid #d7e5ee;
    border-radius: 1.25rem;
    background: rgba(252, 249, 242, 0.98);
    padding: 1rem;
    box-shadow: 0 16px 32px rgba(31, 42, 48, 0.16);
  }

  .raga-search-results-heading {
    color: rgba(47, 101, 120, 0.62);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .raga-search-results {
    display: grid;
    gap: 0.55rem;
    max-height: 13.5rem;
    overflow-y: auto;
    padding-right: 0.2rem;
  }

  .raga-search-option {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border: 1px solid rgba(235, 232, 225, 0.88);
    border-radius: 0.8rem;
    background: #f6f3ec;
    padding: 0.8rem 0.9rem;
    text-align: left;
  }

  .raga-search-option.active,
  .raga-search-option:hover {
    border-color: rgba(111, 163, 184, 0.45);
    background: #dff0fa;
  }

  .raga-option-name {
    color: #245a70;
    font-size: 0.94rem;
    font-weight: 700;
  }

  .raga-option-meta {
    color: rgba(47, 101, 120, 0.62);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .raga-search-empty {
    color: rgba(47, 101, 120, 0.72);
    font-size: 0.82rem;
    font-weight: 700;
  }

  .parse-action {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.25rem;
  }

  .parse-button {
    min-height: 3.5rem;
    padding: 0.95rem 3.5rem;
    border-radius: 0.75rem;
    background: #924a2c;
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.05rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    box-shadow: 0 10px 24px rgba(146, 74, 44, 0.24);
  }

  .tuning-panel {
    display: grid;
    gap: 2rem;
    padding: 2rem;
    border-top: 4px solid rgba(47, 101, 120, 0.3);
    border-radius: 1.5rem;
    background: #6fa3b8;
    color: #003848;
    box-shadow: 0 22px 30px rgba(47, 101, 120, 0.18);
  }

  .tuning-panel h2 {
    color: #003848;
    font-size: 1.1rem;
  }

  .tuning-stack {
    display: grid;
    gap: 1.5rem;
  }

  .field-stack {
    display: grid;
    gap: 0.6rem;
  }

  .micro-label {
    color: rgba(0, 56, 72, 0.62);
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .tuning-panel select {
    min-height: 3rem;
    border: none;
    border-radius: 0.75rem;
    background: rgba(0, 56, 72, 0.9);
    color: #ffffff;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 1rem;
    background: rgba(0, 56, 72, 0.1);
    padding: 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .toggle-button {
    min-height: 1.5rem;
    width: 3rem;
    justify-content: flex-start;
    padding: 0.15rem;
    border-radius: 999px;
    background: #924a2c;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.12);
  }

  .toggle-button.off {
    background: rgba(0, 56, 72, 0.35);
  }

  .toggle-knob {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 999px;
    background: #ffffff;
    transform: translateX(1.3rem);
    box-shadow: 0 2px 6px rgba(31, 42, 48, 0.24);
    transition: transform 180ms ease;
  }

  .toggle-button.off .toggle-knob {
    transform: translateX(0);
  }

  .range-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .range-chip {
    display: inline-flex;
    min-height: 1.4rem;
    align-items: center;
    padding: 0.1rem 0.45rem;
    border-radius: 0.4rem;
    background: rgba(0, 56, 72, 0.2);
    color: #003848;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .tuning-panel input[type='range'],
  .tempo-panel input[type='range'],
  .volume-panel input[type='range'] {
    width: 100%;
    accent-color: #924a2c;
  }

  .transport-band {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .transport-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.2rem;
    padding: 1.5rem;
    border: 1px solid #ebe8e1;
    border-radius: 1.5rem;
    background: #f6f3ec;
    box-shadow: 0 4px 12px rgba(31, 42, 48, 0.04);
  }

  .play-button {
    width: 4rem;
    min-width: 4rem;
    min-height: 4rem;
    border-radius: 999px;
    background: #2f6578;
    color: #ffffff;
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.1),
      0 16px 28px rgba(47, 101, 120, 0.24);
  }

  .tempo-panel {
    flex: 1 1 14rem;
    display: grid;
    gap: 0.65rem;
    min-width: 12rem;
  }

  .tempo-value {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
  }

  .volume-panel {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    min-height: 3.4rem;
    padding: 0.8rem 1.25rem;
    border: 1px solid #f1eee7;
    border-radius: 999px;
    background: rgba(235, 232, 225, 0.5);
  }

  .volume-panel input {
    width: 7rem;
  }

  .volume-icon {
    color: #6fa3b8;
    font-size: 1.2rem;
  }

  .tala-panel {
    min-width: 7.5rem;
    padding: 0.8rem 1.35rem;
    border: 1px solid rgba(146, 74, 44, 0.2);
    border-radius: 0.75rem;
    background: rgba(146, 74, 44, 0.05);
    text-align: center;
  }

  .tala-value {
    display: block;
    color: #924a2c;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.08rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .visualizer-shell {
    width: 100%;
    height: 8rem;
    min-height: 8rem;
    overflow: hidden;
    border: 4px solid #f1eee7;
    border-radius: 1rem;
    background: #292524;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    box-shadow: inset 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  .piano-section {
    display: grid;
    gap: 1rem;
  }

  .section-topline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .accent-bar {
    width: 0.4rem;
    height: 1.5rem;
    border-radius: 999px;
    background: #2f6578;
  }

  .octave-badge {
    display: inline-flex;
    width: fit-content;
    min-height: 2rem;
    align-items: center;
    padding: 0.35rem 1rem;
    border: 1px solid rgba(111, 163, 184, 0.2);
    border-radius: 999px;
    background: rgba(111, 163, 184, 0.1);
    color: #6fa3b8;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .piano-frame {
    position: relative;
    width: 100%;
    height: 20rem;
    border: 8px solid #f1eee7;
    border-radius: 1.5rem;
    background: #f6f3ec;
    box-shadow: 0 24px 36px rgba(31, 42, 48, 0.16);
    user-select: none;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .piano-keybed {
    display: flex;
    position: relative;
    width: 100%;
    min-width: 56rem;
    height: 100%;
    touch-action: none;
  }

  .white-key,
  .black-key {
    box-shadow: none;
    border-radius: 0;
  }

  .white-key {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 0.2rem;
    padding: 0 0 1rem;
    border-left: 1px solid #e5e2db;
    background: #fcf9f2;
    color: inherit;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -4px 0 rgba(0, 0, 0, 0.05);
    transition: transform 75ms ease, box-shadow 75ms ease, background-color 75ms ease;
  }

  .white-key:first-of-type {
    border-left: none;
  }

  .white-key:hover:not(:disabled) {
    transform: none;
    background: #fcf9f2;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -4px 0 rgba(0, 0, 0, 0.05);
  }

  .white-key.divider {
    border-left: 2px solid #f1eee7;
  }

  .white-key:active {
    background: #fcf9f2;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      inset 0 -4px 0 rgba(0, 0, 0, 0.05);
    transform: none;
  }

  .white-key.playback-active {
    background: #ece5d9;
    box-shadow:
      inset 0 4px 12px rgba(123, 108, 84, 0.14),
      inset 0 -1px 0 rgba(0, 0, 0, 0.04);
    transform: translateY(2px);
  }

  .black-key {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 0.15rem;
    padding: 0 0.2rem 0.75rem;
    border-radius: 0 0 0.45rem 0.45rem;
    background: #40484c;
    z-index: 10;
    transform: translateX(-50%);
    box-shadow:
      2px 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 -4px 4px rgba(255, 255, 255, 0.1);
    transition: transform 75ms ease, box-shadow 75ms ease, background-color 75ms ease;
  }

  .black-key:hover:not(:disabled) {
    background: #40484c;
    box-shadow:
      2px 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 -4px 4px rgba(255, 255, 255, 0.1);
    transform: translateX(-50%);
  }

  .black-key:active {
    background: #40484c;
    box-shadow:
      2px 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 -4px 4px rgba(255, 255, 255, 0.1);
    transform: translateX(-50%);
  }

  .black-key.playback-active {
    background: #566066;
    box-shadow:
      1px 2px 3px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 -2px 3px rgba(255, 255, 255, 0.08);
    transform: translateX(-50%) translateY(1px);
  }

  .swara-label {
    color: rgba(47, 101, 120, 0.72);
    font-family: 'Montserrat', sans-serif;
    font-size: 0.82rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .swara-name {
    color: rgba(47, 101, 120, 0.48);
    font-size: 0.56rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .black-key .swara-label {
    color: rgba(252, 249, 242, 0.94);
    font-size: 0.68rem;
    letter-spacing: 0.03em;
  }

  .black-key .swara-name {
    color: rgba(252, 249, 242, 0.68);
    font-size: 0.5rem;
  }

  .piano-frame::-webkit-scrollbar {
    height: 0.55rem;
  }

  .piano-frame::-webkit-scrollbar-track {
    background: rgba(229, 226, 219, 0.8);
  }

  .piano-frame::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(111, 163, 184, 0.55);
  }

  .reference-footer {
    margin-top: 5rem;
    border-top: 1px solid #f1eee7;
    background: #f6f3ec;
    padding: 4rem 0;
  }

  .footer-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
  }

  .footer-links a,
  .footer-meta {
    color: rgba(47, 101, 120, 0.6);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .footer-links a:hover {
    color: #2f6578;
  }

  .footer-meta {
    color: rgba(47, 101, 120, 0.4);
    letter-spacing: 0.2em;
  }

  .mobile-dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 45;
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem 1.5rem;
    border-radius: 2.5rem 2.5rem 0 0;
    background: #2f6578;
    box-shadow: 0 -12px 32px rgba(31, 42, 48, 0.24);
  }

  .mobile-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    color: rgba(252, 249, 242, 0.6);
    padding: 0.5rem 0.8rem;
  }

  .mobile-item span:last-child {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.56rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  .mobile-item.active {
    border-radius: 1rem;
    background: #6fa3b8;
    color: #fcf9f2;
    padding: 0.75rem 1.5rem;
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
    }

    .mobile-dock {
      display: none;
    }

    .reference-page {
      padding-bottom: 0;
    }

    .footer-inner {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }

  @media (min-width: 1024px) {
    .top-panels {
      flex-direction: row;
      align-items: stretch;
    }

    .notation-panel {
      width: 70%;
    }

    .tuning-panel {
      width: 30%;
    }

    .transport-band {
      flex-direction: row;
      align-items: stretch;
    }

    .transport-panel {
      flex: 1;
    }

    .visualizer-shell {
      width: 14rem;
      height: auto;
      min-height: 8rem;
    }

    .section-topline {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  @media (max-width: 767px) {
    .header-inner,
    .reference-main,
    .footer-inner {
      width: min(1280px, calc(100vw - 2rem));
    }

    .reference-header {
      position: relative;
    }

    .brand-logo {
      height: 3.1rem;
    }

    .footer-brand-logo {
      height: 4rem;
    }

    .notation-panel,
    .tuning-panel,
    .transport-panel {
      padding: 1.25rem;
      border-radius: 1.2rem;
    }

    .raga-search-control {
      min-width: 100%;
    }

    .raga-search-overlay {
      left: 1rem;
      right: 1rem;
      width: auto;
    }

    .piano-frame {
      height: 14rem;
    }

    .piano-keybed {
      min-width: 48rem;
    }

    .swara-label {
      font-size: 0.68rem;
    }

    .swara-name {
      font-size: 0.46rem;
    }

    .black-key {
      padding-bottom: 0.5rem;
    }

    .desktop-nav {
      display: none;
    }
  }
</style>
