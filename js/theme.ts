// Theme Changing

document.documentElement.classList.remove('preload');
document.documentElement.style.removeProperty('background-color');
document.documentElement.style.removeProperty('color');
document.documentElement.style.removeProperty('color-scheme');

const DEFAULT_PAGE = 'main';

const PAGE_TITLES: Record<string, string> = {
  main: 'arch2k2x',
  about: 'About · arch2k2x',
  projects: 'Projects · arch2k2x',
  'fun-stuff': 'Fun Stuff · arch2k2x',
  guestbook: 'Guest Book · arch2k2x',
};

type PageState = {
  page: string;
} | null;

// Prevent browser from auto-restoring scroll position
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
history.scrollRestoration = 'manual';

window.addEventListener('load', (): void => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); // 'auto' ensures instant scroll on refresh
});

document.addEventListener('DOMContentLoaded', () => {
  const darkToggle = document.getElementById('dark-toggle') as HTMLButtonElement | null;

  let themeFadeTimer: number | undefined;

  function updateToggleLabel() {
    const isDark = document.documentElement.classList.contains('dark');
    darkToggle?.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  updateToggleLabel();

  darkToggle?.addEventListener('click', () => {
    const html = document.documentElement;

    html.classList.add('theme-fading');
    void html.offsetWidth;
    html.classList.toggle('dark');
    updateToggleLabel();

    window.clearTimeout(themeFadeTimer);
    themeFadeTimer = window.setTimeout(() => {
      html.classList.remove('theme-fading');
    }, 100);

    localStorage.setItem(
      'theme',
      html.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  // Animation or none for page transitions
  function focusPageHeading(page: HTMLElement) {
    const heading = page.querySelector<HTMLElement>('h1') ?? page;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function showPage(pageId: string, skipAnim = false, moveFocus = false) {
    const next = document.getElementById(pageId) as HTMLElement | null;
    if (!next) return;

    document.querySelectorAll<HTMLElement>('.page').forEach(p => {
      p.classList.remove('active', 'no-animate');
    });

    if (skipAnim) {
      next.classList.add('no-animate')
    }

    void next.offsetWidth;
    next.classList.add('active');

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.title = PAGE_TITLES[pageId] ?? PAGE_TITLES[DEFAULT_PAGE]!;

    document.querySelectorAll<HTMLElement>('.nav-btn').forEach(btn => {
      const isCurrent = btn.dataset.page === pageId;
      btn.classList.toggle('active', isCurrent);
      if (isCurrent) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    if (moveFocus) focusPageHeading(next);
  }

  document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (e) => {
    const active = document.querySelector<HTMLElement>('.page.active');
    if (!active) return;
    e.preventDefault();
    focusPageHeading(active);
  });

  const pageLinks = document.querySelectorAll<HTMLElement>('[data-page]');

  pageLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();

      const pageId = el.dataset.page;
      if (!pageId) return;

      history.pushState({ page: pageId }, '', pageId === 'main' ? '/' : '/' + pageId);
      showPage(pageId, el.classList.contains('nav-btn'), true);
    });
  });

  window.addEventListener('popstate', (e: PopStateEvent) => {
    const state = e.state as PageState;

    showPage(state?.page || DEFAULT_PAGE, true, true);
  });

  const redirect = sessionStorage.getItem('spa-redirect');

  if (redirect) {
    sessionStorage.removeItem('spa-redirect');

    const pageId = redirect.replace(/^\//, '').split('/')[0];

    if (pageId && document.getElementById(pageId)) {
      history.replaceState({ page: pageId }, '', pageId === 'main' ? '/' : '/' + pageId);
      showPage(pageId);
    } else {
      showPage(DEFAULT_PAGE);
    }
  } else {
    const path = location.pathname.replace(/^\//, '').split('/')[0];

    if (path && document.getElementById(path)) {
      showPage(path);
    } else {
      showPage(DEFAULT_PAGE);
    }
  }
});
