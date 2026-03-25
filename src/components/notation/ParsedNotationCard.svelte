<script lang="ts">
  import { buildPreviewNotationTokens } from '../../domain/notation/notation.parser';
  import type { ParsedNotationNode } from '../../domain/notation/notation.types';

  export let nodes: ParsedNotationNode[] = [];
  export let highlightedIndex = -1;
  $: previewTokens = buildPreviewNotationTokens(nodes);
</script>

<section class="card section">
  <h2>Parsed Notation</h2>
  <div class="notation">
    {#if nodes.length === 0}
      <p class="empty">Parsed notation will appear here. Enter notation and click Parse to preview.</p>
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
  .section {
    padding: 1rem;
  }

  .notation {
    min-height: 8rem;
  }

  .token,
  .marker {
    display: inline-block;
    margin: 0.125rem 0.25rem 0.125rem 0;
  }

  .token {
    padding: 0.15rem 0.35rem;
    border-radius: 999px;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }

  .token.active {
    background: var(--pg-gold);
    color: var(--pg-brown-900);
    transform: translateY(-1px);
  }

  .empty {
    opacity: 0.7;
  }
</style>
