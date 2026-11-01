// Only faces needed by the current homepage/app shell. Space Grotesk uses one variable file.
export const CRITICAL_FONTS = ['400 16px "Press Start 2P"', '400 16px "Space Grotesk"', '500 16px "Space Grotesk"'];
export const FONT_SAMPLE = 'PROCOM 27 Teams';
const families = ['Press Start 2P', 'Space Grotesk'];
const normalize = name => name.replace(/["']/g, '').trim();

/** A loaded resource cache is not proof of readiness in this document. */
export function criticalFontsAvailable(fonts) {
  if (!fonts) return false;
  const registered = families.every(family => [...fonts].some(face => normalize(face.family) === family));
  return registered && CRITICAL_FONTS.every(font => fonts.check(font, FONT_SAMPLE));
}

/** Same-origin Resource Timing distinguishes actual network font transfers from cache hits.
 * Preloads can finish before React executes; check() alone loses that cold-load history.
 * A revalidated cache response has only the 300-byte Resource Timing header allowance.
 * Missing timing data is not evidence of a network transfer.
 */
export function criticalFontsTransferred(performance = globalThis.performance, origin = globalThis.location?.origin) {
  if (!origin || !performance?.getEntriesByType) return false;
  const critical = new Set(['/fonts/press-start-2p-latin.woff2', '/fonts/space-grotesk-latin.woff2']);
  return performance.getEntriesByType('resource').some(entry => {
    try {
      const url = new URL(entry.name);
      return url.origin === origin && critical.has(url.pathname) && entry.deliveryType !== 'cache' && entry.transferSize > 300 && entry.encodedBodySize > 0;
    } catch { return false; }
  });
}

/** Starts only critical faces concurrently; a slow noncritical font/image never gates the site. */
export function createInitializationController({ fonts = globalThis.document?.fonts, tasks = [], timeout = 1600, transferred = criticalFontsTransferred() } = {}) {
  let state = tasks.length === 0 && criticalFontsAvailable(fonts) ? 'ready' : 'pending';
  const listeners = new Set(), abort = new AbortController();
  let timer, disposed = false;
  const publish = next => {
    if (disposed || state !== 'pending') return;
    state = next; clearTimeout(timer); abort.abort(); listeners.forEach(fn => fn());
  };
  if (state === 'pending') {
    timer = setTimeout(() => publish('fallback'), timeout);
    // Missing @font-face declarations can make check() return true for a fallback.
    const declared = fonts && families.every(family => [...fonts].some(face => normalize(face.family) === family));
    const fontTask = !declared ? Promise.reject(new Error('Critical font stylesheet unavailable')) :
      Promise.all(CRITICAL_FONTS.map(font => fonts.load(font, FONT_SAMPLE).then(faces => {
        if (!faces.length) throw new Error('Missing critical face');
      }))).then(() => { if (!criticalFontsAvailable(fonts)) throw new Error('Critical fonts unavailable'); });
    Promise.allSettled([fontTask, ...tasks.map(task => Promise.resolve().then(() => task(abort.signal)))]).then(results => publish(results.some(result => result.status === 'rejected') ? 'fallback' : 'ready'));
  }
  return {
    getSnapshot: () => state,
    // Resolve at mount: cache-backed loads may finish between controller creation and React.
    get requiresIntro() { return state === 'pending' || transferred || criticalFontsTransferred(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    dispose() { disposed = true; clearTimeout(timer); abort.abort(); listeners.clear(); },
  };
}
// Cached within this document/app lifetime; no localStorage/sessionStorage assumptions.
let initialization;
export function getSiteInitialization() { return initialization ||= createInitializationController(); }
