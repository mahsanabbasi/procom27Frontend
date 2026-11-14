// Renders the final-reference Why Attend section and target game.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { homeWhyAttendContent } from '../../data/homeWhyAttend.js';

const ALIENS = [
  ['...####...', '.########.', '##.####.##', '##########', '..#.##.#..', '.#.#..#.#.', '#........#'],
  ['....##....', '...####...', '.########.', '##..##..##', '##########', '..##..##..', '.#..##..#.'],
  ['.########.', '##########', '###.##.###', '##########', '.#.####.#.', '#..#..#..#', '.#......#.'],
  ['...#..#...', '..######..', '.##.##.##.', '##########', '#.######.#', '#.#....#.#', '...##.##..'],
];
const SHIP = ['......#......', '.....###.....', '.....#B#.....', '....#####....', '.#..#####..#.', '.#.###B###.#.', '.###########.', '#############', '##.##...##.##', '#...........#'];
const ALIEN_COLORS = ['#F5F0FA', '#DCC8FF', '#B57CFF', '#493460'];

function Icon({ name }) {
  return <i className={`i i-${name}`} aria-hidden="true" />;
}

function Alien({ index }) {
  const rows = ALIENS[index % ALIENS.length];
  const height = rows.length;
  const width = rows[0].length;

  return (
    <svg viewBox={`-1 -1 ${width + 2} ${height + 2}`} shapeRendering="crispEdges">
      <g fill="#DCC8FF">
        {rows.flatMap((row, y) => [...row].flatMap((pixel, x) => (
          pixel === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : []
        )))}
      </g>
      <g className="a2" fill="#B57CFF">
        <rect x={Math.floor(width / 2) - 1} y={height - 4} width="2" height="1" />
      </g>
    </svg>
  );
}

