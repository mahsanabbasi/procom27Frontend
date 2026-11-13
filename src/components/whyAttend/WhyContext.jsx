import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BANK from "./soundBank.js";
import { QUESTS, STEPS } from "./questData.js";
import Context from "./contextStore.js";
import { Icon } from "./Visuals.jsx";

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage is optional. */
  }
}

export function WhyProvider({ children }) {
  const [state, setState] = useState({
    path: null,
    boss: false,
    lobby: false,
    bricks: 0,
  });
  const [motion, setMotion] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [soundOn, setSoundOn] = useState(
    () => read("procom27-sfx", false) === 1,
  );
  const [progress, setProgress] = useState(() => {
    const saved = read("procom27-xp", { xp: 0, got: {} });
    return saved &&
      Number.isFinite(saved.xp) &&
      saved.got &&
      typeof saved.got === "object"
      ? saved
      : { xp: 0, got: {} };
  });
  const [message, setMessage] = useState("");
  const audio = useRef(null),
    noticeTimer = useRef(null),
    particles = useRef(new Set()),
    ownedTimers = useRef(new Set()),
    progressRef = useRef(progress),
    soundRef = useRef(null);
  useLayoutEffect(() => {
    progressRef.current = progress;
  }, [progress]);
  const notice = useCallback((text) => {
    setMessage(String(text));
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setMessage(""), 5200);
  }, []);
  const sound = useCallback(
    (name) => {
      if (!soundOn) return;
      try {
        const ac = (audio.current ||= new (
          window.AudioContext || window.webkitAudioContext
        )());
        if (ac.state === "suspended") void ac.resume();
        let t = ac.currentTime + 0.01;
        (BANK[name] || BANK.blip).forEach((n) => {
          const oscillator = ac.createOscillator(),
            gain = ac.createGain();
          oscillator.type = n[2] || "square";
          oscillator.frequency.setValueAtTime(n[0], t);
          if (n[3])
            oscillator.frequency.exponentialRampToValueAtTime(n[3], t + n[1]);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
          oscillator.connect(gain);
          gain.connect(ac.destination);
          oscillator.start(t);
          oscillator.stop(t + n[1] + 0.02);
          t += n[1] * 0.92;
        });
      } catch {
        /* Audio may be unavailable or blocked by the browser. */
      }
    },
    [soundOn],
  );
  const burst = useCallback(
    (at, yOrOptions, options) => {
      if (!motion) return;
      const rect = at?.getBoundingClientRect?.();
      const x = rect ? rect.left + rect.width / 2 : at;
      const y = rect ? rect.top + rect.height / 2 : yOrOptions;
      const o = (rect ? yOrOptions : options) || {};
      const host = document.querySelector(".why-attend-page");
      if (!host || !Number.isFinite(x) || !Number.isFinite(y)) return;
      for (let i = 0; i < (o.n || 18); i++) {
        const p = document.createElement("i"),
          size = 4 + Math.random() * 5,
          angle = Math.random() * Math.PI * 2,
          distance = 40 + Math.random() * (o.spread || 90);
        p.setAttribute("aria-hidden", "true");
        p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${(o.colors || ["#B57CFF", "#DCC8FF", "#F5F0FA"])[i % 3]};z-index:400;pointer-events:none`;
        host.append(p);
        particles.current.add(p);
        const animation = p.animate(
          [
            { transform: "translate(-50%,-50%)", opacity: 1 },
            {
              transform: `translate(${Math.cos(angle) * distance - size / 2}px,${Math.sin(angle) * distance + 40}px) rotate(${Math.random() * 180}deg)`,
              opacity: 0,
            },
          ],
          {
            duration: 700 + Math.random() * 400,
            easing: "cubic-bezier(.2,.75,.15,1)",
          },
        );
        animation.onfinish = () => {
          p.remove();
          particles.current.delete(p);
        };
      }
    },
    [motion],
  );
  useLayoutEffect(() => {
    soundRef.current = sound;
  }, [sound]);
  const award = useCallback(
    (id, points, at) => {
      const previous = progressRef.current;
      if (!id || previous.got[id]) return false;
      const before = STEPS.filter((n) => previous.xp >= n).length;
      const next = {
        xp: previous.xp + points,
        got: { ...previous.got, [id]: 1 },
      };
      progressRef.current = next;
      setProgress(next);
      const host = document.querySelector(".why-attend-page"),
        hud = host?.querySelector(".xp__btn");
      let rect = at?.getBoundingClientRect?.() || hud?.getBoundingClientRect();
      if (rect && (rect.top < 20 || rect.top > innerHeight))
        rect = hud?.getBoundingClientRect();
      if (host && rect) {
        const float = document.createElement("span");
        float.className = "xpf";
        float.textContent = `+${points} XP`;
        float.style.left = `${rect.left + rect.width / 2}px`;
        float.style.top = `${rect.top}px`;
        host.appendChild(float);
        particles.current.add(float);
        const remove = () => {
          float.remove();
          particles.current.delete(float);
        };
        if (motion && float.animate)
          float.animate(
            [
              { transform: "translate(-50%,0)", opacity: 0 },
              { transform: "translate(-50%,-12px)", opacity: 1, offset: 0.2 },
              { transform: "translate(-50%,-46px)", opacity: 0 },
            ],
            { duration: 1150, easing: "steps(9)" },
          ).onfinish = remove;
        else {
          const id = setTimeout(() => {
            ownedTimers.current.delete(id);
            remove();
          }, 1000);
          ownedTimers.current.add(id);
        }
      }
      const after = STEPS.filter((n) => next.xp >= n).length;
      if (after > before) {
        const timer = setTimeout(() => {
          ownedTimers.current.delete(timer);
          notice(`Level up! You reached LV ${String(after).padStart(2, "0")}`);
          burst(hud, { n: 24, spread: 110 });
          soundRef.current?.("up");
        }, 450);
        ownedTimers.current.add(timer);
      } else soundRef.current?.("xp");
      return true;
    },
    [motion, notice, burst],
  );
  const quest = useCallback(
    (id, at) => {
      const item = QUESTS.find((q) => q.id === id);
      return item ? award(id, item.pts, at) : false;
    },
    [award],
  );
  const resetProgress = useCallback(() => {
    const next = { xp: 0, got: {} };
    progressRef.current = next;
    setProgress(next);
    notice("Progress reset. Back to LV 01.");
  }, [notice]);
  useEffect(() => {
    write("procom27-xp", progress);
  }, [progress]);
  useEffect(() => {
    write("procom27-sfx", soundOn ? 1 : 0);
  }, [soundOn]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)"),
      change = () => setMotion(!media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const owned = particles.current,
      timers = ownedTimers.current;
    return () => {
      clearTimeout(noticeTimer.current);
      timers.forEach(clearTimeout);
      timers.clear();
      owned.forEach((p) => {
        p.getAnimations().forEach((a) => a.cancel());
        p.remove();
      });
      owned.clear();
      void audio.current?.close();
    };
  }, []);
  const value = useMemo(
    () => ({
      state,
      setState,
      motion,
      notice,
      registerUrl: null,
      sound,
      soundOn,
      setSoundOn,
      burst,
      quest,
      progress,
      setProgress,
      resetProgress,
      award,
    }),
    [
      state,
      motion,
      notice,
      sound,
      soundOn,
      burst,
      quest,
      progress,
      resetProgress,
      award,
    ],
  );
  return (
    <Context.Provider value={value}>
      {children}
      <div
        className={`toast${message ? " is-on" : ""}`}
        role="status"
        aria-live="polite"
      >
        <Icon name="square" />
        <span className="toast__msg">{message}</span>
      </div>
    </Context.Provider>
  );
}
