import { useEffect, useRef, useState } from 'react';
import { burstAt } from '../../utils/arcade/burst.js';
import { lvPop } from '../../utils/arcade/xp.js';
import { MOTION } from '../../utils/arcade/util.js';

/** 1UP: back-to-top with level (scroll) progress */
export default function OneUp() {
  const [pct, setPct] = useState(0);
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    let done = false;
    const upd = () => {
      const H = document.documentElement.scrollHeight - window.innerHeight;
      const p = H > 0 ? Math.round((window.scrollY / H) * 100) : 0;
      setPct(p);
      setOn(window.scrollY > window.innerHeight * 0.8);
      if (p >= 99 && !done) {
        done = true;
        lvPop('end');
      }
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
    return () => window.removeEventListener('scroll', upd);
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      className={'oneup' + (on ? ' is-on' : '')}
      aria-label="Back to top"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: MOTION ? 'smooth' : 'auto' });
        burstAt(ref.current, { n: 12 }, 'top');
      }}
    >
      <span className="oneup__t">1UP</span>
      <span className="oneup__p">{pct}%</span>
    </button>
  );
}