export default function WhyAttendSection() {
  const fieldRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const [, navigate] = useLocation();
  const [score, setScore] = useState(0);
  const [toast, setToast] = useState('');
  const content = homeWhyAttendContent;
  const displayScore = String(score).padStart(6, '0');

  useEffect(() => {
    const field = fieldRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!field || !canvas || !context) return undefined;

    const targets = [...field.querySelectorAll('.tgt')];
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timers = new Set();
    const frames = new Set();
    const cleanups = [];
    let alive = true;
    let motionEnabled = !motionPreference.matches;
    let visible = true;
    let pointerOver = false;
    let focused = false;
    let width = 0;
    let height = 0;
    let tick = 0;
    let busy = false;
    let totalScore = 0;
    let ship = { x: 0, tx: 0, y: 0 };
    let bullets = [];
    let parts = [];
    let stars = [];
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const shipScale = 3;

    const listen = (element, type, listener, options) => {
      element.addEventListener(type, listener, options);
      cleanups.push(() => element.removeEventListener(type, listener, options));
    };
    const later = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (alive) callback();
      }, delay);
      timers.add(timer);
      return timer;
    };
    const requestFrame = (callback) => {
      if (!alive) return 0;
      let frame = 0;
      frame = window.requestAnimationFrame((time) => {
        frames.delete(frame);
        if (alive) callback(time);
      });
      frames.add(frame);
      return frame;
    };
    const playSound = (name) => {
      try {
        if (window.localStorage.getItem('procom27-sfx') !== '1') return;
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;
        const audio = audioContextRef.current
          || (audioContextRef.current = new AudioContextConstructor());
        if (audio.state === 'suspended') void audio.resume();
        const notes = name === 'jump'
          ? [[392, 0.12, 'square', 784]]
          : [[220, 0.32, 'sawtooth', 80]];
        let start = audio.currentTime + 0.01;
        notes.forEach(([frequency, duration, type = 'square', endFrequency]) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, start);
          if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
          gain.gain.setValueAtTime(0.05, start);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.02);
          start += duration * 0.92;
        });
      } catch {
        // Audio is optional; browser storage and audio failures must not stop play.
      }
    };
    const resize = () => {
      width = field.clientWidth;
      height = field.clientHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = false;
      ship.y = height - 48;
      if (!ship.x) ship.x = ship.tx = width / 2;
      ship.tx = Math.min(ship.tx, width - 24);
      stars = Array.from({ length: Math.round(width * height / 5200) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 1 + (Math.random() * 3 | 0),
      }));
    };
    const relativeRect = (target) => {
      const fieldRect = field.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      return {
        x: targetRect.left - fieldRect.left,
        y: targetRect.top - fieldRect.top,
        w: targetRect.width,
        h: targetRect.height,
      };
    };
    const updateScore = (points) => {
      totalScore += points;
      setScore(totalScore);
    };
    const fire = (target) => {
      bullets.push({ x: ship.x, y: ship.y - 8, target: target || null });
      playSound('jump');
    };
    const showTargetToast = (href) => {
      setToast(href);
      later(() => setToast(''), 3600);
    };
    const resolveTarget = (target) => {
      target.dataset.hits = '0';
      target.classList.remove('is-locked', 'is-hit');
      const href = target.getAttribute('href');
      if (!motionEnabled) {
        navigate(href);
        return;
      }
      // Keep the reference's toast and warp reveal before changing routes.
      showTargetToast(href);
      target.classList.remove('is-boom');
      target.classList.add('is-warp');
      later(() => {
        target.classList.remove('is-warp');
        navigate(href);
      }, 500);
    };
    const explode = (target) => {
      const rect = relativeRect(target);
      for (let index = 0; index < 70; index += 1) {
        parts.push({
          x: rect.x + Math.random() * rect.w,
          y: rect.y + Math.random() * rect.h,
          vx: (Math.random() - 0.5) * 7,
          vy: (Math.random() - 0.7) * 6,
          life: 1,
          size: 2 + Math.random() * 4,
          color: ALIEN_COLORS[index % ALIEN_COLORS.length],
        });
      }
      target.classList.add('is-boom');
      playSound('miss');
      updateScore(1000);
      later(() => resolveTarget(target), motionEnabled ? 620 : 0);
    };
    const hit = (target) => {
      if (target.classList.contains('is-boom')) return;
      target.classList.remove('is-hit');
      void target.offsetWidth;
      target.classList.add('is-hit');
      later(() => target.classList.remove('is-hit'), 280);
      const hits = Number(target.dataset.hits || 0) + 1;
      target.dataset.hits = String(hits);
      updateScore(100);
      if (hits >= 3) explode(target);
    };
    const attack = (target) => {
      if (!motionEnabled) {
        resolveTarget(target);
        return;
      }
      busy = true;
      target.classList.add('is-locked');
      const rect = relativeRect(target);
      ship.tx = rect.x + rect.w / 2;
      const start = performance.now();
      const arrive = () => {
        if (Math.abs(ship.x - ship.tx) < 4 || performance.now() - start > 650) {
          let shots = 0;
          const shoot = () => {
            fire(target);
            shots += 1;
            if (shots < 3) later(shoot, 110);
          };
          shoot();
        } else {
          requestFrame(arrive);
        }
      };
      requestFrame(arrive);
    };
    const drawSprite = (rows, x, y, size) => {
      rows.forEach((row, rowIndex) => {
        [...row].forEach((pixel, columnIndex) => {
          if (pixel === '.') return;
          context.fillStyle = pixel === 'B' ? '#B57CFF' : '#DCC8FF';
          context.fillRect(Math.round(x + columnIndex * size), Math.round(y + rowIndex * size), size, size);
        });
      });
    };
    const frame = () => {
      requestFrame(frame);
      if (!visible || document.hidden) return;
      tick += 1;
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        if (motionEnabled) {
          star.y += star.z * 0.35;
          if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
          }
        }
        context.fillStyle = star.z === 3 ? 'rgba(245,240,250,.75)' : star.z === 2 ? 'rgba(220,200,255,.45)' : 'rgba(181,124,255,.3)';
        context.fillRect(Math.round(star.x), Math.round(star.y), star.z === 3 ? 2 : 1, star.z === 3 ? 2 : 1);
      });
      ship.x += (ship.tx - ship.x) * (motionEnabled ? 0.16 : 1);
      const shipX = ship.x - SHIP[0].length * shipScale / 2;
      const shipY = ship.y - SHIP.length * shipScale / 2;
      if (tick % 6 < 3) {
        context.fillStyle = '#B57CFF';
        context.fillRect(Math.round(ship.x - 4), Math.round(shipY + SHIP.length * shipScale), 3, 5);
        context.fillRect(Math.round(ship.x + 2), Math.round(shipY + SHIP.length * shipScale), 3, 5);
      } else {
        context.fillStyle = '#F5F0FA';
        context.fillRect(Math.round(ship.x - 3), Math.round(shipY + SHIP.length * shipScale), 2, 3);
        context.fillRect(Math.round(ship.x + 2), Math.round(shipY + SHIP.length * shipScale), 2, 3);
      }
      drawSprite(SHIP, shipX, shipY, shipScale);
      for (let index = bullets.length - 1; index >= 0; index -= 1) {
        const bullet = bullets[index];
        bullet.y -= 11;
        if (bullet.target) {
          const rect = relativeRect(bullet.target);
          bullet.x += (rect.x + rect.w / 2 - bullet.x) * 0.12;
          if (bullet.y <= rect.y + rect.h) {
            hit(bullet.target);
            bullets.splice(index, 1);
            continue;
          }
        } else {
          let hitTarget = null;
          for (const target of targets) {
            const rect = relativeRect(target);
            if (bullet.x >= rect.x && bullet.x <= rect.x + rect.w && bullet.y <= rect.y + rect.h && bullet.y >= rect.y) {
              hitTarget = target;
              break;
            }
          }
          if (hitTarget && !busy) {
            busy = true;
            hitTarget.classList.add('is-locked');
            hitTarget.dataset.hits = '2';
            hit(hitTarget);
            bullets.splice(index, 1);
            continue;
          }
        }
        if (bullet.y < -12) {
          bullets.splice(index, 1);
          continue;
        }
        context.fillStyle = '#F5F0FA';
        context.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y), 3, 10);
        context.fillStyle = '#B57CFF';
        context.fillRect(Math.round(bullet.x - 1), Math.round(bullet.y + 10), 3, 4);
      }
      for (let index = parts.length - 1; index >= 0; index -= 1) {
        const part = parts[index];
        part.x += part.vx;
        part.y += part.vy;
        part.vy += 0.18;
        part.life -= 0.022;
        if (part.life <= 0) {
          parts.splice(index, 1);
          continue;
        }
        context.globalAlpha = Math.max(0, part.life);
        context.fillStyle = part.color;
        context.fillRect(Math.round(part.x), Math.round(part.y), part.size, part.size);
      }
      context.globalAlpha = 1;
    };
    const onPointerMove = (event) => {
      const rect = field.getBoundingClientRect();
      if (!busy) ship.tx = Math.max(24, Math.min(width - 24, event.clientX - rect.left));
      pointerOver = true;
    };
    const onPointerLeave = () => { pointerOver = false; };
    const onFieldClick = (event) => {
      if (event.target.closest('.tgt') || busy) return;
      if (bullets.length < 4) fire();
    };
    const onTargetClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!busy) attack(event.currentTarget);
    };
    const onKeyDown = (event) => {
      const activeTag = document.activeElement?.tagName;
      const typing = /^(input|textarea|select|button|a)$/i.test(activeTag || '');
      const fieldFocused = focused || field.contains(document.activeElement);
      const direction = event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a'
        ? -1
        : event.key === 'ArrowRight' || event.key.toLowerCase() === 'd' ? 1 : 0;
      if (fieldFocused && direction) {
        event.preventDefault();
        if (!busy) ship.tx = Math.max(24, Math.min(width - 24, ship.tx + direction * 24));
        return;
      }
      if ((event.key === ' ' || event.code === 'Space') && (pointerOver || fieldFocused) && !busy && !typing) {
        event.preventDefault();
        if (bullets.length < 4) fire();
      }
    };
    const onFocus = () => { focused = true; };
    const onBlur = () => { focused = false; };
    const onVisibilityChange = () => { visible = !document.hidden; };
    const onMotionChange = (event) => { motionEnabled = !event.matches; };

    resize();
    listen(window, 'resize', resize);
    listen(field, 'pointermove', onPointerMove);
    listen(field, 'pointerleave', onPointerLeave);
    listen(field, 'click', onFieldClick);
    listen(field, 'focus', onFocus);
    listen(field, 'blur', onBlur);
    listen(document, 'keydown', onKeyDown);
    listen(document, 'visibilitychange', onVisibilityChange);
    listen(motionPreference, 'change', onMotionChange);
    targets.forEach((target) => listen(target, 'click', onTargetClick));
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(field);
    const visibilityObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; })
      : null;
    visibilityObserver?.observe(field);
    requestFrame(frame);

    return () => {
      alive = false;
      cleanups.forEach((cleanup) => cleanup());
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      frames.forEach((frameId) => window.cancelAnimationFrame(frameId));
      frames.clear();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
      targets.forEach((target) => {
        target.classList.remove('is-locked', 'is-hit', 'is-boom', 'is-warp');
        delete target.dataset.hits;
      });
      const audio = audioContextRef.current;
      audioContextRef.current = null;
      if (audio && audio.state !== 'closed') void audio.close();
    };
  }, [navigate]);

  return (
    <section className="section" id="why" aria-labelledby="why-title" data-munch="flag" data-munch-label="Why attend">
      <div className="container">
        <header className="sh" data-reveal>
          <div>
            <p className="sh__label t-label"><Icon name="square" />{content.sectionLabel}</p>
            <h2 className="sh__title t-d2" id="why-title">
              {content.title} <span className="t-soft">{content.titleHighlight}</span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">{content.description}</p>
        </header>
        <div className="shoot" id="shoot" data-reveal="scale">
          <div className="shoot__hud t-label" aria-hidden="true">
            <span>{content.scoreLabel} <b id="shScore">{displayScore}</b></span>
            <span>{content.highScoreLabel} <b>{content.highScore}</b></span>
            <span className="shoot__ins">{content.prompt}</span>
          </div>
          <div className="shoot__field" id="shField" ref={fieldRef} tabIndex="0" aria-label="Space shooter. Move the pointer or use the arrow keys or A and D to aim, then press Space to fire.">
            <canvas className="shoot__cv" id="shCv" ref={canvasRef} aria-hidden="true" />
            <ul className="fleet" id="shFleet">
              {content.targets.map((target) => (
                <li key={target.id}>
                  <Link
                    className="tgt"
                    href={target.href}
                    data-demo={target.demo ? '' : undefined}
                    data-alien={target.alien}
                  >
                    <span className="tgt__alien" aria-hidden="true"><Alien index={target.alien} /></span>
                    <span className="tgt__lock t-label" aria-hidden="true">{content.lockLabel}</span>
                    <span className="tgt__top">
                      <span className="tgt__ic"><Icon name={target.icon} /></span>
                      <span className="t-label">{target.number}</span>
                    </span>
                    <h3>{target.title}</h3>
                    <p>{target.description}</p>
                    <span className="tgt__cta">{target.cta}<Icon name="arrow" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="shoot__help">{content.help}</p>
        </div>
      </div>
      <div className={`shoot__toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        <Icon name="square" />
        <span>{toast && <>This page isn’t in the demo yet. Planned route: <code>{toast}</code></>}</span>
      </div>
    </section>
  );
}
