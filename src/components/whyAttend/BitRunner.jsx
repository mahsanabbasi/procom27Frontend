import { BIT } from "./pixelSprites.js";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./Visuals.jsx";
import { useWhy } from "./useWhy.js";
const ROLL = /^2\d-\d{4}$/;
const format = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 6);
  return d.length > 2 ? d.slice(0, 2) + "-" + d.slice(2) : d;
};
const pad = (n) => String(n).padStart(5, "0");
const read = (k, f) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? f;
  } catch {
    return f;
  }
};
const playerRead = () => {
  try {
    const s = localStorage.getItem("procom27-roll");
    return ROLL.test(s || "") ? s : "";
  } catch {
    return "";
  }
};
const BUG = [
  ".#.....#.",
  "..#...#..",
  ".#######.",
  "##.#.#.##",
  "#########",
  ".#######.",
  "#.#...#.#",
  "..#...#..",
];
const BOX = [
  "########",
  "#......#",
  "#..##..#",
  "#..##..#",
  "#..##..#",
  "#......#",
  "#..##..#",
  "#......#",
  "########",
];
const OBSTACLES = [
  BUG,
  BOX,
  BOX.concat(BOX.slice(1)),
  BUG.map((r) => r + "." + r),
];
export default function BitRunner() {
  const { motion, sound, quest, notice, burst } = useWhy();
  const [player, setPlayer] = useState(playerRead),
    [value, setValue] = useState(playerRead),
    [error, setError] = useState(""),
    [mode, setMode] = useState(() => (playerRead() ? "ready" : "form")),
    [score, setScore] = useState(0),
    [board, setBoard] = useState(() => {
      const b = read("procom27-board", []);
      return Array.isArray(b) ? b : [];
    }),
    [flag, setFlag] = useState("");
  const canvas = useRef(null),
    stage = useRef(null),
    input = useRef(null),
    playButton = useRef(null),
    engine = useRef(null),
    latest = useRef({ motion, sound, quest, notice, burst, player, board });
  useLayoutEffect(() => {
    latest.current = { motion, sound, quest, notice, burst, player, board };
  });
  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const W = 400,
      H = 100,
      G = 86;
    let alive = true,
      raf = 0,
      demoTimer,
      visible = true,
      acc = 0,
      last = performance.now();
    let st;
    const reset = (m) => {
      st = {
        mode: m,
        y: 0,
        vy: 0,
        obs: [],
        t: 0,
        speed: 2.4,
        score: 0,
        next: 70,
        frame: 0,
        over: false,
      };
    };
    const spr = (rows, x, y, map) => {
      rows.forEach((row, j) =>
        Array.from(row, (c, i) => {
          if (c !== ".") {
            ctx.fillStyle = map?.[c] || "#F5F0FA";
            ctx.fillRect(x + i, y + j, 1, 1);
          }
        }),
      );
    };
    const jump = () => {
      if (st.y === 0 && !st.over) {
        st.vy = -5.6;
        if (st.mode === "play") latest.current.sound("jump");
      }
    };
    const over = () => {
      st.over = true;
      const s = Math.floor(st.score);
      setScore(s);
      setMode("over");
      latest.current.sound("over");
      const { player: p, board: old } = latest.current;
      const b = old.map((x) => ({ ...x })),
        mine = b.find((x) => x.roll === p),
        prev = mine?.score || 0,
        top = b[0]?.score || 0;
      if (mine) {
        if (s > mine.score) {
          mine.score = s;
          mine.t = Date.now();
        }
      } else b.push({ roll: p, score: s, t: Date.now() });
      b.sort((a, c) => c.score - a.score || a.t - c.t);
      const next = b.slice(0, 20);
      setBoard(next);
      try {
        localStorage.setItem("procom27-board", JSON.stringify(next));
      } catch {
        /* Device storage optional. */
      }
      const f = s > top && s > 0 ? "champ" : s > prev && prev > 0 ? "best" : "";
      setFlag(f);
      if (f === "champ") {
        latest.current.quest("champ");
        latest.current.notice(`New champion: ${p} · ${pad(s)}`);
        latest.current.burst(stage.current, {
          n: 30,
          spread: 140,
          colors: ["#F5F0FA", "#A198A8"],
        });
      }
      demoTimer = setTimeout(() => {
        if (alive && st.over) reset("demo");
      }, 6000);
    };
    const step = () => {
      st.t++;
      st.frame = (st.t >> 2) % 3;
      st.speed = Math.min(6.2, 2.4 + st.t / 1400);
      st.score += st.speed * 0.08;
      if (st.vy || st.y < 0) {
        st.vy += 0.32;
        st.y += st.vy;
        if (st.y >= 0) {
          st.y = 0;
          st.vy = 0;
        }
      }
      if (--st.next <= 0) {
        const m = OBSTACLES[(Math.random() * OBSTACLES.length) | 0];
        st.obs.push({ x: W + 4, w: m[0].length, h: m.length, m });
        st.next = 55 + Math.random() * 70 - st.speed * 4;
      }
      st.obs.forEach((o) => (o.x -= st.speed));
      st.obs = st.obs.filter((o) => o.x > -24);
      if (st.mode === "demo") {
        const o = st.obs.find((o) => o.x + o.w > 22);
        if (o && o.x - 37 < 4 + st.speed * 6 && st.y === 0) jump();
      }
      for (let i = 0; i < st.obs.length; i++) {
        const o = st.obs[i],
          by = G - 12 + st.y;
        if (35 > o.x + 1 && 25 < o.x + o.w - 1 && by + 11 > G - o.h + 1) {
          if (st.mode === "demo") st.obs.splice(i, 1);
          else over();
          break;
        }
      }
    };
    const draw = () => {
      ctx.fillStyle = "#07060B";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#F5F0FA";
      ctx.fillRect(0, G, W, 1);
      ctx.fillStyle = "rgba(245,240,250,.3)";
      for (let x = (-st.t * st.speed) % 14; x < W; x += 14) {
        ctx.fillRect(x + 14, G + 4, 3, 1);
        ctx.fillRect(x + 6, G + 8, 2, 1);
      }
      st.obs.forEach((o) => spr(o.m, Math.round(o.x), G - o.h));
      const by = Math.round(G - 12 + st.y),
        map = { "#": "#F5F0FA", B: "#F5F0FA", w: "#07060B", k: "#F5F0FA" };
      spr(BIT.shut.slice(0, 11), 24, by, map);
      spr(
        [
          st.y < 0
            ? ".##.....##..."
            : [".##.....##...", "..##...##....", ".#.......##.."][st.frame],
        ],
        24,
        by + 11,
      );
      if (st.mode === "play") setScore(Math.floor(st.score));
    };
    reset("demo");
    engine.current = {
      start() {
        clearTimeout(demoTimer);
        reset("play");
        setScore(0);
        setFlag("");
        setMode("play");
        latest.current.quest("runner", stage.current);
        latest.current.sound("start");
        stage.current.focus({ preventScroll: true });
      },
      jump,
    };
    const frame = (now) => {
      const dt = Math.min(100, now - last);
      last = now;
      if (
        (latest.current.motion || st.mode === "play") &&
        visible &&
        !document.hidden &&
        !st.over
      ) {
        acc += dt;
        while (acc >= 1000 / 60) {
          step();
          acc -= 1000 / 60;
          if (st.over) break;
        }
      } else acc = 0;
      if (visible) draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const observer = new IntersectionObserver((es) => {
      visible = es[0].isIntersecting;
    });
    observer.observe(canvas.current);
    const key = (e) => {
      if (
        st.mode !== "play" ||
        st.over ||
        /^(input|textarea|select)$/i.test(e.target.tagName)
      )
        return;
      if ([" ", "ArrowUp", "w"].includes(e.key)) {
        e.preventDefault();
        jump();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(demoTimer);
      observer.disconnect();
      document.removeEventListener("keydown", key);
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    if (mode === "over") playButton.current?.focus({ preventScroll: true });
  }, [mode]);
  const submit = (e) => {
    e.preventDefault();
    const v = format(value);
    if (!ROLL.test(v)) {
      setError(
        v && v[0] !== "2"
          ? "Roll numbers start with 2."
          : "Enter your roll number as 2X-XXXX, digits only.",
      );
      input.current?.focus();
      return;
    }
    setPlayer(v);
    latest.current.player = v;
    try {
      localStorage.setItem("procom27-roll", v);
    } catch {
      /* Optional storage. */
    }
    engine.current.start();
  };
  return (
    <section
      className={`frun${mode === "play" ? " is-playing" : ""}`}
      data-runner
      aria-labelledby="frun-title"
    >
      <div className="frun__game">
        <div className="frun__hud">
          <h2 className="frun__title" id="frun-title">
            Bit Runner
          </h2>
          <span>
            Player <b data-r-player>{player || "--·----"}</b>
          </span>
          <span>
            Score <b data-r-score>{pad(score)}</b>
          </span>
        </div>
        <div
          className="frun__stage"
          ref={stage}
          data-r-stage
          tabIndex={-1}
          onPointerDown={(e) => {
            if (!e.target.closest(".frun__ov") && mode === "play") {
              e.preventDefault();
              engine.current?.jump();
            }
          }}
        >
          <canvas
            ref={canvas}
            width="400"
            height="100"
            data-r-canvas
            role="img"
            aria-label="Bit Runner, a pixel runner game. Jump over the bugs to score."
          />
          <div className="frun__ov" data-r-ov>
            {mode === "form" ? (
              <form className="frun__form" noValidate onSubmit={submit}>
                <label className="frun__lbl" htmlFor="rRoll">
                  Enter your roll no.
                </label>
                <div className="frun__row">
                  <input
                    ref={input}
                    className="frun__in"
                    id="rRoll"
                    name="roll"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="2X-XXXX"
                    maxLength="7"
                    aria-describedby="rRollHelp rRollErr"
                    aria-invalid={error ? true : undefined}
                    value={value}
                    onChange={(e) => {
                      const v = format(e.target.value);
                      setValue(v);
                      setError(
                        v && v[0] !== "2" ? "Roll numbers start with 2." : "",
                      );
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key.length === 1 &&
                        !/[0-9]/.test(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                        if (e.key !== "-") setError("Digits only, please.");
                      }
                    }}
                  />
                  <button className="frun__go" type="submit">
                    Play
                    <Icon name="play" />
                  </button>
                </div>
                <p className="frun__hint" id="rRollHelp">
                  Digits only · format 2X-XXXX
                </p>
                <p className="frun__err" id="rRollErr" role="alert">
                  {error}
                </p>
              </form>
            ) : (
              <div className="frun__msg">
                {mode === "over" && <p className="frun__big">Game over</p>}
                <p className="frun__k">
                  {mode === "ready" ? "Player " : ""}
                  <b>{player}</b>
                  {mode === "over" && (
                    <>
                      {" "}
                      · <b>{pad(score)}</b>
                      {flag === "champ"
                        ? " · New champion!"
                        : flag === "best"
                          ? " · Personal best"
                          : ""}
                    </>
                  )}
                </p>
                <button
                  ref={playButton}
                  className="frun__go"
                  type="button"
                  data-play
                  onClick={() => engine.current?.start()}
                >
                  {mode === "over" ? "Play again" : "Play"}
                  <Icon name={mode === "over" ? "refresh" : "play"} />
                </button>
                <button
                  className="frun__link"
                  type="button"
                  data-change
                  onClick={() => {
                    setMode("form");
                    requestAnimationFrame(() => input.current?.focus());
                  }}
                >
                  {mode === "ready"
                    ? "Not you? Change roll no."
                    : "Change roll no."}
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="frun__help">
          Space, ↑ or tap to jump. The highest score takes the champion spot.
        </p>
      </div>
      <aside
        className={`frun__champ${flag === "champ" ? " is-new" : ""}`}
        data-r-champ
        aria-live="polite"
        aria-label="Bit Runner champion"
      >
        <span className="frun__tape" aria-hidden="true" />
        <p className="frun__clbl">Champion</p>
        <p className={`frun__roll${board[0] ? "" : " frun__roll--empty"}`}>
          {board[0]?.roll || "2X-XXXX"}
        </p>
        <p className="frun__cs">
          {board[0] ? (
            <>
              Hi-score <b>{pad(board[0].score)}</b>
            </>
          ) : (
            "No champion yet. Be the first."
          )}
        </p>
        {board.length > 1 && (
          <ol className="frun__board">
            {board.slice(0, 5).map((x, i) => (
              <li key={x.roll} className={x.roll === player ? "is-me" : ""}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{x.roll}</span>
                <b>{pad(x.score)}</b>
              </li>
            ))}
          </ol>
        )}
        <p className="frun__note">Scores are saved on this device</p>
      </aside>
    </section>
  );
}
