// Runs the reference Bit Runner loop and owns its browser resources.
import { useEffect, useRef, useState } from 'react';

const WIDTH = 400;
const HEIGHT = 100;
const ROLL_PATTERN = /^2\d-\d{4}$/;
const BIT = [
  '.....B.......',
  '.....B.......',
  '.##########..',
  '############.',
  '#######wk###.',
  '#######wk###.',
  '############.',
  '#######www##.',
  '############.',
  '############.',
  '.##########..',
  '.##.....##...',
];
const BODY = BIT.slice(0, 11);
const LEGS = ['.##.....##...', '..##...##....', '.#.......##..'];
const BUG = ['.#.....#.', '..#...#..', '.#######.', '##.#.#.##', '#########', '.#######.', '#.#...#.#', '..#...#..'];
const BOX = ['########', '#......#', '#..##..#', '#..##..#', '#..##..#', '#......#', '#..##..#', '#......#', '########'];
const OBSTACLES = [BUG, BOX, BOX.concat(BOX.slice(1)), BUG.map((row) => `${row}.${row}`)];
const COLORS = { '#': '#B57CFF', B: '#DCC8FF', w: '#F5F0FA', k: '#07060B' };
const SOUNDS = {
  jump: [[392, 0.12, 'square', 784]],
  over: [[392, 0.16], [330, 0.16], [262, 0.42]],
  start: [[262, 0.06], [392, 0.06], [523, 0.06], [784, 0.2]],
};

function formatRoll(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 6);
  return digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
}

function readStoredPlayer() {
  try {
    const stored = window.localStorage.getItem('procom27-roll');
    return ROLL_PATTERN.test(stored || '') ? stored : '';
  } catch {
    return '';
  }
}

function readBoard() {
  try {
    const board = JSON.parse(window.localStorage.getItem('procom27-board') || '[]');
    return Array.isArray(board) ? board : [];
  } catch {
    return [];
  }
}

function playSound(name, audioRef, soundOnRef) {
  if (!soundOnRef.current) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audio = audioRef.current || new AudioContext();
    audioRef.current = audio;
    if (audio.state === 'suspended') void audio.resume();
    let time = audio.currentTime + 0.01;

    SOUNDS[name].forEach(([frequency, duration, type = 'square', endFrequency]) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, time);
      if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(time);
      oscillator.stop(time + duration + 0.02);
      time += duration * 0.92;
    });
  } catch {
    // Audio is optional and may be blocked by browser policy.
  }
}

