<script lang="ts">
  export let tabLabel = 'Placeholder';
  export let title = 'Reserved tab';
  export let description = 'This route is intentionally left empty for now, but it uses the same visual system as the primary notation page.';
</script>

<section class="placeholder-wrap">
  <section class="hero-panel">
    <div class="hero-copy">
      <p class="eyebrow">{tabLabel}</p>
      <h1>{title}</h1>
      <p class="lede">{description}</p>
    </div>

    <div class="status-chip">Placeholder</div>
  </section>

  <section class="content-panel">
    <div class="content-header">
      <div class="accent-bar"></div>
      <h2>Workspace Reserved</h2>
    </div>

    <div class="empty-stage">
      <div class="empty-card">
        <span class="badge">Empty state</span>
        <p class="empty-title">No modules wired yet</p>
        <p class="empty-copy">
          The route is active in the information architecture, but the working surface has been intentionally left blank until we build it.
        </p>
      </div>
    </div>
  </section>
</section>

<style>
  .placeholder-wrap {
    display: grid;
    gap: 2rem;
  }

  .hero-panel,
  .content-panel {
    border: 1px solid #ebe8e1;
    border-radius: 1.5rem;
    background: #f6f3ec;
    box-shadow: 0 4px 12px rgba(31, 42, 48, 0.04);
  }

  .hero-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
  }

  .hero-copy {
    display: grid;
    gap: 0.9rem;
    max-width: 40rem;
  }

  .eyebrow {
    color: #6fa3b8;
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(2.8rem, 7vw, 5rem);
    font-weight: 900;
    letter-spacing: -0.06em;
    line-height: 0.92;
    text-transform: uppercase;
    max-width: 10ch;
  }

  .lede {
    color: #40484c;
    font-size: 1rem;
    line-height: 1.7;
    max-width: 36rem;
  }

  .status-chip {
    display: inline-flex;
    width: fit-content;
    min-height: 2rem;
    align-items: center;
    padding: 0.35rem 1rem;
    border: 1px solid rgba(111, 163, 184, 0.2);
    border-radius: 999px;
    background: rgba(111, 163, 184, 0.1);
    color: #6fa3b8;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .content-panel {
    display: grid;
    gap: 1.5rem;
    padding: 2rem;
  }

  .content-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .accent-bar {
    width: 0.4rem;
    height: 1.5rem;
    border-radius: 999px;
    background: #2f6578;
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

  .empty-stage {
    min-height: 24rem;
    display: grid;
    place-items: center;
    border-radius: 1.5rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(229, 226, 219, 0.5));
    box-shadow: inset 0 0 0 1px rgba(192, 200, 204, 0.28);
    padding: 2rem;
  }

  .empty-card {
    display: grid;
    gap: 0.85rem;
    max-width: 25rem;
    padding: 1.5rem;
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: inset 0 0 0 1px rgba(192, 200, 204, 0.35);
  }

  .badge {
    display: inline-flex;
    width: fit-content;
    min-height: 2rem;
    align-items: center;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    background: rgba(170, 218, 254, 0.5);
    color: #2f6578;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .empty-title {
    color: #1c1c18;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }

  .empty-copy {
    color: #71787c;
    line-height: 1.7;
  }

  @media (max-width: 767px) {
    .hero-panel,
    .content-panel {
      padding: 1.25rem;
      border-radius: 1.2rem;
    }

    .empty-stage {
      min-height: 18rem;
      padding: 1.25rem;
    }
  }
</style>
