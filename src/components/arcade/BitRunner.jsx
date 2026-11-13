/* =====================================================================
   FOOTER · BIT RUNNER (monochrome) + roll-number leaderboard
   Leaderboard storage lives in lib/leaderboard.js.
   ===================================================================== */
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { BIT } from '../../utils/arcade/bit.js';
import { LEADERBOARD } from '../../utils/arcade/leaderboard.js';
import { burst } from '../../utils/arcade/burst.js';
import { sfx } from '../../utils/arcade/sfx.js';
import { toast } from '../../utils/arcade/toast.js';
import { quest } from '../../utils/arcade/xp.js';
import { MOTION, pad, retrigger } from '../../utils/arcade/util.js';

const ROLL = /^2\d-\d{4}$/;
const fmtRoll = (v) => {
  const d = String(v || '').replace(/\D/g, '').slice(0, 6);
  return d.length > 2 ? d.slice(0, 2) + '-' + d.slice(2) : d;
};

const FG = '#F5F0FA';
const BG = '#07060B';
const DIM = 'rgba(245,240,250,.3)';
const BODY = BIT.shut.slice(0, 11);
const LEGS = ['.##.....##...', '..##...##....', '.#.......##..'];
const BUG = ['.#.....#.', '..#...#..', '.#######.', '##.#.#.##', '#########', '.#######.', '#.#...#.#', '..#...#..'];
const BOX = ['########', '#......#', '#..##..#', '#..##..#', '#..##..#', '#......#', '#..##..#', '#......#', '########'];
const OBS = [BUG, BOX, BOX.concat(BOX.slice(1)), BUG.map((r) => r + '.' + r)];
const MAP = { '#': FG, B: FG, w: BG, k: FG };

function readPlayer() {
  try {
    const r0 = localStorage.getItem('procom27-roll');
    if (ROLL.test(r0 || '')) return r0;
  } catch {
    /* storage unavailable */
  }
  return null;
}

