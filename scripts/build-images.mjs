// Builds the site's images from content/: icons, device mockups and the social preview image.
//
//   npm run images                     icons, iPad mockups and social preview (keeps iPhone mockups)
//   BEZELS=/Volumes npm run images     also the iPhone mockups, with Bezel-iPhone-17 mounted there
//
// Screenshots live in content/screenshots/<language>/<screen>-<light|dark>.webp, taken from the app
// in that language and appearance.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { site } from '../content/site.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const brand = path.join(root, 'content/brand');
const screensIn = path.join(root, 'content/screenshots');
const publicDir = path.join(root, 'public');
const devicesOut = path.join(publicDir, 'images/devices');
const languages = site.languages.map((l) => l.code);
const schemes = ['light', 'dark'];

await mkdir(path.join(publicDir, 'images'), { recursive: true });

// ---- Icons -----------------------------------------------------------------------------------
// The square icon for iOS (which rounds it itself), the rounded one wherever the page shows it.
const iconSquare = path.join(brand, 'icon.png');
const iconRounded = path.join(brand, 'icon-rounded-light.png');
await sharp(iconSquare).resize(180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
await sharp(iconRounded).resize(64).png().toFile(path.join(publicDir, 'favicon.png'));
await sharp(iconRounded).resize(256).webp({ quality: 90 }).toFile(path.join(publicDir, 'images/icon-256.webp'));
console.log('Icons written to public/.');

// ---- Sample thumbnail ------------------------------------------------------------------------
// The flower photo from the gallery screenshot (a 4032 × 3024 HEIC in the app), for the file cards
// beside the hero's phone.
await sharp(path.join(screensIn, 'en/iphone-gallery-light.webp'))
  .extract({ left: 70, top: 550, width: 330, height: 330 })
  .resize(96)
  .webp({ quality: 82 })
  .toFile(path.join(publicDir, 'images/sample-thumb.webp'));
console.log('Sample thumbnail written to public/images/.');

// ---- Device mockups --------------------------------------------------------------------------
const manifestFile = path.join(root, 'content/devices.json');
const manifest = existsSync(manifestFile) ? JSON.parse(await readFile(manifestFile, 'utf8')) : {};

async function writeSizes(image, outBase, widths) {
  for (const w of widths) {
    await sharp(image).resize({ width: w }).webp({ quality: 86, alphaQuality: 90, effort: 6 }).toFile(`${outBase}-${w}.webp`);
  }
}

// iPhone: composited into Apple's official bezel. The bezels come from Apple Design Resources
// (developer.apple.com/design/resources) and are licensed for mock-ups only — they must not be
// extracted or redistributed on their own. So the bare bezel is never copied into this
// repository; only the finished, flattened mockups are.
const iphone = {
  bezel: 'Bezel-iPhone-17/PNG/iPhone 17 Pro Max/iPhone 17 Pro Max - Deep Blue - Portrait.png',
  screens: ['iphone-empty', 'iphone-picker', 'iphone-gallery', 'iphone-format', 'iphone-results'],
  widths: [480, 760],
};

/** The bezel's transparent screen area: the region connected to the image center. */
async function screenArea(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const inside = new Uint8Array(w * h);
  const start = (h >> 1) * w + (w >> 1);
  const stack = [start];
  inside[start] = 1;
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  while (stack.length) {
    const i = stack.pop();
    const x = i % w, y = (i / w) | 0;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    for (const [j, ok] of [[i - 1, x > 0], [i + 1, x < w - 1], [i - w, y > 0], [i + w, y < h - 1]]) {
      if (ok && !inside[j] && data[j] < 128) { inside[j] = 1; stack.push(j); }
    }
  }
  // Grow the area a few pixels under the bezel's anti-aliased inner edge, so no seam shows.
  const grown = new Uint8Array(inside);
  for (let pass = 0; pass < 3; pass++) {
    const source = new Uint8Array(grown);
    for (let i = 0; i < w * h; i++) {
      if (source[i]) continue;
      const x = i % w;
      if ((x > 0 && source[i - 1]) || (x < w - 1 && source[i + 1]) || source[i - w] || source[i + w]) grown[i] = 1;
    }
  }
  // The device's own outline (opaque pixels), so mockups are cropped to the product itself.
  let bx0 = w, bx1 = 0, by0 = h, by1 = 0;
  for (let i = 0; i < w * h; i++) {
    if (data[i] < 128) continue;
    const x = i % w, y = (i / w) | 0;
    bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y);
  }
  const bounds = { left: bx0, top: by0, width: bx1 - bx0 + 1, height: by1 - by0 + 1 };
  return { width: w, height: h, left: x0, top: y0, screenWidth: x1 - x0 + 1, screenHeight: y1 - y0 + 1, mask: grown, bounds };
}

async function inBezel(bezelFile, area, screenshotFile) {
  const { width, height, left, top, screenWidth, screenHeight, mask } = area;
  const screen = await sharp(screenshotFile).resize(screenWidth, screenHeight, { fit: 'fill' }).png().toBuffer();
  const layer = await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: screen, left, top }])
    .raw()
    .toBuffer();
  for (let i = 0; i < width * height; i++) layer[i * 4 + 3] = mask[i] ? layer[i * 4 + 3] : 0;
  const composited = await sharp(layer, { raw: { width, height, channels: 4 } }).composite([{ input: bezelFile }]).png().toBuffer();
  return sharp(composited).extract(area.bounds).png().toBuffer();
}

