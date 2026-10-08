// Renders every page of the site into site/ (the Vite root), plus public/sitemap.xml and robots.txt.
// Run automatically by vite.config.js before dev and build; `npm run render` runs it on its own.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../content/site.js';
import { renderHome } from './templates/home.js';
import { renderLanguageRedirect, renderLegal } from './templates/legal.js';
import { languages, routes } from './templates/util.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'site');

const locales = Object.fromEntries(
  await Promise.all(languages.map(async (lang) => [lang, (await import(`../content/locales/${lang}.js`)).default])),
);

checkLocales(locales);

// Start clean, so pages removed from the templates don't linger.
for (const dir of [...languages.filter((l) => l !== languages[0]), 'privacy', 'termsofuse']) {
  await rm(path.join(out, dir), { recursive: true, force: true });
}

const pages = [];

async function write(dir, html) {
  const file = path.join(out, dir, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  pages.push(dir);
}

for (const lang of languages) {
  const t = locales[lang];
  await write(routes.home(lang), renderHome(lang, t));
  for (const [page, doc] of [['privacy', 'privacy'], ['terms', 'terms']]) {
    const body = await readFile(path.join(root, `content/legal/${doc}.${lang}.html`), 'utf8');
    await write(routes[page](lang), renderLegal(page, lang, t, body));
  }
}

await writeRedirect('privacy');
await writeRedirect('terms');

async function writeRedirect(page) {
  const dir = routes[page](languages[0]).replace(/[^/]+\/$/, '');
  const file = path.join(out, dir, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, renderLanguageRedirect(page));
}

// Sitemap with hreflang alternates for every localized page.
const groups = ['home', 'privacy', 'terms'];
const urls = groups.flatMap((page) =>
  languages.map((lang) => {
    const alternates = languages
      .map((code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${site.url}${routes[page](code)}" />`)
      .join('\n');
    return `  <url>\n    <loc>${site.url}${routes[page](lang)}</loc>\n${alternates}\n  </url>`;
  }),
);
await writeFile(
  path.join(root, 'public/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);

await writeFile(path.join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);

if (site.developer.address.length === 0) {
  console.warn('⚠ content/site.js: developer.address is empty — a German legal notice (Impressum, § 5 DDG) needs a postal address.');
}
console.log(`Rendered ${pages.length} pages in ${languages.join(', ')}.`);

/** Every locale must have exactly the keys of the default locale, so no page renders "undefined". */
function checkLocales(all) {
  const shape = (value, prefix = '') =>
    typeof value === 'object' && value !== null
      ? Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k))
      : [prefix];
  const reference = new Set(shape(all[languages[0]]));
  for (const lang of languages.slice(1)) {
    const keys = new Set(shape(all[lang]));
    const missing = [...reference].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !reference.has(k));
    if (missing.length || extra.length) {
      throw new Error(`Locale "${lang}" differs from "${languages[0]}". Missing: ${missing.join(', ') || '—'}. Extra: ${extra.join(', ') || '—'}.`);
    }
  }
}