export default function BitRunner() {
  const rootRef = useRef(null);
  const cvRef = useRef(null);
  const stageRef = useRef(null);
  const champRef = useRef(null);
  const scoreRef = useRef(null);
  const inputRef = useRef(null);
  const playAgainRef = useRef(null);
  const api = useRef({});

  const [player, setPlayer] = useState(readPlayer);
  const [board, setBoard] = useState([]);
  const [screen, setScreen] = useState(() => (readPlayer() ? { kind: 'ready' } : { kind: 'form' }));
  const [roll, setRoll] = useState(() => readPlayer() || '');
  const [err, setErr] = useState('');
  const [focusForm, setFocusForm] = useState(0);
  const playerRef = useRef(player);
  const boardRef = useRef(board);
  useEffect(() => {
    playerRef.current = player;
    boardRef.current = board;
  }, [player, board]);

  /* game engine (canvas) */
  useEffect(() => {
    const root = rootRef.current;
    const cv = cvRef.current;
    const stage = stageRef.current;
    const ctx = cv.getContext('2d');
    const W = cv.width;
    const H = cv.height;
    const G = H - 14;
    ctx.imageSmoothingEnabled = false;
    let st = null;
    let lastScore = '';
    let raf = 0;
    let alive = true;

    const playing = () => root.classList.contains('is-playing');
    function reset(mode) {
      if (mode === 'play') lastScore = '';
      st = { mode, y: 0, vy: 0, obs: [], t: 0, speed: 2.4, score: 0, next: 70, frame: 0, over: false };
      root.classList.toggle('is-playing', mode === 'play');
    }
    function spr(m, x, y, map) {
      for (let j = 0; j < m.length; j++) {
        const row = m[j];
        for (let i = 0; i < row.length; i++) {
          const c = row[i];
          if (c === '.') continue;
          ctx.fillStyle = map ? map[c] || FG : FG;
          ctx.fillRect(x + i, y + j, 1, 1);
        }
      }
    }
    function jump() {
      if (st.y === 0 && !st.over) {
        st.vy = -5.6;
        if (st.mode === 'play') sfx.play('jump');
      }
    }
    const hit = (o) => {
      const bx = 24;
      const by = G - 12 + st.y;
      return bx + 11 > o.x + 1 && bx + 1 < o.x + o.w - 1 && by + 11 > G - o.h + 1;
    };
    function over() {
      st.over = true;
      const s = Math.floor(st.score);
      sfx.play('over');
      root.classList.remove('is-playing');
      const b0 = boardRef.current;
      const me = playerRef.current;
      const prevTop = b0[0] ? b0[0].score : 0;
      const mine = b0.find((x) => x.roll === me);
      const prevMine = mine ? mine.score : 0;
      setScreen({ kind: 'over', score: s, flag: '' });
      LEADERBOARD.submit({ roll: me, score: s, t: Date.now() }).then((b) => {
        if (!alive) return;
        const flag = s > prevTop && s > 0 ? 'champ' : s > prevMine && prevMine > 0 ? 'best' : '';
        setBoard(b);
        setScreen({ kind: 'over', score: s, flag, focus: true });
        if (flag === 'champ') {
          if (MOTION) requestAnimationFrame(() => retrigger(champRef.current, 'is-new'));
          quest('champ', champRef.current);
          const r = champRef.current.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + 24, { n: 30, spread: 140, colors: [FG, '#A198A8'] });
          toast(<>New champion: <code>{me}</code> · {pad(s, 5)}</>);
        }
      });
      st.demoT = setTimeout(() => {
        if (st.over && !playing()) reset('demo');
      }, 6000);
    }
    function step() {
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
        const m = OBS[(Math.random() * OBS.length) | 0];
        st.obs.push({ x: W + 4, w: m[0].length, h: m.length, m });
        st.next = 55 + Math.random() * 70 - st.speed * 4;
      }
      st.obs.forEach((o) => {
        o.x -= st.speed;
      });
      st.obs = st.obs.filter((o) => o.x > -24);
      if (st.mode === 'demo') {
        const o = st.obs.filter((ob) => ob.x + ob.w > 22)[0];
        if (o && o.x - 37 < 4 + st.speed * 6 && st.y === 0) jump();
      }
      for (let i = 0; i < st.obs.length; i++) {
        if (hit(st.obs[i])) {
          if (st.mode === 'demo') {
            st.obs.splice(i, 1);
            break;
          }
          over();
          break;
        }
      }
    }
    function draw() {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = FG;
      ctx.fillRect(0, G, W, 1);
      ctx.fillStyle = DIM;
      for (let x = (-st.t * st.speed) % 14; x < W; x += 14) {
        ctx.fillRect(x + 14, G + 4, 3, 1);
        ctx.fillRect(x + 6, G + 8, 2, 1);
      }
      st.obs.forEach((o) => spr(o.m, Math.round(o.x), G - o.h));
      const by = Math.round(G - 12 + st.y);
      spr(BODY, 24, by, MAP);
      spr([st.y < 0 ? LEGS[0] : LEGS[st.frame]], 24, by + 11);
      const sc = st.mode === 'play' ? pad(Math.floor(st.score), 5) : lastScore || '00000';
      if (sc !== lastScore) {
        lastScore = sc;
        scoreRef.current.textContent = sc;
      }
    }
    function start() {
      clearTimeout(st && st.demoT);
      reset('play');
      quest('runner', stage);
      sfx.play('start');
      try {
        stage.focus({ preventScroll: true });
      } catch {
        /* focus unsupported */
      }
    }
    api.current.start = start;

    const onDown = (e) => {
      if (e.target.closest('.frun__ov')) return;
      if (playing() && !st.over) {
        e.preventDefault();
        jump();
      }
    };
    const onKey = (e) => {
      if (!playing() || st.over) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        jump();
      }
    };
    stage.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);

    reset('demo');
    let vis = true;
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((es) => {
        vis = es[0].isIntersecting;
      });
      io.observe(cv);
    }
    let acc = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(100, now - last);
      last = now;
      const run = (MOTION || playing()) && vis && !document.hidden && !st.over;
      if (run) {
        acc += dt;
        while (acc >= 1000 / 60) {
          step();
          acc -= 1000 / 60;
          if (st.over) break;
        }
      } else acc = 0;
      if (vis) draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    LEADERBOARD.load().then((b) => {
      if (alive) setBoard(b || []);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(st && st.demoT);
      stage.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      if (io) io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (screen.kind === 'over' && screen.focus && playAgainRef.current) playAgainRef.current.focus({ preventScroll: true });
  }, [screen]);

  useEffect(() => {
    if (focusForm && inputRef.current) inputRef.current.focus();
  }, [focusForm]);

  const showForm = () => {
    setRoll(player || '');
    setErr('');
    setScreen({ kind: 'form' });
    setFocusForm((n) => n + 1);
  };
  const start = (e) => {
    if (e) e.stopPropagation();
    api.current.start();
  };

  function submit(e) {
    e.preventDefault();
    const v = fmtRoll(roll);
    if (!ROLL.test(v)) {
      setErr(v && v[0] !== '2' ? 'Roll numbers start with 2.' : 'Enter your roll number as 2X-XXXX, digits only.');
      inputRef.current.focus();
      return;
    }
    try {
      localStorage.setItem('procom27-roll', v);
    } catch {
      /* storage unavailable */
    }
    setPlayer(v);
    playerRef.current = v;
    setScreen({ kind: 'ready' });
    api.current.start();
  }

  const champ = board[0];

  return (
    <section className="frun" ref={rootRef} aria-labelledby="frun-title">
      <div className="frun__game">
        <div className="frun__hud">
          <h2 className="frun__title" id="frun-title">
            Bit Runner
          </h2>
          <span>
            Player <b>{player || '--·----'}</b>
          </span>
          <span>
            Score <b ref={scoreRef}>00000</b>
          </span>
        </div>
        <div className="frun__stage" ref={stageRef} tabIndex={-1}>
          <canvas
            ref={cvRef}
            width="400"
            height="100"
            role="img"
            aria-label="Bit Runner, a pixel runner game. Jump over the bugs to score."
          />
          <div className="frun__ov">
            {screen.kind === 'form' && (
              <form className="frun__form" noValidate onSubmit={submit}>
                <label className="frun__lbl" htmlFor="rRoll">
                  Enter your roll no.
                </label>
                <div className="frun__row">
                  <input
                    ref={inputRef}
                    className="frun__in"
                    id="rRoll"
                    name="roll"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck="false"
                    placeholder="2X-XXXX"
                    maxLength={7}
                    aria-describedby="rRollHelp rRollErr"
                    aria-invalid={err ? 'true' : undefined}
                    value={roll}
                    onChange={(e) => {
                      const v = fmtRoll(e.target.value);
                      setRoll(v);
                      setErr(v && v[0] !== '2' ? 'Roll numbers start with 2.' : '');
                    }}
                    onKeyDown={(e) => {
                      if (e.key.length === 1 && !/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        if (e.key !== '-') setErr('Digits only, please.');
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
                  {err}
                </p>
              </form>
            )}
            {screen.kind === 'ready' && (
              <div className="frun__msg">
                <p className="frun__k">
                  Player <b>{player}</b>
                </p>
                <button className="frun__go" type="button" onClick={start}>
                  Play
                  <Icon name="play" />
                </button>
                <button
                  className="frun__link"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showForm();
                  }}
                >
                  Not you? Change roll no.
                </button>
              </div>
            )}
            {screen.kind === 'over' && (
              <div className="frun__msg">
                <p className="frun__big">Game over</p>
                <p className="frun__k">
                  {player} · <b>{pad(screen.score, 5)}</b>
                  {screen.flag === 'champ' ? ' · New champion!' : screen.flag === 'best' ? ' · Personal best' : ''}
                </p>
                <button ref={playAgainRef} className="frun__go" type="button" onClick={start}>
                  Play again
                  <Icon name="refresh" />
                </button>
                <button
                  className="frun__link"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showForm();
                  }}
                >
                  Change roll no.
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="frun__help">Space, ↑ or tap to jump. The highest score takes the champion spot.</p>
      </div>
      <aside className="frun__champ" ref={champRef} aria-live="polite" aria-label="Bit Runner champion">
        <span className="frun__tape" aria-hidden="true" />
        <p className="frun__clbl">Champion</p>
        {champ ? (
          <>
            <p className="frun__roll">{champ.roll}</p>
            <p className="frun__cs">
              Hi-score <b>{pad(champ.score, 5)}</b>
            </p>
          </>
        ) : (
          <>
            <p className="frun__roll frun__roll--empty">2X-XXXX</p>
            <p className="frun__cs">No champion yet. Be the first.</p>
          </>
        )}
        {board.length > 1 && (
          <ol className="frun__board">
            {board.slice(0, 5).map((x, i) => (
              <li key={x.roll} className={x.roll === player ? 'is-me' : undefined}>
                <span>{pad(i + 1)}</span>
                <span>{x.roll}</span>
                <b>{pad(x.score, 5)}</b>
              </li>
            ))}
          </ol>
        )}
        <p className="frun__note">{LEADERBOARD.note}</p>
      </aside>
    </section>
  );
}
