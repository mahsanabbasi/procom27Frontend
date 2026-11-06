/* =====================================================================
   03 — HOW TEAMS WORK: "Climb the ranks" — girders, ladders and Bit.
   Bit walks to a ladder, climbs, and wears the crown at the top floor.
   ===================================================================== */
import { useEffect, useRef, useState } from 'react';
import Icon from '../arcade/Icon.jsx';
import Reveal from '../arcade/Reveal.jsx';
import SectionLabel from '../arcade/SectionLabel.jsx';
import { burst } from '../../utils/arcade/burst.js';
import { sfx } from '../../utils/arcade/sfx.js';
import { quest } from '../../utils/arcade/xp.js';
import { MOTION, pad, retrigger } from '../../utils/arcade/util.js';

const NAMES = { 1: 'Team members', 2: 'Deputy directors', 3: 'Director', 4: 'Executive director' };
const LEVELS = [
  { l: 4, cls: 'lvl', lx: '84%', no: 'Rank 01 · Top floor', title: 'Executive Director', text: 'Oversees the team’s area and makes the big decisions.' },
  { l: 3, cls: 'lvl lvl--r', lx: '84%', no: 'Rank 02', title: 'Director', text: 'Runs the team and manages its day-to-day work.' },
  { l: 2, cls: 'lvl lvl--l', lx: '16%', no: 'Rank 03', title: 'Deputy Directors', text: 'Help the Director and look after different parts of the work.' },
  { l: 1, cls: 'lvl lvl--r', lx: '84%', no: 'Rank 04 · Start', title: 'Team members', text: 'Do the hands-on work for the team.' },
];
const GH = 14;
const BW = 24;
const BH = 36;

