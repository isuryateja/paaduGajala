<script lang="ts">
  import { page } from '$app/stores';

  const tabItems = [
    { href: '/', label: 'Swara to Sruti' },
    { href: '/sruti-to-swara', label: 'Sruti to Swara' },
    { href: '/theory', label: 'Theory' }
  ];

  function isActive(pathname: string, href: string): boolean {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  function getUtilityLabel(pathname: string): string {
    if (pathname.startsWith('/theory')) {
      return 'Theory';
    }

    if (pathname.startsWith('/piano')) {
      return 'Standalone Piano';
    }

    if (pathname.startsWith('/sruti-to-swara')) {
      return 'Sruti to Swara';
    }

    return 'Swara to Sruti';
  }
</script>

<header class="app-header">
  <a class="brand" href="/">
    <span class="brand-top">పాడు గజాల</span>
    <span class="brand-bottom">Paadu Gajala</span>
  </a>

  <nav class="nav" aria-label="Primary">
    {#each tabItems as item}
      <a href={item.href} class:active={isActive($page.url.pathname, item.href)} class="nav-link">{item.label}</a>
    {/each}
  </nav>

  <div class="utility">
    <span class="utility-label">{getUtilityLabel($page.url.pathname)}</span>
  </div>
</header>

<style>
  .app-header {
    display: grid;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem 0 0.5rem;
  }

  .brand {
    display: inline-grid;
    justify-self: start;
    gap: 0.1rem;
  }

  .brand-top {
    color: var(--text-strong);
    font-family: 'Sora', sans-serif;
    font-size: clamp(1.1rem, 2vw, 1.45rem);
    font-weight: 800;
    letter-spacing: -0.04em;
  }

  .brand-bottom,
  .utility-label {
    color: var(--text-muted);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    min-height: 2.4rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    color: var(--text-body);
    background: var(--surface-overlay);
    box-shadow: inset 0 0 0 1px var(--line-soft);
    font-size: 0.92rem;
    font-weight: 700;
  }

  .nav-link.active {
    background: var(--surface-contrast);
    color: var(--text-inverse);
    box-shadow: 0 12px 24px rgba(31, 42, 48, 0.18);
  }

  .utility {
    justify-self: start;
  }

  @media (min-width: 860px) {
    .app-header {
      grid-template-columns: auto 1fr auto;
    }

    .nav {
      justify-content: center;
    }

    .utility {
      justify-self: end;
    }
  }
</style>
