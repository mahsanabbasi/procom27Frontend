/* =====================================================================
   01 · TEAM RING — every team sits on a ring around an LED screen.
   Spin it (drag, the arrow keys, or the mouse wheel once you've clicked
   into it), search, or jump to a department. The team at the pointer
   shows on the screen, decoded from binary.
   Narrow screens get the same ring as a vertical drum.

   The ring's motion (positions, drag, inertia) runs imperatively on the
   DOM for smoothness; everything else is rendered from React state.
   The page controller (`ctl`) owns the state and receives this ring's
   engine through `ctl.ring`.
   ===================================================================== */
import { useLayoutEffect, useRef } from 'react';
import Emblem from './Emblem.jsx';
import Icon from '../arcade/Icon.jsx';
import SectionLabel from '../arcade/SectionLabel.jsx';
import { CATEGORIES, N, ORDER, TONES } from '../../data/teamDirectory.js';
import { MOTION, pad } from '../../utils/arcade/util.js';

const NN = ORDER.length;
const SP = 58; // drum: px between teams
const CATS = [{ id: 'all', label: 'All teams' }].concat(CATEGORIES);

const wrap = (d) => {
  const m = ((d % NN) + NN) % NN;
  return m > NN / 2 ? m - NN : m;
};
const idx = (p) => ((Math.round(p) % NN) + NN) % NN;

