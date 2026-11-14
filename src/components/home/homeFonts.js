const HOME_FONTS_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Pixelify+Sans:wght@400;500;600;700&family=Press+Start+2P&display=swap';
let homeFontsReady;

// Start the font stylesheet and face downloads before the console decodes its text.
export function ensureHomeFontsReady() {
  if (homeFontsReady) return homeFontsReady;
  if (typeof document === 'undefined') return Promise.resolve();

  const stylesheetId = 'home-fonts-stylesheet';
  const stylesheet = document.getElementById(stylesheetId);
  const stylesheetReady = stylesheet
    ? Promise.resolve()
    : new Promise((resolve) => {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://fonts.googleapis.com';
        document.head.appendChild(preconnect);

        const fontOrigin = document.createElement('link');
        fontOrigin.rel = 'preconnect';
        fontOrigin.href = 'https://fonts.gstatic.com';
        fontOrigin.crossOrigin = 'anonymous';
        document.head.appendChild(fontOrigin);

        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'style';
        preload.href = HOME_FONTS_STYLESHEET;
        document.head.appendChild(preload);

        const link = document.createElement('link');
        link.id = stylesheetId;
        link.rel = 'stylesheet';
        link.href = HOME_FONTS_STYLESHEET;
        link.onload = resolve;
        link.onerror = () => {
          console.warn('Could not load the Home hero font stylesheet.');
          resolve();
        };
        document.head.appendChild(link);
      });

  homeFontsReady = stylesheetReady
    .then(() => Promise.all([
      document.fonts.load('400 16px "Press Start 2P"'),
      document.fonts.load('400 16px "Pixelify Sans"'),
      document.fonts.load('400 16px "Inter"'),
    ]))
    .then(() => document.fonts.ready)
    .catch((error) => {
      console.warn('Could not load all Home hero fonts before startup.', error);
    });

  return homeFontsReady;
}
