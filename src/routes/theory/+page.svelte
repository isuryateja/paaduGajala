<svelte:head>
  <title>Paadu Gajala - Theory</title>
</svelte:head>

<script lang="ts">
  import ReferenceChrome from '../../components/layout/ReferenceChrome.svelte';

  interface QuickSwaraTile {
    label: string;
    tone: 'tonic' | 'deep' | 'warm' | 'muted';
  }

  const quickSwaraBank: QuickSwaraTile[] = [
    { label: 'S', tone: 'tonic' },
    { label: 'R', tone: 'deep' },
    { label: 'G', tone: 'warm' },
    { label: 'M', tone: 'deep' },
    { label: 'P', tone: 'muted' },
    { label: 'D', tone: 'muted' },
    { label: 'N', tone: 'warm' }
  ];

  const maxQuickSequence = 4;
  const nadaWaveforms = [
    { label: 'Sine', active: false },
    { label: 'Square', active: true },
    { label: 'Saw', active: false },
    { label: 'Tri', active: false }
  ];

  let quickSequence = $state<string[]>(['S', 'R', 'G']);

  let quickSlots = $derived(Array.from({ length: maxQuickSequence }, (_, index) => quickSequence[index] ?? ''));
  let sequenceReady = $derived(quickSequence.length === maxQuickSequence);
  let sequenceLabel = $derived(quickSequence.length > 0 ? quickSequence.join(' · ') : 'Start with a few anchor swaras.');

  function appendQuickSvara(svara: string): void {
    if (quickSequence.length >= maxQuickSequence) {
      quickSequence = [...quickSequence.slice(1), svara];
      return;
    }

    quickSequence = [...quickSequence, svara];
  }

  function removeLastQuickSvara(): void {
    quickSequence = quickSequence.slice(0, -1);
  }

  function resetQuickSequence(): void {
    quickSequence = ['S', 'R', 'G'];
  }
</script>

