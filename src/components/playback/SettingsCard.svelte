<script lang="ts">
  import SelectControl from '../common/SelectControl.svelte';

  export let waveform = 'triangle';
  export let tuning = 'equal';
  export let preset = 'veena';
  export let onWaveform: (value: string) => void = () => {};
  export let onTuning: (value: string) => void = () => {};
  export let onPreset: (value: string) => void = () => {};

  const waveformOptions = [
    { value: 'triangle', label: 'Triangle (Veena-like)' },
    { value: 'sine', label: 'Sine (Flute-like)' },
    { value: 'sawtooth', label: 'Sawtooth (Violin-like)' },
    { value: 'square', label: 'Square (Harmonium-like)' }
  ];

  const tuningOptions = [
    { value: 'equal', label: 'Equal Temperament' },
    { value: 'just', label: 'Just Intonation' }
  ];

  const presets = ['veena', 'flute', 'violin', 'harmonium'];
</script>

<section class="card section">
  <header class="header">
    <p class="section-label">Tone and tuning</p>
    <h2>Shape the instrument before rehearsal starts.</h2>
  </header>

  <div class="grid">
    <SelectControl label="Waveform" value={waveform} options={waveformOptions} onChange={onWaveform} />
    <SelectControl label="Tuning system" value={tuning} options={tuningOptions} onChange={onTuning} />
  </div>

  <div class="presets">
    <span class="preset-label">Instrument preset</span>
    <div class="buttons">
      {#each presets as presetName}
        <button
          class:active={preset === presetName}
          class="preset-button"
          on:click={() => onPreset(presetName)}
        >
          {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .section {
    display: grid;
    gap: 1rem;
    padding: 1.35rem;
  }

  .header {
    display: grid;
    gap: 0.4rem;
  }

  h2 {
    font-size: 1.3rem;
  }

  .grid {
    display: grid;
    gap: 0.85rem;
  }

  .presets {
    display: grid;
    gap: 0.65rem;
  }

  .preset-label {
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .buttons {
    display: flex;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .preset-button {
    background: var(--surface-overlay);
    color: var(--text-body);
    box-shadow: inset 0 0 0 1px var(--line-soft);
  }

  .preset-button.active {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
    color: var(--text-inverse);
    box-shadow: 0 10px 20px rgba(146, 74, 44, 0.24);
  }
</style>
