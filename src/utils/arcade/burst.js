import { MOTION } from './util.js';

/** pixel burst (confetti made of squares) at viewport coords */
export function burst(x, y, o = {}) {
  if (!MOTION || !document.body.animate) return;
  const n = o.n || 18;
  const cols = o.colors || ['#B57CFF', '#DCC8FF', '#F5F0FA'];
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i');
    const s = 4 + Math.random() * 5;
    const a = Math.random() * Math.PI * 2;
    const v = 40 + Math.random() * (o.spread || 90);
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${s}px;height:${s}px;background:${cols[i % 3]};z-index:400;pointer-events:none`;
    document.body.appendChild(d);
    d.animate(
      [
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * v - s / 2}px,${Math.sin(a) * v + 40}px) rotate(${Math.random() * 180}deg)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.75,.15,1)' },
    ).onfinish = () => d.remove();
  }
}

/** burst from the centre of an element */
export function burstAt(el, o, edge = 'center') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width / 2, edge === 'top' ? r.top : r.top + r.height / 2, o);
}
