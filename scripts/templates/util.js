import { site } from '../../content/site.js';

export const languages = site.languages.map((l) => l.code);
export const defaultLanguage = languages[0];

/**
 * Site-relative output paths (directories, trailing slash) for each page.
 * Privacy and terms keep the /privacy/<lang> and /termsofuse/<lang> paths the app links to.
 */
export const routes = {
  home: (lang) => (lang === defaultLanguage ? '' : `${lang}/`),
  privacy: (lang) => `privacy/${lang}/`,
  terms: (lang) => `termsofuse/${lang}/`,
};

/** A relative href from one page directory to another (or to a file/anchor). */
export function rel(fromDir, to) {
  const depth = fromDir.split('/').filter(Boolean).length;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return prefix + to;
}

export const absolute = (path) => site.url + path;

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Replaces {name} placeholders. */
export const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));

export const languageName = (code) => site.languages.find((l) => l.code === code).name;
export const ogLocale = (code) => site.languages.find((l) => l.code === code).locale;