export default function TeamRing({ ctl, cat, qInput, qApplied, list, curTeam, hit }) {
  const ringRef = useRef(null);
  const wheelRef = useRef(null);
  const trackRef = useRef(null);
  const deptRef = useRef(null);
  const nameRef = useRef(null);
  const leadRef = useRef(null);
  const nodes = useRef(new Map()); // team id → { node, btn, em }
  const { arenaRef, qRef, chipRefs } = ctl;

  const any = cat !== 'all' || !!qApplied;
  const enabledList = any ? list.map((r) => r.t) : ORDER;
  const catLabel = (CATS.find((c) => c.id === cat) || CATS[0]).label;
  const selValue = enabledList.some((t) => t.id === curTeam.id) ? String(curTeam.id) : enabledList[0] ? String(enabledList[0].id) : '';
  const lead = curTeam.leads[0];
  const more = curTeam.leads.length - 1;

  /* ---------- the ring engine ---------- */
  useLayoutEffect(() => {
    const ring = ringRef.current;
    const wheel = wheelRef.current;
    const track = trackRef.current;
    const E = { pos: 0, target: 0, raf: 0, mode: 'ring', S: 0, Re: 0, drag: null, engaged: false, wheelAcc: 0, alive: true };
    const timers = new Map();
    const node = (t) => nodes.current.get(t.id);
    const isOff = (t) => node(t).node.classList.contains('is-off');

    function drawTrack() {
      const c = E.S / 2;
      const step = 360 / NN;
      let out = `<circle cx="${c}" cy="${c}" r="${E.Re}" fill="none" stroke="#3C2B52" stroke-width="2"/>`;
      const pt = (a, r) => {
        const t = ((a - 90) * Math.PI) / 180;
        return [c + r * Math.cos(t), c + r * Math.sin(t)];
      };
      CATEGORIES.forEach((cat) => {
        const ii = ORDER.map((t, i) => (t.category === cat.id ? i : -1)).filter((i) => i >= 0);
        if (!ii.length) return;
        const a0 = (ii[0] - 0.42) * step + 90;
        const a1 = (ii[ii.length - 1] + 0.42) * step + 90;
        const r = E.Re + 30;
        const p0 = pt(a0, r);
        const p1 = pt(a1, r);
        const large = a1 - a0 > 180 ? 1 : 0;
        out += `<path d="M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${r} ${r} 0 ${large} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}" fill="none" stroke="${TONES[cat.id] || '#B57CFF'}" stroke-width="4" stroke-linecap="butt" opacity=".75"/>`;
      });
      track.setAttribute('viewBox', `0 0 ${E.S} ${E.S}`);
      track.innerHTML = out;
    }
    function render() {
      const h = wheel.clientHeight / 2;
      ORDER.forEach((t) => {
        const d = wrap(t.n - E.pos);
        const { node: n, em } = node(t);
        const at = Math.abs(d) < 0.5;
        if (E.mode === 'ring') {
          const a = (d * 360) / NN;
          const flip = Math.cos((a * Math.PI) / 180) < 0;
          n.style.transform = `rotate(${a.toFixed(3)}deg)`;
          em.style.transform = `rotate(${(-a).toFixed(3)}deg)`;
          n.style.visibility = '';
          n.style.opacity = '';
          if (n._flip !== flip) {
            n._flip = flip;
            n.classList.toggle('is-flip', flip);
          }
        } else {
          const y = d * SP;
          const R = 520;
          const x = R - Math.sqrt(Math.max(0, R * R - y * y));
          const vis = Math.abs(y) < h + SP;
          n.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
          em.style.transform = '';
          n.style.visibility = vis ? '' : 'hidden';
          n.style.opacity = vis ? Math.max(0.2, 1 - Math.abs(d) / 3.6).toFixed(2) : '0';
          if (n._flip) {
            n._flip = false;
            n.classList.remove('is-flip');
          }
        }
        if (n._at !== at) {
          n._at = at;
          n.classList.toggle('is-at', at);
        }
      });
      track.style.transform = `rotate(${((-E.pos * 360) / NN).toFixed(3)}deg)`;
    }
    function layout() {
      const w = ring.clientWidth;
      if (!w) return;
      E.mode = w < 600 ? 'drum' : 'ring';
      ring.classList.toggle('is-drum', E.mode === 'drum');
      if (E.mode === 'ring') {
        E.S = w;
        E.Re = E.S * 0.315;
        ring.style.setProperty('--Re', E.Re.toFixed(1) + 'px');
        ring.style.setProperty('--Ro', (E.S * 0.5 - 2).toFixed(1) + 'px');
        ring.style.setProperty('--D', (2 * (E.Re - 40)).toFixed(1) + 'px');
        drawTrack();
      }
      render();
    }
    function loop() {
      E.raf = 0;
      if (!E.alive) return;
      const d = E.target - E.pos;
      if (Math.abs(d) < 0.003) {
        E.pos = E.target;
        const w = ((E.pos % NN) + NN) % NN;
        E.target += w - E.pos;
        E.pos = w;
        render();
        return;
      }
      E.pos += d * (MOTION ? 0.15 : 1);
      render();
      E.raf = requestAnimationFrame(loop);
    }
    const spin = () => {
      if (!E.raf) E.raf = requestAnimationFrame(loop);
    };

    /* the LED screen: details decode out of binary */
    function bin(el, txt) {
      clearInterval(timers.get(el));
      if (!MOTION) {
        el.textContent = txt;
        return;
      }
      const n = txt.length;
      const stepN = Math.max(1, Math.ceil(n / 12));
      let k = 0;
      timers.set(
        el,
        setInterval(() => {
          k += stepN;
          let s = '';
          for (let i = 0; i < n; i++) {
            const ch = txt.charAt(i);
            s += i < k || ch === ' ' ? ch : Math.random() > 0.5 ? '1' : '0';
          }
          el.textContent = s;
          if (k >= n) clearInterval(timers.get(el));
        }, 30),
      );
    }

    ctl.ring.current = {
      el: ring,
      isOff,
      dragMoved: () => !!(E.drag && E.drag.moved),
      engage: () => {
        E.engaged = true;
      },
      spinTo(t, spins = 0) {
        E.target = E.pos + wrap(t.n - E.pos) + spins * NN;
        spin();
      },
      setCurrent(t) {
        ORDER.forEach((x) => {
          const b = node(x).btn;
          b.tabIndex = x === t ? 0 : -1;
          if (x === t) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        });
      },
      setOff(on, anyFilter) {
        ORDER.forEach((t) => node(t).node.classList.toggle('is-off', anyFilter && !on.has(t.id)));
      },
      decode(t, anim) {
        const ld = t.leads[0];
        bin(deptRef.current, t.cat.label + ' · ' + t.code);
        bin(nameRef.current, t.name);
        bin(leadRef.current, ld ? ld.role + ' · ' + ld.name : 'Leads to be announced');
        if (anim && MOTION) {
          ring.classList.remove('is-swap');
          void ring.offsetWidth;
          ring.classList.add('is-swap');
        }
      },
      focusBtn(t) {
        node(t).btn.focus({ preventScroll: true });
      },
    };

    /* ---------- drag to spin (with a little inertia) ---------- */
    const angleAt = (e) => {
      const r = ring.getBoundingClientRect();
      return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    };
    const onDown = (e) => {
      if (e.button > 0) return;
      E.engaged = true;
      E.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, a: angleAt(e), p: E.pos, moved: false, hist: [] };
    };
    const onMove = (e) => {
      const drag = E.drag;
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved) {
        if (Math.hypot(dx, dy) < 7) return;
        drag.moved = true;
        try {
          wheel.setPointerCapture(e.pointerId);
        } catch {
          /* capture unsupported */
        }
        ring.classList.add('is-drag');
      }
      if (E.mode === 'ring') {
        let da = angleAt(e) - drag.a;
        da = ((da + 540) % 360) - 180;
        drag.a = angleAt(e);
        drag.p -= (da * NN) / 360;
      } else {
        drag.p -= (e.clientY - (drag.ly || drag.y)) / SP;
        drag.ly = e.clientY;
      }
      E.pos = E.target = drag.p;
      render();
      drag.hist.push({ t: performance.now(), p: E.pos });
      if (drag.hist.length > 6) drag.hist.shift();
    };
    const endDrag = () => {
      const d = E.drag;
      if (!d) return;
      setTimeout(() => {
        E.drag = null;
      }, 0);
      ring.classList.remove('is-drag');
      if (!d.moved) return;
      const h = d.hist;
      let v = 0;
      if (h.length > 1) {
        const a = h[0];
        const b = h[h.length - 1];
        v = ((b.p - a.p) / Math.max(16, b.t - a.t)) * 1000;
      }
      const land = Math.round(E.pos + Math.max(-4, Math.min(4, v * 0.22)));
      let t = ORDER[idx(land)];
      if (isOff(t)) {
        const on = ORDER.filter((x) => !isOff(x));
        if (on.length) t = on.sort((p1, p2) => Math.abs(wrap(p1.n - land)) - Math.abs(wrap(p2.n - land)))[0];
      }
      E.target = E.pos + wrap(t.n - E.pos);
      ctl.preview(t, { anim: true, sound: true, user: true });
    };
    /* mouse wheel: only after you've clicked into the ring */
    const onLeave = () => {
      if (!E.drag) E.engaged = false;
    };
    const onFocusIn = () => {
      E.engaged = true;
    };
    const onWheel = (e) => {
      if (!E.engaged || E.mode !== 'ring') return;
      e.preventDefault();
      E.wheelAcc += e.deltaY;
      const n = Math.trunc(E.wheelAcc / 70);
      if (n) {
        E.wheelAcc -= n * 70;
        ctl.step(n > 0 ? 1 : -1);
      }
    };
    wheel.addEventListener('pointerdown', onDown);
    wheel.addEventListener('pointermove', onMove);
    wheel.addEventListener('pointerup', endDrag);
    wheel.addEventListener('pointercancel', endDrag);
    ring.addEventListener('pointerleave', onLeave);
    ring.addEventListener('focusin', onFocusIn);
    ring.addEventListener('wheel', onWheel, { passive: false });

    layout();
    let ro;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(layout);
      ro.observe(ring);
    }
    window.addEventListener('load', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => E.alive && layout());
    /* first view: the ring spins in and lands on the current team */
    let io0;
    if (MOTION && 'IntersectionObserver' in window) {
      io0 = new IntersectionObserver(
        (es) => {
          if (es[0].isIntersecting) {
            io0.disconnect();
            E.pos -= NN * 0.6;
            render();
            spin();
          }
        },
        { threshold: 0.3 },
      );
      io0.observe(ring);
    }

    return () => {
      E.alive = false;
      cancelAnimationFrame(E.raf);
      timers.forEach((t) => clearInterval(t));
      wheel.removeEventListener('pointerdown', onDown);
      wheel.removeEventListener('pointermove', onMove);
      wheel.removeEventListener('pointerup', endDrag);
      wheel.removeEventListener('pointercancel', endDrag);
      ring.removeEventListener('pointerleave', onLeave);
      ring.removeEventListener('focusin', onFocusIn);
      ring.removeEventListener('wheel', onWheel);
      window.removeEventListener('load', layout);
      if (ro) ro.disconnect();
      if (io0) io0.disconnect();
    };
    // the engine is built once; it reads the latest controller through `ctl`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- keyboard on the ring ---------- */
  function onWheelKey(e) {
    const k = e.key;
    let t = null;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      ctl.catStep(k === 'ArrowDown' ? 1 : -1);
      ctl.focusCurrent();
      return;
    }
    if (k === 'ArrowRight') t = ctl.step(1);
    else if (k === 'ArrowLeft') t = ctl.step(-1);
    else if (k === 'Home' || k === 'End') {
      const l = ctl.enabled();
      t = k === 'Home' ? l[0] : l[l.length - 1];
      ctl.preview(t, { anim: true, user: true });
    } else if (k === 'Enter' && e.target.classList.contains('rn__b')) {
      e.preventDefault();
      ctl.openCurrent(e.target);
      return;
    } else return;
    e.preventDefault();
    if (t) ctl.ring.current.focusBtn(t);
  }

  const status = !any
    ? `${N} teams on the ring`
    : list.length
      ? `Showing ${list.length} of ${N} teams`
      : `No teams match “${qApplied}”. Try a team name, a person or a department.`;

  return (
    <section className="trs" id="arena" ref={arenaRef} aria-labelledby="sel-title" data-munch="users" data-munch-label="Team ring">
      <div className="shell">
        <header className="trs__top">
          <SectionLabel text="// Meet our teams · One collective" />
          <h1 className="sel__h1" id="sel-title">
            Select your team
          </h1>
          <p className="sel__intro">
            Meet the student teams behind PROCOM’27. Use up/down to change category, then choose a team from the menu or tap its icon on the ring.
          </p>
        </header>
        <div className="trs__grid">
          <div className="trs__ctl" role="search">
            <label className="search">
              <span className="sr-only">Search teams or people</span>
              <Icon name="search" />
              <input
                ref={qRef}
                className="input"
                type="search"
                id="q"
                placeholder="Search teams or people…"
                autoComplete="off"
                spellCheck="false"
                aria-describedby="status"
                value={qInput}
                onChange={(e) => ctl.onSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    ctl.openCurrent(e.currentTarget);
                  }
                }}
              />
              <button className="icon-btn" type="button" id="qclr" aria-label="Clear search" hidden={!qApplied} onClick={ctl.clearSearch}>
                <Icon name="close" />
              </button>
            </label>
            <div className="chips" id="chips" role="group" aria-label="Jump to a department">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  ref={(el) => chipRefs.current.set(c.id, el)}
                  type="button"
                  className="chip"
                  data-cat={c.id}
                  style={{ '--tone': TONES[c.id] || '#B57CFF' }}
                  aria-pressed={c.id === cat}
                  onClick={() => ctl.pickCat(c.id)}
                >
                  {c.label}
                  <span className="count">{ctl.countFor(c.id)}</span>
                </button>
              ))}
            </div>
            <div className="tpick">
              <div className="tpick__f">
                <span className="tpick__lbl t-label" id="catLbl">
                  Category
                </span>
                <div className="trs__spin">
                  <button className="spinb" type="button" id="catPrev" aria-label="Previous category" onClick={() => ctl.catStep(-1)}>
                    <Icon name="chevron-up" />
                  </button>
                  <span className="spinb tpick__val" id="catVal" aria-live="polite" aria-labelledby="catLbl catVal">
                    {catLabel}
                  </span>
                  <button className="spinb" type="button" id="catNext" aria-label="Next category" onClick={() => ctl.catStep(1)}>
                    <Icon name="chevron-down" />
                  </button>
                </div>
              </div>
              <label className="tpick__f">
                <span className="tpick__lbl t-label">Team</span>
                <span className="tpick__selw">
                  <select
                    className="tpick__sel"
                    id="teamSel"
                    aria-label="Choose a team"
                    value={selValue}
                    disabled={!enabledList.length}
                    onChange={(e) => ctl.pickTeam(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        ctl.openCurrent(e.currentTarget);
                      }
                    }}
                  >
                    {enabledList.map((t) => (
                      <option key={t.id} value={String(t.id)}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" />
                </span>
              </label>
            </div>
            <div className="status">
              <span id="status" aria-live="polite">
                {status}
              </span>
              <button className="link-action" type="button" id="reset" hidden={!any} onClick={ctl.resetAll}>
                Show all teams
              </button>
            </div>
            <p className="trs__hint t-label" aria-hidden="true">
              ↑ ↓ change category · select a team from the menu
            </p>
          </div>

          <div className="tring" id="tring" ref={ringRef}>
            <svg className="tring__track" id="ringTrack" aria-hidden="true" ref={trackRef} />
            <div
              className="tring__wheel"
              id="ringWheel"
              role="group"
              aria-label="All teams. Use the arrow keys to move between teams."
              ref={wheelRef}
              onKeyDown={onWheelKey}
            >
              {ORDER.map((t) => (
                <div
                  key={t.id}
                  className="rn"
                  style={{ '--tone': TONES[t.category] || '#B57CFF' }}
                  ref={(el) => {
                    if (!el) return;
                    nodes.current.set(t.id, { node: el, btn: el.firstChild, em: el.firstChild.firstChild });
                  }}
                >
                  <button className="rn__b" type="button" tabIndex={-1} aria-label={`${t.name}, ${t.cat.label}`} onClick={() => ctl.onNodeClick(t)}>
                    <span className="rn__em">
                      <Emblem team={t} />
                    </span>
                    <span className="rn__lb">
                      <b>{t.name}</b>
                      <small>
                        {t.cat.short} · {t.code}
                      </small>
                    </span>
                  </button>
                </div>
              ))}
            </div>
            <span className="tring__ptr" aria-hidden="true" />
            <div className="tring__scr" id="ringScr">
              <div className="rs__led" aria-hidden="true" />
              <div className="rs__in">
                <p className="rs__no t-label" aria-hidden="true">
                  Team <b id="rsIdx">{pad(curTeam.n + 1)}</b> / <span id="rsTot">{pad(NN)}</span>
                </p>
                <span className="rs__em" id="rsEm" aria-hidden="true">
                  <Emblem team={curTeam} />
                </span>
                <p className="rs__dept" id="rsDept" ref={deptRef} />
                <h2 className="rs__name" id="rsName" aria-live="polite" ref={nameRef} />
                <p className="rs__lead" id="rsLead" ref={leadRef} />
                <p className="rs__more" id="rsMore">
                  {more > 0 ? `+${more} more lead${more > 1 ? 's' : ''} on the team page` : curTeam.leads.length ? '1 lead listed' : ''}
                </p>
                <p className="rs__hit" id="rsHit" hidden={!hit}>
                  {hit ? `Match: ${hit.name} (${hit.role})` : ''}
                </p>
                <button className="rs__go" type="button" id="rsGo" onClick={(e) => ctl.openCurrent(e.currentTarget)}>
                  Open team
                  <Icon name="arrow" />
                </button>
              </div>
            </div>
            <p className="sr-only" aria-live="polite">
              {`${curTeam.name}, ${curTeam.cat.label}. ${lead ? lead.role + ' ' + lead.name + '. ' : ''}${curTeam.leads.length} leads listed.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
