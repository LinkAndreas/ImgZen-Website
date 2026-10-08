import { initExplorer } from './explorer.js';

// Nav: transparent over the hero, frosted once the page scrolls past it.
const nav = document.querySelector('[data-nav]');
const hero = document.querySelector('.hero');
if (nav && hero && !nav.classList.contains('nav--static')) {
  new IntersectionObserver(([entry]) => nav.classList.toggle('is-solid', !entry.isIntersecting), {
    // Turn solid once only the nav's own height of the hero is left on screen.
    rootMargin: '0px 0px -100% 0px',
  }).observe(hero);
}

// Scroll reveal, staggered within each parent.
const revealer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  el.style.setProperty('--delay', `${Math.min(siblings.indexOf(el), 4) * 0.08}s`);
  revealer.observe(el);
});

initExplorer(document.querySelector('[data-explorer]'));

// Language menus: remember an explicit choice (the default-language home page uses it to
// skip its browser-language redirect), and close the menu on outside click or Escape.
document.querySelectorAll('[data-lang]').forEach((link) =>
  link.addEventListener('click', () => {
    try {
      localStorage.setItem('imgzen.lang', link.dataset.lang);
    } catch {
      // Storage unavailable (private mode) — the choice just isn't remembered.
    }
  }),
);
const menus = [...document.querySelectorAll('[data-lang-menu]')];
document.addEventListener('click', (event) => {
  menus.forEach((menu) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  menus.forEach((menu) => {
    if (!menu.open) return;
    menu.open = false;
    menu.querySelector('summary').focus();
  });
});

// Appearance toggle. Without a stored choice the page follows the system setting (see the
// inline script in <head>); a click stores the opposite of what's currently shown.
const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme ?? (systemDark.matches ? 'dark' : 'light');

function applyTheme() {
  const chosen = root.dataset.theme;
  // Screenshot <picture>s pick their dark variant by media query; point it at the chosen theme.
  document.querySelectorAll('source[data-dark-source]').forEach((source) => {
    source.media = chosen === 'dark' ? 'all' : chosen === 'light' ? 'not all' : '(prefers-color-scheme: dark)';
  });
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-label', currentTheme() === 'dark' ? button.dataset.labelLight : button.dataset.labelDark);
  });
}

document.querySelectorAll('[data-theme-toggle]').forEach((button) =>
  button.addEventListener('click', () => {
    root.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('imgzen.theme', root.dataset.theme);
    } catch {
      // Storage unavailable — the choice lasts for this page only.
    }
    applyTheme();
  }),
);
systemDark.addEventListener('change', applyTheme);
applyTheme();
