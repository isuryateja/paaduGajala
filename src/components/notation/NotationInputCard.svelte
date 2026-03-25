<script lang="ts">
  import StatusBar from '../common/StatusBar.svelte';

  export let value = '';
  export let statusText = 'Ready';
  export let statusTone = 'ready';
  export let parsedInfo = '';
  export let onInput: (value: string) => void = () => {};
  export let onParse: () => void = () => {};
  export let onLoadExample: () => void = () => {};
  export let onFileChange: (event: Event) => void = () => {};
  export let onClear: () => void = () => {};
</script>

<section class="card section">
  <h2>Notation Input</h2>
  <textarea
    value={value}
    placeholder={"Paste your svara notation here...\n\nExample:\nS R1 G1 M1 | P D1 N1 ||\nS' N1 D1 P | M1 G1 R1 ||"}
    on:input={(event) => onInput((event.currentTarget as HTMLTextAreaElement).value)}
  ></textarea>

  <div class="actions">
    <button on:click={onParse}>Parse</button>
    <button on:click={onLoadExample}>Load Example</button>
    <label class="upload">
      <span>Upload File</span>
      <input type="file" accept=".txt" on:change={onFileChange} />
    </label>
    <button on:click={onClear}>Clear</button>
  </div>

  <StatusBar {statusText} {statusTone} {parsedInfo} />
</section>

<style>
  .section {
    padding: 1rem;
  }

  textarea {
    width: 100%;
    min-height: 12rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.25);
    color: var(--pg-cream);
    border: 1px solid var(--pg-border);
    border-radius: 0.75rem;
    resize: vertical;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .upload {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .upload input {
    max-width: 10rem;
  }
</style>
