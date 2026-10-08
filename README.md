# ImgZen website

Marketing site for [ImgZen](https://github.com/LinkAndreas/ImgZen) — the image converter for iPhone and iPad — in
English and German, with its Privacy Policy and Terms of Use. Static HTML rendered at build time, built with Vite.
Same structure as the [Breathia website](https://github.com/LinkAndreas/Breathia-Website).

```bash
npm install
npm run dev       # local development (re-renders when content or templates change)
npm run build     # production build → dist/
npm run preview   # serve dist/
```

## Pages

| Path | Page |
|---|---|
| `/` · `/de/` | Landing page (English at the root) |
| `/privacy/<lang>/` | Privacy Policy |
| `/termsofuse/<lang>/` | Terms of Use |
| `/privacy/` · `/termsofuse/` | Forward to the visitor's language |

`/privacy/<lang>/` and `/termsofuse/<lang>/` are linked from the app (`SupportLinks.swift`) and set in App Store
Connect — keep them. On a first
visit, the English root page forwards visitors whose browser prefers German; choosing a language in the switcher
is remembered and turns this off.

## Where things live

| Path | What |
|---|---|
| `content/locales/<lang>.js` | All page copy per language — keys must match `en.js` (checked at build) |
| `content/legal/<doc>.<lang>.html` | Privacy Policy and Terms of Use text |
| `content/site.js` | URLs, App Store ID, developer details, legal effective date, languages |
| `content/formats.js` | The six formats and the measured file sizes behind the format explorer |
| `content/screenshots/<lang>/` | App screenshots, `<screen>-<light\|dark>.webp` |
| `content/brand/` | App icon (from the app repository's `ImgZen/Resources`) |
| `scripts/templates/` | Page templates (layout, home, legal) |
| `scripts/render.mjs` | Renders all pages into `site/` and writes `public/sitemap.xml` |
| `scripts/build-images.mjs` | Icons, device mockups and the social preview image |
| `site/src/` | Client code: styles, nav/reveal/theme (`main.js`), format explorer (`explorer.js`) |
| `public/` | Static files: images, icons, OG image |

`site/**/*.html`, `public/sitemap.xml` and `public/robots.txt` are generated — edit `content/` or the templates
instead.

## Screenshots and device mockups

The screenshots were taken in the iOS Simulator (iPhone 17 Pro Max and iPad Pro 13-inch), once per language and
appearance, with a clean status bar:

```bash
xcrun simctl status_bar <device> override --time "9:41" --batteryState discharging --batteryLevel 100
xcrun simctl launch <device> de.linkandreas.imgzen -isOnboardingCompleted YES -completedConversionsCount 3 \
  -AppleLanguages "(de)" -AppleLocale de_DE
xcrun simctl ui <device> appearance dark
```

The launch arguments skip onboarding and the review prompt. Save them as
`content/screenshots/<lang>/<screen>-<light|dark>.webp` and run `npm run images`.

The iPhone screenshots are composited into Apple's official iPhone 17 Pro Max bezel. The bezels are Apple Design
Resources, licensed for mock-ups only: they must not be extracted or redistributed on their own, so they are
**not** in this repository. Download `Bezel-iPhone-17` from
[developer.apple.com/design/resources](https://developer.apple.com/design/resources/), mount it, and run:

```bash
BEZELS=/Volumes npm run images
```

Without `BEZELS`, the existing iPhone mockups are kept. The iPad gets a drawn frame and needs no bezel.

## Format explorer

The file sizes on the home page come from one 12-megapixel sample photo, converted with Apple's ImageIO (the
framework ImgZen uses) at the app's quality levels — Low 60 %, Medium 75 %, High 90 %, Maximum 100 % — and with
libwebp for WebP. To re-measure, e.g. with `sips`:

```bash
sips -s format jpeg -s formatOptions 90 photo.heic --out photo.jpg
```

and update `content/formats.js`.

## Deploying

The site is served at **https://imgzen.linkandreas.de**, the same way as `breathia.linkandreas.de`: a Docker image
with [Caddy](https://caddyserver.com) on port 32773 (compression, caching and security headers in
`docker/Caddyfile`), on the Hostinger VPS behind the Cloudflare Tunnel. The container publishes no ports; it joins
the shared Docker network `web`, where the `cloudflared` container reaches it at `http://imgzen-website:32773`.

Every merge into `main` (each release) runs `.github/workflows/deploy.yml`: GitHub builds the image and pushes it
to `ghcr.io/linkandreas/imgzen-website`, tagged with the commit SHA. The VPS then only receives `compose.yaml` in
`~/imgzen-website`, pulls that image and restarts the container. It can also be started by hand under
**Actions › Deploy to Hostinger VPS › Run workflow**.

To roll back, run on the VPS: `cd ~/imgzen-website && TAG=<older commit sha> docker compose up -d`.

### First-time setup

1. **Create the repository** on GitHub, e.g. `LinkAndreas/ImgZen-Website` (public, no README or license — this
   repository brings its own), and push both branches:

   ```bash
   git remote add origin git@github.com:LinkAndreas/ImgZen-Website.git
   git push -u origin main develop
   ```

   Pushing `main` starts the first deployment, which fails until the secrets below exist; re-run it afterwards.
2. **Secrets** — in the repository, under **Settings › Secrets and variables › Actions**, add the same three as for
   the Breathia website: `HOSTINGER_HOST` (VPS IP address), `HOSTINGER_USERNAME` (SSH user, e.g. `root`) and
   `HOSTINGER_SSH_KEY` (the private deploy key authorized on the VPS).
3. **Environment** — the deploy job runs in the `production` environment, which GitHub creates on the first run.
4. **Package visibility** — after the first successful build, open the `imgzen-website` package under your GitHub
   profile › Packages and connect it to the repository (Package settings › Manage Actions access) if GitHub didn't.
   The VPS logs in with the job's token, so the package can stay private.
5. **Domain** — in Cloudflare **Zero Trust › Networks › Tunnels**, edit the tunnel and add a public hostname:
   subdomain `imgzen`, domain `linkandreas.de`, service **HTTP**, URL `imgzen-website:32773`. Cloudflare creates the
   DNS record and serves HTTPS.

To run it locally:
`docker build -t imgzen-website . && docker run --rm -p 32773:32773 imgzen-website` → <http://localhost:32773>.

### Anywhere else

`npm run build` outputs a static site in `dist/` with relative asset URLs, so it can be served from any host and
path. `SITE_URL` sets the canonical URL used in links, the sitemap and `robots.txt` (default
`https://imgzen.linkandreas.de/`, see `content/site.js`).

## License

The code is available under the [MIT License](LICENSE). The ImgZen name, icon and screenshots, the Apple device
mockups and the App Store badges are excluded — see [NOTICE.md](NOTICE.md).
