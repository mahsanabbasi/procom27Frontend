// Renders the deterministic cartridge art and the reference pixel banner loop.
import { useEffect, useRef } from 'react';

const MOTIFS = {
  cs: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  ai: <><rect x="3" y="4" width="5" height="5" /><rect x="3" y="15" width="5" height="5" /><rect x="16" y="9.5" width="5" height="5" /><path d="M8 6.5l8 5M8 17.5l8-5" /></>,
  ee: <path d="M13 2L5 14h6l-1 8 8-12h-6z" />,
  se: <><rect x="3" y="4" width="18" height="16" /><path d="M3 9h18M7 13h10M7 16h6" /></>,
  biz: <path d="M5 20v-8M11 20V5M17 20v-5M2 20h20" />,
  gen: <><path d="M8 9a4 4 0 1 1 6 3.5c-1.3.7-2 1.5-2 2.5v1" /><path d="M12 19v1.5" /></>,
  gaming: <><path d="M6 7h12a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4z" /><path d="M7 10.5v4M5 12.5h4M15 12h.5M18 11h.5" /></>,
};

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function randomGenerator(seed) {
  let value = seed || 1;
  return () => {
    value ^= value << 13;
    value >>>= 0;
    value ^= value >>> 17;
    value ^= value << 5;
    value >>>= 0;
    return value / 4294967296;
  };
}

