import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { useLocation } from 'wouter';
import { homeTeamCode, homeTeamDept, homeTeams } from '../../data/homeTeams.js';

let soundContext;

function playTeamSound(name) {
  try {
    if (window.localStorage.getItem('procom27-sfx') !== '1') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    soundContext = soundContext || new AudioContext();
    if (soundContext.state === 'suspended') soundContext.resume();

    const bank = {
      blip: [[880, 0.04]],
      win: [[523, 0.08], [659, 0.08], [784, 0.08], [1046, 0.26]],
    };
    let time = soundContext.currentTime + 0.01;
    bank[name].forEach(([frequency, duration]) => {
      const oscillator = soundContext.createOscillator();
      const gain = soundContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain);
      gain.connect(soundContext.destination);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.02);
      time += duration * 0.92;
    });
  } catch {
    // Audio is optional; the reference sound system is off unless enabled.
  }
}

function hashCode(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seed) {
  let random = (seed >>> 0) || 1;
  return () => {
    random ^= random << 13;
    random >>>= 0;
    random ^= random >> 17;
    random ^= random << 5;
    random >>>= 0;
    return random / 4294967296;
  };
}

// The reference builds each pixel glyph from the team-name hash and seeded RNG.
function glyph(seed, offsetX, offsetY, size) {
  const random = makeRng(seed);
  let out = '';

  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      let on = random() > (x === 2 ? 0.38 : 0.5);
      if (y === 2 && x === 2) on = true;
      if (!on) continue;

      const fill = random() > 0.7 ? '#B57CFF' : '#DCC8FF';
      out += `<rect x="${offsetX + x * size}" y="${offsetY + y * size}" width="${size}" height="${size}" fill="${fill}" />`;
      if (x !== 2) {
        out += `<rect x="${offsetX + (4 - x) * size}" y="${offsetY + y * size}" width="${size}" height="${size}" fill="${fill}" />`;
      }
    }
  }

  return out;
}

const FRAMES = {
  ops: '<path d="M20 4H44L60 20V44L44 60H20L4 44V20Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M22 9H42L55 22V42L42 55H22L9 42V22Z" stroke="#493460" stroke-width="1.2" fill="none"/>',
  outreach: '<circle cx="32" cy="32" r="28" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#493460" stroke-width="1.2" stroke-dasharray="3 3"/>',
  creative: '<path d="M32 2L62 32L32 62L2 32Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M32 9L55 32L32 55L9 32Z" fill="none" stroke="#493460" stroke-width="1.2"/>',
  tech: '<path d="M10 4H54L60 10V54L54 60H10L4 54V10Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M4 22H0M4 32H0M4 42H0M60 22H64M60 32H64M60 42H64" stroke="#B57CFF" stroke-width="2"/>',
  comp: '<path d="M32 3L58 12V33C58 47 46 56 32 61C18 56 6 47 6 33V12Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M32 9L52 16V33C52 44 43 51 32 55C21 51 12 44 12 33V16Z" fill="none" stroke="#493460" stroke-width="1.2"/>',
};

function TeamEmblem({ team }) {
  const frame = FRAMES[team.dept] || FRAMES.ops;
  const glyphMarkup = glyph(hashCode(team.name), 19.5, team.dept === 'comp' ? 20 : 19.5, 5);

  return (
    <svg viewBox="-2 -2 68 68" fill="none" aria-hidden="true" dangerouslySetInnerHTML={{
      __html: `${frame}<g shape-rendering="crispEdges">${glyphMarkup}</g>`,
    }} />
  );
}

