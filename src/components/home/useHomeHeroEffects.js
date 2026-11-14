import { useLayoutEffect, useRef, useState } from 'react';
import { homeHeroContent } from '../../data/homeHero.js';
import { ensureHomeFontsReady } from './homeFonts.js';

const LOGO_PATH = 'M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z';
const DECODE_GLYPHS = 'ABCDEFGHJKMNPQRSTUVWXYZ0123456789#%&*+/<>'.split('');
const WAVE_WIDTH = 240;
const WAVE_HEIGHT = 135;
const SOUND_BANK = {
  blip: [[880, 0.04]],
  press: [[520, 0.035]],
  start: [[262, 0.06], [392, 0.06], [523, 0.06], [784, 0.2]],
};

const pad2 = (value) => String(value).padStart(2, '0');

function getInitialBootState() {
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let booted = false;
  try {
    booted = window.sessionStorage.getItem('procom27-boot') === '1';
  } catch {
    booted = false;
  }
  const showBoot = !reducedMotion && !booted;
  return { showBoot, screenOn: !showBoot };
}

export function useHomeHeroEffects() {
  const consoleRef = useRef(null);
  const screenRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const visualRef = useRef(null);
  const orbitRef = useRef(null);
  const nubRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [screenOff, setScreenOff] = useState(false);
  const [consoleSleeping, setConsoleSleeping] = useState(false);
  const [initialBootState] = useState(getInitialBootState);
  const [screenOn, setScreenOn] = useState(initialBootState.screenOn);
  const [bootVisible, setBootVisible] = useState(initialBootState.showBoot);
  const [bootRunning, setBootRunning] = useState(initialBootState.showBoot);
  const [bootDone, setBootDone] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [osd, setOsd] = useState(null);
  const [clock, setClock] = useState('--:--');

  useLayoutEffect(() => {
    const consoleElement = consoleRef.current;
    const screen = screenRef.current;
    const logoCanvas = logoCanvasRef.current;
    const waveCanvas = waveCanvasRef.current;
    const visual = visualRef.current;
    const orbit = orbitRef.current;
    const nub = nubRef.current;
    const logoContext = logoCanvas?.getContext('2d');
    const waveContext = waveCanvas?.getContext('2d');

    if (!consoleElement || !screen || !logoCanvas || !waveCanvas || !visual || !orbit || !nub || !logoContext || !waveContext) {
      console.error('Home hero canvas or console element is unavailable.');
      return undefined;
    }

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = true;
    let bootSequence = 0;
    const timers = new Set();
    const decodeTimers = new Set();
    const cleanupListeners = [];
    const observers = [];
    const frames = new Set();
    const categoryElements = [...orbit.children];
    const bodies = categoryElements.map((element, index) => ({
      element,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      phase: (index / categoryElements.length) * Math.PI * 2,
      hot: false,
      hover: false,
      focus: false,
    }));
    const logoMouse = { x: -999, y: -999 };
    const orbitMouse = { x: 9999, y: 9999, inside: false };
    const waves = [];
    const visible = { logo: true, wave: true, orbit: true };
    const pressTimers = new Map();
    let motionEnabled = !motionPreference.matches;
    let logoWidth = 0;
    let logoHeight = 0;
    let logoParticles = [];
    let orbitRadius = 150;
    let orbitAngle = 0;
    let orbitSpeed = 1;
    let selectedIndex = -1;
    let logoTime = 0;
    let waveTime = 0;
    let lastLogoTime = null;
    let lastWaveTime = null;
    let lastOrbitTime = performance.now();
    let logoFrame = 0;
    let waveFrame = 0;
    let orbitFrame = 0;
    let audioContext = null;
    let soundEnabled = false;
    let selectionTimer = 0;
    let flashTimer = 0;
    let pulseTimer = 0;
    let osdTimer = 0;
    let bootTimer = 0;
    let nubKeyTimer = 0;
    let booted = false;
    let bootFinished = false;
    let clockInterval = 0;
    let brightnessIndex = 0;
    let dragging = false;
    let nubOriginX = 0;
    let nubOriginY = 0;
    const brightnessSteps = [
      { dim: 0, bars: 8 },
      { dim: 0.2, bars: 6 },
      { dim: 0.38, bars: 4 },
      { dim: 0.52, bars: 2 },
    ];

    const addListener = (target, type, listener, options) => {
      target.addEventListener(type, listener, options);
      cleanupListeners.push(() => target.removeEventListener(type, listener, options));
    };
    const later = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (active) callback();
      }, delay);
      timers.add(timer);
      return timer;
    };
    const clearTimer = (timer) => {
      if (timer) {
        window.clearTimeout(timer);
        timers.delete(timer);
      }
    };
    const requestFrame = (callback) => {
      if (!active) return 0;
      let frame = 0;
      frame = window.requestAnimationFrame((time) => {
        frames.delete(frame);
        if (active) callback(time);
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
    const homeFontsReady = ensureHomeFontsReady();

    try {
      soundEnabled = window.localStorage.getItem('procom27-sfx') === '1';
      booted = window.sessionStorage.getItem('procom27-boot') === '1';
    } catch {
      soundEnabled = false;
      booted = false;
    }

    function playSound(name) {
      if (!soundEnabled) return;
      try {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;
        audioContext = audioContext || new AudioContextConstructor();
        if (audioContext.state === 'suspended') audioContext.resume();
        let startTime = audioContext.currentTime + 0.01;
        (SOUND_BANK[name] || SOUND_BANK.blip).forEach(([frequency, duration]) => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(frequency, startTime);
          gain.gain.setValueAtTime(0.05, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(startTime);
          oscillator.stop(startTime + duration + 0.02);
          startTime += duration * 0.92;
        });
      } catch {
        // Audio is optional and must not interrupt the console controls.
      }
    }

    function setSound(enabled) {
      soundEnabled = enabled;
      try {
        window.localStorage.setItem('procom27-sfx', enabled ? '1' : '0');
      } catch {
        console.warn('Could not save the Home hero sound preference.');
      }
      if (enabled) playSound('blip');
    }

    function buildLogo() {
      const bounds = logoCanvas.getBoundingClientRect();
      logoWidth = bounds.width;
      logoHeight = bounds.height;
      if (!logoWidth || !logoHeight) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      logoCanvas.width = logoWidth * dpr;
      logoCanvas.height = logoHeight * dpr;
      logoContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sourceCanvas = document.createElement('canvas');
      const sourceWidth = 186;
      const sourceHeight = 251;
      sourceCanvas.width = sourceWidth;
      sourceCanvas.height = sourceHeight;
      const sourceContext = sourceCanvas.getContext('2d');
      if (!sourceContext) {
        console.error('Could not create the Home hero logo source canvas.');
        return;
      }
      sourceContext.fillStyle = '#fff';
      sourceContext.fill(new Path2D(LOGO_PATH));
      const pixels = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight).data;
      const step = 7;
      const scale = Math.min((logoWidth * 0.62) / sourceWidth, (logoHeight * 0.78) / sourceHeight);
      const offsetX = (logoWidth - sourceWidth * scale) / 2;
      const offsetY = (logoHeight - sourceHeight * scale) / 2;
      const oldParticles = logoParticles;
      logoParticles = [];
      for (let y = 0; y < sourceHeight; y += step) {
        for (let x = 0; x < sourceWidth; x += step) {
          if (pixels[(y * sourceWidth + x) * 4 + 3] <= 128) continue;
          const particle = oldParticles[logoParticles.length] || {
            x: Math.random() * logoWidth,
            y: Math.random() * logoHeight,
            vx: 0,
            vy: 0,
          };
          particle.tx = offsetX + x * scale;
          particle.ty = offsetY + y * scale;
          particle.size = Math.max(3, step * scale * 0.78);
          particle.color = Math.random() < 0.3 ? '#DCC8FF' : '#B57CFF';
          particle.twinkle = Math.random() * 6.28;
          logoParticles.push(particle);
        }
      }
      if (!motionEnabled) {
        logoParticles.forEach((particle) => {
          particle.x = particle.tx;
          particle.y = particle.ty;
        });
        drawLogo(2.5, false);
      }
    }

    function drawLogo(time, animate) {
      logoContext.clearRect(0, 0, logoWidth, logoHeight);
      waves.forEach((wave) => {
        wave.radius += 5.5;
        wave.alpha *= 0.955;
      });
      for (let index = waves.length - 1; index >= 0; index -= 1) {
        if (waves[index].alpha <= 0.08 || waves[index].radius >= Math.max(logoWidth, logoHeight)) {
          waves.splice(index, 1);
        }
      }
      logoParticles.forEach((particle) => {
        const dx = particle.x - logoMouse.x;
        const dy = particle.y - logoMouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        if (distance < 50 && animate) {
          const force = ((50 - distance) / 50) * 0.9;
          particle.vx += dx / distance * force;
          particle.vy += dy / distance * force;
        }
        waves.forEach((wave) => {
          const waveX = particle.x - wave.x;
          const waveY = particle.y - wave.y;
          const waveDistance = Math.sqrt(waveX * waveX + waveY * waveY) || 1;
          const band = Math.abs(waveDistance - wave.radius);
          if (band < 12) {
            const force = (1 - band / 12) * 0.9 * wave.alpha;
            particle.vx += waveX / waveDistance * force;
            particle.vy += waveY / waveDistance * force;
          }
        });
        particle.vx += (particle.tx - particle.x) * 0.045;
        particle.vy += (particle.ty - particle.y) * 0.045;
        particle.vx *= 0.82;
        particle.vy *= 0.82;
        particle.x += particle.vx;
        particle.y += particle.vy;
        logoContext.fillStyle = '#493460';
        logoContext.fillRect(particle.x + 3, particle.y + 3, particle.size, particle.size);
      });
      logoParticles.forEach((particle) => {
        const twinkle = animate ? (Math.sin(time * 2 + particle.twinkle) + 1) / 2 : 0;
        logoContext.globalAlpha = 0.75 + twinkle * 0.25;
        logoContext.fillStyle = twinkle > 0.97 ? '#F5F0FA' : particle.color;
        logoContext.fillRect(particle.x, particle.y, particle.size, particle.size);
      });
      logoContext.globalAlpha = 1;
    }

    function blastLogo(x, y) {
      if (!motionEnabled) return;
      logoParticles.forEach((particle) => {
        const dx = particle.x - x;
        const dy = particle.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.max(0, 1 - distance / 90) * 2.6 + Math.random() * 0.5;
        particle.vx += dx / distance * force;
        particle.vy += dy / distance * force;
      });
      waves.push({ x, y, radius: 0, alpha: 1 });
      if (waves.length > 3) waves.shift();
    }

    function drawWave(time) {
      const width = WAVE_WIDTH;
      const height = WAVE_HEIGHT;
      const colors = ['rgba(181,124,255,.65)', 'rgba(220,200,255,.4)', 'rgba(73,52,96,1)'];
      waveContext.clearRect(0, 0, width, height);
      for (let k = 2; k >= 0; k -= 1) {
        for (let x = 0; x < width; x += 2) {
          const y = Math.round(
            height * 0.64 + Math.sin(x * 0.032 + time * (0.5 + k * 0.14) + k * 1.9) * (9 + k * 5) + Math.sin(x * 0.011 - time * 0.28 + k) * 7,
          );
          if (k === 0) {
            waveContext.fillStyle = 'rgba(181,124,255,.06)';
            waveContext.fillRect(x, y, 2, height - y);
          }
          waveContext.fillStyle = colors[k];
          waveContext.fillRect(x, y, 2, 2);
        }
      }
    }

    function updateOrbitRadius() {
      const width = visual.clientWidth;
      const height = visual.clientHeight || 300;
      orbitRadius = Math.max(100, Math.min(160, width * 0.3, height * 0.5));
    }

    function placeBody(body) {
      body.element.style.transform = `translate(${body.x.toFixed(1)}px,${body.y.toFixed(1)}px)`;
    }

    function updateOrbit(time) {
      const delta = Math.min(0.05, (time - lastOrbitTime) / 1000);
      lastOrbitTime = time;
      if (!visible.orbit || document.hidden) return;
      const anyHot = selectedIndex > -1 || bodies.some((body) => body.hot || body.focus);
      orbitSpeed += ((anyHot ? 0 : (orbitMouse.inside ? 0.35 : 1)) - orbitSpeed) * 0.06;
      orbitAngle += delta * 0.28 * orbitSpeed;
      let nearest = null;
      let nearestDistance = 130;
      bodies.forEach((body) => {
        const distance = Math.hypot(body.x - orbitMouse.x, body.y - orbitMouse.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = body;
        }
      });
      bodies.forEach((body, index) => {
        const angle = body.phase + orbitAngle;
        const homeX = Math.cos(angle) * orbitRadius;
        const homeY = Math.sin(angle) * orbitRadius * 0.92;
        const dx = body.x - orbitMouse.x;
        const dy = body.y - orbitMouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        let forceX = (homeX - body.x) * 0.06;
        let forceY = (homeY - body.y) * 0.06;
        if (body === nearest) {
          forceX += (orbitMouse.x - body.x) * 0.09;
          forceY += (orbitMouse.y - body.y) * 0.09;
        } else if (distance < 120) {
          const force = ((120 - distance) / 120) * 2.4;
          forceX += dx / distance * force;
          forceY += dy / distance * force;
        }
        body.vx = (body.vx + forceX) * 0.76;
        body.vy = (body.vy + forceY) * 0.76;
        body.x += body.vx;
        body.y += body.vy;
        body.hot = body.hover || body.focus || index === selectedIndex || (body === nearest && nearestDistance < 34);
        body.element.classList.toggle('is-hot', body.hot);
        placeBody(body);
      });
    }

    function drawStaticOrbit() {
      bodies.forEach((body, index) => {
        body.x = Math.cos(body.phase) * orbitRadius;
        body.y = Math.sin(body.phase) * orbitRadius * 0.92;
        body.hot = index === selectedIndex;
        body.element.classList.toggle('is-hot', body.hot);
        placeBody(body);
      });
    }

    function stopAnimations() {
      cancelFrame(logoFrame);
      cancelFrame(waveFrame);
      cancelFrame(orbitFrame);
      logoFrame = waveFrame = orbitFrame = 0;
      lastLogoTime = lastWaveTime = null;
    }

    function startAnimations() {
      stopAnimations();
      if (!motionEnabled) {
        drawLogo(2.5, false);
        drawWave(2.5);
        drawStaticOrbit();
        return;
      }
      drawLogo(logoTime, true);
      drawWave(waveTime);
      bodies.forEach(placeBody);
      const runLogo = (time) => {
        if (lastLogoTime === null) lastLogoTime = time;
        const delta = Math.min(0.05, Math.max(0, (time - lastLogoTime) / 1000));
        lastLogoTime = time;
        if (visible.logo && !document.hidden) {
          logoTime += delta;
          drawLogo(logoTime, true);
        }
        logoFrame = requestFrame(runLogo);
      };
      const runWave = (time) => {
        if (lastWaveTime === null) lastWaveTime = time;
        const delta = Math.min(0.05, Math.max(0, (time - lastWaveTime) / 1000));
        lastWaveTime = time;
        if (visible.wave && !document.hidden) {
          waveTime += delta;
          drawWave(waveTime);
        }
        waveFrame = requestFrame(runWave);
      };
      const runOrbit = (time) => {
        updateOrbit(time);
        orbitFrame = requestFrame(runOrbit);
      };
      logoFrame = requestFrame(runLogo);
      waveFrame = requestFrame(runWave);
      orbitFrame = requestFrame(runOrbit);
    }

    function observeVisibility(element, name) {
      if (!('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver((entries) => {
        visible[name] = entries[0].isIntersecting;
      });
      observer.observe(element);
      observers.push(observer);
    }

    function selectCategory(index) {
      const length = homeHeroContent.categories.length;
      selectedIndex = ((index % length) + length) % length;
      setSelectedCategory(selectedIndex);
      setSelectionVisible(true);
      bodies.forEach((body, bodyIndex) => {
        if (!motionEnabled) {
          body.hot = bodyIndex === selectedIndex;
          body.element.classList.toggle('is-hot', body.hot);
        }
      });
      clearTimer(selectionTimer);
      selectionTimer = later(() => {
        setSelectionVisible(false);
        selectedIndex = -1;
        bodies.forEach((body) => body.element.classList.remove('is-hot'));
      }, 6000);
    }

    function pulseScreen() {
      screen.classList.remove('pulse');
      void screen.offsetWidth;
      screen.classList.add('pulse');
      clearTimer(pulseTimer);
      pulseTimer = later(() => screen.classList.remove('pulse'), 240);
    }

    function flashConsole() {
      consoleElement.classList.add('is-flash');
      clearTimer(flashTimer);
      flashTimer = later(() => consoleElement.classList.remove('is-flash'), 150);
    }

    function showOsd(label, bars) {
      setOsd({ label, bars });
      clearTimer(osdTimer);
      osdTimer = later(() => setOsd(null), 1500);
    }

    function pressControl(control, play = true) {
      if (!control) return;
      control.classList.remove('is-press');
      void control.offsetWidth;
      control.classList.add('is-press');
      clearTimer(pressTimers.get(control));
      pressTimers.set(control, later(() => {
        control.classList.remove('is-press');
        pressTimers.delete(control);
      }, 170));
      if (play) playSound('press');
    }

    function restoreHeadline() {
      screen.querySelectorAll('[data-decode]').forEach((element) => {
        // aria-label retains the row text while the decode effect replaces its contents.
        const finalText = element.getAttribute('aria-label') || element.textContent;
        element.textContent = finalText;
        element.setAttribute('aria-label', finalText);
        element.style.removeProperty('min-height');
      });
    }

    function scheduleDecode(callback, delay) {
      let timer = 0;
      timer = later(() => {
        decodeTimers.delete(timer);
        callback();
      }, delay);
      decodeTimers.add(timer);
      return timer;
    }

    function decodeHeadline() {
      screen.querySelectorAll('[data-decode]').forEach((element, index) => {
        const finalText = (element.getAttribute('data-decode-text') || element.textContent).replace(/\u00a0/g, ' ');
        element.textContent = finalText;
        element.setAttribute('aria-label', finalText);
        if (!motionEnabled) return;
        const duration = 900 + finalText.length * 18;
        const originalMinHeight = element.style.minHeight;
        element.style.minHeight = `${element.offsetHeight}px`;
        element.textContent = finalText.replace(/[^\s]/g, '·');
        let startedAt = null;
        const decodeFrame = (time) => {
          if (startedAt === null) startedAt = time;
          const progress = (time - startedAt) / duration;
          let output = '';
          for (let charIndex = 0; charIndex < finalText.length; charIndex += 1) {
            const character = finalText[charIndex];
            if (character === ' ' || character === '\n') output += character;
            else output += progress * finalText.length * 1.15 > charIndex + 2
              ? character
              : DECODE_GLYPHS[Math.floor(Math.random() * DECODE_GLYPHS.length)];
          }
          element.textContent = output;
          if (progress < 1) requestFrame(decodeFrame);
          else {
            element.textContent = finalText;
            scheduleDecode(() => {
              element.textContent = '';
              if (motionEnabled) {
                [...finalText].forEach((character) => {
                  const span = document.createElement('span');
                  span.className = 'hop';
                  span.textContent = character === ' ' ? '\u00a0' : character;
                  element.appendChild(span);
                });
              } else {
                element.textContent = finalText;
              }
              element.style.minHeight = originalMinHeight;
            }, motionEnabled ? finalText.length * 18 : 0);
          }
        };
        scheduleDecode(() => {
          requestFrame(decodeFrame);
        }, 160 + index * 240);
      });
    }

    function countStats() {
      const stat = screen.querySelector('.stat__v');
      if (!stat) return;
      const target = homeHeroContent.categories.reduce((total, category) => total + category.count, 0);
      if (!motionEnabled) {
        stat.textContent = pad2(target);
        return;
      }
      const startTime = performance.now();
      const update = (time) => {
        const progress = Math.min(1, (time - startTime) / 1100);
        stat.textContent = pad2(Math.round(target * progress));
        if (progress < 1) requestFrame(update);
      };
      requestFrame(update);
    }

    function startHero() {
      if (!active) return;
      screen.classList.add('is-on');
      setScreenOn(true);
      decodeHeadline();
      countStats();
    }

    function finishBoot(sequence = bootSequence) {
      if (!active || bootFinished || sequence !== bootSequence) return;
      bootFinished = true;
      clearTimer(bootTimer);
      homeFontsReady.then(() => {
        if (!active || sequence !== bootSequence) return;
        setBootDone(true);
        setBootRunning(false);
        later(() => setBootVisible(false), 420);
        startHero();
        booted = true;
        try {
          window.sessionStorage.setItem('procom27-boot', '1');
        } catch {
          console.warn('Could not save the Home hero startup state.');
        }
      });
    }

    function boot(force) {
      const sequence = ++bootSequence;
      bootFinished = false;
      screen.classList.remove('is-off');
      consoleElement.classList.remove('is-sleep');
      setScreenOff(false);
      setConsoleSleeping(false);
      clearTimer(bootTimer);
      if (!motionEnabled || (!force && booted)) {
        setBootVisible(false);
        setBootRunning(false);
        homeFontsReady.then(() => {
          if (active && sequence === bootSequence) startHero();
        });
        return;
      }
      screen.classList.remove('is-on');
      setScreenOn(false);
      setBootDone(false);
      setBootVisible(true);
      if (force || !initialBootState.showBoot) setBootRunning(false);
      homeFontsReady.then(() => {
        if (!active || sequence !== bootSequence || bootFinished || !motionEnabled) return;
        setBootRunning(true);
        playSound('start');
        bootTimer = later(() => finishBoot(sequence), 2100);
      });
    }

    function scrollToId(id) {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: motionEnabled ? 'smooth' : 'auto' });
    }

    function controlAction(action) {
      const categories = homeHeroContent.categories;
      if (action === 'left' || action === 'L') {
        selectCategory(selectedIndex < 0 ? categories.length - 1 : selectedIndex - 1);
      } else if (action === 'right' || action === 'R') {
        selectCategory(selectedIndex < 0 ? 0 : selectedIndex + 1);
      } else if (action === 'up') {
        window.scrollTo({ top: 0, behavior: motionEnabled ? 'smooth' : 'auto' });
      } else if (action === 'down') {
        scrollToId('register');
      } else if (action === 'ok') {
        if (selectedIndex < 0) selectCategory(0);
        else scrollToId('competitions');
      } else if (action === 'select') {
        blastLogo(logoWidth / 2 + (Math.random() - 0.5) * 20, logoHeight / 2);
      } else if (action === 'home') {
        boot(true);
      } else if (action === 'voldown') {
        setSound(false);
        showOsd('Sound off', 0);
      } else if (action === 'volup') {
        setSound(true);
        showOsd('Sound on', 10);
      } else if (action === 'bright') {
        brightnessIndex = (brightnessIndex + 1) % brightnessSteps.length;
        const setting = brightnessSteps[brightnessIndex];
        setBrightness(setting.dim);
        screen.style.setProperty('--dim', setting.dim);
        showOsd('Brightness', setting.bars);
      } else if (action === 'power') {
        if (screen.classList.contains('is-off')) {
          boot(true);
        } else {
          screen.classList.add('is-off');
          screen.classList.remove('is-on');
          consoleElement.classList.add('is-sleep');
          setScreenOff(true);
          setScreenOn(false);
          setConsoleSleeping(true);
        }
      }
    }

    function handleConsoleClick(event) {
      const control = event.target.closest('[data-act]');
      if (!control || !consoleElement.contains(control)) return;
      const action = control.dataset.act;
      pressControl(control);
      flashConsole();
      if (action !== 'power' && screen.classList.contains('is-off') && action !== 'face' && action !== 'start') return;
      pulseScreen();
      controlAction(action);
    }

    function handleConsoleKeyDown(event) {
      const action = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      }[event.key];
      if (!action || event.target.closest('.orb')) return;
      event.preventDefault();
      pressControl(consoleElement.querySelector(`.dpad__b[data-act="${action}"]`));
      flashConsole();
      pulseScreen();
      controlAction(action);
    }

    function moveNub(event) {
      if (!dragging) return;
      let dx = event.clientX - nubOriginX;
      let dy = event.clientY - nubOriginY;
      const distance = Math.hypot(dx, dy);
      if (distance > 16) {
        dx = (dx / distance) * 16;
        dy = (dy / distance) * 16;
      }
      setNub(dx, dy);
    }

    function setNub(dx, dy) {
      nub.querySelector('.nub__cap').style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
      if (!dx && !dy) {
        logoMouse.x = logoMouse.y = -999;
      } else {
        logoMouse.x = logoWidth / 2 + (dx / 16) * logoWidth * 0.32;
        logoMouse.y = logoHeight / 2 + (dy / 16) * logoHeight * 0.36;
      }
    }

    function endNubDrag() {
      if (!dragging) return;
      dragging = false;
      nub.classList.remove('is-drag');
      setNub(0, 0);
    }

    function handleNubKeyDown(event) {
      const direction = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      }[event.key];
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      setNub(direction[0] * 16, direction[1] * 16);
      clearTimer(nubKeyTimer);
      nubKeyTimer = later(() => setNub(0, 0), 260);
    }

    function handleMotionChange(event) {
      motionEnabled = !event.matches;
      if (!motionEnabled) {
        [...frames].forEach(cancelFrame);
        [...decodeTimers].forEach(clearTimer);
        decodeTimers.clear();
        restoreHeadline();
        const stat = screen.querySelector('.stat__v');
        if (stat) {
          stat.textContent = pad2(homeHeroContent.categories.reduce((total, category) => total + category.count, 0));
        }
      }
      startAnimations();
      if (!motionEnabled && !screen.querySelector('.boot').hidden) {
        clearTimer(bootTimer);
        finishBoot();
      }
    }

    const onLogoPointerMove = (event) => {
      const bounds = logoCanvas.getBoundingClientRect();
      logoMouse.x = event.clientX - bounds.left;
      logoMouse.y = event.clientY - bounds.top;
    };
    const onLogoPointerLeave = () => {
      logoMouse.x = logoMouse.y = -999;
    };
    const onLogoClick = (event) => {
      const bounds = logoCanvas.getBoundingClientRect();
      blastLogo(event.clientX - bounds.left, event.clientY - bounds.top);
    };
    const onOrbitMove = (event) => {
      const bounds = orbit.getBoundingClientRect();
      orbitMouse.x = event.clientX - bounds.left;
      orbitMouse.y = event.clientY - bounds.top;
      orbitMouse.inside = true;
    };
    const onOrbitLeave = () => {
      orbitMouse.inside = false;
      orbitMouse.x = orbitMouse.y = 9999;
    };
    const onScreenPointerMove = (event) => {
      const bounds = screen.getBoundingClientRect();
      screen.style.setProperty('--gx', `${(((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1)}%`);
      screen.style.setProperty('--gy', `${(((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1)}%`);
    };
    const onNubPointerDown = (event) => {
      dragging = true;
      nub.classList.add('is-drag');
      try {
        nub.setPointerCapture(event.pointerId);
      } catch {
        console.warn('Could not capture the Home hero analog-stick pointer.');
      }
      const bounds = nub.getBoundingClientRect();
      nubOriginX = bounds.left + bounds.width / 2;
      nubOriginY = bounds.top + bounds.height / 2;
      moveNub(event);
    };
    const onVisibilityChange = () => {
      if (!document.hidden) {
        lastOrbitTime = performance.now();
        lastLogoTime = lastWaveTime = null;
      }
    };
    const tickClock = () => {
      try {
        setClock(new Intl.DateTimeFormat('en-GB', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Karachi',
        }).format(new Date()).toUpperCase());
      } catch {
        console.error('Could not format the Home hero status clock.');
      }
    };

    buildLogo();
    // The reference draws in a fixed logical pixel grid without DPR scaling.
    waveCanvas.width = WAVE_WIDTH;
    waveCanvas.height = WAVE_HEIGHT;
    updateOrbitRadius();
    if (motionEnabled) {
      bodies.forEach((body) => {
        body.x = Math.cos(body.phase) * orbitRadius * 0.2;
        body.y = Math.sin(body.phase) * orbitRadius * 0.2;
      });
    } else {
      drawStaticOrbit();
    }
    observeVisibility(logoCanvas, 'logo');
    observeVisibility(waveCanvas, 'wave');
    observeVisibility(visual, 'orbit');
    startAnimations();

    addListener(window, 'resize', () => {
      buildLogo();
      updateOrbitRadius();
      if (!motionEnabled) drawStaticOrbit();
    });
    addListener(document, 'visibilitychange', onVisibilityChange);
    addListener(motionPreference, 'change', handleMotionChange);
    addListener(logoCanvas, 'pointermove', onLogoPointerMove);
    addListener(logoCanvas, 'pointerleave', onLogoPointerLeave);
    addListener(logoCanvas, 'click', onLogoClick);
    addListener(visual, 'pointermove', onOrbitMove);
    addListener(visual, 'pointerleave', onOrbitLeave);
    bodies.forEach((body) => {
      addListener(body.element, 'focus', () => { body.focus = true; });
      addListener(body.element, 'blur', () => { body.focus = false; });
      addListener(body.element, 'pointerenter', () => { body.hover = true; });
      addListener(body.element, 'pointerleave', () => { body.hover = false; });
    });
    addListener(consoleElement, 'click', handleConsoleClick);
    addListener(consoleElement, 'keydown', handleConsoleKeyDown);
    addListener(consoleElement, 'pointermove', onScreenPointerMove);
    addListener(nub, 'pointerdown', onNubPointerDown);
    addListener(nub, 'pointermove', moveNub);
    addListener(nub, 'pointerup', endNubDrag);
    addListener(nub, 'pointercancel', endNubDrag);
    addListener(nub, 'lostpointercapture', endNubDrag);
    addListener(nub, 'keydown', handleNubKeyDown);
    addListener(screen.querySelector('.boot'), 'click', () => finishBoot());

    tickClock();
    clockInterval = window.setInterval(tickClock, 15000);
    boot(false);

    return () => {
      active = false;
      bootSequence += 1;
      stopAnimations();
      observers.forEach((observer) => observer.disconnect());
      cleanupListeners.forEach((removeListener) => removeListener());
      timers.forEach((timer) => window.clearTimeout(timer));
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      pressTimers.forEach((timer) => window.clearTimeout(timer));
      restoreHeadline();
      window.clearInterval(clockInterval);
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
      screen.style.removeProperty('--gx');
      screen.style.removeProperty('--gy');
      consoleElement.classList.remove('is-flash');
      screen.classList.remove('pulse');
      nub.classList.remove('is-drag');
    };
  }, [initialBootState.showBoot]);

  return {
    consoleRef,
    screenRef,
    logoCanvasRef,
    waveCanvasRef,
    visualRef,
    orbitRef,
    nubRef,
    selectedCategory,
    selectionVisible,
    screenOff,
    consoleSleeping,
    screenOn,
    bootVisible,
    bootRunning,
    bootDone,
    brightness,
    osd,
    clock,
  };
}
