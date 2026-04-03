<script lang="ts">
  export let path = '';
  export let active = false;
</script>

<section class="scope-panel" aria-label="Oscilloscope panel">
  <div class="panel-header">
    <span>Oscilloscope-Alpha</span>
    <span class:active class="scope-status">{active ? 'Sampling' : 'Idle'}</span>
  </div>

  <div class="scope-screen">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={path}></path>
    </svg>
    <div class="scope-grid" aria-hidden="true"></div>
  </div>
</section>

<style>
  .scope-panel {
    display: grid;
    gap: 0.55rem;
    min-height: 13rem;
    padding: 1rem;
    border: 4px solid #5d5a56;
    border-radius: 1.2rem;
    background: linear-gradient(180deg, #151515, #21211f);
    box-shadow: inset 0 10px 24px rgba(0, 0, 0, 0.34);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    color: rgba(154, 206, 228, 0.68);
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .scope-status {
    color: rgba(146, 74, 44, 0.8);
  }

  .scope-status.active {
    color: rgba(111, 163, 184, 0.95);
  }

  .scope-screen {
    position: relative;
    overflow: hidden;
    border-radius: 0.9rem;
    background:
      linear-gradient(180deg, rgba(31, 42, 48, 0.12), transparent),
      linear-gradient(180deg, rgba(5, 5, 5, 0.16), rgba(7, 7, 7, 0.18)),
      rgba(9, 9, 9, 0.78);
  }

  .scope-screen svg,
  .scope-grid {
    position: absolute;
    inset: 0;
  }

  .scope-screen svg {
    width: 100%;
    height: 100%;
  }

  path {
    fill: none;
    stroke: #6fa3b8;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 10px rgba(111, 163, 184, 0.42));
  }

  .scope-grid {
    background:
      linear-gradient(rgba(111, 163, 184, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(111, 163, 184, 0.06) 1px, transparent 1px);
    background-size: 12.5% 20%;
    opacity: 0.65;
    pointer-events: none;
  }
</style>
