import { useEffect } from 'react';
import { burst } from '../../utils/arcade/burst.js';
import { toast } from '../../utils/arcade/toast.js';
import { quest } from '../../utils/arcade/xp.js';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/** site-wide effects: click bursts on arcade CTAs + the Konami-code CRT mode */
export default function GlobalFX() {
  useEffect(() => {
    const onClick = (e) => {
      const b = e.target.closest && e.target.closest('.btn--primary,.btn--arcade,.btn--register,[data-burst]');
      if (!b || b.classList.contains('is-closed')) return;
      const r = b.getBoundingClientRect();
      burst(e.clientX || r.left + 20, e.clientY || r.top + 10, { n: 10, spread: 50 });
    };
    let kp = 0;
    const onKey = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      kp = k === KONAMI[kp] ? kp + 1 : k === KONAMI[0] ? 1 : 0;
      if (kp === KONAMI.length) {
        kp = 0;
        const on = document.documentElement.classList.toggle('cheat');
        quest('konami');
        toast(on ? <>Cheat code activated: <code>CRT MODE</code></> : 'Cheat code off');
        for (let i = 0; i < 5; i++) {
          setTimeout(() => burst(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.6, { n: 20, spread: 120 }), i * 140);
        }
      }
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  return null;
}