export default function useBitRunner() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const gameRef = useRef(null);
  const playerRef = useRef('');
  const audioRef = useRef(null);
  const soundOnRef = useRef(false);
  const [player, setPlayer] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [score, setScore] = useState('00000');
  const [overlay, setOverlay] = useState('loading');
  const [outcome, setOutcome] = useState(null);
  const [champion, setChampion] = useState(null);
  const [board, setBoard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !stage || !canvas || !overlayRef.current) return undefined;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Bit Runner could not initialize its 2D canvas.');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      soundOnRef.current = window.localStorage.getItem('procom27-sfx') === '1';
    } catch {
      soundOnRef.current = false;
    }

    const storedPlayer = readStoredPlayer();
    const savedBoard = readBoard();
    playerRef.current = storedPlayer;
    setPlayer(storedPlayer);
    setPlayerInput(storedPlayer);
    setBoard(savedBoard);
    setChampion(savedBoard[0] || null);
    setOverlay(storedPlayer ? 'ready' : 'form');
    context.imageSmoothingEnabled = false;

    const state = {
      mode: 'demo',
      y: 0,
      vy: 0,
      obstacles: [],
      time: 0,
      speed: 2.4,
      points: 0,
      nextObstacle: 70,
      frame: 0,
      over: false,
      visible: true,
      accumulator: 0,
      lastTime: performance.now(),
      lastScore: '',
      animationId: 0,
      demoTimer: 0,
      width: WIDTH,
      height: HEIGHT,
      ground: HEIGHT - 14,
    };
    gameRef.current = state;

    const resizeCanvas = () => {
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(WIDTH * ratio);
      canvas.height = Math.round(HEIGHT * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.imageSmoothingEnabled = false;
    };
    resizeCanvas();
    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(resizeCanvas)
      : null;
    resizeObserver?.observe(stage);
    window.addEventListener('resize', resizeCanvas);

    function reset(mode) {
      if (mode === 'play') {
        state.lastScore = '';
        setOutcome(null);
      }
      Object.assign(state, {
        mode,
        y: 0,
        vy: 0,
        obstacles: [],
        time: 0,
        speed: 2.4,
        points: 0,
        nextObstacle: 70,
        frame: 0,
        over: false,
        accumulator: 0,
      });
      root.classList.toggle('is-playing', mode === 'play');
      setScore('00000');
    }

    function drawSprite(sprite, x, y, colorMap) {
      sprite.forEach((row, rowIndex) => {
        [...row].forEach((pixel, columnIndex) => {
          if (pixel !== '.') {
            context.fillStyle = colorMap ? colorMap[pixel] || '#F5F0FA' : '#F5F0FA';
            context.fillRect(x + columnIndex, y + rowIndex, 1, 1);
          }
        });
      });
    }

    function jump() {
      if (state.y === 0 && !state.over) {
        state.vy = -5.6;
        if (state.mode === 'play') playSound('jump', audioRef, soundOnRef);
      }
    }

    function hit(obstacle) {
      const bitX = 24;
      const bitY = state.ground - 12 + state.y;
      return bitX + 11 > obstacle.x + 1
        && bitX + 1 < obstacle.x + obstacle.width - 1
        && bitY + 11 > state.ground - obstacle.height + 1;
    }

    function renderOverlay(mode, details = null) {
      setOutcome(details);
      setOverlay(mode);
    }

    function saveScore(points) {
      const nextBoard = readBoard();
      const oldTop = nextBoard[0]?.score || 0;
      const oldPlayerScore = nextBoard.find((entry) => entry.roll === playerRef.current)?.score || 0;
      const mine = nextBoard.find((entry) => entry.roll === playerRef.current);
      if (mine) {
        if (points > mine.score) {
          mine.score = points;
          mine.t = Date.now();
        }
      } else {
        nextBoard.push({ roll: playerRef.current, score: points, t: Date.now() });
      }
      nextBoard.sort((a, b) => b.score - a.score || a.t - b.t);
      const rankedBoard = nextBoard.slice(0, 20);
      try {
        window.localStorage.setItem('procom27-board', JSON.stringify(rankedBoard));
      } catch {
        // Keep the game playable when storage is disabled.
      }
      const flag = points > oldTop && points > 0
        ? 'champ'
        : points > oldPlayerScore && oldPlayerScore > 0 ? 'best' : '';
      setBoard(rankedBoard);
      setChampion(rankedBoard[0] || null);
      return flag;
    }

    function finishGame() {
      state.over = true;
      const points = Math.floor(state.points);
      playSound('over', audioRef, soundOnRef);
      root.classList.remove('is-playing');
      renderOverlay('over', { score: points, flag: '' });
      window.clearTimeout(state.demoTimer);
      state.demoTimer = window.setTimeout(() => {
        if (state.over && !root.classList.contains('is-playing')) reset('demo');
      }, 6000);
      const flag = saveScore(points);
      renderOverlay('over', { score: points, flag });
    }

    function step() {
      state.time += 1;
      state.frame = (state.time >> 2) % 3;
      state.speed = Math.min(6.2, 2.4 + state.time / 1400);
      state.points += state.speed * 0.08;

      if (state.vy || state.y < 0) {
        state.vy += 0.32;
        state.y += state.vy;
        if (state.y >= 0) {
          state.y = 0;
          state.vy = 0;
        }
      }
      if (--state.nextObstacle <= 0) {
        const sprite = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        state.obstacles.push({
          x: WIDTH + 4,
          width: sprite[0].length,
          height: sprite.length,
          sprite,
        });
        state.nextObstacle = 55 + Math.random() * 70 - state.speed * 4;
      }
      state.obstacles.forEach((obstacle) => { obstacle.x -= state.speed; });
      state.obstacles = state.obstacles.filter((obstacle) => obstacle.x > -24);

      if (state.mode === 'demo') {
        const obstacle = state.obstacles.find((item) => item.x + item.width > 22);
        if (obstacle && obstacle.x - 37 < 4 + state.speed * 6 && state.y === 0) jump();
      }
      for (let index = 0; index < state.obstacles.length; index += 1) {
        if (hit(state.obstacles[index])) {
          if (state.mode === 'demo') state.obstacles.splice(index, 1);
          else finishGame();
          break;
        }
      }
    }

    function draw() {
      const { ground } = state;
      context.fillStyle = '#07060B';
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.fillStyle = '#F5F0FA';
      context.fillRect(0, ground, WIDTH, 1);
      context.fillStyle = 'rgba(245,240,250,.3)';
      for (let x = (-state.time * state.speed) % 14; x < WIDTH; x += 14) {
        context.fillRect(x + 14, ground + 4, 3, 1);
        context.fillRect(x + 6, ground + 8, 2, 1);
      }
      state.obstacles.forEach((obstacle) => {
        drawSprite(obstacle.sprite, Math.round(obstacle.x), ground - obstacle.height);
      });
      const bitY = Math.round(ground - 12 + state.y);
      drawSprite(BODY, 24, bitY, COLORS);
      drawSprite([state.y < 0 ? LEGS[0] : LEGS[state.frame]], 24, bitY + 11);
      const scoreText = state.mode === 'play'
        ? String(Math.floor(state.points)).padStart(5, '0')
        : state.lastScore || '00000';
      if (scoreText !== state.lastScore) {
        state.lastScore = scoreText;
        setScore(scoreText);
      }
    }

    function animate(now) {
      const elapsed = Math.min(100, now - state.lastTime);
      state.lastTime = now;
      const shouldRun = (!reduceMotion || root.classList.contains('is-playing'))
        && state.visible
        && !document.hidden
        && !state.over;
      if (shouldRun) {
        state.accumulator += elapsed;
        while (state.accumulator >= 1000 / 60) {
          step();
          state.accumulator -= 1000 / 60;
          if (state.over) break;
        }
      } else {
        state.accumulator = 0;
      }
      if (state.visible) draw();
      state.animationId = window.requestAnimationFrame(animate);
    }

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(([entry]) => {
        state.visible = entry.isIntersecting;
      })
      : null;
    observer?.observe(canvas);
    const onKeyDown = (event) => {
      if (!root.classList.contains('is-playing') || state.over) return;
      if (/^(input|textarea|select)$/i.test(event.target.tagName)) return;
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w') {
        event.preventDefault();
        jump();
      }
    };
    const onPointerDown = (event) => {
      if (event.target.closest('.frun__ov')) return;
      if (root.classList.contains('is-playing') && !state.over) {
        event.preventDefault();
        jump();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    stage.addEventListener('pointerdown', onPointerDown);
    const onSoundChange = (event) => {
      soundOnRef.current = Boolean(event.detail);
    };
    document.addEventListener('procom:sfx', onSoundChange);

    reset('demo');
    state.animationId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(state.animationId);
      window.clearTimeout(state.demoTimer);
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('procom:sfx', onSoundChange);
      stage.removeEventListener('pointerdown', onPointerDown);
      if (audioRef.current) {
        void audioRef.current.close();
        audioRef.current = null;
      }
      root.classList.remove('is-playing');
    };
  }, []);

  useEffect(() => {
    if (overlay !== 'form') return;
    const input = overlayRef.current?.querySelector('input');
    input?.focus();
  }, [overlay]);

  useEffect(() => {
    if (overlay !== 'over') return;
    overlayRef.current?.querySelector('[data-r-play]')?.focus({ preventScroll: true });
  }, [overlay]);

  const start = () => {
    const state = gameRef.current;
    const root = rootRef.current;
    if (!state || !root) return;
    window.clearTimeout(state.demoTimer);
    state.mode = 'play';
    state.y = 0;
    state.vy = 0;
    state.obstacles = [];
    state.time = 0;
    state.speed = 2.4;
    state.points = 0;
    state.nextObstacle = 70;
    state.frame = 0;
    state.lastScore = '';
    state.over = false;
    state.accumulator = 0;
    root.classList.add('is-playing');
    setOutcome(null);
    rootRef.current?.querySelector('[data-r-stage]')?.focus({ preventScroll: true });
    playSound('start', audioRef, soundOnRef);
  };

  const showForm = () => {
    setPlayerInput(playerRef.current);
    setError('');
    setOverlay('form');
  };

  const updatePlayerInput = (value) => {
    const formatted = formatRoll(value);
    setPlayerInput(formatted);
    if (formatted && formatted[0] !== '2') setError('Roll numbers start with 2.');
    else setError('');
  };

  const handleRollKeyDown = (event) => {
    if (
      event.key.length === 1
      && !/[0-9]/.test(event.key)
      && !event.ctrlKey
      && !event.metaKey
    ) {
      event.preventDefault();
      if (event.key !== '-') setError('Digits only, please.');
    }
  };

  const submitPlayer = (event) => {
    event.preventDefault();
    const formatted = formatRoll(playerInput);
    if (!ROLL_PATTERN.test(formatted)) {
      setError(formatted && formatted[0] !== '2'
        ? 'Roll numbers start with 2.'
        : 'Enter your roll number as 2X-XXXX, digits only.');
      overlayRef.current?.querySelector('input')?.focus();
      return;
    }
    playerRef.current = formatted;
    setPlayer(formatted);
    try {
      window.localStorage.setItem('procom27-roll', formatted);
    } catch {
      // The session still works if browser storage is disabled.
    }
    setOverlay('ready');
    start();
  };

  return {
    rootRef,
    stageRef,
    canvasRef,
    overlayRef,
    player,
    playerInput,
    score,
    overlay,
    outcome,
    champion,
    board,
    error,
    start,
    showForm,
    updatePlayerInput,
    handleRollKeyDown,
    submitPlayer,
  };
}
