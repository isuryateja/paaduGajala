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
  <h2>Settings</h2>
  <div class="grid">
    <SelectControl label="Waveform" value={waveform} options={waveformOptions} onChange={onWaveform} />
    <SelectControl label="Tuning System" value={tuning} options={tuningOptions} onChange={onTuning} />
  </div>

  <div class="presets">
    <span>Instrument Preset</span>
    <div class="buttons">
      {#each presets as presetName}
        <button class:active={preset === presetName} on:click={() => onPreset(presetName)}>
          {presetName.charAt(0).toUpperCase() + presetName.slice(1)}
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .section {
    padding: 1rem;
  }

  .grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  }

  .presets {
    display: grid;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .active {
    background: var(--pg-saffron);
    color: #1f1400;
  }
</style>
