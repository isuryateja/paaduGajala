<script lang="ts">
  import PianoKeyboard from './PianoKeyboard.svelte';
  export let title = 'Virtual Piano';
  export let subtitle = '';
  export let activeKeys = new Set<string>();
</script>

<section class="card piano-card">
  <header class="header">
    <div>
      <p class="section-label">Keyboard response</p>
      <h2>{title}</h2>
    </div>
    {#if subtitle}
      <p class="section-copy copy">{subtitle}</p>
    {/if}
  </header>

  <div class="stage">
    <PianoKeyboard {activeKeys} />
  </div>
</section>

<style>
  .piano-card {
    display: grid;
    gap: 1rem;
    padding: 1.35rem;
  }

  .header {
    display: grid;
    gap: 0.55rem;
  }

  h2 {
    font-size: clamp(1.5rem, 3vw, 2.1rem);
  }

  .copy {
    max-width: 42rem;
  }

  .stage {
    padding: 0.85rem;
    border-radius: calc(var(--radius-lg) - 0.3rem);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(229, 226, 219, 0.92)),
      linear-gradient(135deg, rgba(47, 101, 120, 0.06), rgba(146, 74, 44, 0.08));
    box-shadow: inset 0 0 0 1px var(--line-soft);
  }
</style>
