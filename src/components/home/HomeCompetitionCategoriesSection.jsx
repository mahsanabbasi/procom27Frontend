// Renders the final-reference Competition categories claw machine and controls.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { homeCategories, homeCompetitions } from '../../data/homeCompetitions.js';

const categoryCount = (categoryId) => homeCompetitions.filter(({ cat }) => cat === categoryId).length;
const plural = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;
const INITIAL_LCD = 'Pick a prize, or steer with the joystick and press GRAB.';

function playSound(audioContextRef, name) {
  let enabled = false;
  try {
    enabled = window.localStorage.getItem('procom27-sfx') === '1';
  } catch {
    return;
  }
  if (!enabled) return;

  const bank = {
    blip: [[880, 0.04]],
    press: [[520, 0.035]],
    grab: [[220, 0.09, 'sawtooth'], [170, 0.12, 'sawtooth']],
    drop: [[700, 0.26, 'triangle', 110]],
    miss: [[220, 0.32, 'sawtooth', 80]],
    win: [[523, 0.08], [659, 0.08], [784, 0.08], [1046, 0.26]],
  };
  const notes = bank[name] || bank.blip;
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return;

  try {
    const audioContext = audioContextRef.current
      || (audioContextRef.current = new AudioContextConstructor());
    if (audioContext.state === 'suspended') void audioContext.resume();

    let startTime = audioContext.currentTime + 0.01;
    notes.forEach(([frequency, duration, type = 'square', endFrequency]) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
      }
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
      startTime += duration * 0.92;
    });
  } catch {
    // Audio is optional and must not interrupt claw interaction.
  }
}

function Icon({ name }) {
  return <i className={`i i-${name}`} aria-hidden="true" />;
}

function Bulbs({ id }) {
  return (
    <div className="bulbs" id={id} aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <i key={index} style={{ '--n': id === 'cmBulbsBot' ? 16 - index : index }} />
      ))}
    </div>
  );
}

function CategoryPrize({ category, index }) {
  const [left, bottom, rotation] = category.position;
  const count = categoryCount(category.id);

  return (
    <button
      className={`prize prize--${index % 3}`}
      type="button"
      data-cat={category.id}
      style={{
        '--px': left,
        '--pb': `${bottom}px`,
        '--rot': `${rotation}deg`,
        '--z': bottom > 40 ? 1 : 2,
      }}
      aria-label={`Grab ${category.label}, ${plural(count, 'competition')}`}
    >
      <span className="prize__ic"><Icon name={`cat-${category.id}`} /></span>
      <span className="prize__code" aria-hidden="true">{category.short}</span>
      <span className="prize__tip" aria-hidden="true">{category.label}</span>
    </button>
  );
}

function CategoryPrizeRow({ category }) {
  const count = categoryCount(category.id);

  return (
    <li>
      <Link className="plist__row" href={`/competitions?cat=${category.id}`}>
        <span className="plist__ic"><Icon name={`cat-${category.id}`} /></span>
        <span className="plist__nm">{category.label}</span>
        <span className="plist__n">{plural(count, 'comp')}</span>
        <Icon name="arrow" />
      </Link>
    </li>
  );
}

