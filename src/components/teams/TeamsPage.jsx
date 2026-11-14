/* =====================================================================
   TEAMS — every team on a ring around an LED screen (01), departments
   (02), featured teams (03) and the closing ring. A team's detail view
   opens at /teams/:slug.
   ===================================================================== */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import TeamRing from './TeamRing.jsx';
import Departments from './Departments.jsx';
import FeaturedCrew from './FeaturedCrew.jsx';
import FinalSection from './FinalSection.jsx';
import TeamDetail from './TeamDetail.jsx';
import { results } from './search.js';
import ArcadeLayout from '../arcade/ArcadeLayout.jsx';
import { CATEGORIES, CONFIG, ORDER, TEAMS, catById, catForGroupKey, teamBySlug } from '../../data/teamDirectory.js';
import { sfx } from '../../utils/arcade/sfx.js';
import { quest } from '../../utils/arcade/xp.js';
import { lockScroll, unlockScroll } from '../../utils/arcade/scrollLock.js';
import { MOTION } from '../../utils/arcade/util.js';

const PAGE_TITLE = 'Our Teams — PROCOM’27';
const UX = TEAMS.find((t) => t.slug === 'ui-ux') || ORDER[0];
const CATS = [{ id: 'all' }].concat(CATEGORIES);
const teamById = (id) => TEAMS[id];

/* `/teams?group=competitions` (the site footer's links) opens on that department */
function initialCat() {
  const g = new URLSearchParams(window.location.search).get('group');
  return !g ? 'all' : catById[g] ? g : catForGroupKey(g);
}

/* ---------- the page controller: one stable object that reads live values
   from S, so the ring engine and timers never see stale state ---------- */
function createController({ setCat, setQInput, setQApplied, setCurId }) {
  const S = { cat: 'all', q: '', cur: null, on: new Set(), any: false, hits: new Map(), detailOpen: false, pushed: false, returnFocus: null, qT: 0 };
  const c = {
    S,
    ring: { current: null }, // the ring engine (set by TeamRing)
    arenaRef: { current: null },
    qRef: { current: null },
    chipRefs: { current: new Map() },
    navigate: null,
  };
  const ring = () => c.ring.current;

  c.enabled = () => ORDER.filter((t) => !S.any || S.on.has(t.id));
  c.countFor = (id) => results(id, S.q).length;

  c.preview = (t, o = {}) => {
    if (!t) return;
    const changed = S.cur !== t.id;
    S.cur = t.id;
    setCurId(t.id);
    ring().spinTo(t, o.spins || 0);
    ring().setCurrent(t);
    if (changed || o.force) ring().decode(t, o.anim !== false);
    if (o.sound) sfx.play('blip');
    if (o.user) quest('team', ring().el);
  };

  c.applyFilter = (nextCat, nextQ, fromUser) => {
    S.cat = nextCat;
    S.q = nextQ.trim();
    setCat(nextCat);
    setQApplied(S.q);
    const res = results(S.cat, S.q);
    S.on = new Set(res.map((r) => r.t.id));
    S.hits = new Map(res.filter((r) => r.m.person).map((r) => [r.t.id, r.m.person]));
    S.any = S.cat !== 'all' || !!S.q;
    ring().setOff(S.on, S.any);
    if (res.length && (fromUser || S.cur === null || !S.on.has(S.cur))) {
      c.preview(res[0].t, { anim: true, sound: false, force: S.hits.has(res[0].t.id) });
    }
  };

  c.step = (dir) => {
    const list = c.enabled();
    if (!list.length) return null;
    const i = list.indexOf(teamById(S.cur));
    const t = list[((((i < 0 ? 0 : i + dir) % list.length) + list.length) % list.length)];
    c.preview(t, { anim: true, sound: true, user: true });
    return t;
  };

  /* category up/down + team menu */
  c.catStep = (d) => {
    const i = Math.max(0, CATS.findIndex((x) => x.id === S.cat));
    c.applyFilter(CATS[(i + d + CATS.length) % CATS.length].id, S.q, true);
    sfx.play('blip');
  };
  c.pickCat = (id) => {
    c.applyFilter(id, S.q, true);
    sfx.play('blip');
  };
  c.pickTeam = (id) => {
    const t = teamById(id);
    if (t) c.preview(t, { anim: true, sound: true, user: true });
  };
  c.onSearch = (v) => {
    setQInput(v);
    clearTimeout(S.qT);
    S.qT = setTimeout(() => c.applyFilter(S.cat, v, true), 140);
  };
  c.clearSearch = () => {
    clearTimeout(S.qT);
    setQInput('');
    c.applyFilter(S.cat, '', true);
    c.qRef.current.focus();
  };
  c.resetAll = () => {
    clearTimeout(S.qT);
    setQInput('');
    c.applyFilter('all', '', true);
    c.qRef.current.focus();
  };
  c.onNodeClick = (t) => {
    if (ring().dragMoved()) return;
    ring().engage();
    c.preview(t, { anim: true, sound: true, user: true });
  };
  c.focusCurrent = () => {
    if (S.cur !== null) ring().focusBtn(teamById(S.cur));
  };
  c.scrollToArena = () => c.arenaRef.current.scrollIntoView({ behavior: MOTION ? 'smooth' : 'auto' });

  /* ---------- detail view (route driven) ---------- */
  c.openDetail = (t, from) => {
    S.returnFocus = from || document.activeElement;
    S.pushed = true;
    c.navigate(CONFIG.ROUTE_BASE + t.slug);
  };
  c.openCurrent = (from) => {
    if (S.cur !== null) c.openDetail(teamById(S.cur), from);
  };
  c.closeDetail = () => {
    if (S.pushed) {
      S.pushed = false;
      window.history.back();
    } else c.navigate('/teams', { replace: true });
  };
  c.goDetail = (t) => c.navigate(CONFIG.ROUTE_BASE + t.slug, { replace: true });

  /* ---------- sections below the ring ---------- */
  c.showDept = (id) => {
    clearTimeout(S.qT);
    setQInput('');
    c.applyFilter(id, '', true);
    c.scrollToArena();
    setTimeout(() => {
      const f = c.chipRefs.current.get(id);
      if (f) f.focus({ preventScroll: true });
    }, MOTION ? 500 : 0);
  };
  c.showOnRing = (t) => {
    clearTimeout(S.qT);
    setQInput('');
    c.applyFilter('all', '', false);
    c.scrollToArena();
    setTimeout(() => {
      ring().focusBtn(t);
      c.preview(t, { anim: true, sound: true });
    }, MOTION ? 500 : 0);
  };
  c.seeAll = () => {
    clearTimeout(S.qT);
    setQInput('');
    c.applyFilter('all', '', true);
  };
  return c;
}

