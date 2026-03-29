<script lang="ts">
  export let activeTab: 'swara-to-sruti' | 'sruti-to-swara' | 'theory' = 'swara-to-sruti';

  const navItems = [
    { id: 'swara-to-sruti', href: '/', label: 'Swara to Sruti' },
    { id: 'sruti-to-swara', href: '/sruti-to-swara', label: 'Sruti to Swara' },
    { id: 'theory', href: '/theory', label: 'Theory' }
  ] as const;
</script>

<div class="reference-page">
  <header class="reference-header">
    <div class="header-inner">
      <div class="brand">పాడు గజాల</div>

      <nav class="desktop-nav" aria-label="Primary">
        {#each navItems as item}
          <a href={item.href} class:active={activeTab === item.id} class="desktop-link">{item.label}</a>
        {/each}
      </nav>

      <div class="account-slot" aria-hidden="true">
        <span class="material-symbols-outlined">account_circle</span>
      </div>
    </div>
  </header>

  <main class="reference-main">
    <slot />
  </main>

  <footer class="reference-footer">
    <div class="footer-inner">
      <div class="footer-brand">పాడు గజాల</div>

      <div class="footer-links">
        <a href="/">Terms of Berth</a>
        <a href="/">Privacy Policy</a>
        <a href="/">Contact Station Master</a>
      </div>

      <div class="footer-meta">© 1994 The Rhythmic Rail Conservatory</div>
    </div>
  </footer>

  <nav class="mobile-dock" aria-label="Mobile shortcuts">
    <div class:active={activeTab === 'swara-to-sruti'} class="mobile-item">
      <span class="material-symbols-outlined">library_music</span>
      <span>Lessons</span>
    </div>
    <div class:active={activeTab === 'sruti-to-swara'} class="mobile-item">
      <span class="material-symbols-outlined">settings_input_component</span>
      <span>Practice</span>
    </div>
    <div class:active={activeTab === 'theory'} class="mobile-item">
      <span class="material-symbols-outlined">music_note</span>
      <span>Ragas</span>
    </div>
    <div class="mobile-item">
      <span class="material-symbols-outlined">person</span>
      <span>Profile</span>
    </div>
  </nav>
</div>

<style>
  .reference-page {
    min-height: 100vh;
    background: var(--bg-canvas);
    color: var(--text-strong);
    font-family: 'Inter', sans-serif;
    padding-bottom: 6.5rem;
  }

  .reference-header {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid #f1eee7;
    background: #fcf9f2;
  }

  .header-inner,
  .reference-main,
  .footer-inner {
    width: min(1280px, calc(100vw - 3rem));
    margin: 0 auto;
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.25rem 0;
  }

  .brand,
  .footer-brand {
    color: #2f6578;
    font-family: 'Montserrat', sans-serif;
    font-size: 1.55rem;
    font-weight: 900;
    letter-spacing: -0.06em;
    text-transform: uppercase;
  }

  .desktop-nav {
    display: none;
    align-items: center;
    gap: 2.5rem;
  }

  .desktop-link {
    color: rgba(47, 101, 120, 0.6);
    font-family: 'Montserrat', sans-serif;
    font-size: 0.86rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding-bottom: 0.25rem;
    transition: color 180ms ease;
  }

  .desktop-link:hover {
    color: #924a2c;
  }

  .desktop-link.active {
    color: #2f6578;
    border-bottom: 2px solid #924a2c;
  }

  .account-slot {
    color: #2f6578;
    font-size: 2rem;
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 500,
      'GRAD' 0,
      'opsz' 24;
  }

  .reference-main {
    display: grid;
    gap: 2.25rem;
    padding: 2rem 0 0;
  }

  .reference-footer {
    margin-top: 5rem;
    border-top: 1px solid #f1eee7;
    background: #f6f3ec;
    padding: 4rem 0;
  }

  .footer-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
  }

  .footer-links a,
  .footer-meta {
    color: rgba(47, 101, 120, 0.6);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .footer-links a:hover {
    color: #2f6578;
  }

  .footer-meta {
    color: rgba(47, 101, 120, 0.4);
    letter-spacing: 0.2em;
  }

  .mobile-dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 45;
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem 1.5rem;
    border-radius: 2.5rem 2.5rem 0 0;
    background: #2f6578;
    box-shadow: 0 -12px 32px rgba(31, 42, 48, 0.24);
  }

  .mobile-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    color: rgba(252, 249, 242, 0.6);
    padding: 0.5rem 0.8rem;
  }

  .mobile-item span:last-child {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.56rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    text-transform: uppercase;
  }

  .mobile-item.active {
    border-radius: 1rem;
    background: #6fa3b8;
    color: #fcf9f2;
    padding: 0.75rem 1.5rem;
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
    }

    .mobile-dock {
      display: none;
    }

    .reference-page {
      padding-bottom: 0;
    }

    .footer-inner {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }

  @media (max-width: 767px) {
    .header-inner,
    .reference-main,
    .footer-inner {
      width: min(1280px, calc(100vw - 2rem));
    }

    .reference-header {
      position: relative;
    }
  }
</style>
