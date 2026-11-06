// Runs and cleans up the Home hero's reference canvas and orbit animations.
import { useCallback, useEffect, useRef, useState } from "react";
import { homeHeroContent } from "../../data/homeContent.js";

const LOGO_PATH =
  "M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z";
const WAVE_COLORS = [
  "rgba(181,124,255,.65)",
  "rgba(220,200,255,.4)",
  "rgba(73,52,96,1)",
];
const WAVE_WIDTH = 240;
const WAVE_HEIGHT = 135;

export default function useHeroCanvas(navigate) {
  const consoleRef = useRef(null);
  const screenRef = useRef(null);
  const logoCanvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const visualRef = useRef(null);
  const orbitRef = useRef(null);
  const nubRef = useRef(null);
  const selectedCategoryRef = useRef(-1);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [isScreenOn, setIsScreenOn] = useState(false);
  const [isScreenOff, setIsScreenOff] = useState(false);
  const [isConsoleSleeping, setIsConsoleSleeping] = useState(false);
  const [isBootVisible, setIsBootVisible] = useState(false);
  const [isBootRunning, setIsBootRunning] = useState(false);
  const [isBootDone, setIsBootDone] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return window.localStorage.getItem("procom27-sfx") === "1";
    } catch {
      return false;
    }
  });
  const [osd, setOsd] = useState(null);
  const soundEnabledRef = useRef(soundEnabled);

  // Keep selection state available to the frame loop without restarting it.
  const selectCategory = useCallback((index) => {
    selectedCategoryRef.current = index;
    setSelectedCategoryIndex(index);
  }, []);

  useEffect(() => {
    const consoleElement = consoleRef.current;
    const screenElement = screenRef.current;
    const logoCanvas = logoCanvasRef.current;
    const waveCanvas = waveCanvasRef.current;
    const visualElement = visualRef.current;
    const orbitElement = orbitRef.current;
    const nubElement = nubRef.current;
    const logoContext = logoCanvas?.getContext("2d");
    const waveContext = waveCanvas?.getContext("2d");

    if (
      !consoleElement ||
      !screenElement ||
      !logoCanvas ||
      !waveCanvas ||
      !visualElement ||
      !orbitElement ||
      !nubElement ||
      !logoContext ||
      !waveContext
    ) {
      return undefined;
    }

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let motionEnabled = !motionPreference.matches;
    let logoWidth = 0;
    let logoHeight = 0;
    let particles = [];
    let logoMouseX = -999;
    let logoMouseY = -999;
    let orbitMouseX = 9999;
    let orbitMouseY = 9999;
    let orbitMouseIn = false;
    let orbitAngle = 0;
    let orbitSpeed = 1;
    let orbitRadius = 150;
    let logoLastTime = null;
    let waveLastTime = null;
    let orbitLastTime = performance.now();
    let logoTime = 0;
    let waveTime = 0;
    let logoFrame = 0;
    let waveFrame = 0;
    let orbitFrame = 0;
    let logoVisible = true;
    let waveVisible = true;
    let orbitVisible = true;
    let draggingNub = false;
    let nubOriginX = 0;
    let nubOriginY = 0;
    let nubKeyTimer = 0;
    let pulseTimer = 0;
    let selectionTimer = 0;
    let bootTimer = 0;
    let bootFinishTimer = 0;
    let bootStartFrame = 0;
    let osdTimer = 0;
    let brightnessIndex = 0;
    let booted = false;
    let screenIsOff = false;
    let bootIsVisible = false;
    let audioContext = null;
    const pressTimers = new Map();
    let categoryIndex = selectedCategoryRef.current;
    const nubRadius = 16;
    const categories = homeHeroContent.categories;
    const orbitBodies = categories.map((_, index) => ({
      element: orbitElement.children[index],
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      phase: (index / categories.length) * Math.PI * 2,
      hot: false,
      hover: false,
      focus: false,
    }));
    const observers = [];

    try {
      booted = window.sessionStorage.getItem("procom27-boot") === "1";
    } catch {
      booted = false;
    }

    // Match the reference's local, opt-in arcade sound bank.
    function playSound(name) {
      if (!soundEnabledRef.current) return;
      try {
        const AudioContextConstructor =
          window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;
        audioContext = audioContext || new AudioContextConstructor();
        if (audioContext.state === "suspended") audioContext.resume();
        const sounds = {
          blip: [[880, 0.04]],
          press: [[520, 0.035]],
          start: [
            [262, 0.06],
            [392, 0.06],
            [523, 0.06],
            [784, 0.2],
          ],
        };
        let startTime = audioContext.currentTime + 0.01;
        (sounds[name] || sounds.blip).forEach(([frequency, duration]) => {
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(frequency, startTime);
          gain.gain.setValueAtTime(0.05, startTime);
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            startTime + duration,
          );
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(startTime);
          oscillator.stop(startTime + duration + 0.02);
          startTime += duration * 0.92;
        });
      } catch {
        // Audio is optional; unsupported or blocked audio must not block controls.
      }
    }

    // Pause frame drawing offscreen while retaining cancellable animation loops.
    function observeVisibility(element, updateVisibility) {
      if (!("IntersectionObserver" in window)) return;
      const observer = new IntersectionObserver((entries) => {
        updateVisibility(entries[0].isIntersecting);
      });
      observer.observe(element);
      observers.push(observer);
    }

    // Rasterize the reference brand mark into particles at its original 7px step.
    function buildLogo() {
      const bounds = logoCanvas.getBoundingClientRect();
      logoWidth = bounds.width;
      logoHeight = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      logoCanvas.width = logoWidth * dpr;
      logoCanvas.height = logoHeight * dpr;
      logoContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      const sourceCanvas = document.createElement("canvas");
      const sourceWidth = 186;
      const sourceHeight = 251;
      sourceCanvas.width = sourceWidth;
      sourceCanvas.height = sourceHeight;
      const sourceContext = sourceCanvas.getContext("2d");
      if (!sourceContext) return;

      sourceContext.fillStyle = "#fff";
      sourceContext.fill(new Path2D(LOGO_PATH));
      const imageData = sourceContext.getImageData(
        0,
        0,
        sourceWidth,
        sourceHeight,
      ).data;
      const pixelStep = 7;
      const scale = Math.min(
        (logoWidth * 0.62) / sourceWidth,
        (logoHeight * 0.78) / sourceHeight,
      );
      const offsetX = (logoWidth - sourceWidth * scale) / 2;
      const offsetY = (logoHeight - sourceHeight * scale) / 2;
      const previousParticles = particles;
      particles = [];

      for (let y = 0; y < sourceHeight; y += pixelStep) {
        for (let x = 0; x < sourceWidth; x += pixelStep) {
          if (imageData[(y * sourceWidth + x) * 4 + 3] <= 128) continue;

          const particle = previousParticles[particles.length] || {
            x: Math.random() * logoWidth,
            y: Math.random() * logoHeight,
            vx: 0,
            vy: 0,
          };
          particle.tx = offsetX + x * scale;
          particle.ty = offsetY + y * scale;
          particle.size = Math.max(3, pixelStep * scale * 0.78);
          particle.color = Math.random() < 0.3 ? "#DCC8FF" : "#B57CFF";
          particle.twinkle = Math.random() * 6.28;
          particles.push(particle);
        }
      }

      if (!motionEnabled) {
        particles.forEach((particle) => {
          particle.x = particle.tx;
          particle.y = particle.ty;
          particle.vx = 0;
          particle.vy = 0;
        });
      }
    }

    function drawLogo(time) {
      logoContext.clearRect(0, 0, logoWidth, logoHeight);
      particles.forEach((particle) => {
        const dx = particle.x - logoMouseX;
        const dy = particle.y - logoMouseY;
        const distance = Math.hypot(dx, dy);

        if (distance < 70 && motionEnabled) {
          const force = ((70 - distance) / 70) * 2.4;
          const divisor = distance || 1;
          particle.vx += (dx / divisor) * force;
          particle.vy += (dy / divisor) * force;
        }

        particle.vx += (particle.tx - particle.x) * 0.045;
        particle.vy += (particle.ty - particle.y) * 0.045;
        particle.vx *= 0.82;
        particle.vy *= 0.82;
        particle.x += particle.vx;
        particle.y += particle.vy;

        logoContext.fillStyle = "#493460";
        logoContext.fillRect(
          particle.x + 3,
          particle.y + 3,
          particle.size,
          particle.size,
        );
      });

      particles.forEach((particle) => {
        const twinkle = motionEnabled
          ? (Math.sin(time * 2 + particle.twinkle) + 1) / 2
          : 0;
        logoContext.globalAlpha = 0.75 + twinkle * 0.25;
        logoContext.fillStyle =
          twinkle > 0.97 ? "#F5F0FA" : particle.color;
        logoContext.fillRect(
          particle.x,
          particle.y,
          particle.size,
          particle.size,
        );
      });
      logoContext.globalAlpha = 1;
    }

    // Draw the same 240x135, three-layer pixel ribbon used by the reference.
    function drawWave(time) {
      waveContext.clearRect(0, 0, WAVE_WIDTH, WAVE_HEIGHT);
      for (let layer = 2; layer >= 0; layer -= 1) {
        for (let x = 0; x < WAVE_WIDTH; x += 2) {
          const y = Math.round(
            WAVE_HEIGHT * 0.64 +
              Math.sin(
                x * 0.032 + time * (0.5 + layer * 0.14) + layer * 1.9,
              ) *
                (9 + layer * 5) +
              Math.sin(x * 0.011 - time * 0.28 + layer) * 7,
          );
          if (layer === 0) {
            waveContext.fillStyle = "rgba(181,124,255,.06)";
            waveContext.fillRect(x, y, 2, WAVE_HEIGHT - y);
          }
          waveContext.fillStyle = WAVE_COLORS[layer];
          waveContext.fillRect(x, y, 2, 2);
        }
      }
    }

    function placeOrbitBody(body) {
      body.element.style.transform = `translate(${body.x.toFixed(1)}px,${body.y.toFixed(1)}px)`;
    }

    function setOrbitPositions(scale) {
      orbitBodies.forEach((body) => {
        body.x = Math.cos(body.phase) * orbitRadius * scale;
        body.y = Math.sin(body.phase) * orbitRadius * 0.92 * scale;
        body.vx = 0;
        body.vy = 0;
        placeOrbitBody(body);
      });
    }

    function updateOrbitRadius() {
      const width = visualElement.clientWidth;
      const height = visualElement.clientHeight || 300;
      orbitRadius = Math.max(100, Math.min(160, width * 0.3, height * 0.5));
      setOrbitPositions(motionEnabled ? 0.2 : 1);
    }

    // The pointer repulsion, click burst, and analog nub share particle velocity.
    function scatterLogo(x, y) {
      if (!motionEnabled) return;
      particles.forEach((particle) => {
        const dx = particle.x - x;
        const dy = particle.y - y;
        const distance = Math.hypot(dx, dy) || 1;
        const force = 18 + Math.random() * 22;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;
      });
    }

    function blastLogo() {
      scatterLogo(
        logoWidth / 2 + (Math.random() - 0.5) * 20,
        logoHeight / 2,
      );
    }

    function moveLogoWithStick(dx, dy) {
      if (!dx && !dy) {
        logoMouseX = -999;
        logoMouseY = -999;
        return;
      }
      logoMouseX = logoWidth / 2 + dx * logoWidth * 0.32;
      logoMouseY = logoHeight / 2 + dy * logoHeight * 0.36;
    }

    // D-pad selection highlights an orbit icon and dismisses its label after 6s.
    function selectOrbitCategory(index) {
      categoryIndex = ((index % categories.length) + categories.length) % categories.length;
      selectedCategoryRef.current = categoryIndex;
      selectCategory(categoryIndex);
      if (!motionEnabled) {
        orbitBodies.forEach((body, bodyIndex) => {
          body.element.classList.toggle("is-hot", bodyIndex === categoryIndex);
        });
      }
      window.clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(() => {
        categoryIndex = -1;
        selectedCategoryRef.current = -1;
        selectCategory(-1);
        orbitBodies.forEach((body) => body.element.classList.remove("is-hot"));
      }, 6000);
    }

    // Each loop matches the reference's capped delta and hidden-tab behavior.
    function runLogoFrame(now) {
      if (logoLastTime === null) logoLastTime = now;
      const delta = Math.min(0.05, Math.max(0, (now - logoLastTime) / 1000));
      logoLastTime = now;
      if (logoVisible && !document.hidden) {
        logoTime += delta;
        drawLogo(logoTime);
      }
      logoFrame = window.requestAnimationFrame(runLogoFrame);
    }

    function runWaveFrame(now) {
      if (waveLastTime === null) waveLastTime = now;
      const delta = Math.min(0.05, Math.max(0, (now - waveLastTime) / 1000));
      waveLastTime = now;
      if (waveVisible && !document.hidden) {
        waveTime += delta;
        drawWave(waveTime);
      }
      waveFrame = window.requestAnimationFrame(runWaveFrame);
    }

    function runOrbitFrame(now) {
      const delta = Math.min(0.05, Math.max(0, (now - orbitLastTime) / 1000));
      orbitLastTime = now;
      if (orbitVisible && !document.hidden) {
        const anyHot =
          categoryIndex > -1 ||
          orbitBodies.some((body) => body.hot || body.focus);
        orbitSpeed +=
          ((anyHot ? 0 : orbitMouseIn ? 0.35 : 1) - orbitSpeed) * 0.06;
        orbitAngle += delta * 0.28 * orbitSpeed;

        let nearestBody = null;
        let nearestDistance = 130;
        orbitBodies.forEach((body) => {
          const distance = Math.hypot(
            body.x - orbitMouseX,
            body.y - orbitMouseY,
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestBody = body;
          }
        });

        orbitBodies.forEach((body, index) => {
          const angle = body.phase + orbitAngle;
          const homeX = Math.cos(angle) * orbitRadius;
          const homeY = Math.sin(angle) * orbitRadius * 0.92;
          const dx = body.x - orbitMouseX;
          const dy = body.y - orbitMouseY;
          const distance = Math.hypot(dx, dy) || 1;
          let forceX = (homeX - body.x) * 0.06;
          let forceY = (homeY - body.y) * 0.06;

          if (body === nearestBody) {
            forceX += (orbitMouseX - body.x) * 0.09;
            forceY += (orbitMouseY - body.y) * 0.09;
          } else if (distance < 120) {
            const force = ((120 - distance) / 120) * 2.4;
            forceX += (dx / distance) * force;
            forceY += (dy / distance) * force;
          }

          body.vx = (body.vx + forceX) * 0.76;
          body.vy = (body.vy + forceY) * 0.76;
          body.x += body.vx;
          body.y += body.vy;
          body.hot = Boolean(
            body.hover ||
              index === categoryIndex ||
              (body === nearestBody && nearestDistance < 34),
          );
          body.element.classList.toggle("is-hot", body.hot);
          placeOrbitBody(body);
        });
      }
      orbitFrame = window.requestAnimationFrame(runOrbitFrame);
    }

    function stopMotion() {
      window.cancelAnimationFrame(logoFrame);
      window.cancelAnimationFrame(waveFrame);
      window.cancelAnimationFrame(orbitFrame);
      logoFrame = 0;
      waveFrame = 0;
      orbitFrame = 0;
      logoLastTime = null;
      waveLastTime = null;
      particles.forEach((particle) => {
        particle.x = particle.tx;
        particle.y = particle.ty;
        particle.vx = 0;
        particle.vy = 0;
      });
      drawLogo(2.5);
      drawWave(2.5);
      setOrbitPositions(1);
    }

    function startMotion() {
      if (!motionEnabled) return;
      logoLastTime = null;
      waveLastTime = null;
      orbitLastTime = performance.now();
      setOrbitPositions(0.2);
      logoFrame = window.requestAnimationFrame(runLogoFrame);
      waveFrame = window.requestAnimationFrame(runWaveFrame);
      orbitFrame = window.requestAnimationFrame(runOrbitFrame);
    }

    function updateMotionPreference(event) {
      motionEnabled = !event.matches;
      if (motionEnabled) startMotion();
      else stopMotion();
    }

    function updateClock() {
      const clock = consoleElement.querySelector("#scrClock");
      if (!clock) return;
      clock.textContent = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      })
        .format(new Date())
        .toUpperCase();
    }

    function pulseScreen() {
      screenElement.classList.remove("pulse");
      void screenElement.offsetWidth;
      screenElement.classList.add("pulse");
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(
        () => screenElement.classList.remove("pulse"),
        220,
      );
    }

    function showOsd(label, activeBars) {
      setOsd({ label, activeBars });
      window.clearTimeout(osdTimer);
      osdTimer = window.setTimeout(() => setOsd(null), 1500);
    }

    function setSoundPreference(enabled) {
      soundEnabledRef.current = enabled;
      setSoundEnabled(enabled);
      try {
        window.localStorage.setItem("procom27-sfx", enabled ? "1" : "0");
      } catch {
        // Keep the in-memory preference if browser storage is unavailable.
      }
      document.dispatchEvent(
        new CustomEvent("procom:sfx", { detail: enabled }),
      );
      if (enabled) playSound("blip");
    }

    function pressControl(control) {
      if (!control) return;
      control.classList.remove("is-press");
      void control.offsetWidth;
      control.classList.add("is-press");
      window.clearTimeout(pressTimers.get(control));
      pressTimers.set(
        control,
        window.setTimeout(() => {
          control.classList.remove("is-press");
          pressTimers.delete(control);
        }, 170),
      );
      playSound("press");
    }

    function startHero() {
      screenIsOff = false;
      setIsScreenOn(true);
      screenElement.classList.add("is-on");
      screenElement.classList.remove("is-off");
      setIsScreenOff(false);
    }

    function finishBoot() {
      window.clearTimeout(bootTimer);
      window.cancelAnimationFrame(bootStartFrame);
      bootIsVisible = true;
      setIsBootRunning(false);
      setIsBootDone(true);
      startHero();
      booted = true;
      try {
        window.sessionStorage.setItem("procom27-boot", "1");
      } catch {
        booted = true;
      }
      window.clearTimeout(bootFinishTimer);
      bootFinishTimer = window.setTimeout(() => {
        bootIsVisible = false;
        setIsBootVisible(false);
        setIsBootDone(false);
      }, 420);
    }

    function boot(force) {
      screenIsOff = false;
      bootIsVisible = false;
      setIsScreenOn(false);
      setIsScreenOff(false);
      setIsConsoleSleeping(false);
      screenElement.classList.remove("is-on");
      screenElement.classList.remove("is-off");
      consoleElement.classList.remove("is-sleep");
      if (!motionEnabled || (!force && booted)) {
        setIsBootVisible(false);
        setIsBootRunning(false);
        setIsBootDone(false);
        startHero();
        return;
      }

      window.clearTimeout(bootTimer);
      window.clearTimeout(bootFinishTimer);
      bootIsVisible = true;
      setIsBootVisible(true);
      setIsBootDone(false);
      setIsBootRunning(false);
      bootStartFrame = window.requestAnimationFrame(() => {
        setIsBootRunning(true);
      });
      playSound("start");
      bootTimer = window.setTimeout(finishBoot, 2100);
    }

    function runAction(action) {
      if (action === "L") action = "left";
      if (action === "R") action = "right";

      if (action === "left") {
        selectOrbitCategory(
          categoryIndex < 0 ? categories.length - 1 : categoryIndex - 1,
        );
      } else if (action === "right") {
        selectOrbitCategory(categoryIndex < 0 ? 0 : categoryIndex + 1);
      } else if (action === "up") {
        window.scrollTo({ top: 0, behavior: motionEnabled ? "smooth" : "auto" });
      } else if (action === "down") {
        document
          .querySelector("#play")
          ?.scrollIntoView({ behavior: motionEnabled ? "smooth" : "auto" });
      } else if (action === "ok") {
        if (categoryIndex < 0) selectOrbitCategory(0);
        else navigate(`/competitions/${categories[categoryIndex].id}`);
      } else if (action === "select") {
        blastLogo();
      } else if (action === "home") {
        boot(true);
      } else if (action === "voldown") {
        setSoundPreference(false);
        showOsd("Sound off", 0);
      } else if (action === "volup") {
        setSoundPreference(true);
        showOsd("Sound on", 10);
      } else if (action === "bright") {
        const dimLevels = [0, 0.2, 0.38, 0.52];
        const barLevels = [8, 6, 4, 2];
        brightnessIndex = (brightnessIndex + 1) % dimLevels.length;
        screenElement.style.setProperty(
          "--dim",
          String(dimLevels[brightnessIndex]),
        );
        showOsd("Brightness", barLevels[brightnessIndex]);
      } else if (action === "power") {
        if (screenIsOff) {
          boot(true);
        } else {
          screenIsOff = true;
          setIsScreenOn(false);
          setIsScreenOff(true);
          setIsConsoleSleeping(true);
          screenElement.classList.add("is-off");
          screenElement.classList.remove("is-on");
          consoleElement.classList.add("is-sleep");
        }
      }
    }

    function handleLogoPointerMove(event) {
      const bounds = logoCanvas.getBoundingClientRect();
      logoMouseX = event.clientX - bounds.left;
      logoMouseY = event.clientY - bounds.top;
    }

    function resetLogoPointer() {
      logoMouseX = -999;
      logoMouseY = -999;
    }

    function handleLogoClick(event) {
      const bounds = logoCanvas.getBoundingClientRect();
      scatterLogo(event.clientX - bounds.left, event.clientY - bounds.top);
    }

    function handleOrbitPointerMove(event) {
      const bounds = orbitElement.getBoundingClientRect();
      orbitMouseX = event.clientX - bounds.left;
      orbitMouseY = event.clientY - bounds.top;
      orbitMouseIn = true;
    }

    function handleOrbitPointerLeave() {
      orbitMouseIn = false;
      orbitMouseX = 9999;
      orbitMouseY = 9999;
    }

    function handleOrbitFocus(event) {
      const body = orbitBodies.find((item) => item.element === event.target);
      if (body) body.focus = true;
    }

    function handleOrbitBlur(event) {
      const body = orbitBodies.find((item) => item.element === event.target);
      if (body) body.focus = false;
    }

    function handleOrbitHover(event) {
      const element = event.target.closest(".orb");
      const body = orbitBodies.find((item) => item.element === element);
      if (!body) return;
      if (
        event.type === "pointerout" &&
        element.contains(event.relatedTarget)
      ) {
        return;
      }
      body.hover = event.type === "pointerover";
    }

    function setNubPosition(dx, dy) {
      const cap = nubElement.querySelector(".nub__cap");
      cap.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
      moveLogoWithStick(dx / nubRadius, dy / nubRadius);
    }

    function moveNub(event) {
      if (!draggingNub) return;
      let dx = event.clientX - nubOriginX;
      let dy = event.clientY - nubOriginY;
      const distance = Math.hypot(dx, dy);
      if (distance > nubRadius) {
        dx = (dx / distance) * nubRadius;
        dy = (dy / distance) * nubRadius;
      }
      setNubPosition(dx, dy);
    }

    function startNubDrag(event) {
      draggingNub = true;
      nubElement.classList.add("is-drag");
      try {
        nubElement.setPointerCapture(event.pointerId);
      } catch {
        draggingNub = false;
        nubElement.classList.remove("is-drag");
        return;
      }
      const bounds = nubElement.getBoundingClientRect();
      nubOriginX = bounds.left + bounds.width / 2;
      nubOriginY = bounds.top + bounds.height / 2;
      moveNub(event);
    }

    function endNubDrag() {
      if (!draggingNub) return;
      draggingNub = false;
      nubElement.classList.remove("is-drag");
      setNubPosition(0, 0);
    }

    function handleNubKeyDown(event) {
      const directions = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      setNubPosition(direction[0] * nubRadius, direction[1] * nubRadius);
      window.clearTimeout(nubKeyTimer);
      nubKeyTimer = window.setTimeout(() => setNubPosition(0, 0), 260);
    }

    function handleConsoleClick(event) {
      if (event.target.closest(".boot") && bootIsVisible) {
        finishBoot();
        return;
      }

      const control = event.target.closest("[data-act]");
      if (!control) return;
      const action = control.dataset.act;
      pressControl(control);
      if (
        action !== "power" &&
        screenIsOff &&
        action !== "face" &&
        action !== "start"
      ) {
        return;
      }
      pulseScreen();
      runAction(action);
    }

    function handleConsoleKeyDown(event) {
      if (event.target.closest(".orb")) return;
      const actions = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      pressControl(consoleElement.querySelector(`[data-act="${action}"]`));
      pulseScreen();
      runAction(action);
    }

    function handleConsolePointerMove(event) {
      const bounds = screenElement.getBoundingClientRect();
      screenElement.style.setProperty(
        "--gx",
        `${(((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1)}%`,
      );
      screenElement.style.setProperty(
        "--gy",
        `${(((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1)}%`,
      );
    }

    function handleResize() {
      buildLogo();
      updateOrbitRadius();
      if (!motionEnabled) {
        drawLogo(2.5);
        drawWave(2.5);
      }
    }

    // Initialize canvas dimensions, visibility observers, and console controls.
    buildLogo();
    waveCanvas.width = WAVE_WIDTH;
    waveCanvas.height = WAVE_HEIGHT;
    updateOrbitRadius();
    observeVisibility(logoCanvas, (visible) => {
      logoVisible = visible;
    });
    observeVisibility(waveCanvas, (visible) => {
      waveVisible = visible;
    });
    observeVisibility(visualElement, (visible) => {
      orbitVisible = visible;
    });
    updateClock();
    const clockInterval = window.setInterval(updateClock, 15000);

    logoCanvas.addEventListener("pointermove", handleLogoPointerMove);
    logoCanvas.addEventListener("pointerleave", resetLogoPointer);
    logoCanvas.addEventListener("click", handleLogoClick);
    visualElement.addEventListener("pointermove", handleOrbitPointerMove);
    visualElement.addEventListener("pointerleave", handleOrbitPointerLeave);
    orbitElement.addEventListener("focusin", handleOrbitFocus);
    orbitElement.addEventListener("focusout", handleOrbitBlur);
    orbitElement.addEventListener("pointerover", handleOrbitHover);
    orbitElement.addEventListener("pointerout", handleOrbitHover);
    nubElement.addEventListener("pointerdown", startNubDrag);
    nubElement.addEventListener("pointermove", moveNub);
    nubElement.addEventListener("pointerup", endNubDrag);
    nubElement.addEventListener("pointercancel", endNubDrag);
    nubElement.addEventListener("lostpointercapture", endNubDrag);
    nubElement.addEventListener("keydown", handleNubKeyDown);
    consoleElement.addEventListener("click", handleConsoleClick);
    consoleElement.addEventListener("keydown", handleConsoleKeyDown);
    consoleElement.addEventListener("pointermove", handleConsolePointerMove);
    window.addEventListener("resize", handleResize);
    motionPreference.addEventListener("change", updateMotionPreference);

    if (motionEnabled) startMotion();
    else stopMotion();
    boot(false);

    return () => {
      window.cancelAnimationFrame(logoFrame);
      window.cancelAnimationFrame(waveFrame);
      window.cancelAnimationFrame(orbitFrame);
      window.clearInterval(clockInterval);
      window.clearTimeout(nubKeyTimer);
      window.clearTimeout(pulseTimer);
      window.clearTimeout(selectionTimer);
      window.clearTimeout(bootTimer);
      window.clearTimeout(bootFinishTimer);
      window.clearTimeout(osdTimer);
      window.cancelAnimationFrame(bootStartFrame);
      pressTimers.forEach((timer) => window.clearTimeout(timer));
      audioContext?.close();
      motionPreference.removeEventListener("change", updateMotionPreference);
      logoCanvas.removeEventListener("pointermove", handleLogoPointerMove);
      logoCanvas.removeEventListener("pointerleave", resetLogoPointer);
      logoCanvas.removeEventListener("click", handleLogoClick);
      visualElement.removeEventListener("pointermove", handleOrbitPointerMove);
      visualElement.removeEventListener("pointerleave", handleOrbitPointerLeave);
      orbitElement.removeEventListener("focusin", handleOrbitFocus);
      orbitElement.removeEventListener("focusout", handleOrbitBlur);
      orbitElement.removeEventListener("pointerover", handleOrbitHover);
      orbitElement.removeEventListener("pointerout", handleOrbitHover);
      nubElement.removeEventListener("pointerdown", startNubDrag);
      nubElement.removeEventListener("pointermove", moveNub);
      nubElement.removeEventListener("pointerup", endNubDrag);
      nubElement.removeEventListener("pointercancel", endNubDrag);
      nubElement.removeEventListener("lostpointercapture", endNubDrag);
      nubElement.removeEventListener("keydown", handleNubKeyDown);
      consoleElement.removeEventListener("click", handleConsoleClick);
      consoleElement.removeEventListener("keydown", handleConsoleKeyDown);
      consoleElement.removeEventListener(
        "pointermove",
        handleConsolePointerMove,
      );
      window.removeEventListener("resize", handleResize);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [
    consoleRef,
    screenRef,
    logoCanvasRef,
    waveCanvasRef,
    visualRef,
    orbitRef,
    nubRef,
    selectedCategoryRef,
    selectCategory,
    navigate,
  ]);

  return {
    consoleRef,
    screenRef,
    logoCanvasRef,
    waveCanvasRef,
    visualRef,
    orbitRef,
    nubRef,
    selectedCategory:
      selectedCategoryIndex < 0
        ? null
        : homeHeroContent.categories[selectedCategoryIndex],
    isScreenOn,
    isScreenOff,
    isConsoleSleeping,
    isBootVisible,
    isBootRunning,
    isBootDone,
    soundEnabled,
    osd,
  };
}
