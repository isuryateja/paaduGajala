<script lang="ts">
  export let levels: number[] = [];
</script>

<section class="meter-panel" aria-label="Signal peak meter">
  <label>Signal Peak (VU)</label>

  <div class="meter-bars" aria-hidden="true">
    {#each levels as level, index}
      <div class:hot={index === levels.length - 2} class:peak={index === levels.length - 3} class="meter-bar">
        <span style={`height:${Math.round(level * 100)}%;`}></span>
      </div>
    {/each}
  </div>
</section>

<style>
  .meter-panel {
    display: grid;
    gap: 0.75rem;
    padding: 1rem 1.1rem 1.15rem;
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-radius: 1.15rem;
    background: linear-gradient(180deg, rgba(62, 60, 57, 0.92), rgba(84, 82, 79, 0.92));
    box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.08);
  }

  label {
    color: rgba(190, 192, 194, 0.78);
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .meter-bars {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.45rem;
    align-items: end;
    min-height: 3.25rem;
  }

  .meter-bar {
    display: flex;
    align-items: end;
    height: 3.25rem;
  }

  .meter-bar span {
    display: block;
    width: 100%;
    border-radius: 0.22rem;
    background: rgba(111, 163, 184, 0.56);
    box-shadow: 0 0 12px rgba(111, 163, 184, 0.12);
  }

  .meter-bar.peak span {
    background: #6fa3b8;
    box-shadow: 0 0 16px rgba(111, 163, 184, 0.32);
  }

  .meter-bar.hot span {
    background: #924a2c;
    box-shadow: 0 0 16px rgba(146, 74, 44, 0.34);
  }
</style>
