<script lang="ts">
  export let sectionLabel = 'Placeholder';
  export let title = 'Coming soon';
  export let description = 'This section is reserved in the information architecture and will be filled in next.';
</script>

<section class="placeholder-shell">
  <div class="placeholder-copy">
    <p class="section-label">{sectionLabel}</p>
    <h1>{title}</h1>
    <p class="description">{description}</p>
  </div>

  <div class="placeholder-stage">
    <div class="placeholder-card">
      <span class="badge">Empty state</span>
      <p class="placeholder-title">No modules wired yet</p>
      <p class="placeholder-text">
        The tab exists in the navigation and route structure, but its working surface is intentionally left blank for now.
      </p>
    </div>
  </div>
</section>

<style>
  .placeholder-shell {
    display: grid;
    gap: 2rem;
    padding: 2rem 0 4rem;
  }

  .placeholder-copy {
    display: grid;
    gap: 0.9rem;
    max-width: 40rem;
  }

  h1 {
    font-size: clamp(2.8rem, 7vw, 5.2rem);
    line-height: 0.92;
    max-width: 10ch;
  }

  .description {
    max-width: 34rem;
    color: var(--text-body);
    font-size: 1.02rem;
  }

  .placeholder-stage {
    min-height: 24rem;
    display: grid;
    place-items: center;
    padding: 2rem;
    border-radius: var(--radius-xl);
    background:
      radial-gradient(circle at top right, var(--bg-glow-primary), transparent 28%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(246, 243, 236, 0.92));
    box-shadow: var(--shadow-panel);
    position: relative;
    overflow: hidden;
  }

  .placeholder-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(192, 200, 204, 0.32);
    border-radius: inherit;
    pointer-events: none;
  }

  .placeholder-card {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0.85rem;
    max-width: 24rem;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    text-align: left;
  }

  .badge {
    display: inline-flex;
    width: fit-content;
    min-height: 2rem;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    background: var(--accent-secondary-soft);
    color: var(--accent-secondary);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .placeholder-title {
    color: var(--text-strong);
    font-family: 'Sora', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.04em;
  }

  .placeholder-text {
    color: var(--text-muted);
    line-height: 1.7;
  }
</style>