export default function HomeCompetitionCategoriesSection() {
  const machineRef = useRef(null);
  const audioContextRef = useRef(null);
  const [, navigate] = useLocation();
  const [lcd, setLcd] = useState(INITIAL_LCD);
  const [wonCategory, setWonCategory] = useState(null);
  const [countdown, setCountdown] = useState({ left: 3, paused: false, progress: 0 });

  useEffect(() => {
    const machine = machineRef.current;
    if (!machine) return undefined;

    const glass = machine.querySelector('.cm__glass');
    const gantry = machine.querySelector('.cm__gantry');
    const pile = machine.querySelector('.cm__pile');
    const win = machine.querySelector('.cm__win');
    const chute = machine.querySelector('.cm__chute');
    const grabButton = machine.querySelector('.grab');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timers = new Set();
    const frames = new Set();
    const cancellations = new Set();
    const bursts = new Set();
    const audioContext = audioContextRef;
    let alive = true;
    let motionEnabled = !motionPreference.matches;
    let x = 0;
    let busy = false;
    let held = null;
    let autoTimer = 0;
    let direction = 0;
    let directionFrame = 0;

    const addListener = (target, type, listener, options) => {
      target.addEventListener(type, listener, options);
      cleanups.push(() => target.removeEventListener(type, listener, options));
    };
    const cleanups = [];
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
    const cancelFrame = (frame) => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frames.delete(frame);
      }
    };
    const later = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (alive) callback();
      }, delay);
      timers.add(timer);
      return timer;
    };
    const wait = (duration) => new Promise((resolve) => {
      let settled = false;
      const finish = (completed) => {
        if (settled) return;
        settled = true;
        cancellations.delete(cancel);
        resolve(completed);
      };
      const timer = later(() => finish(true), duration);
      const cancel = () => {
        window.clearTimeout(timer);
        timers.delete(timer);
        finish(false);
      };
      cancellations.add(cancel);
    });
    const tween = (duration, update, ease) => new Promise((resolve) => {
      if (!motionEnabled) {
        update(1);
        resolve(true);
        return;
      }
      const start = performance.now();
      let frame = 0;
      let settled = false;
      const finish = (completed) => {
        if (settled) return;
        settled = true;
        cancelFrame(frame);
        cancellations.delete(cancel);
        resolve(completed);
      };
      const tick = (time) => {
        if (!alive) {
          finish(false);
          return;
        }
        const progress = Math.min(1, (time - start) / duration);
        update(ease ? ease(progress) : progress);
        if (progress < 1) frame = requestFrame(tick);
        else finish(true);
      };
      const cancel = () => finish(false);
      cancellations.add(cancel);
      tick(start);
    });
    const easeInOut = (progress) => (
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
    );
    const setX = (value) => {
      x = Math.max(0, Math.min(glass.clientWidth - 76, value));
      gantry.style.setProperty('--x', `${x}px`);
    };
    const setLength = (length) => gantry.style.setProperty('--l', `${length}px`);
    const setOpen = (open) => machine.classList.toggle('is-open', open);
    const restX = () => chute.offsetWidth / 2 - 38;
    const relativePrize = (prize) => ({
      x: pile.offsetLeft + prize.offsetLeft,
      y: pile.offsetTop + prize.offsetTop,
      w: prize.offsetWidth,
      h: prize.offsetHeight,
    });
    const prizes = () => [...pile.querySelectorAll('.prize')].filter((prize) => prize !== held);
    const target = () => {
      const clawCenter = x + 38;
      let best = null;
      let bestDistance = 32;
      prizes().forEach((prize) => {
        const rect = relativePrize(prize);
        const distance = Math.abs(rect.x + rect.w / 2 - clawCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = prize;
        }
      });
      return best;
    };
    const markTarget = () => {
      const selected = target();
      prizes().forEach((prize) => prize.classList.toggle('is-target', prize === selected));
    };
    const markTargetOff = () => prizes().forEach((prize) => prize.classList.remove('is-target'));
    const press = (element) => {
      element.classList.remove('is-press');
      void element.offsetWidth;
      element.classList.add('is-press');
      later(() => element.classList.remove('is-press'), 170);
    };
    const categoryFor = (prize) => homeCategories.find(({ id }) => id === prize.dataset.cat);
    const burst = (x, y) => {
      if (!motionEnabled || !document.body.animate) return;
      const colors = ['#B57CFF', '#DCC8FF', '#F5F0FA'];
      for (let index = 0; index < 22; index += 1) {
        const element = document.createElement('i');
        const size = 4 + Math.random() * 5;
        const angle = Math.random() * Math.PI * 2;
        const velocity = 40 + Math.random() * 120;
        element.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${colors[index % 3]};z-index:400;pointer-events:none`;
        document.body.appendChild(element);
        const animation = element.animate([
          { transform: 'translate(-50%,-50%)', opacity: 1 },
          {
            transform: `translate(${Math.cos(angle) * velocity - size / 2}px,${Math.sin(angle) * velocity + 40}px) rotate(${Math.random() * 180}deg)`,
            opacity: 0,
          },
        ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.2,.75,.15,1)' });
        const particle = { element, animation };
        bursts.add(particle);
        animation.onfinish = () => {
          element.remove();
          bursts.delete(particle);
        };
      }
    };

    const reveal = (category) => {
      if (!alive) return;
      playSound(audioContext, 'win');
      setLcd(`You won: ${category.label}!`);
      setCountdown({ left: 3, paused: false, progress: 0 });
      setWonCategory(category);
      requestFrame(() => {
        win.querySelector('.cm__auto i b')?.style.setProperty('--a', '33%');
        win.querySelector('a')?.focus({ preventScroll: true });
      });
      const rect = chute.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + 20);
      let left = 3;
      let paused = false;
      const pause = () => {
        if (paused) return;
        paused = true;
        window.clearInterval(autoTimer);
        setCountdown({ left, paused: true, progress: 0 });
        win.querySelector('.cm__auto i b')?.style.setProperty('--a', '0%');
      };
      win.onpointerdown = (event) => {
        if (!event.target.closest('a')) pause();
      };
      win.onkeydown = (event) => {
        if (event.key !== 'Enter') pause();
      };
      autoTimer = window.setInterval(() => {
        if (!alive) return;
        left -= 1;
        if (left <= 0) {
          window.clearInterval(autoTimer);
          navigate(`/competitions?cat=${category.id}`);
          return;
        }
        const progress = ((3 - left + 1) / 3) * 100;
        setCountdown({ left, paused: false, progress });
        win.querySelector('.cm__auto i b')?.style.setProperty('--a', `${progress}%`);
      }, 1000);
    };
    const run = async (prize, auto) => {
      if (busy) return;
      busy = true;
      machine.classList.add('is-busy');
      markTargetOff();
      const category = categoryFor(prize);
      if (!category) {
        console.error(`Unknown competition category: ${prize.dataset.cat}`);
        busy = false;
        machine.classList.remove('is-busy');
        return;
      }
      setLcd(`Grabbing: ${category.label}`);
      if (!motionEnabled) {
        held = prize;
        reveal(category);
        return;
      }

      const rect = relativePrize(prize);
      const from = x;
      if (auto) {
        const targetX = rect.x + rect.w / 2 - 38;
        playSound(audioContext, 'blip');
        if (!await tween(Math.min(480, 150 + Math.abs(targetX - from) * 0.85), (progress) => {
          setX(from + (targetX - from) * progress);
        }, easeInOut)) return;
      }
      setOpen(true);
      if (!await wait(70)) return;
      const lower = rect.y + rect.h * 0.42 - 56 - 26;
      if (!await tween(360, (progress) => setLength(26 + (lower - 26) * progress), easeInOut)) return;
      setOpen(false);
      playSound(audioContext, 'grab');
      if (!await wait(130)) return;
      held = prize;
      prize.classList.add('is-held');
      prize.classList.remove('is-target');
      const clawX = x;
      const rotation = Number.parseFloat(prize.style.getPropertyValue('--rot')) || 0;
      if (!await tween(380, (progress) => {
        const length = lower + (26 - lower) * progress;
        setLength(length);
        prize.style.setProperty('--ty', `${length - lower}px`);
        prize.style.setProperty('--rr', `${rotation * (1 - progress)}deg`);
      }, easeInOut)) return;
      const chuteX = chute.offsetWidth / 2 - 38;
      const fromX = x;
      const initialY = 26 - lower;
      if (!await tween(460, (progress) => {
        setX(fromX + (chuteX - fromX) * progress);
        prize.style.setProperty('--tx', `${x - clawX}px`);
        prize.style.setProperty('--ty', `${initialY + Math.sin(progress * Math.PI * 3) * 2}px`);
      }, easeInOut)) return;
      setOpen(true);
      playSound(audioContext, 'drop');
      const fall = glass.clientHeight - (rect.y + initialY) + 12;
      if (!await tween(300, (progress) => {
        prize.style.setProperty('--ty', `${initialY + fall * progress * progress}px`);
      })) return;
      chute.classList.add('is-hit');
      later(() => chute.classList.remove('is-hit'), 720);
      if (!await wait(80)) return;
      setOpen(false);
      reveal(category);
    };
    const miss = async () => {
      if (busy) return;
      busy = true;
      machine.classList.add('is-busy');
      markTargetOff();
      setLcd('Dropping…');
      const lower = glass.clientHeight - 22 - 56 - 26;
      setOpen(true);
      if (!await wait(70)) return;
      if (!await tween(380, (progress) => setLength(26 + (lower - 26) * progress), easeInOut)) return;
      setOpen(false);
      playSound(audioContext, 'miss');
      if (!await wait(130)) return;
      if (!await tween(380, (progress) => setLength(lower + (26 - lower) * progress), easeInOut)) return;
      setLcd('Missed! Line the claw up over a prize and try again.');
      busy = false;
      machine.classList.remove('is-busy');
      markTarget();
    };
    const reset = () => {
      window.clearInterval(autoTimer);
      win.onpointerdown = null;
      win.onkeydown = null;
      setWonCategory(null);
      setOpen(false);
      busy = false;
      machine.classList.remove('is-busy');
      setLcd(INITIAL_LCD);
      if (held) {
        const prize = held;
        held = null;
        prize.classList.remove('is-held');
        ['--tx', '--ty', '--rr'].forEach((property) => prize.style.removeProperty(property));
        if (motionEnabled) {
          prize.classList.add('is-back');
          later(() => prize.classList.remove('is-back'), 560);
        }
        prize.focus({ preventScroll: true });
      }
      const from = x;
      const to = restX();
      void tween(380, (progress) => setX(from + (to - from) * progress), easeInOut).then(markTarget);
    };
    const onPileClick = (event) => {
      const prize = event.target.closest('.prize');
      if (prize && pile.contains(prize)) void run(prize, true);
    };
    const hold = (nextDirection) => {
      if (busy) return;
      direction = nextDirection;
      machine.classList.add(nextDirection < 0 ? 'joy-l' : 'joy-r');
      const move = () => {
        if (!direction || !alive || busy) return;
        setX(x + direction * 4.6);
        markTarget();
        directionFrame = requestFrame(move);
      };
      move();
    };
    const release = () => {
      direction = 0;
      cancelFrame(directionFrame);
      directionFrame = 0;
      machine.classList.remove('joy-l', 'joy-r');
    };
    const onJoystickPointerDown = (event) => {
      event.preventDefault();
      hold(Number(event.currentTarget.dataset.joy));
    };
    const onJoystickKeyDown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (busy) return;
      const directionValue = Number(event.currentTarget.dataset.joy);
      machine.classList.add(directionValue < 0 ? 'joy-l' : 'joy-r');
      setX(x + directionValue * 18);
      markTarget();
    };
    const onJoystickKeyUp = () => machine.classList.remove('joy-l', 'joy-r');
    const onMachineKeyDown = (event) => {
      if (event.target.closest('.cm__win')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (busy) return;
      event.preventDefault();
      setX(x + (event.key === 'ArrowLeft' ? -18 : 18));
      markTarget();
    };
    const onGrab = () => {
      if (busy) return;
      press(grabButton);
      const selected = target();
      if (selected) void run(selected, false);
      else void miss();
    };
    const onWinClick = (event) => {
      if (event.target.closest('[data-again]')) reset();
    };
    const onMotionChange = () => {
      motionEnabled = !motionPreference.matches;
    };

    setX(restX());
    setLength(26);
    markTarget();
    addListener(window, 'resize', () => {
      if (!busy) setX(x);
    });
    addListener(pile, 'click', onPileClick);
    addListener(machine, 'keydown', onMachineKeyDown);
    addListener(grabButton, 'click', onGrab);
    addListener(win, 'click', onWinClick);
    [...machine.querySelectorAll('[data-joy]')].forEach((button) => {
      addListener(button, 'pointerdown', onJoystickPointerDown);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((eventName) => {
        addListener(button, eventName, release);
      });
      addListener(button, 'keydown', onJoystickKeyDown);
      addListener(button, 'keyup', onJoystickKeyUp);
    });
    addListener(window, 'pointerup', release);
    addListener(window, 'blur', release);
    motionPreference.addEventListener('change', onMotionChange);

    return () => {
      alive = false;
      motionPreference.removeEventListener('change', onMotionChange);
      cleanups.forEach((cleanup) => cleanup());
      timers.forEach(window.clearTimeout);
      timers.clear();
      window.clearInterval(autoTimer);
      frames.forEach(window.cancelAnimationFrame);
      frames.clear();
      cancellations.forEach((cancel) => cancel());
      cancellations.clear();
      bursts.forEach(({ element, animation }) => {
        animation.cancel();
        element.remove();
      });
      bursts.clear();
      held?.classList.remove('is-held');
      win.onpointerdown = null;
      win.onkeydown = null;
      if (audioContext.current && audioContext.current.state !== 'closed') {
        void audioContext.current.close();
        audioContext.current = null;
      }
    };
  }, [navigate]);

  return (
    <section
      className="section"
      id="categories"
      aria-labelledby="cat-title"
      data-munch="trophy"
      data-munch-label="Competitions"
    >
      <div className="container">
        <header className="sh" data-reveal>
          <div>
            <p className="sh__label t-label"><Icon name="square" />01 / Competitions</p>
            <h2 className="sh__title t-d2" id="cat-title">
              Competition <span className="t-soft">categories</span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            Find the competitions that fit your interests and skills. Pick a prize, or steer the claw and press GRAB.
          </p>
        </header>
        <div className="claw">
          <div className="cm" id="claw" data-reveal="scale" ref={machineRef}>
            <div className="cm__top">
              <Bulbs id="cmBulbsTop" />
              <p className="cm__title" aria-hidden="true">Prize grabber</p>
              <p className="cm__sub t-label" id="cmSub" aria-hidden="true">
                {plural(homeCategories.length, 'category', 'categories')} · free play
              </p>
              <Bulbs id="cmBulbsBot" />
            </div>
            <div className="cm__box">
              <div className="cm__glass">
                <span className="cm__rail" aria-hidden="true" />
                <div className="cm__gantry" aria-hidden="true" style={{ '--x': '12px', '--l': '26px' }}>
                  <span className="cm__car" />
                  <span className="cm__cable" />
                  <span className="cm__head">
                    <svg viewBox="0 0 76 64">
                      <rect x="27" y="0" width="22" height="13" fill="#100C16" stroke="#DCC8FF" strokeWidth="1.5" />
                      <rect x="33" y="4" width="10" height="5" fill="#B57CFF" />
                      <g className="cm__prong cm__prong--l">
                        <path d="M31 11 L17 30 L19 47 L28 56" fill="none" stroke="#DCC8FF" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
                      </g>
                      <g className="cm__prong cm__prong--r">
                        <path d="M45 11 L59 30 L57 47 L48 56" fill="none" stroke="#DCC8FF" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
                      </g>
                    </svg>
                  </span>
                </div>
                <div className="cm__chute" aria-hidden="true">
                  <span className="cm__clbl t-label">Prize<Icon name="arrow-down" /></span>
                  <span className="cm__hole" />
                </div>
                <div className="cm__pile" id="cmPile" role="group" aria-label="Prizes: competition categories">
                  {homeCategories.map((category, index) => (
                    <CategoryPrize key={category.id} category={category} index={index} />
                  ))}
                </div>
                <span className="cm__shine" aria-hidden="true" />
                <div className="cm__win" id="cmWin" role="dialog" aria-label="Your prize" aria-modal="false" aria-live="polite" hidden={!wonCategory}>
                  {wonCategory && (
                    <>
                      <p className="cm__wl t-label">★ You won ★</p>
                      <span className="cm__wi"><Icon name={`cat-${wonCategory.id}`} /></span>
                      <h3 className="cm__wn">{wonCategory.label}</h3>
                      <p className="cm__wc">{plural(categoryCount(wonCategory.id), 'competition')} in this category</p>
                      <ul className="cm__wlist">
                        {homeCompetitions.filter(({ cat }) => cat === wonCategory.id).slice(0, 3).map((competition) => (
                          <li key={competition.id}>{competition.name}</li>
                        ))}
                        {categoryCount(wonCategory.id) > 3 && (
                          <li>and {categoryCount(wonCategory.id) - 3} more</li>
                        )}
                      </ul>
                      <div className="btn-row">
                        <Link className="btn btn--primary btn--sm" href={`/competitions?cat=${wonCategory.id}`}>
                          Open category<Icon name="arrow" />
                        </Link>
                        <button className="btn btn--secondary btn--sm" type="button" data-again>
                          Play again<Icon name="refresh" />
                        </button>
                      </div>
                      <p className="cm__auto">
                        <span>{countdown.paused ? 'Auto-open paused' : <>Opening in <b>{countdown.left}</b>…</>}</span>
                        <i><b style={{ '--a': `${countdown.progress}%` }} /></i>
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="cm__deck">
              <div className="joy" role="group" aria-label="Move the claw">
                <button className="joy__b" type="button" data-joy="-1" aria-label="Move claw left">
                  <Icon name="chevron-left" />
                </button>
                <span className="joy__stick" aria-hidden="true"><i /></span>
                <button className="joy__b" type="button" data-joy="1" aria-label="Move claw right">
                  <Icon name="chevron-right" />
                </button>
              </div>
              <p className="cm__lcd" id="cmLcd" aria-live="polite">{lcd}</p>
              <button className="grab" id="cmGrab" type="button">Grab</button>
            </div>
          </div>
          <aside className="panel plist" data-reveal aria-labelledby="plist-title">
            <div className="hud t-label">
              <span id="plist-title">Prize list</span>
              <b id="plistCount">{plural(homeCategories.length, 'category', 'categories')}</b>
            </div>
            <ul className="plist__rows" id="cats">
              {homeCategories.map((category) => (
                <CategoryPrizeRow key={category.id} category={category} />
              ))}
            </ul>
            <div className="plist__foot">
              <Link className="link-action" href="/competitions">
                View all competitions<Icon name="arrow" />
              </Link>
              <span className="t-meta" id="allCount">{plural(homeCompetitions.length, 'competition')} listed</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
