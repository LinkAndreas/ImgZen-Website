// Privacy Policy and Terms of Use, rendered from content/legal/<doc>.<lang>.html.
import { site } from '../../content/site.js';
import { renderDocument } from './layout.js';
import { escapeHtml, languageName, languages, rel, routes } from './util.js';

function developerBlock() {
  const { name, email, address } = site.developer;
  return [`<strong>${escapeHtml(name)}</strong>`, ...address.map(escapeHtml), `<a href="mailto:${email}">${email}</a>`].join('<br />\n  ');
}

/** Builds a table of contents from the document's <h2 id="…"> headings. */
function tableOfContents(html) {
  const headings = [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)];
  return headings.map(([, id, text]) => `<li><a href="#${id}">${text}</a></li>`).join('\n              ');
}

export function renderLegal(page, lang, t, body) {
  const dir = routes[page](lang);
  const title = page === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle;
  const description = page === 'privacy' ? t.legal.privacyDescription : t.legal.termsDescription;
  const date = new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(site.legalEffectiveDate));

  const html = body
    .replaceAll('{{developerName}}', escapeHtml(site.developer.name))
    .replaceAll('{{developerEmail}}', site.developer.email)
    .replaceAll('{{privacyEmail}}', site.privacyEmail)
    .replaceAll('{{privacyUrl}}', rel(dir, routes.privacy(lang)))
    .replaceAll('{{developerBlock}}', developerBlock());

  const unresolved = html.match(/\{\{\w+\}\}/);
  if (unresolved) throw new Error(`Unresolved placeholder ${unresolved[0]} in ${page}.${lang}.html`);

  const others = languages
    .filter((code) => code !== lang)
    .map((code) => `<a href="${rel(dir, routes[page](code))}" hreflang="${code}" lang="${code}" data-lang="${code}">${languageName(code)}</a>`)
    .join(' · ');

  const content = `
      <article class="legal" aria-labelledby="legal-title">
        <div class="legal__inner container">
          <header class="legal__header">
            <p class="eyebrow">ImgZen</p>
            <h1 class="legal__title" id="legal-title">${title}</h1>
            <p class="legal__meta">${t.legal.lastUpdated}: <time datetime="${site.legalEffectiveDate}">${date}</time></p>
            <p class="legal__languages">${t.legal.otherLanguages}: ${others}</p>
          </header>

          <div class="legal__layout">
            <nav class="legal__toc" aria-labelledby="toc-title">
              <h2 class="legal__toc-title" id="toc-title">${t.legal.contents}</h2>
              <ol role="list">
              ${tableOfContents(html)}
              </ol>
            </nav>
            <div class="legal__body">
${html}
            </div>
          </div>
        </div>
      </article>`;

  return renderDocument({
    lang,
    t,
    page,
    title: `${title} — ImgZen`,
    description,
    content,
    bodyClass: 'page-legal',
  });
}

/** /privacy/ and /termsofuse/ without a language: pick the visitor's language, else English. */
export function renderLanguageRedirect(page) {
  const fallback = routes[page](languages[0]).split('/').filter(Boolean).pop() + '/';
  const links = languages
    .map((code) => `<li><a href="${code}/" hreflang="${code}" lang="${code}">${languageName(code)}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="${languages[0]}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ImgZen</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${site.url}${routes[page](languages[0])}" />
    <script>
      (function () {
        var supported = ${JSON.stringify(languages)};
        var preferred = (navigator.languages || [navigator.language]).map(function (l) { return String(l).slice(0, 2).toLowerCase(); });
        var lang = '${languages[0]}';
        try { lang = localStorage.getItem('imgzen.lang') || lang; } catch (e) {}
        for (var i = 0; i < preferred.length && lang === '${languages[0]}'; i++) {
          if (supported.indexOf(preferred[i]) !== -1) { lang = preferred[i]; break; }
        }
        location.replace(lang + '/');
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=${fallback}" /></noscript>
  </head>
  <body>
    <ul>${links}</ul>
  </body>
</html>
`;
}
