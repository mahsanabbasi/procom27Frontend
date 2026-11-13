/* Pixel page transition: blocks sweep in, the route changes, blocks clear out. */
import { MOTION } from './util.js';

export function cover(dir, done) {
  const c = document.createElement('canvas');
  c.className = 'px-cover';
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const d = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  c.width = W * d;
  c.height = H * d;
  const x = c.getContext('2d');
  x.scale(d, d);
  const B = Math.max(32, Math.round(W / 30));
  const cols = Math.ceil(W / B);
  const rows = Math.ceil(H / B);
  const cells = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      cells.push([i, j, Math.random() * 0.6 + (dir === 'in' ? (i / cols) * 0.4 : (1 - i / cols) * 0.4)]);
    }
  }
  cells.sort((a, b) => a[2] - b[2]);
  if (dir === 'out') {
    x.fillStyle = '#07060B';
    x.fillRect(0, 0, W, H);
  }
  const t0 = performance.now();
  const DUR = dir === 'in' ? 380 : 460;
  let k = 0;
  const f = (t) => {
    const p = Math.min(1, (t - t0) / DUR);
    const target = Math.floor(p * cells.length);
    for (; k < target; k++) {
      const q = cells[k];
      if (dir === 'in') {
        x.fillStyle = Math.random() < 0.12 ? '#B57CFF' : '#07060B';
        x.fillRect(q[0] * B, q[1] * B, B, B);
      } else {
        x.clearRect(q[0] * B, q[1] * B, B, B);
        if (Math.random() < 0.1) {
          x.fillStyle = '#B57CFF';
          x.fillRect(q[0] * B + B * 0.35, q[1] * B + B * 0.35, B * 0.3, B * 0.3);
        }
      }
    }
    if (p < 1) requestAnimationFrame(f);
    else if (dir === 'in') {
      x.fillStyle = '#07060B';
      x.fillRect(0, 0, W, H);
      if (done) done();
      c.remove();
    } else setTimeout(() => c.remove(), 80);
  };
  requestAnimationFrame(f);
}

/** navigate with the pixel transition (SPA version of the design's page-to-page wipe) */
export function pixelNavigate(navigate, to) {
  if (!MOTION) {
    navigate(to);
    return;
  }
  cover('in', () => {
    navigate(to);
    window.scrollTo(0, 0);
    cover('out');
  });
}
