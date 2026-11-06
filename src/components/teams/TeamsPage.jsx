/* =====================================================================
   TEAMS — CHARACTER SELECT
   Crest-lattice backdrop, 1P portrait with speed lines, manga-panel
   roster in halftone duotones (one tone per department), roaming P1
   cursor, random select and a lock-in stamp. Detail view at /teams/:slug.
   ===================================================================== */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import SelectArena from './SelectArena.jsx';
import Departments from './Departments.jsx';
import ClimbRanks from './ClimbRanks.jsx';
import FeaturedCrew from './FeaturedCrew.jsx';
import FinalSection from './FinalSection.jsx';
import TeamDetail from './TeamDetail.jsx';
import { results } from './search.js';
import ArcadeLayout from '../arcade/ArcadeLayout.jsx';
import { CONFIG, ORDER, TEAMS, catById, catForGroupKey, teamBySlug } from '../../data/teamDirectory.js';
import { burstAt } from '../../utils/arcade/burst.js';
import { sfx } from '../../utils/arcade/sfx.js';
import { quest } from '../../utils/arcade/xp.js';
import { lockScroll, unlockScroll } from '../../utils/arcade/scrollLock.js';
import { FINE, MOTION, isTyping, retrigger } from '../../utils/arcade/util.js';

const PAGE_TITLE = 'Our Teams — PROCOM’27';
const UX = TEAMS.find((t) => t.slug === 'ui-ux') || ORDER[0];
const teamById = (id) => TEAMS[id];

/* `/teams?group=competitions` (the site footer's links) opens on that department */
function initialView() {
  const g = new URLSearchParams(window.location.search).get('group');
  const cat = !g ? 'all' : catById[g] ? g : catForGroupKey(g);
  const list = results(cat, '');
  const cur = list.some((r) => r.t.id === UX.id) ? UX : list[0].t;
  return { cat, cur: cur.id, on: new Set(list.map((r) => r.t.id)) };
}

function hitsFor(cat, q) {
  const m = new Map();
  results(cat, q).forEach((r) => {
    if (r.m.person) m.set(r.t.id, r.m.person);
  });
  return m;
}