export function CompetitionArt({ competition }) {
  const random = randomGenerator(hash(competition.id));
  const pixels = [];
  let sequence = 0;

  for (let y = 0; y < 10; y += 1) {
    for (let x = 0; x < 16; x += 1) {
      const value = random();
      const height = (Math.sin(x * 0.7 + random() * 2) + 1) / 2;
      const active = value < 0.16 + (y / 10) * 0.22 * height;
      const opacity = active ? 0.18 + random() * 0.5 : (random() < 0.08 ? 0.06 : 0);
      if (!opacity) continue;
      pixels.push({
        x: x * 10,
        y: y * 10,
        color: random() < 0.25 ? '#DCC8FF' : '#B57CFF',
        opacity: opacity.toFixed(2),
        sequence: sequence++ % 40,
        active,
      });
    }
  }

  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`art-gradient-${competition.id}`}>
          <stop offset="0" stopColor="#B57CFF" stopOpacity=".35" />
          <stop offset="1" stopColor="#B57CFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="100" fill="#0B0910" />
      {pixels.map((pixel, index) => (
        <rect
          className={`px ${pixel.active ? 'f' : 'o'}`}
          style={{ '--d': pixel.sequence }}
          key={`${pixel.x}-${pixel.y}-${index}`}
          x={pixel.x}
          y={pixel.y}
          width="10"
          height="10"
          fill={pixel.color}
          opacity={pixel.opacity}
        />
      ))}
      <g stroke="#493460" strokeWidth=".5" opacity=".7">
        {Array.from({ length: 15 }, (_, index) => <path key={`v-${index}`} d={`M${(index + 1) * 10} 0V100`} />)}
        {Array.from({ length: 9 }, (_, index) => <path key={`h-${index}`} d={`M0 ${(index + 1) * 10}H160`} />)}
      </g>
      <circle cx="80" cy="50" r="38" fill={`url(#art-gradient-${competition.id})`} />
      <g className="motif" style={{ transformOrigin: '80px 50px' }}>
        <rect x="58" y="28" width="44" height="44" fill="#100C16" stroke="#DCC8FF" strokeWidth="1" />
        <g transform="translate(65 35) scale(1.25)" fill="none" stroke="#DCC8FF" strokeWidth="2" strokeLinecap="square">
          {MOTIFS[competition.cat]}
        </g>
      </g>
      <path d="M54 24h6M54 24v6M106 24h-6M106 24v6M54 76h6M54 76v-6M106 76h-6M106 76v-6" stroke="#B57CFF" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function prepareBanner(canvas, category) {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to initialize the featured competition canvas.');
  const width = 192;
  const height = 84;
  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = false;

  const light = '#B57CFF';
  const bright = '#DCC8FF';
  const dim = '#493460';
  const background = '#0B0910';
  const white = '#F5F0FA';
  const random = randomGenerator(hash(category) + 7);
  const state = {};

  function drawBackground() {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'rgba(73,52,96,.35)';
    for (let x = 0; x < width; x += 8) context.fillRect(x, 0, 1, height);
    for (let y = 0; y < height; y += 8) context.fillRect(0, y, width, 1);
  }

  function drawSorting() {
    if (!state.values) {
      state.values = Array.from({ length: 30 }, () => 4 + ((random() * 60) | 0));
      state.i = 0;
      state.j = 0;
      state.done = 0;
      state.accumulator = 0;
    }
    state.accumulator += 1;
    if (state.accumulator > 2) {
      state.accumulator = 0;
      if (!state.done) {
        const values = state.values;
        if (values[state.j] > values[state.j + 1]) {
          [values[state.j], values[state.j + 1]] = [values[state.j + 1], values[state.j]];
        }
        state.j += 1;
        if (state.j >= values.length - 1 - state.i) {
          state.j = 0;
          state.i += 1;
          if (state.i >= values.length - 1) {
            state.done = 1;
            state.hold = 90;
          }
        }
      } else if (--state.hold <= 0) {
        state.values = null;
      }
    }
    drawBackground();
    if (!state.values) return;
    const barWidth = 5;
    const startX = (width - state.values.length * (barWidth + 1)) / 2;
    state.values.forEach((value, index) => {
      context.fillStyle = state.done
        ? (index < ((90 - state.hold) / 90 * 30) ? bright : light)
        : (index === state.j || index === state.j + 1 ? white : (index >= state.values.length - state.i ? bright : dim));
      context.fillRect(startX + index * (barWidth + 1), height - 8 - value, barWidth, value);
    });
    context.fillStyle = light;
    context.fillRect(startX - 2, height - 8, state.values.length * (barWidth + 1) + 3, 1);
  }

  function drawNetwork(time) {
    drawBackground();
    const layers = [[20, 42, 64], [14, 30, 46, 62], [22, 42, 62], [42]];
    const xPositions = [30, 80, 130, 170];
    for (let layer = 0; layer < 3; layer += 1) {
      layers[layer].forEach((start) => layers[layer + 1].forEach((end) => {
        context.strokeStyle = 'rgba(73,52,96,.9)';
        context.beginPath();
        context.moveTo(xPositions[layer], start);
        context.lineTo(xPositions[layer + 1], end);
        context.stroke();
        const progress = ((time * 0.6 + ((start * end) % 7) / 7) % 1);
        context.fillStyle = light;
        context.fillRect(
          Math.round(xPositions[layer] + (xPositions[layer + 1] - xPositions[layer]) * progress) - 1,
          Math.round(start + (end - start) * progress) - 1,
          2,
          2,
        );
      }));
    }
    layers.forEach((layer, layerIndex) => layer.forEach((position, index) => {
      context.fillStyle = Math.sin(time * 3 + index + layerIndex) > 0.3 ? bright : dim;
      context.fillRect(xPositions[layerIndex] - 3, position - 3, 6, 6);
    }));
  }

  function drawCircuit(time) {
    drawBackground();
    if (!state.paths) {
      state.paths = [];
      for (let line = 0; line < 7; line += 1) {
        let x = 8;
        let y = 8 + line * 11;
        const points = [[x, y]];
        while (x < width - 10) {
          x += 8 + ((random() * 4) | 0) * 8;
          if (random() < 0.4) y = Math.max(6, Math.min(height - 6, y + (random() < 0.5 ? -8 : 8)));
          points.push([Math.min(x, width - 8), y]);
        }
        state.paths.push(points);
      }
    }
    state.paths.forEach((points, line) => {
      context.strokeStyle = dim;
      context.beginPath();
      points.forEach(([x, y], index) => index
        ? context.lineTo(x + 0.5, y + 0.5)
        : context.moveTo(x + 0.5, y + 0.5));
      context.stroke();
      points.forEach(([x, y]) => {
        context.fillStyle = dim;
        context.fillRect(x - 1, y - 1, 3, 3);
      });
      const segment = ((time * 2 + line * 0.37) % 1) * (points.length - 1);
      const segmentIndex = Math.floor(segment);
      const fraction = segment - segmentIndex;
      const start = points[segmentIndex];
      const end = points[segmentIndex + 1] || start;
      context.fillStyle = bright;
      context.fillRect(Math.round(start[0] + (end[0] - start[0]) * fraction) - 1, Math.round(start[1] + (end[1] - start[1]) * fraction) - 1, 3, 3);
    });
    context.fillStyle = light;
    context.fillRect(width - 14, height / 2 - 10, 8, 20);
  }

  function drawUi(time) {
    drawBackground();
    const count = Math.floor(time * 1.2) % 9;
    context.strokeStyle = light;
    context.strokeRect(40.5, 10.5, 112, 64);
    context.fillStyle = dim;
    context.fillRect(41, 11, 111, 8);
    const blocks = [[46, 24, 40, 6], [46, 34, 60, 4], [46, 42, 50, 4], [46, 54, 28, 10], [110, 24, 36, 30], [78, 54, 28, 10], [114, 58, 30, 6], [46, 68, 20, 2]];
    blocks.forEach(([x, y, blockWidth, blockHeight], index) => {
      if (index >= count) return;
      context.fillStyle = index === count - 1 ? white : (index % 3 ? light : bright);
      context.fillRect(x, y, blockWidth, blockHeight);
    });
    const cursorX = 46 + ((time * 40) % 100);
    const cursorY = 44 + Math.sin(time * 2) * 20;
    context.fillStyle = white;
    context.fillRect(cursorX | 0, cursorY | 0, 2, 4);
    context.fillRect((cursorX | 0) + 2, (cursorY | 0) + 2, 2, 2);
  }

  function drawBusiness(time) {
    drawBackground();
    const count = 12;
    const progress = (time * 0.25) % 1.3;
    context.fillStyle = light;
    context.fillRect(16, height - 10, width - 32, 1);
    let previous = null;
    for (let index = 0; index < count; index += 1) {
      const value = 10 + index * 4.5 + Math.sin(index * 1.7) * 6;
      const barHeight = Math.max(0, Math.min(1, progress * count - index)) * value;
      context.fillStyle = index === count - 1 ? bright : dim;
      context.fillRect(22 + index * 13, height - 10 - barHeight, 8, barHeight);
      const point = [26 + index * 13, height - 14 - value];
      if (barHeight >= value) {
        context.fillStyle = bright;
        context.fillRect(point[0] - 1, point[1] - 1, 3, 3);
        if (previous) {
          context.strokeStyle = light;
          context.beginPath();
          context.moveTo(previous[0] + 0.5, previous[1] + 0.5);
          context.lineTo(point[0] + 0.5, point[1] + 0.5);
          context.stroke();
        }
        previous = point;
      }
    }
  }

  function drawGeneral(time) {
    drawBackground();
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 10; x += 1) {
        const phase = Math.sin(time * 1.5 + x * 0.7 + y * 1.3);
        const tileX = 22 + x * 15;
        const tileY = 8 + y * 18;
        const size = Math.abs(phase) * 10;
        context.fillStyle = phase > 0 ? light : dim;
        context.fillRect(tileX + 5 - size / 2, tileY, size, 12);
        if (phase > 0.8) {
          context.fillStyle = background;
          context.fillRect(tileX + 3, tileY + 2, 4, 2);
          context.fillRect(tileX + 6, tileY + 4, 2, 2);
          context.fillRect(tileX + 4, tileY + 6, 2, 2);
          context.fillRect(tileX + 4, tileY + 9, 2, 2);
        }
      }
    }
  }

  function drawGaming(time) {
    drawBackground();
    const invader = ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'];
    const offset = Math.sin(time * 0.8) * 30;
    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        const originX = 40 + column * 24 + offset;
        const originY = 8 + row * 14;
        invader.forEach((line, y) => {
          for (let x = 0; x < 11; x += 1) {
            if (line[x] === '1') {
              context.fillStyle = row ? light : bright;
              context.fillRect(originX + x, originY + y, 1, 1);
            }
          }
        });
      }
    }
    const playerX = width / 2 + Math.sin(time * 1.3) * 60;
    context.fillStyle = white;
    context.fillRect(playerX - 5, height - 10, 11, 3);
    context.fillRect(playerX - 1, height - 13, 3, 3);
    for (let bullet = 0; bullet < 3; bullet += 1) {
      const bulletY = height - 14 - ((time * 60 + bullet * 25) % 60);
      context.fillStyle = bright;
      context.fillRect(playerX, bulletY, 1, 3);
    }
    context.fillStyle = dim;
    context.fillRect(0, height - 4, width, 1);
  }

  const draw = {
    cs: drawSorting,
    ai: drawNetwork,
    ee: drawCircuit,
    se: drawUi,
    biz: drawBusiness,
    gen: drawGeneral,
    gaming: drawGaming,
  }[category] || drawSorting;

  return (time) => draw(time);
}

export function PixelBanner({ category, reduceMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const draw = prepareBanner(canvas, category);
    if (reduceMotion) {
      draw(2.5);
      return undefined;
    }

    let visible = true;
    let previousTime = null;
    let elapsed = 0;
    let frame = 0;
    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
      })
      : null;
    observer?.observe(canvas);

    const animate = (time) => {
      if (previousTime === null) previousTime = time;
      const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
      previousTime = time;
      if (visible && !document.hidden) {
        elapsed += delta;
        draw(elapsed);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [category, reduceMotion]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
