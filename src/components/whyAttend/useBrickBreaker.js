import { useCallback, useEffect, useRef, useState } from "react";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/** Original reference physics; React owns the category, meter and completion UI. */
export function useBrickBreaker({ motion, onProgress, sound, burst, quest }) {
  const field = useRef(null),
    paddle = useRef(null),
    ball = useRef(null),
    bricks = useRef([]),
    meter = useRef([]),
    clear = useRef(null);
  const [broken, setBroken] = useState([]),
    [selected, setSelected] = useState(null),
    [cracking, setCracking] = useState(null),
    [lit, setLit] = useState([]),
    [popping, setPopping] = useState(null),
    [message, setMessage] = useState("Click to launch"),
    [done, setDone] = useState(false),
    [live, setLive] = useState(false),
    [flash, setFlash] = useState(0);
  const sim = useRef({
      W: 0,
      H: 0,
      PW: 96,
      PH: 12,
      BS: 10,
      px: null,
      bx: 0,
      by: 0,
      vx: 0,
      vy: 0,
      speed: 420,
      stuck: true,
      broken: new Set(),
      lit: new Set(),
      rects: [],
      raf: 0,
      last: 0,
      visible: false,
      done: false,
      keys: {},
    }),
    timers = useRef(new Set()),
    animations = useRef(new Set()),
    alive = useRef(true);
  const callbacks = useRef({ motion, onProgress, sound, burst, quest });
  useEffect(() => {
    callbacks.current = { motion, onProgress, sound, burst, quest };
  }, [motion, onProgress, sound, burst, quest]);
  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      if (alive.current) fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);
  const draw = useCallback(() => {
    const s = sim.current;
    if (paddle.current)
      paddle.current.style.transform = `translate(${(s.px - s.PW / 2).toFixed(1)}px,${s.H - 30}px)`;
    if (s.stuck) {
      s.bx = s.px;
      s.by = s.H - 30 - s.BS / 2 - 2;
    }
    if (ball.current)
      ball.current.style.transform = `translate(${(s.bx - s.BS / 2).toFixed(1)}px,${(s.by - s.BS / 2).toFixed(1)}px)`;
  }, []);
  const light = useCallback(
    (i) => {
      const s = sim.current;
      if (i >= 5 || s.lit.has(i)) return;
      s.lit.add(i);
      setLit([...s.lit]);
      setPopping(i);
      schedule(() => setPopping(null), 600);
      if (s.lit.size === 5) callbacks.current.sound?.("up");
    },
    [schedule],
  );
  const hit = useCallback(
    (i, byBall = false) => {
      const s = sim.current;
      setSelected(i);
      setFlash((v) => v + 1);
      if (s.broken.has(i)) return;
      s.broken.add(i);
      const n = s.broken.size;
      setBroken([...s.broken]);
      setCracking(i);
      schedule(() => setCracking(null), 400);
      callbacks.current.onProgress(n);
      callbacks.current.sound?.(byBall ? "grab" : "drop");
      const b = bricks.current[i];
      callbacks.current.burst?.(b, { n: 14, spread: 70 });
      const slot = meter.current[n - 1];
      if (slot) {
        if (!callbacks.current.motion || !document.body.animate) light(n - 1);
        else {
          const from = b.getBoundingClientRect(),
            to = slot.getBoundingClientRect(),
            capsule = document.createElement("span");
          capsule.className = "capsule";
          capsule.textContent = "P";
          capsule.setAttribute("aria-hidden", "true");
          field.current.closest(".why-attend-page")?.appendChild(capsule);
          if (!capsule.isConnected)
            field.current.parentElement.appendChild(capsule);
          const x0 = from.left + from.width / 2 - 14,
            y0 = from.top + from.height / 2 - 8,
            x1 = to.left + to.width / 2 - 14,
            y1 = to.top + 24;
          const animation = capsule.animate(
            [
              { transform: `translate(${x0}px,${y0}px) scale(.5)`, opacity: 0 },
              {
                transform: `translate(${x0}px,${y0 + 34}px) scale(1)`,
                opacity: 1,
                offset: 0.25,
              },
              { transform: `translate(${x1}px,${y1}px) scale(.8)`, opacity: 1 },
            ],
            { duration: 900, easing: "cubic-bezier(.5,0,.65,1)" },
          );
          const entry = { animation, element: capsule };
          animations.current.add(entry);
          animation.onfinish = () => {
            capsule.remove();
            animations.current.delete(entry);
            if (alive.current) light(n - 1);
          };
        }
      }
      if (n === bricks.current.length)
        schedule(
          () => {
            s.done = true;
            s.stuck = true;
            setDone(true);
            setLive(false);
            setMessage("All clear");
            callbacks.current.sound?.("win");
            callbacks.current.burst?.(field.current, { n: 30, spread: 160 });
            callbacks.current.quest?.("brick", clear.current);
            for (let p = 0; p < 5; p++) light(p);
          },
          callbacks.current.motion ? 650 : 0,
        );
    },
    [schedule, light],
  );
  const frame = useRef(null);
  const loopOn = useCallback(() => {
    const s = sim.current;
    if (s.raf || !s.visible || s.done) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame((t) => frame.current(t));
  }, []);
  useEffect(() => {
    alive.current = true;
    const activeTimers = timers.current,
      activeAnimations = animations.current;
    const s = sim.current;
    const layout = () => {
      const el = field.current;
      if (!el) return;
      s.W = el.clientWidth;
      s.H = el.clientHeight;
      if (!s.W) return;
      s.PW = clamp(Math.round(s.W * 0.16), 74, 112);
      paddle.current.style.width = s.PW + "px";
      s.speed = clamp(s.W * 0.62, 300, 460);
      const f = el.getBoundingClientRect();
      s.rects = bricks.current.map((b) => {
        const r = b.getBoundingClientRect();
        return {
          x: r.left - f.left,
          y: r.top - f.top,
          w: r.width,
          h: r.height,
        };
      });
      if (s.px === null) s.px = s.W / 2;
      s.px = clamp(s.px, s.PW / 2, s.W - s.PW / 2);
      draw();
    };
    const miss = () => {
      s.stuck = true;
      setLive(false);
      setMessage("Missed · click to launch");
      callbacks.current.sound?.("miss");
    };
    const step = (dt) => {
      if (s.keys.l) s.px -= 520 * dt;
      if (s.keys.r) s.px += 520 * dt;
      s.px = clamp(s.px, s.PW / 2, s.W - s.PW / 2);
      if (s.stuck) return;
      const n = Math.max(1, Math.ceil((s.speed * dt) / 4)),
        h = dt / n,
        py = s.H - 30;
      for (let k = 0; k < n; k++) {
        s.bx += s.vx * h;
        s.by += s.vy * h;
        if (s.bx < s.BS / 2) {
          s.bx = s.BS / 2;
          s.vx = Math.abs(s.vx);
        } else if (s.bx > s.W - s.BS / 2) {
          s.bx = s.W - s.BS / 2;
          s.vx = -Math.abs(s.vx);
        }
        if (s.by < s.BS / 2) {
          s.by = s.BS / 2;
          s.vy = Math.abs(s.vy);
        }
        if (
          s.vy > 0 &&
          s.by + s.BS / 2 >= py &&
          s.by + s.BS / 2 <= py + s.PH + 8 &&
          s.bx >= s.px - s.PW / 2 - s.BS / 2 &&
          s.bx <= s.px + s.PW / 2 + s.BS / 2
        ) {
          const off = clamp((s.bx - s.px) / (s.PW / 2), -1, 1),
            a = (off * 58 * Math.PI) / 180;
          s.vx = s.speed * Math.sin(a);
          s.vy = -s.speed * Math.cos(a);
          s.by = py - s.BS / 2;
          callbacks.current.sound?.("blip");
        }
        for (let j = 0; j < s.rects.length; j++) {
          if (s.broken.has(j)) continue;
          const r = s.rects[j];
          if (
            s.bx + s.BS / 2 > r.x &&
            s.bx - s.BS / 2 < r.x + r.w &&
            s.by + s.BS / 2 > r.y &&
            s.by - s.BS / 2 < r.y + r.h
          ) {
            const ox = Math.min(
                s.bx + s.BS / 2 - r.x,
                r.x + r.w - (s.bx - s.BS / 2),
              ),
              oy = Math.min(
                s.by + s.BS / 2 - r.y,
                r.y + r.h - (s.by - s.BS / 2),
              );
            if (ox < oy) s.vx = -s.vx;
            else s.vy = -s.vy;
            hit(j, true);
            break;
          }
        }
        if (s.by > s.H + s.BS) {
          miss();
          return;
        }
      }
    };
    frame.current = (t) => {
      s.raf = 0;
      if (!s.visible || s.done || document.hidden) return;
      const dt = Math.min(0.033, (t - s.last) / 1000) || 0;
      s.last = t;
      step(dt);
      draw();
      s.raf = requestAnimationFrame((v) => frame.current(v));
    };
    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(field.current);
    const io = new IntersectionObserver(
      (es) => {
        s.visible = es[0].isIntersecting;
        if (s.visible) {
          layout();
          loopOn();
        } else {
          cancelAnimationFrame(s.raf);
          s.raf = 0;
        }
      },
      { threshold: 0.15 },
    );
    io.observe(field.current);
    const visible = () => {
      if (document.hidden) {
        cancelAnimationFrame(s.raf);
        s.raf = 0;
      } else loopOn();
    };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("load", layout);
    document.fonts?.ready.then(() => {
      if (alive.current) layout();
    });
    return () => {
      alive.current = false;
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      resize.disconnect();
      io.disconnect();
      activeTimers.forEach(clearTimeout);
      activeAnimations.forEach(({ animation, element }) => {
        animation.cancel();
        element.remove();
      });
      activeAnimations.clear();
      window.removeEventListener("load", layout);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [draw, hit, loopOn]);
  const launch = () => {
    const s = sim.current;
    if (!s.stuck || s.done) return;
    s.stuck = false;
    setLive(true);
    const a = ((Math.random() * 50 - 25) * Math.PI) / 180;
    s.vx = s.speed * Math.sin(a);
    s.vy = -s.speed * Math.cos(a);
    setMessage("Break them all");
    sound?.("press");
    loopOn();
  };
  const move = (e) => {
    const s = sim.current,
      f = field.current.getBoundingClientRect();
    s.px = clamp(e.clientX - f.left, s.PW / 2, s.W - s.PW / 2);
    if (s.stuck) draw();
  };
  const pointerDown = (e) => {
    if (e.target.closest(".brick,.bb__clear")) return;
    move(e);
    draw();
    launch();
  };
  const keyDown = (e) => {
    if (e.target !== field.current) return;
    const s = sim.current;
    if (e.key === "ArrowLeft") {
      s.keys.l = true;
      e.preventDefault();
      loopOn();
    } else if (e.key === "ArrowRight") {
      s.keys.r = true;
      e.preventDefault();
      loopOn();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      launch();
    }
  };
  const keyUp = (e) => {
    if (e.key === "ArrowLeft") sim.current.keys.l = false;
    if (e.key === "ArrowRight") sim.current.keys.r = false;
  };
  const reset = () => {
    const s = sim.current;
    s.broken.clear();
    setBroken([]);
    s.done = false;
    s.stuck = true;
    setDone(false);
    setLive(false);
    setMessage("Click to launch");
    draw();
    loopOn();
    field.current?.focus();
  };
  return {
    field,
    paddle,
    ball,
    bindBrick: (i) => (el) => {
      bricks.current[i] = el;
    },
    bindMeter: (i) => (el) => {
      meter.current[i] = el;
    },
    clear,
    broken,
    selected,
    cracking,
    lit,
    popping,
    message,
    done,
    live,
    flash,
    hit,
    move,
    pointerDown,
    keyDown,
    keyUp,
    blur: () => {
      sim.current.keys = {};
    },
    reset,
  };
}
