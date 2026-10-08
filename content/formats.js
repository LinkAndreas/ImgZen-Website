// The formats ImgZen converts to, with file sizes measured for the format explorer on the home page.
//
// Sample: a 12-megapixel photo (4032 × 3024), originally a 2.8 MB HEIC. Converted with Apple's
// ImageIO — the framework ImgZen uses — at each quality level the app offers (Low 60 %, Medium
// 75 %, High 90 %, Maximum 100 %); WebP with libwebp, as in the app. Sizes in MB (1 MB = 10^6 bytes,
// as the app shows them). Results differ from photo to photo; the proportions are what matter.

export const sample = { width: 4032, height: 3024, format: 'HEIC', megabytes: 2.8 };

/** Quality levels as the app names them (see the locales for their labels). */
export const qualities = ['low', 'medium', 'high', 'maximum'];
export const defaultQuality = 'high';

export const formats = [
  { id: 'jpeg', name: 'JPEG', lossy: true, megabytes: { low: 2.5, medium: 3.7, high: 4.9, maximum: 9.0 } },
  { id: 'heic', name: 'HEIC', lossy: true, megabytes: { low: 1.9, medium: 2.6, high: 3.6, maximum: 13.8 } },
  { id: 'webp', name: 'WebP', lossy: true, megabytes: { low: 1.1, medium: 1.3, high: 2.6, maximum: 5.2 } },
  { id: 'png', name: 'PNG', lossy: false, megabytes: 20.3 },
  { id: 'tiff', name: 'TIFF', lossy: false, megabytes: 37.8 },
  { id: 'bmp', name: 'BMP', lossy: false, megabytes: 36.6 },
];