export default function TeamsPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const routeTeam = params.slug ? teamBySlug(params.slug) : null;

  /* ---------- state (mirrored in refs for event handlers / timers) ---------- */
  const [init] = useState(initialView);
  const [cat, setCat] = useState(init.cat);
  const [q, setQ] = useState('');
  const [curId, setCurId] = useState(init.cur);
  const [lockingId, setLockingId] = useState(null);
  const [introOn, setIntroOn] = useState(false);
  const [detailTeam, setDetailTeam] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const S = useRef({ cat: init.cat, q: '', cur: init.cur, on: init.on, locking: false, rolling: false, detailOpen: false, pushed: false, returnFocus: null });

  const refs = {
    arena: useRef(null),
    p1: useRef(null),
    q: useRef(null),
    grid: useRef(null),
    cursor: useRef(null),
    chips: useRef(new Map()),
    depts: useRef(new Map()),
    lis: useRef(new Map()),
    btns: useRef(new Map()),
  };
  const detailRef = useRef(null);
  const dNameRef = useRef(null);

  /* ---------- roving P1 cursor ---------- */
  const placeCursor = useCallback(() => {
    const cursor = refs.cursor.current;
    const grid = refs.grid.current;
    const t = teamById(S.current.cur);
    if (!cursor || !grid) return;
    const li = t && refs.lis.current.get(t.id);
    if (!t || !S.current.on.has(t.id) || !li) {
      cursor.hidden = true;
      return;
    }
    const g = grid.getBoundingClientRect();
    const r = li.getBoundingClientRect();
    cursor.hidden = false;
    cursor.style.width = r.width + 'px';
    cursor.style.height = r.height + 'px';
    cursor.style.transform = 'translate(' + (r.left - g.left).toFixed(1) + 'px,' + (r.top - g.top).toFixed(1) + 'px)';
    const sec = refs.depts.current.get(t.category);
    if (sec) cursor.style.setProperty('--sk', getComputedStyle(sec).getPropertyValue('--sk'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- preview a team in the 1P portrait ---------- */
  const preview = useCallback((t, o = {}) => {
    if (!t) return;
    const changed = S.current.cur !== t.id;
    S.current.cur = t.id;
    setCurId(t.id);
    placeCursor();
    if (!changed && !o.force) return;
    if (o.anim && MOTION) retrigger(refs.p1.current, 'is-swap');
    if (o.sound) sfx.play('blip');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeCursor]);

  /* ---------- filtering ---------- */
  const applyFilter = useCallback((nextCat, nextQ, fromUser) => {
    S.current.cat = nextCat;
    S.current.q = nextQ;
    setCat(nextCat);
    setQ(nextQ);
    const list = results(nextCat, nextQ);
    S.current.on = new Set(list.map((r) => r.t.id));
    if (!list.length) {
      if (refs.cursor.current) refs.cursor.current.hidden = true;
      return;
    }
    const cur = teamById(S.current.cur);
    if (!cur || !S.current.on.has(cur.id)) preview(list[0].t, { anim: fromUser });
    else placeCursor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeCursor, preview]);

  const enabled = () => ORDER.filter((t) => S.current.on.has(t.id));
  const resetAll = () => {
    applyFilter('all', '', true);
    refs.q.current.focus();
  };

  /* ---------- open / close the team detail (route driven) ---------- */
  const openDetail = (t, from) => {
    S.current.returnFocus = from || document.activeElement;
    S.current.pushed = true;
    navigate(CONFIG.ROUTE_BASE + t.slug);
  };
  const closeDetail = () => {
    if (S.current.pushed) {
      S.current.pushed = false;
      window.history.back();
    } else navigate('/teams', { replace: true });
  };
  const goDetail = (t) => navigate(CONFIG.ROUTE_BASE + t.slug, { replace: true });

  /* ---------- lock-in: stamp, flash, shake, then open the team ---------- */
  const lockIn = (t, from) => {
    if (!t || S.current.locking) return;
    S.current.locking = true;
    preview(t, { anim: false });
    const btn = refs.btns.current.get(t.id);
    setLockingId(t.id);
    const p1 = refs.p1.current;
    retrigger(p1, 'is-locked');
    sfx.play('win');
    quest('team', btn);
    burstAt(btn, { n: 22, spread: 110 });
    setTimeout(
      () => {
        setLockingId(null);
        p1.classList.remove('is-locked');
        S.current.locking = false;
        openDetail(t, from || btn);
      },
      MOTION ? 950 : 0,
    );
  };

  /* random select: the cursor shuffles and lands on a team */
  const roulette = () => {
    const list = enabled();
    if (!list.length || S.current.rolling || S.current.locking) return;
    S.current.rolling = true;
    const steps = MOTION ? 14 : 1;
    let k = 0;
    let last = teamById(S.current.cur);
    const step = () => {
      let t;
      do {
        t = list[(Math.random() * list.length) | 0];
      } while (list.length > 1 && t === last);
      last = t;
      preview(t, { anim: k === steps - 1, sound: true });
      k++;
      if (k < steps) setTimeout(step, 60 + k * k * 2.4);
      else {
        S.current.rolling = false;
        const a = document.activeElement;
        if (a && a.classList.contains('tm')) refs.btns.current.get(t.id).focus();
      }
    };
    step();
  };

  const centre = (t) => {
    const r = refs.lis.current.get(t.id).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height };
  };

  const scrollToArena = () => refs.arena.current.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto' });

  /* controller handed to the select screen */
  const ctl = {
    refs,
    applyFilter,
    resetAll,
    lockIn,
    roulette,
    clearSearch: () => {
      applyFilter(S.current.cat, '', false);
      refs.q.current.focus();
    },
    pickChip: (id) => {
      applyFilter(id, S.current.q, true);
      sfx.play('blip');
    },
    onSearchKey: (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        const cur = teamById(S.current.cur);
        const t = cur && S.current.on.has(cur.id) ? cur : enabled()[0];
        if (t) {
          e.preventDefault();
          refs.btns.current.get(t.id).focus();
        }
      }
      if (e.key === 'Escape' && S.current.q) applyFilter(S.current.cat, '', false);
    },
    onTeamEnter: (t) => {
      if (FINE && S.current.on.has(t.id) && !S.current.locking) preview(t, { anim: true, sound: true });
    },
    onTeamFocus: (t) => {
      if (!S.current.locking) preview(t, { anim: true });
    },
    onTeamClick: (t, btn) => {
      if (!S.current.on.has(t.id)) return;
      if (!FINE && S.current.cur !== t.id) {
        preview(t, { anim: true, sound: true }); // touch: first tap previews, second tap selects
        return;
      }
      lockIn(t, btn);
    },
    onGridKey: (e) => {
      const t = teamById(S.current.cur);
      if (!t || !e.target.classList.contains('tm')) return;
      const list = enabled();
      const i = list.indexOf(t);
      let n = null;
      if (e.key === 'ArrowRight') n = list[Math.min(i + 1, list.length - 1)];
      else if (e.key === 'ArrowLeft') n = list[Math.max(i - 1, 0)];
      else if (e.key === 'Home') n = list[0];
      else if (e.key === 'End') n = list[list.length - 1];
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const c = centre(t);
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        let best = null;
        let bd = 1e9;
        list.forEach((x) => {
          if (x === t) return;
          const p = centre(x);
          const dy = (p.y - c.y) * dir;
          if (dy < c.h * 0.5) return;
          const d = dy * 3 + Math.abs(p.x - c.x);
          if (d < bd) {
            bd = d;
            best = x;
          }
        });
        if (!best && dir < 0) {
          e.preventDefault();
          refs.q.current.focus();
          return;
        }
        n = best;
      }
      if (n) {
        e.preventDefault();
        if (n !== t) {
          sfx.play('blip');
          refs.btns.current.get(n.id).focus();
        }
      }
    },
  };

  const ctlRef = useRef(ctl);
  ctlRef.current = ctl;

  /* ---------- intro: deal the panels in, keep the cursor in place ---------- */
  useEffect(() => {
    let r1;
    let r2;
    let t1;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setIntroOn(true);
        t1 = setTimeout(placeCursor, MOTION ? 900 : 0);
      });
    });
    placeCursor();
    const onResize = () => requestAnimationFrame(placeCursor);
    window.addEventListener('resize', onResize);
    window.addEventListener('load', placeCursor);
    let ro;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => placeCursor());
      ro.observe(refs.grid.current);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCursor);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      clearTimeout(t1);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', placeCursor);
      if (ro) ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- keyboard: hints, "/" to search, "R" for random ---------- */
  useEffect(() => {
    const kb = (e) => {
      if (/^(Tab|Arrow|\/)/.test(e.key) || e.key === '/') {
        document.documentElement.classList.add('kb');
        document.removeEventListener('keydown', kb);
      }
    };
    const keys = (e) => {
      if (S.current.detailOpen || isTyping(document.activeElement)) return;
      if (e.key === '/') {
        e.preventDefault();
        refs.arena.current.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto' });
        refs.q.current.focus({ preventScroll: true });
      }
      if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const r = refs.arena.current.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) ctlRef.current.roulette();
      }
    };
    document.addEventListener('keydown', kb);
    document.addEventListener('keydown', keys);
    return () => {
      document.removeEventListener('keydown', kb);
      document.removeEventListener('keydown', keys);
      document.documentElement.classList.remove('kb');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- detail view follows the route ---------- */
  useLayoutEffect(() => {
    if (routeTeam) {
      preview(routeTeam, { anim: false });
      setDetailTeam(routeTeam);
      document.title = routeTeam.name + ' — PROCOM’27 Teams';
      if (detailRef.current) detailRef.current.scrollTop = 0;
      lockScroll('detail');
      if (!S.current.detailOpen) {
        S.current.detailOpen = true;
        setDetailOpen(true);
      }
      const f = setTimeout(() => dNameRef.current && dNameRef.current.focus(), 60);
      return () => clearTimeout(f);
    }
    document.title = PAGE_TITLE;
    if (S.current.detailOpen) {
      S.current.detailOpen = false;
      S.current.pushed = false;
      setDetailOpen(false);
      unlockScroll('detail');
      const rf = S.current.returnFocus;
      const target = rf && document.body.contains(rf) ? rf : refs.btns.current.get(S.current.cur);
      if (target) target.focus({ preventScroll: true });
      requestAnimationFrame(placeCursor);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTeam]);

  useEffect(
    () => () => {
      unlockScroll('detail');
      document.title = PAGE_TITLE;
    },
    [],
  );

  const onDetailKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDetail();
      return;
    }
    if (e.key === 'Tab') {
      const f = Array.from(detailRef.current.querySelectorAll('button,a[href]')).filter((x) => x.offsetParent !== null);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  };

  /* ---------- sections below the select screen ---------- */
  const showDept = (id) => {
    applyFilter(id, '', true);
    scrollToArena();
    setTimeout(() => {
      const f = refs.chips.current.get(id);
      if (f) f.focus({ preventScroll: true });
    }, MOTION ? 500 : 0);
  };
  const showOnSelect = (t) => {
    applyFilter('all', '', false);
    scrollToArena();
    setTimeout(() => {
      refs.btns.current.get(t.id).focus({ preventScroll: true });
      preview(t, { anim: true, sound: true });
    }, MOTION ? 500 : 0);
  };

  const curTeam = teamById(curId);

  return (
    <ArcadeLayout
      page="teams"
      active="teams"
      crumbs={[{ label: 'Home', to: 'home' }, { label: 'Teams' }]}
      skip={{ href: '#arena', label: 'Skip to the team directory' }}
      after={
        <TeamDetail
          ref={detailRef}
          nameRef={dNameRef}
          team={detailTeam}
          open={detailOpen}
          onBack={closeDetail}
          onGo={goDetail}
          onKeyDown={onDetailKey}
        />
      }
    >
      <SelectArena ctl={ctl} cat={cat} q={q} curTeam={curTeam} hits={hitsFor(cat, q)} lockingId={lockingId} introOn={introOn} />
      <Departments onPick={showDept} />
      <ClimbRanks />
      <FeaturedCrew onView={openDetail} onShow={showOnSelect} />
      <FinalSection onSeeAll={() => applyFilter('all', '', true)} />
    </ArcadeLayout>
  );
}
