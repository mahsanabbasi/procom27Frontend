const mq = (q) => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(q).matches;

/** false when the visitor asked for reduced motion */
export const MOTION = !mq('(prefers-reduced-motion: reduce)');
/** true on a mouse / trackpad (hover + fine pointer) */
export const FINE = mq('(hover:hover) and (pointer:fine)');

export const pad = (n, len = 2) => String(n).padStart(len, '0');

/** FNV-1a string hash */
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** xorshift32 seeded random */
export function rng(seed) {
  let r = seed || 1;
  return () => {
    r ^= r << 13; r >>>= 0;
    r ^= r >> 17;
    r ^= r << 5; r >>>= 0;
    return r / 4294967296;
  };
}

/** force a CSS animation to restart on an element */
export function retrigger(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

export const isTyping = (el) => !!el && /^(input|textarea|select)$/i.test(el.tagName);