export default function TeamsPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const routeTeam = params.slug ? teamBySlug(params.slug) : null;

  /* ---------- React state (what renders) ---------- */
  const [cat, setCat] = useState(initialCat);
  const [qInput, setQInput] = useState('');
  const [qApplied, setQApplied] = useState('');
  const [curId, setCurId] = useState(UX.id);
  const [detailTeam, setDetailTeam] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const detailRef = useRef(null);
  const dNameRef = useRef(null);
  const [ctl] = useState(() => createController({ setCat, setQInput, setQApplied, setCurId }));
  useLayoutEffect(() => {
    ctl.navigate = navigate;
  });

  /* ---------- start: filter (an optional ?group=), then land on UI/UX ---------- */
  useLayoutEffect(() => {
    ctl.navigate = navigate;
    ctl.applyFilter(initialCat(), '', false);
    if (ctl.S.on.has(UX.id) || !ctl.S.any) ctl.preview(UX, { force: true, anim: false });
    return () => clearTimeout(ctl.S.qT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- the detail view follows the route ---------- */
  useLayoutEffect(() => {
    const S = ctl.S;
    if (routeTeam) {
      ctl.preview(routeTeam, { anim: false });
      setDetailTeam(routeTeam);
      document.title = routeTeam.name + ' — PROCOM’27 Teams';
      if (detailRef.current) detailRef.current.scrollTop = 0;
      lockScroll('detail');
      if (!S.detailOpen) {
        S.detailOpen = true;
        setDetailOpen(true);
      }
      const f = setTimeout(() => dNameRef.current && dNameRef.current.focus(), 60);
      return () => clearTimeout(f);
    }
    document.title = PAGE_TITLE;
    if (S.detailOpen) {
      S.detailOpen = false;
      S.pushed = false;
      setDetailOpen(false);
      unlockScroll('detail');
      const rf = S.returnFocus;
      if (rf && document.body.contains(rf)) rf.focus({ preventScroll: true });
      else ctl.focusCurrent();
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
      ctl.closeDetail();
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

  const list = results(cat, qApplied);
  const curTeam = teamById(curId);
  const hit = list.find((r) => r.t.id === curId && r.m.person);

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
          onBack={ctl.closeDetail}
          onGo={ctl.goDetail}
          onKeyDown={onDetailKey}
        />
      }
    >
      <TeamRing ctl={ctl} cat={cat} qInput={qInput} qApplied={qApplied} list={list} curTeam={curTeam} hit={hit ? hit.m.person : null} />
      <Departments onPick={ctl.showDept} />
      <FeaturedCrew onView={ctl.openDetail} onShow={ctl.showOnRing} />
      <FinalSection onSeeAll={ctl.seeAll} />
    </ArcadeLayout>
  );
}
