// English copy. Other locales mirror these keys exactly (checked at build time).
// Strings may contain inline HTML. Format and quality descriptions use the app's own wording.

export default {
  meta: {
    title: 'ImgZen — Convert Images on iPhone & iPad',
    alternateName: 'ImgZen: The Image Converter',
    description:
      'Convert photos and images between JPEG, HEIC, WebP, PNG, TIFF and BMP on iPhone and iPad. Convert many at once, choose the quality, and share the results. Everything happens on your device. Free, no account.',
    ogTitle: 'ImgZen — The Image Converter',
    ogDescription: 'Convert images between JPEG, HEIC, WebP, PNG, TIFF and BMP on iPhone and iPad — right on your device.',
    ogImageAlt: 'The ImgZen app icon — a sun over violet and blue mountains — with the words: ImgZen, The Image Converter.',
  },

  common: {
    skip: 'Skip to content',
    backToTop: 'ImgZen, back to top',
    sections: 'Sections',
    download: 'Download',
    appStoreBadge: 'Download on the App Store',
    language: 'Language',
    chooseLanguage: 'Choose language',
    home: 'Home',
    themeToDark: 'Switch to dark appearance',
    themeToLight: 'Switch to light appearance',
  },

  nav: {
    formats: 'Formats',
    how: 'How it works',
    ipad: 'iPad',
    privacy: 'Privacy',
  },

  hero: {
    eyebrow: 'ImgZen for iPhone &amp; iPad',
    title: 'Any image.<br /><span class="hero__title-glow">The format you need.</span>',
    lede: 'Turn HEIC photos into JPEG for sharing, screenshots into PNG, pictures into small WebP files for the web. Pick your images, choose a format, and convert them all at once — right on your device.',
    secondary: 'Compare the formats',
    meta: 'Free · No account · Nothing is uploaded',
    phoneAlt: 'ImgZen on iPhone: six photos ready to convert, with Convert at the top and the output format, JPEG at High quality, at the bottom.',
  },

  glance: {
    label: 'ImgZen at a glance',
    formats: 'formats, lossy and lossless',
    qualities: 'quality levels to choose from',
    uploads: 'uploads — it all stays on your device',
    accounts: 'accounts or sign-ups',
  },

  formats: {
    eyebrow: 'Formats',
    title: 'Small files or every detail.<br class="br-lg" /> Your choice.',
    lede: 'Lossy formats make files smaller and let you choose how much detail to keep. Lossless formats keep every pixel, and the files are larger. Choose a quality level to see what it means for one photo.',
    ticks: [
      '<strong>Six formats:</strong> JPEG, HEIC and WebP to save space; PNG, TIFF and BMP to keep every detail.',
      '<strong>Four quality levels</strong> for lossy formats, from Low for the smallest files to Maximum for every detail. High is recommended.',
      '<strong>A short note on every format</strong> in the app tells you what it’s best for, so you don’t need to know the details.',
    ],
    sampleLabel: 'Example photo',
    sample: '12 megapixels · originally {size} {format}',
    qualityLabel: 'Quality',
    qualities: { low: 'Low', medium: 'Medium', high: 'High', maximum: 'Maximum' },
    qualityHints: {
      low: 'The smallest files. Artifacts become visible.',
      medium: 'Smaller files for websites and messages. Fine details soften.',
      high: 'Recommended. Looks like the original, at a fraction of the size.',
      maximum: 'Every detail is kept. Files are the largest.',
    },
    lossy: 'Lossy formats',
    lossless: 'Lossless formats — always full quality',
    subtitles: {
      jpeg: 'Works everywhere. Best for sharing photos.',
      heic: 'About half the size of JPEG. Best on Apple devices.',
      webp: 'Small files for websites.',
      png: 'Sharp graphics and screenshots. Keeps transparency.',
      tiff: 'Best for printing and archiving.',
      bmp: 'Uncompressed. For older software.',
    },
    fineprint:
      'Sizes measured for one 12-megapixel photo with the same image frameworks ImgZen uses. Every photo is different — detailed scenes take more space than simple ones.',
  },

  how: {
    eyebrow: 'How it works',
    title: 'Three steps. Done in seconds.',
    lede: 'No settings to dig through, no account to create. Open ImgZen and start converting.',
    steps: [
      {
        title: 'Add your images',
        body: 'Choose photos from your library or files from the Files app — as many as you like. ImgZen only sees the images you pick.',
        alt: 'The photo picker with six photos selected, and a note that ImgZen can only access the items you select.',
      },
      {
        title: 'Choose a format',
        body: 'Pick the format you need and, for lossy formats, the quality. Every option says in a few words what it’s good for.',
        alt: 'The output format sheet with JPEG, HEIC and WebP, HEIC selected, and Image Quality set to High.',
      },
      {
        title: 'Convert and share',
        body: 'Tap Convert. Your images are ready in moments — review them, choose the ones you want, and share or save them.',
        alt: 'Ready to Share: six converted HEIC photos, all selected, with Deselect All and Share (6) at the bottom.',
      },
    ],
  },

  details: {
    eyebrow: 'Thoughtful details',
    title: 'Simple on the surface.<br class="br-lg" /> Careful underneath.',
    cards: [
      {
        title: 'Many images at once',
        body: 'Add dozens of photos and convert them in one go. A progress card shows how far along it is, and you can cancel any time.',
      },
      {
        title: 'Size and dimensions at a glance',
        body: 'Every image shows its format, dimensions and file size — before and after converting.',
      },
      {
        title: 'Share only what you need',
        body: 'All converted images start selected. Tap to leave some out, then share the rest together.',
      },
      {
        title: 'Straight to where it goes',
        body: 'Save to Photos or Files, send in Messages or Mail, or share with any app — from the share sheet you know.',
      },
      {
        title: 'Drag and drop',
        body: 'Drop images from other apps right into ImgZen on iPad.',
      },
      {
        title: 'Start fresh with one tap',
        body: 'Clear All empties the list. Your originals in Photos and Files stay untouched.',
      },
    ],
  },

  ipad: {
    eyebrow: 'iPad',
    title: 'More room for your images.',
    lede: 'On iPad, your images fill the screen and the output format stays in view beside them — change it without opening a menu.',
    alt: 'ImgZen on iPad: six photos in a grid on the left, the output format list with JPEG and Image Quality High on the right, and Convert and Add at the bottom.',
    points: [
      '<strong>Format beside your images</strong> — always one tap away.',
      '<strong>Convert with ⌘ Return</strong> on a hardware keyboard.',
      '<strong>Drag and drop</strong> images from other apps.',
    ],
  },

  privacy: {
    eyebrow: 'Privacy',
    title: 'Your photos stay yours.',
    lede: 'ImgZen converts everything on your device. Nothing is uploaded, nothing is collected, and there’s no account.',
    pillars: [
      { title: 'On your device', body: 'Every conversion happens on your iPhone or iPad. Your images never leave it.' },
      { title: 'Only what you pick', body: 'ImgZen doesn’t ask for access to your photo library. It only sees the images you choose.' },
      { title: 'No account, no tracking', body: 'No sign-up, no analytics, no ads. Open the app and convert.' },
    ],
    link: 'Read the Privacy Policy',
  },

  cta: {
    iconAlt: 'ImgZen app icon',
    title: 'The format you need,<br />in seconds.',
    lede: 'ImgZen is free on the App Store for iPhone and iPad.',
    meta: 'Available in English and Deutsch',
  },

  footer: {
    label: 'Legal and contact',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    feedback: 'Send Feedback',
    github: 'Open source on GitHub',
    disclaimer:
      'Apple, the Apple logo, iPad, iPhone and App Store are trademarks of Apple Inc., registered in the U.S. and other countries.',
  },

  legal: {
    effective: 'Effective',
    lastUpdated: 'Effective date',
    contents: 'Contents',
    otherLanguages: 'Also available in',
    backHome: 'Back to ImgZen',
    privacyTitle: 'Privacy Policy',
    privacyDescription: 'How ImgZen handles your data: it doesn’t collect, store or process any personal data. Images are converted on your device.',
    termsTitle: 'Terms of Use',
    termsDescription: 'The terms of use for the ImgZen app: Apple’s Standard License Agreement for Licensed Applications.',
    redirecting: 'Redirecting…',
  },
};