const bezelFile = process.env.BEZELS && path.join(process.env.BEZELS, iphone.bezel);
if (bezelFile && existsSync(bezelFile)) {
  const area = await screenArea(bezelFile);
  for (const lang of languages) {
    await mkdir(path.join(devicesOut, lang), { recursive: true });
    for (const name of iphone.screens) {
      for (const scheme of schemes) {
        const mockup = await inBezel(bezelFile, area, path.join(screensIn, lang, `${name}-${scheme}.webp`));
        await writeSizes(mockup, path.join(devicesOut, lang, `${name}-${scheme}`), iphone.widths);
      }
    }
  }
  manifest.iphone = { width: area.bounds.width, height: area.bounds.height, widths: iphone.widths };
  console.log(`iphone: ${iphone.screens.length} screens per language, screen ${area.screenWidth}×${area.screenHeight} at ${area.left},${area.top}`);
} else {
  console.log('iphone: BEZELS not set or bezel not found — kept the existing iPhone mockups.');
}

// iPad: a plain, drawn frame around the landscape screenshot (no Apple bezel needed).
const ipad = { screens: ['ipad-gallery'], widths: [900, 1600] };

async function inFrame(screenshotFile) {
  const { width: sw, height: sh } = await sharp(screenshotFile).metadata();
  const bezel = Math.round(sw * 0.026);
  const screenRadius = Math.round(sw * 0.022);
  const radius = screenRadius + bezel;
  const width = sw + 2 * bezel;
  const height = sh + 2 * bezel;
  const body = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4d57"/><stop offset="0.5" stop-color="#26272d"/><stop offset="1" stop-color="#3b3d45"/></linearGradient></defs>
    <rect width="${width}" height="${height}" rx="${radius}" fill="url(#edge)"/>
    <rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="${radius - 3}" fill="#0b0b0d"/>
  </svg>`;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}"><rect width="${sw}" height="${sh}" rx="${screenRadius}" fill="#fff"/></svg>`);
  const screen = await sharp(screenshotFile).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  return sharp(Buffer.from(body)).composite([{ input: screen, left: bezel, top: bezel }]).png().toBuffer();
}

for (const lang of languages) {
  await mkdir(path.join(devicesOut, lang), { recursive: true });
  for (const name of ipad.screens) {
    for (const scheme of schemes) {
      const mockup = await inFrame(path.join(screensIn, lang, `${name}-${scheme}.webp`));
      await writeSizes(mockup, path.join(devicesOut, lang, `${name}-${scheme}`), ipad.widths);
      const { width, height } = await sharp(mockup).metadata();
      manifest.ipad = { width, height, widths: ipad.widths };
    }
  }
}
console.log(`ipad: ${ipad.screens.length} screen per language, drawn frame`);

await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

// ---- Social preview (1200×630) ---------------------------------------------------------------
// The app icon's palette (its dark appearance): a sunset over violet and blue mountains.
const iconData = `data:image/png;base64,${(await sharp(iconRounded).resize(224).png().toBuffer()).toString('base64')}`;
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#09042d"/><stop offset="0.55" stop-color="#2f28c9"/><stop offset="1" stop-color="#8149bc"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fbcf31"/><stop offset="0.55" stop-color="#fb8c22"/><stop offset="0.85" stop-color="#fc4525"/><stop offset="1" stop-color="#f21c3e"/>
    </radialGradient>
    <radialGradient id="halo" cx="930" cy="250" r="380" gradientUnits="userSpaceOnUse">
      <stop offset="0.2" stop-color="#d3005d" stop-opacity="0.45"/><stop offset="1" stop-color="#d3005d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59c1ff"/><stop offset="1" stop-color="#2f28c9"/></linearGradient>
    <linearGradient id="near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4263f2"/><stop offset="1" stop-color="#150d77"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#halo)"/>
  <circle cx="930" cy="250" r="120" fill="url(#sun)"/>
  <path d="M560 630 L800 360 L960 520 L1060 420 L1200 560 V630Z" fill="url(#far)" opacity="0.9"/>
  <path d="M640 630 L900 430 L1080 600 L1200 500 V630Z" fill="url(#near)"/>
  <image href="${iconData}" x="80" y="92" width="112" height="112"/>
  <text x="80" y="300" font-family="SF Pro Display, Helvetica Neue, Arial" font-weight="700" font-size="84" fill="#ffffff" letter-spacing="-2">ImgZen</text>
  <text x="82" y="362" font-family="SF Pro Display, Helvetica Neue, Arial" font-weight="500" font-size="34" fill="#ffffff" fill-opacity="0.85">The Image Converter</text>
  <text x="82" y="430" font-family="SF Pro Display, Helvetica Neue, Arial" font-weight="600" font-size="24" fill="#ffffff" fill-opacity="0.7" letter-spacing="1">JPEG · HEIC · WEBP · PNG · TIFF · BMP</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, 'og-image.png'));
console.log('Social preview written to public/og-image.png.');
