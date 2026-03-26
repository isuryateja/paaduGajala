<script lang="ts">
  export let label = '';
  export let min = 0;
  export let max = 100;
  export let value = 0;
  export let suffix = '';
  export let onInput: (value: number) => void = () => {};
</script>

<label class="control">
  <span class="topline">
    <span class="label">{label}</span>
    <span class="value">{value}{suffix}</span>
  </span>
  <input
    type="range"
    min={min}
    max={max}
    value={value}
    on:input={(event) => onInput(Number((event.currentTarget as HTMLInputElement).value))}
  />
</label>

<style>
  .control {
    display: grid;
    gap: 0.6rem;
    padding: 0.95rem;
    border-radius: var(--radius-md);
    background: var(--surface-overlay);
    box-shadow: inset 0 0 0 1px var(--line-soft);
  }

  .topline {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .label,
  .value {
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .label {
    color: var(--text-muted);
  }

  .value {
    color: var(--text-strong);
  }

  input[type='range'] {
    accent-color: var(--accent);
  }
</style>
