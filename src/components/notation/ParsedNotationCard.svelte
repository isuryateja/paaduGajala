<script lang="ts">
  import { buildPreviewNotationTokens } from '../../domain/notation/notation.parser';
  import type { ParsedNotationNode } from '../../domain/notation/notation.types';

  export let nodes: ParsedNotationNode[] = [];
  export let highlightedIndex = -1;
  $: previewTokens = buildPreviewNotationTokens(nodes);
</script>

<section class="card parsed-card">
  <header class="header">
    <div>
      <p class="section-label">Sequence preview</p>
      <h2>Read the phrase exactly as the engine sees it.</h2>
    </div>
    <p class="section-copy">Parsed notes stay in view while playback advances so phrase structure and keyboard response remain connected.</p>
  </header>

  <div class="notation">
    {#if nodes.length === 0}
      <p class="empty">Parsed notation will appear here once you run the current sequence through the parser.</p>
    {:else}
      {#each previewTokens as token}
        {#if token.type === 'svara'}
          <span class:active={highlightedIndex === token.noteIndex} class="token">
            {token.text}
            {#if token.octaveDisplay === 'sub'}
              <sub>.</sub>
            {:else if token.octaveDisplay === 'sup'}
              <sup>.</sup>
            {/if}
          </span>
        {:else if token.type === 'rhythm_marker'}
          <span class="marker">{token.text}</span>
        {:else if token.type === 'newline'}
          <br />
        {/if}
      {/each}
    {/if}
  </div>
</section>

<style>
  .parsed-card {
    display: grid;
    gap: 1rem;
    padding: 1.35rem;
  }

  .header {
    display: grid;
    gap: 0.5rem;
  }

  h2 {
    font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  .notation {
    min-height: 12rem;
    padding: 1rem;
    border-radius: var(--radius-md);
    background: var(--surface-overlay);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    line-height: 2.1;
  }

  .token,
  .marker {
    display: inline-block;
    margin: 0.15rem 0.35rem 0.15rem 0;
  }

  .token {
    padding: 0.16rem 0.55rem;
    border-radius: 999px;
    background: var(--accent-secondary-soft);
    color: var(--text-strong);
    font-weight: 700;
  }

  .token.active {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
    color: var(--text-inverse);
    transform: translateY(-1px);
  }

  .marker {
    color: var(--accent-secondary);
    font-weight: 800;
  }

  .empty {
    max-width: 28rem;
    color: var(--text-muted);
  }
</style>
