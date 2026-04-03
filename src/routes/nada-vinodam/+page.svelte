<svelte:head>
  <title>Paadu Gajala - Nāda Vinōdam</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import NadaKnob from '../../components/nada-vinodam/NadaKnob.svelte';
  import NadaOscilloscope from '../../components/nada-vinodam/NadaOscilloscope.svelte';
  import NadaSignalMeter from '../../components/nada-vinodam/NadaSignalMeter.svelte';
  import NadaWaveformSelector from '../../components/nada-vinodam/NadaWaveformSelector.svelte';
  import ReferenceChrome from '../../components/layout/ReferenceChrome.svelte';
  import { createIdleMeterLevels, createIdleOscilloscopePath, createNadaVinodamPageController } from '../../app/services/nada-vinodam-page';
  import type { NadaVinodamState } from '../../domain/audio/nada-vinodam.types';

  const controller = createNadaVinodamPageController();

  const initialState: NadaVinodamState = {
    frequencyHz: 261.63,
    gain: 0.42,
    attackSeconds: 0.08,
    releaseSeconds: 0.4,
    waveform: 'square',
    sustainEnabled: true,
    isPlaying: false,
    mappedSvara: 'S',
    mappedOctave: 'madhya',
    signalPeak: 0,
    audioReady: false,
    audioError: null
  };

  const featureNotes = [
    {
      accent: '#924a2c',
      title: 'Analog Integrity',
      body: 'Single-oscillator voicing with envelope control keeps the page useful as a focused Carnatic pitch bench instead of a broad workstation.'
    },
    {
      accent: '#6fa3b8',
      title: 'Rhythmic Precision',
      body: 'Live frequency motion, gain shaping, and waveform swaps all respond without restarting the circuit, so the lab stays tactile under your hand.'
    },
    {
      accent: '#c7e7ff',
      title: 'Legacy Export',
      body: 'The console is additive to the current app: shared pitch references remain canonical, while the synthesis path stays isolated from notation playback.'
    }
  ];

  let state: NadaVinodamState = initialState;
  let oscilloscopePath = createIdleOscilloscopePath();
  let meterLevels = createIdleMeterLevels();

  function formatFrequency(value: number): string {
    return `${value.toFixed(2)} Hz`;
  }

  function formatOctave(octave: string): string {
    return octave === 'madhya' ? 'Madhya' : octave === 'mandra' ? 'Mandra' : 'Taara';
  }

  onMount(() => {
    const unsubscribeState = controller.state.subscribe((value) => {
      state = value;
    });
    const unsubscribeScope = controller.oscilloscopePath.subscribe((value) => {
      oscilloscopePath = value;
    });
    const unsubscribeMeter = controller.meterLevels.subscribe((value) => {
      meterLevels = value;
    });
    const teardown = controller.mount();

    return () => {
      unsubscribeState();
      unsubscribeScope();
      unsubscribeMeter();
      teardown();
    };
  });
</script>

