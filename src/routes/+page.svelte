<svelte:head>
  <title>Paadu Gajala - Notation Player</title>
</svelte:head>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { bootstrapApp } from '../app/services/app-bootstrap';
  import { mainPlayerHandlers } from '../app/services/main-player-page';
  import { getVisualizerMedia } from '../app/services/visualizer-state';
  import { notationStore } from '../app/stores/notation.store';
  import { playbackStore } from '../app/stores/playback.store';
  import { settingsStore } from '../app/stores/settings.store';
  import { uiStore } from '../app/stores/ui.store';
  import { startPianoNote, stopPianoNote, releaseAllPianoNotes } from '../app/actions/piano.actions';

  type ManualOctave = '1' | '2';

  interface WhiteKey {
    note: string;
    octave: ManualOctave;
    label: string;
    name: string;
    divider?: boolean;
  }

  interface BlackKey {
    note: string;
    octave: ManualOctave;
    left: number;
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
    { note: 's', octave: '1', label: 'SA', name: 'Shadjama' },
    { note: 'r', octave: '1', label: 'RI', name: 'Rishabha' },
    { note: 'g', octave: '1', label: 'GA', name: 'Gandhara' },
    { note: 'm', octave: '1', label: 'MA', name: 'Madhyama' },
    { note: 'p', octave: '1', label: 'PA', name: 'Panchama' },
    { note: 'd', octave: '1', label: 'DA', name: 'Dhaivata' },
    { note: 'n', octave: '1', label: 'NI', name: 'Nishada' },
    { note: 's', octave: '2', label: "SA'", name: 'Tara', divider: true },
    { note: 'r', octave: '2', label: "RI'", name: 'Rishabha' },
    { note: 'g', octave: '2', label: "GA'", name: 'Gandhara' },
    { note: 'm', octave: '2', label: "MA'", name: 'Madhyama' },
    { note: 'p', octave: '2', label: "PA'", name: 'Panchama' },
    { note: 'd', octave: '2', label: "DA'", name: 'Dhaivata' },
    { note: 'n', octave: '2', label: "NI'", name: 'Nishada' }
  ];

  const blackKeys: BlackKey[] = [
    { note: 'r1', octave: '1', left: 4 },
    { note: 'r2', octave: '1', left: 11 },
    { note: 'm1', octave: '1', left: 25 },
    { note: 'd1', octave: '1', left: 32 },
    { note: 'd2', octave: '1', left: 39 },
    { note: 'r1', octave: '2', left: 54 },
    { note: 'r2', octave: '2', left: 61 },
    { note: 'm1', octave: '2', left: 75 },
    { note: 'd1', octave: '2', left: 82 },
    { note: 'd2', octave: '2', left: 89 }
  ];

  let teardown = () => {};
  let droneEnabled = true;
  let reverbLevel = 42;
  let activeManualKeys = new Set<string>();

  onMount(() => {
    teardown = bootstrapApp();
  });

  onDestroy(() => {
    releaseAllPianoNotes();
    teardown();
  });

  $: transportIcon = $playbackStore.status === 'playing' ? 'pause' : 'play_arrow';
  $: transportLabel =
    $playbackStore.status === 'playing' ? 'Pause playback' : $playbackStore.status === 'paused' ? 'Resume playback' : 'Play';
  $: visualizerMedia = getVisualizerMedia($playbackStore.status, $uiStore.status);

  function updateManualKey(key: string, active: boolean): void {
    const next = new Set(activeManualKeys);
    if (active) {
      next.add(key);
    } else {
      next.delete(key);
    }
    activeManualKeys = next;
  }

  async function pressManualKey(note: string, octave: ManualOctave): Promise<void> {
    const key = `${note}:${octave}`;
    updateManualKey(key, true);
    await startPianoNote(note, octave);
  }

  function releaseManualKey(note: string, octave: ManualOctave): void {
    const key = `${note}:${octave}`;
    updateManualKey(key, false);
    stopPianoNote(note, octave);
  }

  function isManualKeyActive(note: string, octave: ManualOctave): boolean {
    return activeManualKeys.has(`${note}:${octave}`);
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
</script>

<div class="reference-page">
  <header class="reference-header">
    <div class="header-inner">
      <div class="brand">పాడు గజాల</div>

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
      <section class="notation-panel">
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
          </div>
        </div>

        <div class="manuscript-field">
          <label for="notation-input">Swaram Manuscript</label>
          <textarea
            id="notation-input"
            placeholder="Enter swara notation (e.g., S R G M P D N S')..."
            value={$notationStore.rawText}
            on:input={(event) => mainPlayerHandlers.setNotationText((event.currentTarget as HTMLTextAreaElement).value)}
          ></textarea>
        </div>

        <div class="parse-action">
          <button class="parse-button" type="button" on:click={mainPlayerHandlers.parseCurrentNotation}>Parse</button>
        </div>
      </section>

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
            max="180"
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
        <div class="octave-badge">2 Octaves Mapped</div>
      </div>

      <div class="piano-frame">
        {#each blackKeys as key}
          <button
            aria-label={`${key.note.toUpperCase()} octave ${key.octave}`}
            class:black-active={isManualKeyActive(key.note, key.octave)}
            class="black-key"
            style={`left:${key.left}%`}
            type="button"
            on:mousedown={() => void pressManualKey(key.note, key.octave)}
            on:mouseup={() => releaseManualKey(key.note, key.octave)}
            on:mouseleave={() => releaseManualKey(key.note, key.octave)}
            on:touchstart|preventDefault={() => void pressManualKey(key.note, key.octave)}
            on:touchend|preventDefault={() => releaseManualKey(key.note, key.octave)}
          ></button>
        {/each}

        {#each whiteKeys as key}
          <button
            class:divider={key.divider}
            class:white-active={isManualKeyActive(key.note, key.octave)}
            class="white-key"
            type="button"
            on:mousedown={() => void pressManualKey(key.note, key.octave)}
            on:mouseup={() => releaseManualKey(key.note, key.octave)}
            on:mouseleave={() => releaseManualKey(key.note, key.octave)}
            on:touchstart|preventDefault={() => void pressManualKey(key.note, key.octave)}
            on:touchend|preventDefault={() => releaseManualKey(key.note, key.octave)}
          >
            <span class="swara-label">{key.label}</span>
            <span class="swara-name">{key.name}</span>
          </button>
        {/each}
      </div>
    </section>
  </main>

  <footer class="reference-footer">
    <div class="footer-inner">
      <div class="footer-brand">పాడు గజాల</div>

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

  .brand,
  .footer-brand {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.55rem;
    font-weight: 900;
    letter-spacing: -0.06em;
    text-transform: uppercase;
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
    display: flex;
    position: relative;
    width: 100%;
    height: 20rem;
    border: 8px solid #f1eee7;
    border-radius: 1.5rem;
    background: #f6f3ec;
    box-shadow: 0 24px 36px rgba(31, 42, 48, 0.16);
    user-select: none;
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
    gap: 0.15rem;
    padding: 0 0 1rem;
    border-left: 1px solid #e5e2db;
    background: #fcf9f2;
    color: inherit;
    box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.05);
    transition: transform 75ms ease, box-shadow 75ms ease, background-color 75ms ease;
  }

  .white-key:first-of-type {
    border-left: none;
  }

  .white-key.divider {
    border-left: 2px solid #f1eee7;
  }

  .white-key.white-active {
    background: #f6f3ec;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(2px);
  }

  .black-key {
    position: absolute;
    top: 0;
    width: 6%;
    height: 60%;
    border-radius: 0 0 0.45rem 0.45rem;
    background: #40484c;
    z-index: 10;
    transform: translateX(-50%);
    box-shadow:
      2px 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 -4px 4px rgba(255, 255, 255, 0.1);
    transition: transform 75ms ease, box-shadow 75ms ease, background-color 75ms ease;
  }

  .black-key.black-active {
    background: #1c1c18;
    box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.4);
    transform: translateX(-50%) translateY(2px);
  }

  .swara-label {
    color: rgba(47, 101, 120, 0.4);
    font-family: 'Montserrat', sans-serif;
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .swara-name {
    color: rgba(47, 101, 120, 0.3);
    font-size: 0.48rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    text-transform: uppercase;
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

    .notation-panel,
    .tuning-panel,
    .transport-panel {
      padding: 1.25rem;
      border-radius: 1.2rem;
    }

    .piano-frame {
      height: 14rem;
    }

    .desktop-nav {
      display: none;
    }
  }
</style>
