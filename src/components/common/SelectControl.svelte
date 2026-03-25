<script lang="ts">
  export let label = '';
  export let value = '';
  export let options: Array<{ value: string; label: string }> = [];
  export let onChange: (value: string) => void = () => {};
</script>

<label class="control">
  <span>{label}</span>
  <select value={value} on:change={(event) => onChange((event.currentTarget as HTMLSelectElement).value)}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</label>

<style>
  .control {
    display: grid;
    gap: 0.5rem;
  }
</style>
