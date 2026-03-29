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

<section class="card notation-card">
  <header class="header">
    <div>
      <p class="section-label">Notation input</p>
      <h2>Shape the phrase before you play it.</h2>
    </div>
    <p class="section-copy">Paste swaras, upload a text file, or start from the sample phrase to build the current run.</p>
  </header>

  <label class="field">
    <span class="field-label">Svara notation</span>
    <textarea
      value={value}
      placeholder={"Paste your svara notation here...\n\nExample:\nS R1 G1 M1 | P D1 N1 ||\nS' N1 D1 P | M1 G1 R1 ||"}
      on:input={(event) => onInput((event.currentTarget as HTMLTextAreaElement).value)}
    ></textarea>
  </label>

  <div class="actions">
    <button class="accent" on:click={onParse}>Parse notation</button>
    <button class="secondary" on:click={onLoadExample}>Load example</button>
    <label class="upload">
      <span>Import text file</span>
      <input type="file" accept=".txt" on:change={onFileChange} />
    </label>
    <button class="ghost" on:click={onClear}>Clear</button>
  </div>

  <StatusBar {statusText} {statusTone} {parsedInfo} />
</section>

<style>
  .notation-card {
    display: grid;
    gap: 1.1rem;
    padding: 1.35rem;
  }

  .header {
    display: grid;
    gap: 0.5rem;
  }

  h2 {
    font-size: clamp(1.3rem, 3vw, 2rem);
  }

  .field {
    display: grid;
    gap: 0.7rem;
  }

  .field-label {
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  textarea {
    min-height: 16rem;
    padding: 1.1rem 1.15rem;
    resize: vertical;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
    font-size: 1rem;
    line-height: 1.7;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .upload {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.9rem;
    padding: 0.8rem 1.15rem;
    border-radius: 999px;
    background: var(--surface-3);
    color: var(--text-body);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    cursor: pointer;
    font-weight: 700;
  }

  .upload input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
</style>
