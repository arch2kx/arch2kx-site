// Theme Changing

document.documentElement.classList.remove('preload');
document.documentElement.style.removeProperty('background-color');
document.documentElement.style.removeProperty('color');
document.documentElement.style.removeProperty('color-scheme');

const DEFAULT_PAGE = 'main';

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
  const fswindow = document.getElementById('funStuffScrollTop');

  fswindow?.addEventListener('click', (): void => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });

  darkToggle?.addEventListener('click', () => {
    const html = document.documentElement;

    html.classList.toggle('dark');

    localStorage.setItem(
      'theme',
      html.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  function showPage(pageId: string, skipAnim = false) {
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

    const button = document.getElementById("funStuffScrollTop") as HTMLButtonElement | null;

    const scrollToTop = (): void => {
      window.scrollTo({
        top: 0,
        behavior: "instant"
      });
    };

    if (button) {
      button.addEventListener("click", scrollToTop);
    }

    document.querySelectorAll<HTMLElement>('.nav-btn').forEach(btn => {
      const btnPage = btn.dataset.page;
      btn.classList.toggle('active', btnPage === pageId);
    });
  }

  const pageLinks = document.querySelectorAll<HTMLElement>('[data-page]');

  pageLinks.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();

      const pageId = el.dataset.page;
      if (!pageId) return;

      history.pushState({ page: pageId }, '', pageId === 'main' ? '/' : '/' + pageId);
      showPage(pageId, el.classList.contains('nav-btn'));
    });
  });

  window.addEventListener('popstate', (e: PopStateEvent) => {
    const state = e.state as PageState;

    showPage(state?.page || DEFAULT_PAGE, true);
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
