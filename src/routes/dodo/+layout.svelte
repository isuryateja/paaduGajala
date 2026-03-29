<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/dodo/arch', label: 'arch' },
    { href: '/dodo/theory', label: 'theory' },
    { href: '/dodo/plans', label: 'plans' },
  ];
</script>

<div class="dodo-shell">
  <header class="dodo-header">
    <span class="dodo-badge">🦤 dodo</span>
    <nav class="dodo-nav">
      {#each links as link}
        <a
          href={link.href}
          class="dodo-link"
          class:active={$page.url.pathname === link.href}
        >{link.label}</a>
      {/each}
    </nav>
  </header>

  <main class="dodo-main">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    background: #0a0a0c;
    color: #d4d4d8;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  }

  .dodo-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0a0a0c;
  }

  .dodo-header {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1rem 2rem;
    border-bottom: 1px solid #1e1e2e;
    background: #0d0d10;
  }

  .dodo-badge {
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #52525b;
    user-select: none;
  }

  .dodo-nav {
    display: flex;
    gap: 1.5rem;
  }

  .dodo-link {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-decoration: none;
    color: #52525b;
    text-transform: lowercase;
    transition: color 0.2s ease;
    padding-bottom: 2px;
    border-bottom: 1px solid transparent;
  }

  .dodo-link:hover {
    color: #a1a1aa;
  }

  .dodo-link.active {
    color: #a78bfa;
    border-bottom-color: #a78bfa;
  }

  .dodo-main {
    flex: 1;
    padding: 3rem 2rem;
    max-width: 860px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }
</style>