<ReferenceChrome activeTab="nada-vinodam">
  <section class="nada-page">
    <section class="title-strip">
      <div>
        <h1>Nāda Vinōdam</h1>
        <p class="subtitle">Model GAJ-1974 | Analog Frequency Diagnostic Tool</p>
      </div>

      <div class="readout-chip">
        <span class="chip-label">Nearest svara</span>
        <strong>{state.mappedSvara}</strong>
        <span class="chip-meta">{formatOctave(state.mappedOctave)}</span>
      </div>
    </section>

    <section class="console-shell">
      <div class="console-skin">
        <div class="console-grid">
          <section class="control-bay">
            <div class="primary-cluster">
              <NadaKnob
                label="Frequency"
                value={state.frequencyHz}
                min={80}
                max={880}
                step={1}
                size="large"
                accent="#3e6f8e"
                valueText={formatFrequency(state.frequencyHz)}
                onChange={controller.setFrequency}
              />

              <NadaKnob
                label="Gain"
                value={state.gain}
                min={0}
                max={1}
                step={0.02}
                size="compact"
                accent="#a65a3a"
                valueText={`${Math.round(state.gain * 100)}%`}
                onChange={controller.setGain}
              />

              <div class="envelope-bank">
                <label class="slider-row">
                  <span>Attack</span>
                  <input
                    type="range"
                    min="0.005"
                    max="2"
                    step="0.005"
                    value={state.attackSeconds}
                    oninput={(event) => controller.setAttack(Number((event.currentTarget as HTMLInputElement).value))}
                  />
                  <small>{state.attackSeconds.toFixed(2)} s</small>
                </label>

                <label class="slider-row">
                  <span>Release</span>
                  <input
                    type="range"
                    min="0.01"
                    max="3"
                    step="0.01"
                    value={state.releaseSeconds}
                    oninput={(event) => controller.setRelease(Number((event.currentTarget as HTMLInputElement).value))}
                  />
                  <small>{state.releaseSeconds.toFixed(2)} s</small>
                </label>
              </div>
            </div>

            <NadaWaveformSelector value={state.waveform} onChange={controller.setWaveform} />

            <div class="playback-stack">
              <button class:playing={state.isPlaying} class="play-toggle" type="button" onclick={() => void controller.togglePlayback()}>
                <span class="material-symbols-outlined">{state.isPlaying ? 'stop' : 'play_arrow'}</span>
                <span>{state.isPlaying ? 'Stop' : 'Play'}</span>
              </button>

              <label class="sustain-switch">
                <span>Infinite Sustain</span>
                <input
                  type="checkbox"
                  checked={state.sustainEnabled}
                  onchange={(event) => controller.setSustainEnabled((event.currentTarget as HTMLInputElement).checked)}
                />
                <span class="switch-track" aria-hidden="true">
                  <span class="switch-knob"></span>
                </span>
              </label>
            </div>
          </section>

          <section class="diagnostic-bay">
            <div class="digital-panel">
              <div class="panel-heading">
                <span>Digital Readout</span>
                <span class:ready={state.audioReady && !state.audioError} class="status-light"></span>
              </div>

              <div class="readout-grid">
                <div class="readout-cell">
                  <span class="cell-label">Frequency</span>
                  <strong>{state.frequencyHz.toFixed(2)} <small>Hz</small></strong>
                </div>

                <div class="readout-cell accent">
                  <span class="cell-label">Svara Map</span>
                  <strong>{state.mappedSvara}</strong>
                  <small>{formatOctave(state.mappedOctave)}</small>
                </div>
              </div>

              <p class="readout-note">
                {#if state.audioError}
                  {state.audioError}
                {:else if state.isPlaying}
                  Oscillator is live. Frequency and waveform changes are applied in place.
                {:else}
                  Dial the target pitch, then engage the console to hear the current circuit.
                {/if}
              </p>
            </div>

            <NadaOscilloscope path={oscilloscopePath} active={state.isPlaying} />
            <NadaSignalMeter levels={meterLevels} />
          </section>
        </div>

        <footer class="console-footer">
          <div class="footer-status">
            <span class="status-dot"></span>
            <span>Diagnostic Output: {state.isPlaying ? 'Active' : 'Standby'}</span>
          </div>
          <span class="footer-copy">Designated for: Swaram Express Rail Division</span>
        </footer>
      </div>
    </section>

    <section class="feature-strip" aria-label="Feature notes">
      {#each featureNotes as note}
        <article class="feature-note">
          <span class="feature-accent" style={`background:${note.accent};`}></span>
          <h2>{note.title}</h2>
          <p>{note.body}</p>
        </article>
      {/each}
    </section>
  </section>
</ReferenceChrome>

<style>
  .nada-page {
    display: grid;
    gap: 2rem;
    padding-bottom: 2rem;
  }

  .title-strip {
    display: grid;
    gap: 1.2rem;
    align-items: end;
  }

  h1 {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(3.4rem, 8vw, 5.4rem);
    font-weight: 900;
    letter-spacing: -0.08em;
    line-height: 0.9;
    text-transform: uppercase;
  }

  .subtitle,
  .chip-label,
  .chip-meta,
  .panel-heading,
  .cell-label,
  .console-footer,
  .slider-row span,
  .slider-row small,
  .readout-note,
  .sustain-switch span,
  .feature-note h2 {
    text-transform: uppercase;
  }

  .subtitle {
    margin-top: 0.3rem;
    color: rgba(64, 72, 76, 0.86);
    font-size: 0.84rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .readout-chip {
    display: inline-grid;
    justify-self: start;
    gap: 0.18rem;
    padding: 0.95rem 1.15rem;
    border-radius: 1.25rem;
    background: rgba(246, 243, 236, 0.88);
    box-shadow: inset 0 0 0 1px rgba(192, 200, 204, 0.42);
  }

  .readout-chip strong {
    color: #924a2c;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.9rem;
    font-weight: 900;
    letter-spacing: -0.06em;
    line-height: 1;
  }

  .chip-label,
  .chip-meta {
    color: rgba(64, 72, 76, 0.74);
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.18em;
  }

  .console-shell {
    position: relative;
  }

  .console-shell::before {
    content: '';
    position: absolute;
    inset: 2rem 1rem -2rem;
    background: radial-gradient(circle at center, rgba(31, 42, 48, 0.18), transparent 70%);
    filter: blur(28px);
    opacity: 0.55;
    pointer-events: none;
  }

  .console-skin {
    position: relative;
    overflow: hidden;
    border-radius: 2rem;
    padding: 0.8rem;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.42), transparent 18%),
      linear-gradient(135deg, #c9cbcc 0%, #b0b2b4 100%);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.42),
      0 28px 54px rgba(31, 42, 48, 0.2);
  }

  .console-skin::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
  }

  .console-grid {
    position: relative;
    display: grid;
    gap: 1.35rem;
    padding: 1.3rem;
    border-radius: 1.55rem 1.55rem 0 0;
    background: linear-gradient(145deg, rgba(208, 210, 212, 0.98), rgba(179, 181, 183, 0.96));
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .control-bay,
  .diagnostic-bay {
    display: grid;
    gap: 1rem;
  }

  .primary-cluster {
    display: grid;
    gap: 1rem;
    align-items: center;
    padding: 1.15rem;
    border-radius: 1.45rem;
    background: rgba(239, 236, 228, 0.38);
    border: 1px solid rgba(255, 255, 255, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.42);
  }

  .envelope-bank {
    display: grid;
    gap: 0.95rem;
  }

  .slider-row {
    display: grid;
    gap: 0.3rem;
  }

  .slider-row span,
  .slider-row small {
    color: rgba(88, 91, 94, 0.82);
    font-size: 0.56rem;
    font-weight: 900;
    letter-spacing: 0.2em;
  }

  .slider-row small {
    color: rgba(88, 91, 94, 0.62);
  }

  input[type='range'] {
    width: 100%;
    accent-color: #3e6f8e;
    cursor: ew-resize;
  }

  .playback-stack {
    display: grid;
    justify-items: center;
    gap: 1rem;
    padding-top: 0.35rem;
  }

  .play-toggle {
    width: 8.8rem;
    min-height: 8.8rem;
    flex-direction: column;
    gap: 0.2rem;
    border-radius: 1.55rem;
    background: linear-gradient(180deg, #4c7ea0 0%, #28506a 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.24),
      0 12px 22px rgba(31, 42, 48, 0.24);
  }

  .play-toggle.playing {
    background: linear-gradient(180deg, #924a2c 0%, #743417 100%);
  }

  .play-toggle .material-symbols-outlined {
    font-size: 2.25rem;
    font-variation-settings:
      'FILL' 1,
      'wght' 500,
      'GRAD' 0,
      'opsz' 24;
  }

  .play-toggle span:last-child {
    font-size: 0.68rem;
    font-weight: 900;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .sustain-switch {
    display: grid;
    justify-items: center;
    gap: 0.6rem;
    color: rgba(88, 91, 94, 0.82);
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.22em;
    cursor: pointer;
  }

  .sustain-switch input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .switch-track {
    position: relative;
    width: 3.65rem;
    height: 1.8rem;
    border-radius: 999px;
    background: rgba(109, 114, 118, 0.74);
    box-shadow:
      inset 0 1px 4px rgba(0, 0, 0, 0.24),
      0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .switch-track::before {
    content: '';
    position: absolute;
    inset: 0.18rem;
    border-radius: inherit;
    background: rgba(0, 0, 0, 0.12);
  }

  .switch-knob {
    position: absolute;
    top: 0.17rem;
    left: 0.17rem;
    width: 1.46rem;
    height: 1.46rem;
    border-radius: 999px;
    background: linear-gradient(180deg, #f1f2f4, #bfc3c7);
    box-shadow: 0 2px 6px rgba(31, 42, 48, 0.28);
    transition: transform 180ms ease;
  }

  .sustain-switch input:checked + .switch-track {
    background: #924a2c;
  }

  .sustain-switch input:checked + .switch-track .switch-knob {
    transform: translateX(1.82rem);
  }

  .digital-panel {
    display: grid;
    gap: 0.9rem;
    padding: 1.2rem;
    border: 4px solid #5d5a56;
    border-radius: 1.2rem;
    background: linear-gradient(180deg, #181816, #23231f);
    box-shadow: inset 0 12px 28px rgba(0, 0, 0, 0.34);
  }

  .panel-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    color: rgba(154, 206, 228, 0.78);
    font-size: 0.6rem;
    font-weight: 900;
    letter-spacing: 0.2em;
  }

  .status-light {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 999px;
    background: rgba(146, 74, 44, 0.85);
    box-shadow: 0 0 12px rgba(146, 74, 44, 0.35);
  }

  .status-light.ready {
    background: #78c884;
    box-shadow: 0 0 12px rgba(120, 200, 132, 0.45);
  }

  .readout-grid {
    display: grid;
    gap: 0.75rem;
  }

  .readout-cell {
    display: grid;
    justify-items: center;
    gap: 0.3rem;
    min-height: 6.2rem;
    padding: 1rem;
    border-radius: 0.9rem;
    background: rgba(6, 6, 6, 0.54);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
    text-align: center;
  }

  .readout-cell strong {
    color: #6fa3b8;
    font-family: 'Roboto Mono', 'SFMono-Regular', ui-monospace, monospace;
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.08em;
    text-shadow: 0 0 14px rgba(111, 163, 184, 0.28);
  }

  .readout-cell small {
    color: rgba(154, 206, 228, 0.62);
    font-size: 0.85rem;
    letter-spacing: 0;
  }

  .readout-cell.accent strong {
    color: #a65a3a;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: -0.05em;
    text-shadow: 0 0 12px rgba(166, 90, 58, 0.2);
  }

  .cell-label {
    color: rgba(121, 126, 132, 0.72);
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.18em;
  }

  .readout-note {
    min-height: 2.8rem;
    color: rgba(196, 199, 202, 0.76);
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    line-height: 1.65;
  }

  .console-footer {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    justify-content: space-between;
    padding: 0.9rem 1.3rem 1.1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 0 0 1.55rem 1.55rem;
    color: rgba(88, 91, 94, 0.78);
    font-size: 0.56rem;
    font-weight: 900;
    letter-spacing: 0.18em;
    background: rgba(173, 175, 177, 0.72);
  }

  .footer-status {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .status-dot {
    width: 0.46rem;
    height: 0.46rem;
    border-radius: 999px;
    background: rgba(31, 42, 48, 0.75);
  }

  .footer-copy {
    color: rgba(67, 70, 74, 0.78);
  }

  .feature-strip {
    display: grid;
    gap: 1.25rem;
  }

  .feature-note {
    display: grid;
    gap: 0.9rem;
    align-content: start;
  }

  .feature-accent {
    width: 3rem;
    height: 0.2rem;
    border-radius: 999px;
  }

  .feature-note h2 {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .feature-note p {
    max-width: 26rem;
    color: rgba(64, 72, 76, 0.86);
    font-size: 0.95rem;
    line-height: 1.7;
  }

  @media (min-width: 720px) {
    .title-strip {
      grid-template-columns: 1fr auto;
    }

    .readout-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .console-footer {
      flex-direction: row;
      align-items: center;
    }

    .feature-strip {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 2rem;
    }
  }

  @media (min-width: 960px) {
    .console-grid {
      grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
      gap: 1.6rem;
      padding: 1.6rem;
    }

    .primary-cluster {
      grid-template-columns: auto auto minmax(0, 1fr);
      gap: 1.15rem;
    }
  }

  @media (max-width: 719px) {
    .readout-chip {
      width: 100%;
    }

    .play-toggle {
      width: 100%;
      min-height: 5rem;
      border-radius: 1.25rem;
      flex-direction: row;
    }
  }
</style>
