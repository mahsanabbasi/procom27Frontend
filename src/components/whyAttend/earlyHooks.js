import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TIPS, PATH_ORDER, CONNECTIONS } from "./earlyData.js";

export function useHero(motion, sound) {
  const [current, setCurrent] = useState(0),
    [tip, setTip] = useState(0),
    [text, setText] = useState(TIPS[0]);
  const hold = useRef(false),
    root = useRef(null),
    first = useRef(true),
    [restart, setRestart] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!motion) return;
    let k = 0;
    const id = setInterval(() => {
      k += 2;
      setText(TIPS[tip].slice(0, k));
      if (k >= TIPS[tip].length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [tip, motion]);
  useEffect(() => {
    if (!motion) return;
    const id = setInterval(() => {
      if (!hold.current && !document.hidden)
        setTip((i) => (i + 1) % TIPS.length);
    }, 6500);
    return () => clearInterval(id);
  }, [motion, restart]);
  useEffect(() => {
    if (!motion || !matchMedia("(hover:hover) and (pointer:fine)").matches)
      return;
    let mx = 0,
      my = 0,
      tx = 0,
      ty = 0,
      id;
    const move = (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    };
    const frame = () => {
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      root.current?.closest(".why-attend-page")?.querySelectorAll("[data-tunnel]").forEach((t) => {
        t.style.setProperty("--mx", mx.toFixed(3));
        t.style.setProperty("--my", my.toFixed(3));
      });
      id = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", move, { passive: true });
    frame();
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(id);
    };
  }, [motion]);
  const nextTip = () => {
    setTip((i) => (i + 1) % TIPS.length);
    setRestart((i) => i + 1);
    sound?.("blip");
  };
  const menuKey = (e, i) => {
    let n =
      e.key === "ArrowDown"
        ? (i + 1) % 3
        : e.key === "ArrowUp"
          ? (i + 2) % 3
          : null;
    if (n === null) return;
    e.preventDefault();
    e.currentTarget.parentElement.querySelectorAll(".tmenu__it")[n]?.focus();
    sound?.("blip");
  };
  return {
    root,
    current,
    setCurrent,
    tip,
    text: motion ? text : TIPS[tip],
    onTipEnter: () => {
      hold.current = true;
    },
    onTipLeave: () => {
      hold.current = false;
    },
    nextTip,
    menuKey,
  };
}

export function useWorldMap(motion, onChoose, sound) {
  const field = useRef(null),
    walker = useRef(null),
    nodes = useRef([]),
    svg = useRef(null),
    paths = useRef([]),
    goal = useRef(0),
    at = useRef(0);
  const [selected, setSelected] = useState("compete"),
    [displayed, setDisplayed] = useState("compete"),
    [swap, setSwap] = useState(0),
    [size, setSize] = useState({ width: 0, height: 0 }),
    [position, setPosition] = useState(0),
    [cleared, setCleared] = useState([]);
  const [goalVersion, setGoalVersion] = useState(0),
    timers = useRef(new Set()),
    alive = useRef(true),
    busy = useRef(false),
    raf = useRef(0),
    geometry = useRef([]),
    pending = useRef(null);
  useEffect(() => {
    alive.current = true;
    const activeTimers = timers.current;
    return () => {
      alive.current = false;
      activeTimers.forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      if (alive.current) fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    const layout = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const points = useMemo(() => {
    const coords =
      size.width < 560
        ? [
            [7, 31],
            [30, 27],
            [70, 48],
            [30, 69],
            [70, 90],
          ]
        : [
            [3, 88],
            [14, 70],
            [39, 32],
            [63, 72],
            [87, 34],
          ];
    return coords.map(([x, y]) => ({
      x: (x / 100) * size.width,
      y: (y / 100) * size.height,
    }));
  }, [size]);
  const format = (p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  const segments = points.slice(0, -1).map((p1, i) => {
    const p0 = points[i - 1] || p1,
      p2 = points[i + 1],
      p3 = points[i + 2] || p2;
    return `M${format(p1)} C${format({ x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 })} ${format({ x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 })} ${format(p2)}`;
  });
  const road = segments
      .map((s, i) => (i ? s.slice(s.indexOf("C")) : s))
      .join(" "),
    trail = segments
      .slice(0, position)
      .map((s, i) => (i ? s.slice(s.indexOf("C")) : s))
      .join(" ");
  const put = useCallback((p) => {
    if (walker.current)
      walker.current.style.transform = `translate(${(p.x - 10).toFixed(1)}px,${(p.y - 35).toFixed(1)}px)`;
  }, []);
  useLayoutEffect(() => {
    geometry.current = points;
    nodes.current.forEach((n, i) => {
      if (!n) return;
      const card = n.querySelector(".wnode__card"),
        p = points[i + 1];
      card.style.setProperty("--sh", "0px");
      const w = card.offsetWidth,
        l = p.x - w / 2;
      card.style.setProperty(
        "--sh",
        `${(l < 8 ? 8 - l : l + w > size.width - 8 ? size.width - 8 - (l + w) : 0).toFixed(1)}px`,
      );
    });
    if (!busy.current) put(points[at.current]);
  }, [points, size.width, put]);
  useEffect(() => {
    if (!size.width || busy.current) return;
    let cancelled = false;
    const along = (path, forward, ms) =>
      new Promise((resolve) => {
        pending.current = resolve;
        const len = path.getTotalLength();
        if (!motion || ms < 16) {
          put(path.getPointAtLength(forward ? len : 0));
          resolve();
          return;
        }
        const start = performance.now();
        const frame = (now) => {
          if (cancelled || !alive.current) {
            resolve();
            return;
          }
          const f = Math.min(1, (now - start) / ms);
          put(path.getPointAtLength((forward ? f : 1 - f) * len));
          if (f < 1) raf.current = requestAnimationFrame(frame);
          else resolve();
        };
        raf.current = requestAnimationFrame(frame);
      });
    const run = async () => {
      busy.current = true;
      walker.current?.classList.add("is-walk");
      while (at.current !== goal.current && !cancelled) {
        const fwd = goal.current > at.current,
          i = fwd ? at.current : at.current - 1,
          path = paths.current[i],
          a = geometry.current[i],
          b = geometry.current[i + 1];
        if (!path) break;
        walker.current?.classList.toggle(
          "is-left",
          fwd ? b.x < a.x : a.x < b.x,
        );
        await along(path, fwd, (path.getTotalLength() / 300) * 1000);
        if (cancelled) break;
        at.current += fwd ? 1 : -1;
        setPosition(at.current);
        if (at.current > 0)
          setCleared((v) => [...new Set([...v, at.current - 1])]);
      }
      busy.current = false;
      walker.current?.classList.remove("is-walk", "is-left");
      if (!cancelled && at.current > 0) {
        const n = nodes.current[at.current - 1];
        n?.classList.remove("is-arrive");
        if (n) {
          void n.offsetWidth;
          n.classList.add("is-arrive");
        }
        sound?.("blip");
      }
    };
    run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf.current);
      pending.current?.();
      busy.current = false;
    };
  }, [goalVersion, size.width, size.height, motion, put, sound]);
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    let id;
    const go = () => {
      id = schedule(
        () => {
          if (goal.current === 0) {
            goal.current = 1;
            setGoalVersion((v) => v + 1);
          }
        },
        motion ? 450 : 0,
      );
    };
    if (!motion) {
      go();
      return () => clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          io.disconnect();
          go();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(id);
    };
  }, [motion, schedule]);
  const choose = (key, focus = false) => {
    setSelected(key);
    onChoose(key);
    goal.current = PATH_ORDER.indexOf(key) + 1;
    setGoalVersion((v) => v + 1);
    if (focus) nodes.current[goal.current - 1]?.focus();
    if (key !== selected) {
      setSwap((v) => v + 1);
      schedule(() => setDisplayed(key), motion ? 200 : 0);
    }
    sound?.("press");
  };
  const keyDown = (e, i) => {
    let n = null;
    if (["ArrowDown", "ArrowRight"].includes(e.key)) n = (i + 1) % 4;
    else if (["ArrowUp", "ArrowLeft"].includes(e.key)) n = (i + 3) % 4;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = 3;
    if (n !== null) {
      e.preventDefault();
      choose(PATH_ORDER[n], true);
    }
  };
  return {
    field,
    walker,
    svg,
    bindNode: (i) => (el) => {
      nodes.current[i] = el;
    },
    bindPath: (i) => (el) => {
      paths.current[i] = el;
    },
    selected,
    displayed,
    swap,
    size,
    points,
    road,
    trail,
    segments,
    cleared,
    choose,
    keyDown,
  };
}

export function useLobby(motion, onJoin, sound, quest, burst) {
  const root = useRef(null),
    [counts, setCounts] = useState({
      pro: 0,
      sponsor: 0,
      speaker: 0,
      student: 0,
    }),
    [log, setLog] = useState(["> Lobby open. Players joiningâ€¦"]),
    [waiting, setWaiting] = useState(false),
    [joined, setJoined] = useState(false),
    [filter, setFilter] = useState(null);
  const line = (t) => setLog((v) => [...v, t].slice(-3));
  useEffect(() => {
    const queue = CONNECTIONS.flatMap((r) => Array(r.n).fill(r.id));
    let seed = 27;
    for (let i = queue.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    let timer,
      alive = true,
      started = false;
    const ready = () => {
      line("> Everyoneâ€™s here. Waiting for you.");
      setWaiting(true);
    };
    const start = () => {
      if (started) return;
      started = true;
      if (!motion) {
        setCounts(Object.fromEntries(CONNECTIONS.map((r) => [r.id, r.n])));
        ready();
        return;
      }
      let k = 0;
      const next = () => {
        if (!alive) return;
        if (k >= queue.length) {
          ready();
          return;
        }
        const type = queue[k++];
        setCounts((v) => ({ ...v, [type]: v[type] + 1 }));
        line("> " + CONNECTIONS.find((r) => r.id === type).joined + " joined");
        timer = setTimeout(next, k < 6 ? 280 : 115);
      };
      next();
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.4 },
    );
    if (root.current) io.observe(root.current);
    return () => {
      alive = false;
      clearTimeout(timer);
      io.disconnect();
    };
  }, [motion]);
  const join = (e) => {
    setJoined(true);
    setWaiting(false);
    line("> You joined the lobby");
    onJoin();
    sound?.("coin");
    burst?.(e.currentTarget, { n: 18, spread: 90 });
    quest?.("lobby", e.currentTarget);
  };
  const highlight = (t) => {
    setFilter((v) => (v === t ? null : t));
    sound?.("blip");
  };
  return { root, counts, log, waiting, joined, filter, join, highlight };
}
