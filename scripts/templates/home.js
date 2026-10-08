// The landing page, one per language.
import { site } from '../../content/site.js';
import { defaultQuality, formats, qualities, sample } from '../../content/formats.js';
import devices from '../../content/devices.json' with { type: 'json' };
import { renderDocument, storeBadge } from './layout.js';
import { escapeHtml, fill, rel, routes } from './util.js';

const deviceSizes = {
  iphone: '(min-width: 960px) 340px, 70vw',
  ipad: '(min-width: 1100px) 1000px, 94vw',
};

/**
 * A screenshot inside its device frame (composited by scripts/build-images.mjs), taken from the
 * app running in the page's language. It follows the visitor's light/dark appearance.
 */
function device(lang, kind, name, { alt, className = '', eager = false }) {
  const { width, height, widths } = devices[kind];
  const set = (scheme) => widths.map((w) => `/images/devices/${lang}/${name}-${scheme}-${w}.webp ${w}w`).join(', ');
  const fallback = `/images/devices/${lang}/${name}-light-${widths[0]}.webp`;
  const loading = eager ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<figure class="device device--${kind}${className ? ` ${className}` : ''}">
              <picture>
                <source srcset="${set('dark')}" sizes="${deviceSizes[kind]}" media="(prefers-color-scheme: dark)" data-dark-source />
                <img src="${fallback}" srcset="${set('light')}" sizes="${deviceSizes[kind]}" width="${width}" height="${height}"${loading} alt="${escapeHtml(alt)}" />
              </picture>
            </figure>`;
}

const icons = {
  stack: '<rect x="4" y="8" width="13" height="12" rx="2.5" /><path d="M8 5h9.5A2.5 2.5 0 0 1 20 7.5V16" />',
  dial: '<path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4-5" />',
  check: '<circle cx="12" cy="12" r="8" /><path d="M8.5 12.5l2.3 2.3 4.7-5" />',
  share: '<path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M6 11H5v9h14v-9h-1" />',
  drop: '<path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14" /><path d="M12 4v11" /><path d="M8 11l4 4 4-4" />',
  restore: '<path d="M5 5l14 14M19 5L5 19" />',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />',
  picker: '<rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9.5" r="1.6" /><path d="M5 17l4.5-4.5 3 3L15 13l4 4" />',
  noAccount: '<circle cx="12" cy="8" r="3.5" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /><path d="M4 4l16 16" />',
};
const icon = (name, className) => `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;

/** Sizes as the app shows them: one decimal, the language's decimal separator. */
const megabytes = (lang, mb) =>
  `${new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(mb)} MB`;

const largest = Math.max(...formats.map((f) => (f.lossy ? Math.max(...Object.values(f.megabytes)) : f.megabytes)));
const barWidth = (mb) => `${Math.max(2, (mb / largest) * 100).toFixed(1)}%`;

/** The interactive format explorer: every format's size for the sample photo, per quality level. */
function explorer(t, lang) {
  const chips = qualities
    .map(
      (q) =>
        `<button type="button" class="chip" role="radio" aria-checked="${q === defaultQuality}" data-quality="${q}">${t.formats.qualities[q]}</button>`,
    )
    .join('\n                  ');

  const row = (f) => {
      const mb = f.lossy ? f.megabytes[defaultQuality] : f.megabytes;
      const sizes = f.lossy ? ` data-sizes='${JSON.stringify(f.megabytes)}'` : '';
      return `<li class="format${f.lossy ? '' : ' format--lossless'}"${sizes}>
                  <div class="format__head">
                    <span class="format__name">${f.name}</span>
                    <span class="format__size" data-size>${megabytes(lang, mb)}</span>
                  </div>
                  <div class="format__track" aria-hidden="true"><span class="format__bar" data-bar style="width: ${barWidth(mb)}"></span></div>
                  <p class="format__note">${t.formats.subtitles[f.id]}</p>
                </li>`;
  };
  const list = (lossy) => formats.filter((f) => f.lossy === lossy).map(row).join('\n                ');

  return `<div class="explorer" data-explorer data-largest="${largest}" data-lang="${lang}">
              <div class="explorer__top">
                <div class="explorer__sample">
                  <span class="explorer__label">${t.formats.sampleLabel}</span>
                  <span class="explorer__value">${fill(t.formats.sample, { size: megabytes(lang, sample.megabytes), format: sample.format })}</span>
                </div>
                <div class="explorer__quality">
                  <span class="explorer__label" id="quality-label">${t.formats.qualityLabel}</span>
                  <div class="chips" role="radiogroup" aria-labelledby="quality-label" data-quality-chips hidden>
                  ${chips}
                  </div>
                  <p class="explorer__hint" data-quality-hint>${t.formats.qualityHints[defaultQuality]}</p>
                </div>
              </div>
              <h3 class="explorer__group">${t.formats.lossy}</h3>
              <ul class="formats" role="list">
                ${list(true)}
              </ul>
              <h3 class="explorer__group">${t.formats.lossless}</h3>
              <ul class="formats" role="list">
                ${list(false)}
              </ul>
              <p class="explorer__fineprint">${t.formats.fineprint}</p>
              <script type="application/json" data-quality-hints>${JSON.stringify(t.formats.qualityHints)}</script>
            </div>`;
}

/** Redirects first-time visitors of the default-language home page to their browser's language. */
const languageRedirect = (dir) => `<script>
      (function () {
        try {
          if (localStorage.getItem('imgzen.lang')) return;
          var supported = ${JSON.stringify(site.languages.map((l) => l.code).slice(1))};
          var preferred = (navigator.languages || [navigator.language]).map(function (l) { return String(l).slice(0, 2).toLowerCase(); });
          for (var i = 0; i < preferred.length; i++) {
            if (preferred[i] === '${site.languages[0].code}') return;
            if (supported.indexOf(preferred[i]) !== -1) { location.replace('${dir}' + preferred[i] + '/' + location.hash); return; }
          }
        } catch (e) {}
      })();
    </script>`;

/** The mountains and sun of the app icon, as the hero's backdrop. */
const landscape = `<svg class="hero__land" viewBox="0 0 1440 360" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="peak-far" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#5fb6ff" />
                <stop offset="1" stop-color="#4b3fd8" />
              </linearGradient>
              <linearGradient id="peak-near" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#8a6bff" />
                <stop offset="1" stop-color="var(--hero-ground)" />
              </linearGradient>
            </defs>
            <path class="peak peak--far" fill="url(#peak-far)" d="M0 300 L260 110 L470 260 L700 60 L960 250 L1180 120 L1440 280 V360 H0Z" />
            <path class="peak peak--near" fill="url(#peak-near)" d="M0 360 L0 290 L330 170 L600 330 L860 180 L1120 320 L1440 220 V360Z" />
          </svg>`;

export function renderHome(lang, t) {
  const dir = routes.home(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ImgZen',
    alternateName: t.meta.alternateName,
    applicationCategory: 'PhotographyApplication',
    operatingSystem: 'iOS, iPadOS',
    description: t.meta.description,
    url: site.url + dir,
    downloadUrl: site.appStoreUrl,
    image: `${site.url}og-image.png`,
    inLanguage: site.languages.map((l) => l.code),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Person', name: site.developer.name },
  };

  const head = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>${
    dir === '' ? `\n    ${languageRedirect(rel(dir, ''))}` : ''
  }`;

  const content = `
      <!-- Hero -->
      <section class="hero" id="top" aria-labelledby="hero-title">
        <div class="hero__copy container">
          <p class="hero__eyebrow intro">
            <img src="/images/icon-256.webp" width="56" height="56" alt="" class="hero__icon" />
            <span>${t.hero.eyebrow}</span>
          </p>
          <h1 class="hero__title intro" id="hero-title">${t.hero.title}</h1>
          <p class="hero__lede intro">${t.hero.lede}</p>
          <div class="hero__actions">
            ${storeBadge(t, lang)}
            <a class="link-arrow link-arrow--light intro" href="#formats">${t.hero.secondary}</a>
          </div>
          <p class="hero__meta intro">${t.hero.meta}</p>
        </div>

        <div class="hero__stage">
          <div class="hero__sun" aria-hidden="true"></div>
          ${landscape}
          ${device(lang, 'iphone', 'iphone-gallery', { alt: t.hero.phoneAlt, className: 'hero__phone', eager: true })}
        </div>
      </section>

      <!-- At a glance -->
      <section class="glance" aria-label="${t.glance.label}">
        <ul class="glance__list container" role="list">
          <li><strong>${formats.length}</strong><span>${t.glance.formats}</span></li>
          <li><strong>${qualities.length}</strong><span>${t.glance.qualities}</span></li>
          <li><strong>0</strong><span>${t.glance.uploads}</span></li>
          <li><strong>0</strong><span>${t.glance.accounts}</span></li>
        </ul>
      </section>

      <!-- Formats -->
      <section class="section" id="formats" aria-labelledby="formats-title">
        <div class="container split split--explorer">
          <div class="split__copy">
            <p class="eyebrow reveal" style="--accent: var(--violet)">${t.formats.eyebrow}</p>
            <h2 class="section__title reveal" id="formats-title">${t.formats.title}</h2>
            <p class="section__lede reveal">${t.formats.lede}</p>
            <ul class="ticks reveal" role="list">
              ${t.formats.ticks.map((tick) => `<li>${tick}</li>`).join('\n              ')}
            </ul>
          </div>
          <div class="split__visual reveal">
            ${explorer(t, lang)}
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="section section--alt" id="how" aria-labelledby="how-title">
        <div class="container">
          <header class="section__header section__header--center">
            <p class="eyebrow reveal" style="--accent: var(--orange)">${t.how.eyebrow}</p>
            <h2 class="section__title reveal" id="how-title">${t.how.title}</h2>
            <p class="section__lede reveal">${t.how.lede}</p>
          </header>
          <ol class="steps" role="list">
            ${t.how.steps
              .map(
                (step, i) => `<li class="step reveal">
              ${device(lang, 'iphone', ['iphone-picker', 'iphone-format', 'iphone-results'][i], { alt: step.alt, className: 'device--sm' })}
              <h3>${step.title}</h3>
              <p>${step.body}</p>
            </li>`,
              )
              .join('\n            ')}
          </ol>
        </div>
      </section>

      <!-- Details -->
      <section class="section" id="details" aria-labelledby="details-title">
        <div class="container">
          <header class="section__header">
            <p class="eyebrow reveal" style="--accent: var(--blue)">${t.details.eyebrow}</p>
            <h2 class="section__title reveal" id="details-title">${t.details.title}</h2>
          </header>
          <ul class="cards" role="list">
            ${t.details.cards
              .map(
                (card, i) => `<li class="card reveal">
              ${icon(['stack', 'dial', 'check', 'share', 'drop', 'restore'][i], 'card__icon')}
              <h3>${card.title}</h3>
              <p>${card.body}</p>
            </li>`,
              )
              .join('\n            ')}
          </ul>
        </div>
      </section>

      <!-- iPad -->
      <section class="section section--ipad" id="ipad" aria-labelledby="ipad-title">
        <div class="container">
          <header class="section__header section__header--center">
            <p class="eyebrow reveal" style="--accent: var(--pink)">${t.ipad.eyebrow}</p>
            <h2 class="section__title reveal" id="ipad-title">${t.ipad.title}</h2>
            <p class="section__lede reveal">${t.ipad.lede}</p>
          </header>
          ${device(lang, 'ipad', 'ipad-gallery', { alt: t.ipad.alt, className: 'ipad__device reveal' })}
          <ul class="ipad__points" role="list">
            ${t.ipad.points.map((point) => `<li class="reveal">${point}</li>`).join('\n            ')}
          </ul>
        </div>
      </section>

      <!-- Privacy -->
      <section class="section section--alt" id="privacy" aria-labelledby="privacy-title">
        <div class="container">
          <header class="section__header section__header--center">
            <p class="eyebrow reveal" style="--accent: var(--green)">${t.privacy.eyebrow}</p>
            <h2 class="section__title reveal" id="privacy-title">${t.privacy.title}</h2>
            <p class="section__lede reveal">${t.privacy.lede}</p>
            <p class="section__link reveal"><a class="link-arrow" href="${rel(dir, routes.privacy(lang))}">${t.privacy.link}</a></p>
          </header>

          <ul class="pillars" role="list">
            ${t.privacy.pillars
              .map(
                (pillar, i) => `<li class="pillar reveal">
              <svg viewBox="0 0 24 24" aria-hidden="true">${icons[['lock', 'picker', 'noAccount'][i]]}</svg>
              <h3>${pillar.title}</h3>
              <p>${pillar.body}</p>
            </li>`,
              )
              .join('\n            ')}
          </ul>
        </div>
      </section>

      <!-- Download CTA -->
      <section class="cta" id="download" aria-labelledby="cta-title">
        <div class="cta__sun" aria-hidden="true"></div>
        <div class="container cta__inner">
          <img class="cta__icon reveal" src="/images/icon-256.webp" width="112" height="112" alt="${escapeHtml(t.cta.iconAlt)}" loading="lazy" />
          <h2 class="cta__title reveal" id="cta-title">${t.cta.title}</h2>
          <p class="cta__lede reveal">${t.cta.lede}</p>
          ${storeBadge(t, lang, { height: 56 })}
          <p class="cta__meta reveal">${t.cta.meta}</p>
        </div>
      </section>`;

  return renderDocument({
    lang,
    t,
    page: 'home',
    title: t.meta.title,
    description: t.meta.description,
    ogTitle: t.meta.ogTitle,
    ogDescription: t.meta.ogDescription,
    head,
    content,
  });
}