<ReferenceChrome activeTab="theory">
  <section class="theory-page">
    <section class="theory-hero">
      <div class="hero-copy">
        <p class="eyebrow">Theory Workspace</p>
        <h1>Raga Nirmāṇa</h1>
        <p class="lede">
          A compact construction widget for shaping a quick melodic outline before you step into the full builder.
        </p>

        <div class="hero-notes">
          <div>
            <span class="note-label">What it does</span>
            <p>Lets you sketch a fast Arohanam idea with the core swara families.</p>
          </div>
          <div>
            <span class="note-label">What opens next</span>
            <p>The full builder adds both paths, finer svara variants, and live raga elimination.</p>
          </div>
        </div>
      </div>

      <div class="widget-shell">
        <div class="widget-rim" aria-hidden="true"></div>
        <section class="quick-widget">
          <div class="widget-header">
            <div>
              <h2>Raga Nirmāṇa</h2>
              <p>Quick Build</p>
            </div>
          </div>

          <div class="widget-section">
            <div class="section-header">
              <span>Swara Bank</span>
              <span class="section-meta">Core families</span>
            </div>

            <div class="swara-grid">
              {#each quickSwaraBank as tile}
                <button
                  type="button"
                  class={`swara-tile ${tile.tone}`}
                  aria-label={`Add ${tile.label} to quick sequence`}
                  onclick={() => appendQuickSvara(tile.label)}
                >
                  {tile.label}
                </button>
              {/each}

              <button class="swara-tile swara-placeholder" type="button" disabled aria-label="More swaras in full builder">
                <span class="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          <div class="sequence-panel">
            <div class="section-header">
              <span>Arohanam Sequence</span>
              <span class="section-meta">{sequenceLabel}</span>
            </div>

            <div class="sequence-row" aria-label="Quick arohanam preview">
              {#each quickSlots as svara, index}
                {#if index > 0}
                  <span class="sequence-dot" aria-hidden="true">•</span>
                {/if}

                <div class:filled={Boolean(svara)} class="sequence-slot">
                  {#if svara}
                    {svara}
                  {:else}
                    <span class="material-symbols-outlined">edit</span>
                  {/if}
                </div>
              {/each}
            </div>

            <div class="sequence-actions">
              <button class="secondary sequence-button" type="button" disabled={quickSequence.length === 0} onclick={removeLastQuickSvara}>
                Undo
              </button>
              <button class="ghost sequence-button" type="button" onclick={resetQuickSequence}>
                Reset
              </button>
            </div>
          </div>

          <a class="widget-cta" href="/raga-nirmana">
            <span>{sequenceReady ? 'Continue Full Builder' : 'Open Full Builder'}</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </a>
        </section>
      </div>
    </section>

    <section class="support-strip">
      <div class="support-accent" aria-hidden="true"></div>
      <div class="support-copy">
        <p class="support-label">Builder Scope</p>
        <h3>Use this quick widget for orientation. Use the full builder for identification.</h3>
      </div>
      <div class="support-meta">
        <span>Quick row</span>
        <span>Core swaras</span>
        <span>Full route: Arohanam + Avarohanam</span>
      </div>
    </section>

    <section class="lab-preview">
      <div class="lab-copy">
        <p class="eyebrow">Sound Lab</p>
        <h2>Nāda Vinōdam</h2>
        <p class="lede">
          A compact analog console preview for testing pitch, gain, waveform color, and live svara mapping before you open the full sound lab.
        </p>

        <div class="hero-notes">
          <div>
            <span class="note-label">What it does</span>
            <p>Lets you preview the synthesis surface with a tactile mini-console right from the Theory workspace.</p>
          </div>
          <div>
            <span class="note-label">What opens next</span>
            <p>The full lab adds live playback, oscilloscope diagnostics, and continuous frequency shaping.</p>
          </div>
        </div>
      </div>

      <div class="widget-shell">
        <div class="widget-rim nada-rim" aria-hidden="true"></div>
        <section class="quick-widget nada-widget">
          <div class="widget-header">
            <div>
              <h2>Nāda Vinōdam</h2>
              <p>Quick Lab</p>
            </div>
          </div>

          <div class="nada-topline">
            <div class="nada-knob-bank" aria-hidden="true">
              <div class="theory-knob large">
                <span class="theory-indicator"></span>
              </div>
              <div class="theory-knob compact gain">
                <span class="theory-indicator"></span>
              </div>
            </div>

            <div class="nada-readout">
              <span class="nada-readout-label">Digital Readout</span>
              <div class="nada-readout-grid">
                <div>
                  <span class="nada-readout-key">Frequency</span>
                  <strong>261.63</strong>
                  <small>Hz</small>
                </div>
                <div>
                  <span class="nada-readout-key">Svara</span>
                  <strong class="accent">S</strong>
                  <small>Madhya</small>
                </div>
              </div>
            </div>
          </div>

          <div class="nada-controls">
            <div class="nada-mini-sliders" aria-hidden="true">
              <div class="mini-slider">
                <span>Attack</span>
                <div class="track"><span class="thumb attack"></span></div>
              </div>
              <div class="mini-slider">
                <span>Release</span>
                <div class="track"><span class="thumb release"></span></div>
              </div>
            </div>

            <div class="nada-waveform-row" aria-label="Waveform preview">
              {#each nadaWaveforms as waveform}
                <div class:active={waveform.active} class="waveform-chip">
                  <span class="waveform-dot"></span>
                  <span>{waveform.label}</span>
                </div>
              {/each}
            </div>

            <div class="nada-footer-row">
              <div class="mini-scope" aria-hidden="true">
                <span class="scope-line"></span>
              </div>
              <div class="mini-sustain">
                <span>Infinite Sustain</span>
                <span class="mini-toggle"><span></span></span>
              </div>
            </div>
          </div>

          <a class="widget-cta nada-cta" href="/nada-vinodam">
            <span>Open Sound Lab</span>
            <span class="material-symbols-outlined">tune</span>
          </a>
        </section>
      </div>
    </section>
  </section>
</ReferenceChrome>

<style>
  .theory-page {
    display: grid;
    gap: 2rem;
    padding-bottom: 2rem;
  }

  .theory-hero {
    display: grid;
    gap: 2rem;
    align-items: center;
    padding: 1rem 0 0;
  }

  .hero-copy {
    display: grid;
    gap: 1rem;
  }

  .eyebrow,
  .note-label,
  .support-label {
    color: #6fa3b8;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  h1 {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(3rem, 7vw, 5.5rem);
    font-weight: 900;
    letter-spacing: -0.08em;
    line-height: 0.92;
    max-width: 9ch;
    text-transform: uppercase;
  }

  .lede {
    max-width: 34rem;
    color: #40484c;
    font-size: 1rem;
    line-height: 1.7;
  }

  .hero-notes {
    display: grid;
    gap: 1rem;
    max-width: 38rem;
  }

  .hero-notes > div {
    display: grid;
    gap: 0.35rem;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(192, 200, 204, 0.34);
  }

  .hero-notes p {
    color: #71787c;
    line-height: 1.6;
  }

  .widget-shell {
    position: relative;
    display: flex;
    justify-content: center;
  }

  .widget-rim {
    position: absolute;
    inset: 1rem auto 1rem 0.35rem;
    width: 0.25rem;
    border-radius: 999px;
    background: linear-gradient(180deg, #2f6578, #6fa3b8);
    box-shadow: 0 0 0 1px rgba(47, 101, 120, 0.08);
  }

  .quick-widget {
    position: relative;
    width: min(100%, 25rem);
    display: grid;
    gap: 1.35rem;
    padding: 2rem;
    border-radius: 2rem;
    background: linear-gradient(180deg, #f6f3ec 0%, rgba(246, 243, 236, 0.94) 100%);
    box-shadow: 0 24px 56px rgba(31, 42, 48, 0.09);
    overflow: hidden;
  }

  .quick-widget::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(235, 232, 225, 0.9);
    border-radius: inherit;
    pointer-events: none;
  }

  .quick-widget > * {
    position: relative;
    z-index: 1;
  }

  .widget-header h2 {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.06em;
  }

  .widget-header p {
    color: #924a2c;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .widget-section,
  .sequence-panel {
    display: grid;
    gap: 0.85rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .section-header span:first-child {
    color: #40484c;
    font-size: 0.8rem;
    font-weight: 800;
  }

  .section-meta {
    color: #71787c;
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-align: right;
  }

  .swara-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .swara-tile {
    min-height: 4rem;
    padding: 0;
    border-radius: 999px;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.05rem;
    font-weight: 900;
    box-shadow: 0 10px 22px rgba(31, 42, 48, 0.1);
  }

  .swara-tile.tonic {
    background: #9acee4;
    color: #003848;
  }

  .swara-tile.deep {
    background: #3e6f8e;
    color: #ffffff;
  }

  .swara-tile.warm {
    background: #a65a3a;
    color: #ffffff;
  }

  .swara-tile.muted {
    background: rgba(111, 163, 184, 0.7);
    color: #ffffff;
  }

  .swara-placeholder {
    background: rgba(229, 226, 219, 0.8);
    color: #71787c;
    box-shadow: inset 0 0 0 2px rgba(113, 120, 124, 0.16);
  }

  .sequence-panel {
    padding: 1.25rem;
    border-radius: 1rem;
    background: #e5e2db;
    box-shadow: inset 0 -4px 0 #aadafe;
  }

  .sequence-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .sequence-slot {
    width: 3rem;
    height: 3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.85rem;
    border: 2px dashed rgba(47, 101, 120, 0.26);
    color: rgba(47, 101, 120, 0.42);
    font-weight: 800;
  }

  .sequence-slot.filled {
    border-style: solid;
    border-color: transparent;
    color: #ffffff;
    box-shadow: 0 8px 18px rgba(31, 42, 48, 0.08);
  }

  .sequence-row .sequence-slot:nth-of-type(1).filled {
    background: #2f6578;
  }

  .sequence-row .sequence-slot:nth-of-type(3).filled {
    background: #3e6f8e;
  }

  .sequence-row .sequence-slot:nth-of-type(5).filled {
    background: #a65a3a;
  }

  .sequence-row .sequence-slot:nth-of-type(7).filled {
    background: #6fa3b8;
  }

  .sequence-dot {
    color: rgba(113, 120, 124, 0.4);
    font-weight: 800;
  }

  .sequence-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .sequence-button {
    min-height: 2.35rem;
    padding: 0.55rem 0.95rem;
    font-size: 0.82rem;
  }

  .widget-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: 3.4rem;
    border-radius: 0.95rem;
    background: linear-gradient(135deg, #924a2c 0%, #743417 100%);
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    box-shadow: 0 18px 30px rgba(146, 74, 44, 0.18);
  }

  .widget-cta:hover {
    transform: translateY(-1px);
  }

  .widget-cta .material-symbols-outlined {
    transition: transform 180ms ease;
  }

  .widget-cta:hover .material-symbols-outlined {
    transform: translateX(3px);
  }

  .support-strip {
    display: grid;
    gap: 1rem;
    align-items: center;
    padding: 1.5rem;
    border-radius: 1.5rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(241, 238, 231, 0.92));
    box-shadow: inset 0 0 0 1px rgba(192, 200, 204, 0.28);
  }

  .support-accent {
    width: 0.35rem;
    height: 3rem;
    border-radius: 999px;
    background: #924a2c;
  }

  .support-copy {
    display: grid;
    gap: 0.35rem;
  }

  h3 {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  .support-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .support-meta span {
    display: inline-flex;
    align-items: center;
    min-height: 2rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    color: #71787c;
    box-shadow: inset 0 0 0 1px rgba(192, 200, 204, 0.3);
    font-size: 0.74rem;
    font-weight: 700;
  }

  .lab-preview {
    display: grid;
    gap: 2rem;
    align-items: center;
    padding-top: 0.5rem;
  }

  .lab-copy {
    display: grid;
    gap: 1rem;
  }

  .lab-copy h2 {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(2.6rem, 6vw, 4.25rem);
    font-weight: 900;
    letter-spacing: -0.08em;
    line-height: 0.92;
    text-transform: uppercase;
    max-width: 9ch;
  }

  .nada-rim {
    background: linear-gradient(180deg, #924a2c, #dc8662);
  }

  .nada-widget {
    width: min(100%, 32rem);
    gap: 1.1rem;
    padding: 1.4rem;
    background:
      radial-gradient(circle at top left, rgba(255, 255, 255, 0.42), transparent 35%),
      linear-gradient(180deg, #d8d9db 0%, #b7b9bb 100%);
    box-shadow: 0 28px 60px rgba(31, 42, 48, 0.14);
  }

  .nada-widget::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
  }

  .nada-topline,
  .nada-controls {
    display: grid;
    gap: 0.9rem;
  }

  .nada-knob-bank {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.55rem 0.2rem 0;
  }

  .theory-knob {
    position: relative;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(226, 228, 230, 0.98), rgba(126, 131, 135, 0.96));
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.52),
      0 10px 24px rgba(31, 42, 48, 0.18);
  }

  .theory-knob.large {
    width: 5.8rem;
    height: 5.8rem;
  }

  .theory-knob.compact {
    width: 3rem;
    height: 3rem;
  }

  .theory-knob::before {
    content: '';
    position: absolute;
    inset: 0.45rem;
    border-radius: inherit;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.82), transparent 35%),
      linear-gradient(180deg, rgba(215, 217, 219, 0.98), rgba(160, 164, 167, 0.95));
    box-shadow:
      inset 0 -4px 6px rgba(44, 48, 52, 0.18),
      inset 0 1px 2px rgba(255, 255, 255, 0.35);
  }

  .theory-knob.compact::before {
    inset: 0.25rem;
  }

  .theory-indicator {
    position: absolute;
    top: 0.6rem;
    left: 50%;
    z-index: 1;
    width: 0.24rem;
    height: 1.1rem;
    border-radius: 999px;
    background: #3e6f8e;
    transform: translateX(-50%) rotate(-58deg);
    transform-origin: center 2.25rem;
    box-shadow: 0 0 10px rgba(62, 111, 142, 0.25);
  }

  .theory-knob.compact .theory-indicator {
    height: 0.72rem;
    background: #a65a3a;
    transform-origin: center 1.15rem;
    transform: translateX(-50%) rotate(18deg);
  }

  .nada-readout {
    display: grid;
    gap: 0.65rem;
    padding: 1rem;
    border-radius: 1rem;
    background: linear-gradient(180deg, #181816, #22211f);
    box-shadow: inset 0 10px 24px rgba(0, 0, 0, 0.28);
  }

  .nada-readout-label,
  .nada-readout-key,
  .mini-slider span,
  .waveform-chip span:last-child,
  .mini-sustain span:first-child {
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .nada-readout-label,
  .nada-readout-key {
    color: rgba(154, 206, 228, 0.72);
  }

  .nada-readout-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .nada-readout-grid > div {
    display: grid;
    justify-items: start;
    gap: 0.18rem;
    padding: 0.9rem;
    border-radius: 0.9rem;
    background: rgba(8, 8, 8, 0.4);
  }

  .nada-readout-grid strong {
    color: #6fa3b8;
    font-family: 'Montserrat', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.08em;
    line-height: 0.9;
  }

  .nada-readout-grid strong.accent {
    color: #a65a3a;
  }

  .nada-readout-grid small {
    color: rgba(154, 206, 228, 0.68);
    font-size: 0.7rem;
    font-weight: 700;
  }

  .nada-mini-sliders {
    display: grid;
    gap: 0.65rem;
    padding: 0.85rem 0.95rem;
    border-radius: 1rem;
    background: rgba(246, 243, 236, 0.5);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  .mini-slider {
    display: grid;
    gap: 0.35rem;
  }

  .mini-slider span {
    color: #71787c;
  }

  .track {
    position: relative;
    height: 0.55rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.76);
    box-shadow: inset 0 0 0 1px rgba(113, 120, 124, 0.2);
  }

  .thumb {
    position: absolute;
    top: 50%;
    width: 1rem;
    height: 1rem;
    border-radius: 999px;
    background: #3e6f8e;
    transform: translate(-50%, -50%);
  }

  .thumb.attack {
    left: 78%;
  }

  .thumb.release {
    left: 28%;
  }

  .nada-waveform-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.6rem;
    padding: 0.9rem 0.95rem;
    border-radius: 1rem;
    background: rgba(246, 243, 236, 0.42);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.24);
  }

  .waveform-chip {
    display: grid;
    justify-items: center;
    gap: 0.35rem;
    color: #71787c;
  }

  .waveform-dot {
    width: 0.95rem;
    height: 0.95rem;
    border-radius: 999px;
    border: 2px solid rgba(113, 120, 124, 0.35);
    background: rgba(255, 255, 255, 0.76);
  }

  .waveform-chip.active {
    color: #924a2c;
  }

  .waveform-chip.active .waveform-dot {
    border-color: #924a2c;
    background: #924a2c;
    box-shadow: 0 0 12px rgba(146, 74, 44, 0.28);
  }

  .nada-footer-row {
    display: grid;
    gap: 0.7rem;
    align-items: center;
  }

  .mini-scope {
    position: relative;
    height: 3.5rem;
    border-radius: 0.9rem;
    background:
      linear-gradient(rgba(111, 163, 184, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(111, 163, 184, 0.06) 1px, transparent 1px),
      linear-gradient(180deg, #181816, #21211f);
    background-size: 12.5% 20%, 12.5% 20%, auto;
    box-shadow: inset 0 10px 22px rgba(0, 0, 0, 0.26);
    overflow: hidden;
  }

  .scope-line {
    position: absolute;
    inset: 50% 0 auto;
    height: 2px;
    background: linear-gradient(90deg, rgba(111, 163, 184, 0.65), rgba(111, 163, 184, 0.9), rgba(111, 163, 184, 0.65));
    box-shadow: 0 0 10px rgba(111, 163, 184, 0.3);
    transform: translateY(-50%);
  }

  .mini-sustain {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    color: #71787c;
    padding: 0 0.15rem;
  }

  .mini-toggle {
    position: relative;
    width: 3.2rem;
    height: 1.5rem;
    border-radius: 999px;
    background: #924a2c;
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.22);
  }

  .mini-toggle span {
    position: absolute;
    top: 0.16rem;
    left: 1.72rem;
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 999px;
    background: linear-gradient(180deg, #f1f2f4, #bfc3c7);
    box-shadow: 0 2px 6px rgba(31, 42, 48, 0.2);
  }

  .nada-cta {
    background: linear-gradient(135deg, #2f6578 0%, #204257 100%);
    box-shadow: 0 18px 30px rgba(47, 101, 120, 0.2);
  }

  @media (min-width: 960px) {
    .theory-hero {
      grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 24rem);
      gap: 3rem;
    }

    .lab-preview {
      grid-template-columns: minmax(0, 1.05fr) minmax(21rem, 32rem);
      gap: 3rem;
    }

    .support-strip {
      grid-template-columns: auto minmax(0, 1fr) auto;
    }
  }

  @media (max-width: 767px) {
    .quick-widget {
      padding: 1.35rem;
      border-radius: 1.6rem;
    }

    .swara-grid {
      gap: 0.65rem;
    }

    .swara-tile {
      min-height: 3.5rem;
    }

    .section-header {
      align-items: flex-start;
    }

    .nada-waveform-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