export default function HomeTeamsSection() {
  const [, navigate] = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [cursorReady, setCursorReady] = useState(false);
  const selectedIndexRef = useRef(2);
  const gridRef = useRef(null);
  const cursorRef = useRef(null);
  const panelRef = useRef(null);
  const lockingRef = useRef(false);
  const lockTimerRef = useRef(null);
  const burstAnimationsRef = useRef(new Set());
  const selectedTeam = homeTeams[selectedIndex];
  const selectedCode = homeTeamCode[selectedTeam.slug] || '';

  const placeCursor = useCallback(() => {
    const grid = gridRef.current;
    const cursor = cursorRef.current;
    const tile = grid?.querySelector(`[data-i="${selectedIndexRef.current}"]`);
    if (!grid || !cursor || !tile) return;

    const gridRect = grid.getBoundingClientRect();
    const tileRect = tile.parentElement.getBoundingClientRect();
    cursor.style.width = `${tileRect.width}px`;
    cursor.style.height = `${tileRect.height}px`;
    cursor.style.transform = `translate(${tileRect.left - gridRect.left}px,${tileRect.top - gridRect.top}px)`;
    cursor.style.setProperty('--csk', getComputedStyle(tile).getPropertyValue('--sk'));
    setCursorReady(true);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      if (motionQuery.matches && panelRef.current) panelRef.current.classList.remove('is-swap');
    };
    let cursorFrame = null;
    const queueCursor = () => {
      if (cursorFrame !== null) cancelAnimationFrame(cursorFrame);
      cursorFrame = requestAnimationFrame(() => {
        cursorFrame = null;
        placeCursor();
      });
    };
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(queueCursor) : null;
    const grid = gridRef.current;
    resizeObserver?.observe(grid);
    window.addEventListener('resize', queueCursor);
    window.addEventListener('load', queueCursor);
    motionQuery.addEventListener?.('change', updateMotion);
    queueCursor();
    const burstAnimations = burstAnimationsRef.current;

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', queueCursor);
      window.removeEventListener('load', queueCursor);
      motionQuery.removeEventListener?.('change', updateMotion);
      if (cursorFrame !== null) cancelAnimationFrame(cursorFrame);
      if (lockTimerRef.current !== null) window.clearTimeout(lockTimerRef.current);
      burstAnimations.forEach(({ animation, element }) => {
        animation.cancel();
        element.remove();
      });
      burstAnimations.clear();
    };
  }, [placeCursor]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    const frame = requestAnimationFrame(placeCursor);
    return () => cancelAnimationFrame(frame);
  }, [selectedIndex, placeCursor]);

  const preview = (index, animate = true) => {
    if (lockingRef.current || selectedIndexRef.current === index) return;
    selectedIndexRef.current = index;
    setSelectedIndex(index);
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && motion && panelRef.current) {
      panelRef.current.classList.remove('is-swap');
      void panelRef.current.offsetWidth;
      panelRef.current.classList.add('is-swap');
      playTeamSound('blip');
    }
  };

  const burst = (x, y) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body.animate) return;
    const colors = ['#B57CFF', '#DCC8FF', '#F5F0FA'];
    for (let index = 0; index < 20; index += 1) {
      const element = document.createElement('i');
      const size = 4 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const velocity = 40 + Math.random() * 100;
      element.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[index % 3]};z-index:400;pointer-events:none`;
      document.body.appendChild(element);
      const animation = element.animate([
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * velocity - size / 2}px,${Math.sin(angle) * velocity + 40}px) rotate(${Math.random() * 180}deg)`,
          opacity: 0,
        },
      ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.75,.15,1)' });
      const particle = { animation, element };
      burstAnimationsRef.current.add(particle);
      animation.onfinish = () => {
        burstAnimationsRef.current.delete(particle);
        element.remove();
      };
    }
  };

  const lock = (index) => {
    if (lockingRef.current) return;
    preview(index, false);
    lockingRef.current = true;
    const team = homeTeams[index];
    const tile = gridRef.current?.querySelector(`[data-i="${index}"]`);
    tile?.classList.add('is-lock');
    panelRef.current?.classList.remove('is-locked');
    if (panelRef.current) {
      void panelRef.current.offsetWidth;
      panelRef.current.classList.add('is-locked');
    }
    playTeamSound('win');
    if (tile) {
      const rect = tile.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    lockTimerRef.current = window.setTimeout(() => {
      lockingRef.current = false;
      tile?.classList.remove('is-lock');
      panelRef.current?.classList.remove('is-locked');
      navigate(`/teams/${team.slug}`);
    }, motion ? 900 : 0);
  };

  const handleKeyDown = (event) => {
    const buttons = Array.from(gridRef.current?.querySelectorAll('.mtile[data-i]') || []);
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = current + 1;
    if (event.key === 'ArrowLeft') next = current - 1;
    if (next === undefined) return;
    event.preventDefault();
    buttons[(next + buttons.length) % buttons.length]?.focus();
  };

  return (
    <section className="section section--alt" id="teams" aria-labelledby="teams-title" data-munch="users" data-munch-label="Teams">
      <div className="container">
        <div className="row-head" data-reveal>
          <div>
            <p className="sh__label t-label"><i className="i i-square" aria-hidden="true" />03 / Teams</p>
            <h2 className="t-d2" id="teams-title">Meet the <span className="t-soft">teams</span></h2>
            <p className="t-body-lg">The people behind PROCOM ’27.</p>
          </div>
          <Link className="link-action" href="/teams">
            Meet all teams<i className="i i-arrow" aria-hidden="true" />
          </Link>
        </div>

        <div className="mts" id="mts" data-reveal>
          <aside className="mts__p1" id="mtsP1" aria-label="Selected team" ref={panelRef} style={{ '--tone': selectedTeam.accent }}>
            <div className="mts__hud t-label">
              <span className="mts__tag">1P</span>
              <span>
                Team <b id="mtsIdx">{String(selectedIndex + 1).padStart(2, '0')}</b> / 04
              </span>
            </div>

            <div className="mts__stage" aria-hidden="true">
              <span className="mts__burst" />
              <span className="mts__code" id="mtsCode" style={{ fontSize: `${Math.min(130, 260 / (Math.max(2, selectedCode.length) * 0.62))}px` }}>{selectedCode}</span>
              <span className="mts__em" id="mtsEm"><TeamEmblem team={selectedTeam} /></span>
              <span className="mts__flash" />
              <span className="mts__stamp">Team<br />selected!</span>
            </div>

            <div className="mts__plate">
              <span className="mts__dept" id="mtsDept">{homeTeamDept[selectedTeam.dept]}</span>
              <h3 className="mts__name" id="mtsName" aria-live="polite">{selectedTeam.name}</h3>
            </div>

            <p className="mts__role" id="mtsRole">{selectedTeam.role}</p>
            <Link className="btn btn--arcade" href={`/teams/${selectedTeam.slug}`} aria-label={`Select ${selectedTeam.name} and open the team`} onClick={(event) => { event.preventDefault(); lock(selectedIndexRef.current); }}>
              <i className="i i-play" aria-hidden="true" />Select team
            </Link>
          </aside>

          <div className="mts__pick">
            <ul className="mts__grid" id="mtsGrid" aria-label="Featured teams" ref={gridRef} onKeyDown={handleKeyDown}>
              {homeTeams.map((team, index) => (
                <li key={team.slug}>
                  <button
                    type="button"
                    className={`mtile${index === selectedIndex ? ' is-cur' : ''}`}
                    data-i={index}
                    tabIndex={index === selectedIndex ? 0 : -1}
                    style={{ '--tone': team.accent, '--n': index }}
                    aria-label={`${team.name}, ${homeTeamDept[team.dept]}. Select to open the team`}
                    onPointerEnter={() => {
                      if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) preview(index);
                    }}
                    onFocus={() => preview(index)}
                    onClick={() => {
                      const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
                      if (!finePointer && selectedIndexRef.current !== index) preview(index);
                      else lock(index);
                    }}
                  >
                    <span className="mtile__in">
                      <span className="mtile__code" aria-hidden="true">{homeTeamCode[team.slug]}</span>
                      <span className="mtile__em"><TeamEmblem team={team} /></span>
                      <span className="mtile__nm">{team.name}</span>
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <Link className="mtile mtile--all" href="/teams" style={{ '--tone': '#B57CFF', '--n': 4 }}>
                  <span className="mtile__in">
                    <span className="mtile__q" aria-hidden="true">?</span>
                    <span className="mtile__nm">All 36 teams</span>
                  </span>
                </Link>
              </li>
            </ul>
            <div className="mts__cursor" id="mtsCur" aria-hidden="true" ref={cursorRef} hidden={!cursorReady}>
              <i />
              <b>1P</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