export default function ClimbRanks() {
  const [at, setAt] = useState(1);
  const stageRef = useRef(null);
  const bitRef = useRef(null);
  const crownRef = useRef(null);
  const popRef = useRef(null);
  const lvlRefs = useRef({});
  const goRef = useRef(() => {});

  useEffect(() => {
    const stage = stageRef.current;
    const bit = bitRef.current;
    const crown = crownRef.current;
    const pop = popRef.current;
    const lvls = lvlRefs.current;
    const S = { at: 1, x: 0, y: 0, busy: false, alive: true };
    const timers = [];

    const floorY = (k) => lvls[k].offsetTop + lvls[k].offsetHeight - GH - BH;
    const ladderX = (k) => (lvls[k].offsetWidth * parseFloat(getComputedStyle(lvls[k]).getPropertyValue('--lx'))) / 100;
    const restX = (k) => {
      if (k === 1) return Math.min(stage.offsetWidth * 0.5, ladderX(1) - 140);
      const from = ladderX(k - 1);
      const dir = from > stage.offsetWidth / 2 ? -1 : 1;
      return from + dir * 46;
    };
    const put = (nx, ny) => {
      S.x = nx;
      S.y = ny;
      bit.style.transform = 'translate(' + (S.x - BW / 2).toFixed(1) + 'px,' + S.y.toFixed(1) + 'px)';
    };
    const setOn = (k) => {
      S.at = k;
      setAt(k);
    };
    const showPop = (txt) => {
      pop.textContent = txt;
      pop.style.left = S.x + 'px';
      pop.style.top = S.y - (S.at === 4 ? 50 : 26) + 'px';
      retrigger(pop, 'is-on');
    };
    const tween = (tx, ty, speed, cls) =>
      new Promise((res) => {
        const sx = S.x;
        const sy = S.y;
        const d = Math.hypot(tx - sx, ty - sy);
        if (!MOTION || d < 1) {
          put(tx, ty);
          res();
          return;
        }
        const dur = (d / speed) * 1000;
        const t0 = performance.now();
        bit.classList.toggle('is-left', tx < sx - 1);
        bit.classList.add(cls);
        const f = (t) => {
          if (!S.alive) return res();
          const p = Math.min(1, (t - t0) / dur);
          put(sx + (tx - sx) * p, sy + (ty - sy) * p);
          if (p < 1) requestAnimationFrame(f);
          else {
            bit.classList.remove(cls);
            res();
          }
        };
        requestAnimationFrame(f);
      });
    const wait = (ms) =>
      new Promise((r) => {
        timers.push(setTimeout(r, MOTION ? ms : 0));
      });

    async function go(target, pauseEach) {
      if (S.busy || target === S.at || target < 1 || target > 4) return;
      S.busy = true;
      bit.classList.remove('is-win');
      crown.classList.remove('on-head');
      crown.style.left = '';
      while (S.at !== target && S.alive) {
        const up = target > S.at;
        const k = S.at;
        const lad = up ? ladderX(k) : ladderX(k - 1);
        const next = up ? k + 1 : k - 1;
        await tween(lad, floorY(k), 430, 'is-walk');
        sfx.play('jump');
        await tween(lad, floorY(next), 230, 'is-climb');
        setOn(next);
        sfx.play('blip');
        if (next !== target && pauseEach) await wait(pauseEach);
      }
      if (!S.alive) return;
      await tween(restX(S.at), floorY(S.at), 430, 'is-walk');
      if (S.at === 4) {
        crown.style.left = S.x + 'px';
        crown.classList.add('on-head');
        showPop('Max rank!');
        sfx.play('up');
        quest('party', lvls[4]);
        const r = crown.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top, { n: 20, spread: 90 });
      } else showPop('Rank ' + pad(5 - S.at));
      bit.classList.toggle('is-win', S.at === 4);
      S.busy = false;
    }
    goRef.current = (k) => go(k === 'up' ? S.at + 1 : k === 'down' ? S.at - 1 : k);

    const place = () => {
      if (S.busy) return;
      put(restX(S.at), floorY(S.at));
    };
    setOn(1);
    place();
    window.addEventListener('resize', place);
    let ro;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(place);
      ro.observe(stage);
    }
    /* first time it scrolls into view, Bit climbs all the way up, pausing on each floor */
    let io;
    if (MOTION && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (es) => {
          if (es[0].isIntersecting) {
            io.disconnect();
            timers.push(setTimeout(() => go(4, 700), 400));
          }
        },
        { threshold: 0.55 },
      );
      io.observe(stage);
    }
    return () => {
      S.alive = false;
      window.removeEventListener('resize', place);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="section section--alt" id="structure" aria-labelledby="st-title" data-munch="flag" data-munch-label="How teams work">
      <div className="shell">
        <Reveal as="header" className="sh">
          <div>
            <SectionLabel text="03 / How teams work" />
            <h2 className="sh__title t-d2" id="st-title">
              <span className="ln" style={{ '--l': 0 }}>
                <span>How a team</span>
              </span>
              <span className="ln" style={{ '--l': 1 }}>
                <span className="t-soft">is organized.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            Each team page lists its leads by role. Here’s what each role means. Climb the ladders to go up the ranks.
          </p>
        </Reveal>
        <Reveal className="climb" id="climb" variant="scale">
          <div className="climb__hud t-label" aria-hidden="true">
            <span>1UP</span>
            <span>
              Rank <b>{pad(5 - at)}</b> / 04
            </span>
            <span>{NAMES[at]}</span>
          </div>
          <div className="climb__stage" id="clStage" ref={stageRef}>
            {LEVELS.map((v) => (
              <div
                key={v.l}
                className={v.cls + (at === v.l ? ' is-on' : '')}
                data-l={v.l}
                style={{ '--lx': v.lx }}
                ref={(el) => {
                  lvlRefs.current[v.l] = el;
                }}
                onClick={() => goRef.current(v.l)}
              >
                <div className="lvl__txt">
                  <span className="lvl__no">{v.no}</span>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
                {v.l === 4 && (
                  <span className="lvl__crown" id="clCrown" aria-hidden="true" ref={crownRef}>
                    <svg viewBox="0 0 12 10" shapeRendering="crispEdges">
                      <path d="M0 8h12v2H0zM0 1l3 3 3-4 3 4 3-3v6H0z" />
                      <path d="M5 5h2v2H5z" fill="#07060B" />
                    </svg>
                  </span>
                )}
                {v.l !== 4 && <span className="ladder" aria-hidden="true" />}
                <span className="girder" aria-hidden="true" />
              </div>
            ))}
            <span className="clbit" id="clBit" aria-hidden="true" ref={bitRef}>
              {/* the climber: limbs swing for walking, alternate on ladders, go up for the win */}
              <svg viewBox="0 0 24 36" fill="none" stroke="#DCC8FF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="6" r="4.3" fill="#0B0910" />
                <path d="M12 10.5V22" />
                <path className="sf-arm sf-l" d="M12 13.5L6.5 20" />
                <path className="sf-arm sf-r" d="M12 13.5L17.5 20" />
                <path className="sf-leg sf-l" d="M12 22L7.5 33" />
                <path className="sf-leg sf-r" d="M12 22L16.5 33" />
              </svg>
            </span>
            <span className="clpop" id="clPop" aria-hidden="true" ref={popRef} />
          </div>
          <div className="climb__ctrl">
            <button className="btn btn--secondary btn--sm" type="button" id="clDown" disabled={at <= 1} onClick={() => goRef.current('down')}>
              <Icon name="chevron-down" />
              Down a rank
            </button>
            <button className="btn btn--arcade" type="button" id="clUp" disabled={at >= 4} onClick={() => goRef.current('up')}>
              <Icon name="chevron-up" />
              Climb a rank
            </button>
            <span className="climb__tip t-label">or click any floor</span>
          </div>
          <p className="sr-only" id="clLive" aria-live="polite">
            Rank {5 - at}: {LEVELS.find((v) => v.l === at).title}
          </p>
        </Reveal>
        <p className="t-meta climb__note">Not every team has every role. Some have no Executive Director, and some have two Directors.</p>
      </div>
    </section>
  );
}
