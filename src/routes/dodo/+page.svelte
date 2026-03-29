<script lang="ts">
  // /dodo — index redirect hint
</script>

<div class="dodo-index">
  <p class="hint">nothing to see here. try <a href="/dodo/arch">/arch</a>, <a href="/dodo/theory">/theory</a>, or <a href="/dodo/plans">/plans</a>.</p>
</div>

<style>
  .dodo-index {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
  }

  .hint {
    font-size: 0.85rem;
    color: #3f3f46;
    letter-spacing: 0.05em;
  }

  .hint a {
    color: #52525b;
    text-decoration: none;
    border-bottom: 1px dashed #3f3f46;
    transition: color 0.2s;
  }

  .hint a:hover {
    color: #a78bfa;
  }
</style>
