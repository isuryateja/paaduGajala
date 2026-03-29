<script lang="ts">
  export let label = '';
  export let value = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let onChange: (value: string) => void = () => {};
</script>

<label class="control">
  <span class="label">{label}</span>
  <select value={value} on:change={(event) => onChange((event.currentTarget as HTMLSelectElement).value)}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</label>

<style>
  .control {
    display: grid;
    gap: 0.6rem;
  }

  .label {
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  select {
    min-height: 3.15rem;
    padding: 0.8rem 1rem;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
</style>
