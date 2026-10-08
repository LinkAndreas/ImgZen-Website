import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(root, 'site');

// Pages are generated from content/ and scripts/templates/ (see scripts/render.mjs).
// A child process gives each render a fresh module graph, so edits always show up.
function render() {
  execFileSync(process.execPath, [path.join(root, 'scripts/render.mjs')], { stdio: 'inherit' });
}

function htmlPages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    if (name === 'src') return [];
    if (statSync(file).isDirectory()) return htmlPages(file);
    return name.endsWith('.html') ? [file] : [];
  });
}

function renderedPages() {
  return {
    name: 'imgzen-rendered-pages',
    configureServer(server) {
      const sources = [path.join(root, 'content'), path.join(root, 'scripts/templates'), path.join(root, 'scripts/render.mjs')];
      server.watcher.add(sources);
      server.watcher.on('change', (file) => {
        if (!sources.some((source) => file.startsWith(source))) return;
        try {
          render();
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(String(error));
        }
      });
    },
  };
}

export default defineConfig(() => {
  render();
  const input = Object.fromEntries(
    htmlPages(siteDir).map((file) => [path.relative(siteDir, file).replace(/\/?index\.html$/, '') || 'index', file]),
  );

  return {
    root: siteDir,
    publicDir: path.join(root, 'public'),
    // Relative asset URLs, so the site works from any sub-path (e.g. /imgzen/).
    base: './',
    plugins: [renderedPages()],
    build: {
      outDir: path.join(root, 'dist'),
      emptyOutDir: true,
      target: 'es2020',
      rollupOptions: { input },
    },
  };
});
