// The document shell shared by every page: head/SEO, navigation with language switcher, footer.
import { readFileSync } from 'node:fs';
import { site } from '../../content/site.js';
import { absolute, escapeHtml, languageName, languages, ogLocale, rel, routes } from './util.js';

const globeIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';

// Official, localized App Store badge (public/images/badges, from Apple's marketing artwork).
// Per Apple's guidelines: the preferred black badge, unmodified and unanimated.
const badgeRatio = Object.fromEntries(
  languages.map((lang) => {
    const svg = readFileSync(new URL(`../../public/images/badges/app-store-${lang}.svg`, import.meta.url), 'utf8');
    const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    return [lang, w / h];
  }),
);

/** The "Download on the App Store" badge. `height` in CSS pixels (min. 40). */
export function storeBadge(t, lang, { height = 48 } = {}) {
  const width = Math.round(height * badgeRatio[lang]);
  return `<div class="badges" style="--badge-h: ${height}px">
              <a class="badge" href="${site.appStoreUrl}"><img src="/images/badges/app-store-${lang}.svg" width="${width}" height="${height}" alt="${t.common.appStoreBadge}" /></a>
            </div>`;
}

const moonIcon = '<svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>';
const sunIcon =
  '<svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>';

/** Icon-only light/dark switch; main.js sets its label to the action it performs. */
function themeToggle(t) {
  return `<button type="button" class="theme-toggle" data-theme-toggle aria-label="${t.common.themeToDark}" data-label-dark="${t.common.themeToDark}" data-label-light="${t.common.themeToLight}">${moonIcon}${sunIcon}</button>`;
}

/** Links to the same page in every language. */
function languageSwitcher({ lang, page, dir, t, variant }) {
  const items = languages
    .map((code) => {
      const current = code === lang;
      return `<li><a href="${rel(dir, routes[page](code))}" hreflang="${code}" lang="${code}" data-lang="${code}"${
        current ? ' aria-current="page"' : ''
      }>${languageName(code)}</a></li>`;
    })
    .join('');
  return `<details class="lang lang--${variant}" data-lang-menu>
    <summary aria-label="${t.common.chooseLanguage}: ${languageName(lang)}">${globeIcon}<span>${lang.toUpperCase()}</span></summary>
    <ul class="lang__menu" role="list">${items}</ul>
  </details>`;
}

export function renderDocument({ lang, t, page, title, description, content, head = '', ogTitle, ogDescription, bodyClass = '' }) {
  const dir = routes[page](lang);
  const home = routes.home(lang);
  const url = absolute(dir);
  const onHome = page === 'home';
  const section = (id) => (onHome ? `#${id}` : `${rel(dir, home)}#${id}`);

  const alternates = languages
    .map((code) => `<link rel="alternate" hreflang="${code}" href="${absolute(routes[page](code))}" />`)
    .join('\n    ');

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${absolute(routes[page](languages[0]))}" />
    <meta name="theme-color" content="#09042d" />
    <meta name="color-scheme" content="light dark" />
    <meta name="apple-itunes-app" content="app-id=${site.appStoreId}" />
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ImgZen" />
    <meta property="og:locale" content="${ogLocale(lang)}" />
    <meta property="og:title" content="${escapeHtml(ogTitle ?? title)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription ?? description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${absolute('og-image.png')}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(t.meta.ogImageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    ${head}
    <script>
      document.documentElement.classList.add('js');
      try {
        var theme = localStorage.getItem('imgzen.theme');
        if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
      } catch (e) {}
    </script>
    <link rel="stylesheet" href="/src/styles/main.css" />
    <script type="module" src="/src/main.js"></script>
  </head>

  <body class="${bodyClass}">
    <a class="skip-link" href="#main">${t.common.skip}</a>

    <header class="nav${onHome ? '' : ' is-solid nav--static'}" data-nav>
      <div class="nav__inner">
        <a class="nav__brand" href="${onHome ? '#top' : rel(dir, home)}" aria-label="${onHome ? t.common.backToTop : t.common.home}">
          <img src="/favicon.png" width="28" height="28" alt="" />
          <span>ImgZen</span>
        </a>
        <nav class="nav__links" aria-label="${t.common.sections}">
          <a href="${section('formats')}">${t.nav.formats}</a>
          <a href="${section('how')}">${t.nav.how}</a>
          <a href="${section('ipad')}">${t.nav.ipad}</a>
          <a href="${section('privacy')}">${t.nav.privacy}</a>
        </nav>
        ${themeToggle(t)}
        ${languageSwitcher({ lang, page, dir, t, variant: 'nav' })}
        <a class="nav__cta" href="${site.appStoreUrl}">${t.common.download}</a>
      </div>
    </header>

    <main id="main">
${content}
    </main>

    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__top">
          <a class="footer__brand" href="${rel(dir, home)}">
            <img src="/favicon.png" width="24" height="24" alt="" />
            <span>ImgZen</span>
          </a>
          ${languageSwitcher({ lang, page, dir, t, variant: 'footer' })}
        </div>
        <nav class="footer__links" aria-label="${t.footer.label}">
          <a href="${rel(dir, routes.privacy(lang))}"${page === 'privacy' ? ' aria-current="page"' : ''}>${t.footer.privacy}</a>
          <a href="${rel(dir, routes.terms(lang))}"${page === 'terms' ? ' aria-current="page"' : ''}>${t.footer.terms}</a>
          <a href="mailto:${site.feedbackEmail}">${t.footer.feedback}</a>
          <a href="${site.githubUrl}">${t.footer.github}</a>
        </nav>
        <p class="footer__disclaimer">${t.footer.disclaimer}</p>
        <p class="footer__copy">© ${new Date().getFullYear()} ${site.developer.name}</p>
      </div>
    </footer>
  </body>
</html>
`;
}
