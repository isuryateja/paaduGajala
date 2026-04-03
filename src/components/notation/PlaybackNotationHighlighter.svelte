<script lang="ts">
  import { tick } from 'svelte';
  import { buildPreviewNotationTokens } from '../../domain/notation/notation.parser';
  import type { ParsedNotationNode } from '../../domain/notation/notation.types';

  export let nodes: ParsedNotationNode[] = [];
  export let highlightedIndex = -1;

  let notationViewport: HTMLDivElement | null = null;
  let lastScrolledIndex = -2;

  $: previewTokens = buildPreviewNotationTokens(nodes);

  $: if (highlightedIndex !== lastScrolledIndex) {
    lastScrolledIndex = highlightedIndex;
    void scrollActiveTokenIntoView();
  }

  async function scrollActiveTokenIntoView(): Promise<void> {
    if (!notationViewport || highlightedIndex < 0) {
      return;
    }

    await tick();
    const activeToken = notationViewport.querySelector<HTMLElement>(`[data-note-index="${highlightedIndex}"]`);
    activeToken?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth'
    });
  }
</script>

<div class="playback-notation-panel">
  <div class="panel-header">
    <h2>Live Notation</h2>
    <div class="utility-actions-spacer" aria-hidden="true">
      <span class="utility-button-shell"></span>
      <span class="utility-button-shell"></span>
    </div>
  </div>

  <div class="notation-field">
    <label for="playback-notation-preview">Swaram Manuscript</label>
    <div
      id="playback-notation-preview"
      bind:this={notationViewport}
      class="notation-preview"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {#if nodes.length === 0}
        <p class="empty-state">Parse notation to preview the live phrase.</p>
      {:else}
        {#each previewTokens as token}
          {#if token.type === 'svara'}
            <span
              data-note-index={token.noteIndex}
              class:active={highlightedIndex === token.noteIndex}
              class="token"
            >
              {token.text}
              {#if token.octaveDisplay === 'sub'}
                <sub>.</sub>
              {:else if token.octaveDisplay === 'sup'}
                <sup>.</sup>
              {/if}
            </span>
          {:else if token.type === 'rhythm_marker' || token.type === 'sustain_unit' || token.type === 'beat_rest'}
            <span class="marker">{token.text}</span>
          {:else if token.type === 'newline'}
            <br />
          {/if}
        {/each}
      {/if}
    </div>
  </div>

  <div class="parse-action-spacer" aria-hidden="true">
    <span class="parse-button-shell"></span>
  </div>
</div>

<style>
  .playback-notation-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-height: 100%;
  }

  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h2 {
    margin: 0;
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.32rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }

  .utility-actions-spacer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .utility-button-shell {
    min-height: 2.55rem;
    width: 8.75rem;
    border-radius: 0.75rem;
    visibility: hidden;
  }

  .notation-field {
    position: relative;
  }

  .notation-field label {
    position: absolute;
    left: 1rem;
    top: -0.55rem;
    z-index: 2;
    padding: 0 0.5rem;
    background: #f6f3ec;
    color: #6fa3b8;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .notation-preview {
    min-height: 13rem;
    max-height: 13rem;
    overflow: auto;
    padding: 1.5rem;
    border: 1px solid #ebe8e1;
    border-radius: 1.5rem;
    background: rgba(229, 226, 219, 0.3);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.08);
    color: #1c1c18;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 1.05rem;
    line-height: 2;
  }

  .parse-action-spacer {
    display: flex;
    justify-content: flex-end;
    padding-top: 0.25rem;
  }

  .parse-button-shell {
    min-height: 3.5rem;
    width: 10.5rem;
    border-radius: 0.75rem;
    visibility: hidden;
  }

  .token,
  .marker {
    display: inline-block;
    margin: 0.15rem 0.35rem 0.15rem 0;
  }

  .token {
    padding: 0.18rem 0.6rem;
    border-radius: 999px;
    background: rgba(170, 218, 254, 0.45);
    color: #2f6578;
    font-weight: 700;
    transition:
      transform 120ms ease,
      background-color 120ms ease,
      color 120ms ease,
      box-shadow 120ms ease;
  }

  .token.active {
    background: linear-gradient(135deg, #2f6578 0%, #6fa3b8 100%);
    color: #fcf9f2;
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(47, 101, 120, 0.18);
  }

  .marker {
    color: #924a2c;
    font-weight: 800;
  }

  .empty-state {
    margin: 0;
    color: rgba(47, 101, 120, 0.68);
  }
</style>
