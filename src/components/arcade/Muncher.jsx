/* =====================================================================
   MUNCHER HEALTH BAR — Bit eats the header bar as you scroll; each
   section with data-munch="icon" drops a power-up on the bar.
   ===================================================================== */
import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import Sprite from './Sprite.jsx';
import { BIT } from '../../utils/arcade/bit.js';
import { award, setMunchItems } from '../../utils/arcade/xp.js';

const GAP = 24;

export default function Muncher() {
  const trackRef = useRef(null);
  const lineRef = useRef(null);
  const dotsRef = useRef(null);
  const botRef = useRef(null);
  const [location] = useLocation();

  useEffect(() => {
    const track = trackRef.current;
    const dots = dotsRef.current;
    const bot = botRef.current;
    const line = lineRef.current;
    if (!track) return undefined;
    let W = 0;
    let segs = [];
    let items = [];
    let lastY = window.scrollY;
    let idleT = null;
    let layoutT = null;
    let raf = 0;
    let ticking = false;

    const navH = () => {
      const n = document.querySelector('.nav');
      return n ? n.offsetHeight : 0;
    };

    function update(silent) {
      const H = document.documentElement.scrollHeight - window.innerHeight;
      const p = H > 0 ? Math.min(1, Math.max(0, window.scrollY / H)) : 0;
      const x = p * W;
      bot.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
      line.style.width = x.toFixed(1) + 'px';
      if (!silent) {
        bot.classList.toggle('is-left', window.scrollY < lastY);
        bot.classList.add('is-moving');
        clearTimeout(idleT);
        idleT = setTimeout(() => bot.classList.remove('is-moving'), 200);
      }
      lastY = window.scrollY;
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const e = s.x < x + 3;
        if (e !== s.e) {
          s.e = e;
          s.el.classList.toggle('is-eaten', e);
        }
      }
      items.forEach((it) => {
        const e = it.x <= x + 4;
        if (e === it.e) return;
        it.e = e;
        it.el.classList.toggle('is-eaten', e);
        if (e) award('sec:' + it.id, 20, it.el);
      });
    }

    function layout() {
      W = track.clientWidth;
      const H = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const nh = navH();
      items = Array.from(document.querySelectorAll('[data-munch]')).map((sec) => {
        const top = sec.getBoundingClientRect().top + window.scrollY - nh - 8;
        const p = Math.max(0, Math.min(1, top / H));
        return { id: sec.id || sec.getAttribute('data-munch-id'), p, x: Math.round(p * W) };
      });
      const frag = document.createDocumentFragment();
      segs = [];
      dots.innerHTML = '';
      const n = Math.max(4, Math.floor(W / GAP));
      for (let i = 0; i < n; i++) {
        const x = i * GAP + GAP / 2;
        if (items.some((it) => Math.abs(it.x - x) < 12)) continue;
        const s = document.createElement('i');
        s.className = 'munch__seg';
        s.style.left = x + 'px';
        frag.appendChild(s);
        segs.push({ el: s, x, e: false });
      }
      items.forEach((it) => {
        const e = document.createElement('span');
        e.className = 'munch__item';
        e.style.left = it.x + 'px';
        frag.appendChild(e);
        it.el = e;
        it.e = false;
      });
      dots.appendChild(frag);
      setMunchItems(items.map((it) => ({ id: it.id })));
      update(true);
    }

    const later = () => {
      clearTimeout(layoutT);
      layoutT = setTimeout(layout, 180);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => {
        ticking = false;
        update(false);
      });
    };

    layout();
    update(false); // first frame: Bit gives a quick chomp, like the design's boot
    window.addEventListener('resize', later);
    window.addEventListener('load', later);
    window.addEventListener('scroll', onScroll, { passive: true });
    let ro;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(later);
      ro.observe(document.body);
    }
    return () => {
      window.removeEventListener('resize', later);
      window.removeEventListener('load', later);
      window.removeEventListener('scroll', onScroll);
      if (ro) ro.disconnect();
      clearTimeout(idleT);
      clearTimeout(layoutT);
      cancelAnimationFrame(raf);
    };
  }, [location]);

  return (
    <div className="munch" aria-hidden="true">
      <div className="munch__track" ref={trackRef}>
        <span className="munch__line" ref={lineRef} />
        <div className="munch__dots" ref={dotsRef} />
        <span className="munch__bot" ref={botRef}>
          <Sprite rows={BIT.shut} className="m-c" />
          <Sprite rows={BIT.open} className="m-o" />
        </span>
      </div>
    </div>
  );
}
