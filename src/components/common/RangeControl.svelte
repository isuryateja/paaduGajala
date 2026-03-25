<script lang="ts">
  export let label = '';
  export let min = 0;
  export let max = 100;
  export let value = 0;
  export let suffix = '';
  export let onInput: (value: number) => void = () => {};
</script>

<label class="control">
  <span>{label}</span>
  <input
    type="range"
    min={min}
    max={max}
    value={value}
    on:input={(event) => onInput(Number((event.currentTarget as HTMLInputElement).value))}
  />
  <span>{value}{suffix}</span>
</label>

<style>
  .control {
    display: grid;
    gap: 0.5rem;
  }
</style>
