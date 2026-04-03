<script lang="ts">
  import type { WaveformType } from '../../domain/shared/types';

  export let value: WaveformType = 'square';
  export let onChange: (waveform: WaveformType) => void = () => {};

  const options: Array<{ value: WaveformType; label: string }> = [
    { value: 'sine', label: 'Sine' },
    { value: 'square', label: 'Square' },
    { value: 'sawtooth', label: 'Saw' },
    { value: 'triangle', label: 'Tri' }
  ];
</script>

<fieldset class="waveform-panel">
  <legend>Waveform Selection</legend>

  <div class="waveform-options" role="radiogroup" aria-label="Waveform selection">
    {#each options as option}
      <button
        type="button"
        role="radio"
        aria-checked={value === option.value}
        class:active={value === option.value}
        class="waveform-option"
        onclick={() => onChange(option.value)}
      >
        <span class="indicator" aria-hidden="true"></span>
        <span>{option.label}</span>
      </button>
    {/each}
  </div>
</fieldset>

<style>
  .waveform-panel {
    margin: 0;
    padding: 1.5rem 1.6rem 1.35rem;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 1.35rem;
    background: rgba(230, 229, 226, 0.48);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  legend {
    width: 100%;
    padding: 0;
    color: rgba(96, 99, 102, 0.78);
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.3em;
    text-align: center;
    text-transform: uppercase;
  }

  .waveform-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.55rem;
    margin-top: 1rem;
  }

  .waveform-option {
    display: grid;
    justify-items: center;
    gap: 0.45rem;
    min-height: auto;
    padding: 0.2rem;
    border-radius: 1rem;
    background: transparent;
    box-shadow: none;
    color: rgba(88, 91, 94, 0.78);
  }

  .waveform-option:hover {
    transform: none;
  }

  .indicator {
    width: 0.95rem;
    height: 0.95rem;
    border-radius: 999px;
    border: 2px solid rgba(109, 114, 118, 0.52);
    background: rgba(255, 255, 255, 0.86);
    box-shadow: inset 0 1px 2px rgba(31, 42, 48, 0.14);
  }

  .waveform-option span:last-child {
    font-size: 0.62rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .waveform-option.active {
    color: #924a2c;
  }

  .waveform-option.active .indicator {
    border-color: #924a2c;
    background: #924a2c;
    box-shadow: 0 0 12px rgba(146, 74, 44, 0.35);
  }

  @media (max-width: 640px) {
    .waveform-options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
