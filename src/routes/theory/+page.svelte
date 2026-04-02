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

  @media (min-width: 960px) {
    .theory-hero {
      grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 24rem);
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
  }
</style>
