import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { homeMoreCabinets } from '../../data/homeMore.js';

const W = 240;
const H = 520;
const T = 8;
const D = 320;
const F = 640;
const EYE = 150;
const VBW = 312;
const PROF = [[0, 40], [80, 40], [96, 70], [300, 58], [312, 58], [338, 0], [366, 0], [378, 26], [500, 26], [500, 32], [520, 32]];
const SCREEN = { x0: 24, x1: 216, y0: 112, y1: 292 };
const COLORS = ['#B57CFF', '#DCC8FF', '#4A3562'];

function project(cx, x, y, z) {
  const scale = F / (F + z);
  return [cx + (x - cx) * scale, EYE + (y - EYE) * scale];
}

function cabinetGeometry(cabinet) {
  const { id, marquee, sticks = [], buttons = [], starts = [], ball, side, label } = cabinet;
  const cx = cabinet.center;
  const sx = cx > W ? W : cx < 0 ? 0 : null;
  const zb = (y) => 80 + (y - 96) * (68 - 80) / (300 - 96);
  const ext = PROF.flatMap(([y, z]) => [project(cx, 0, y, z), project(cx, W, y, z)]);
  if (sx !== null) ext.push(project(cx, sx, 0, D), project(cx, sx, H, D));
  const minX = Math.min(...ext.map(([x]) => x));
  const maxX = Math.max(...ext.map(([x]) => x));
  const ox = (VBW - (maxX - minX)) / 2 - minX;
  const oy = 12 - project(cx, 0, 0, 40)[1];
  const vbh = Math.ceil(project(cx, 0, H, 32)[1] + oy + 20);
  const q = (x, y, z) => project(cx, x, y, z).map((v, i) => v + (i ? oy : ox));
  const scaleAt = (z) => F / (F + z);
  const f = (v) => Math.round(v * 10) / 10;
  const points = (list) => list.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
  const poly = (list, attrs = '') => `<polygon points="${points(list)}" ${attrs}/>`;
  const quad = (x0, x1, y0, z0, y1, z1) => [q(x0, y0, z0), q(x1, y0, z0), q(x1, y1, z1), q(x0, y1, z1)];
  const profile = (x) => PROF.map(([y, z]) => q(x, y, z));
  const rect = (x, y, width, height, z, attrs = '') => {
    const p = q(x, y, z);
    const s = scaleAt(z);
    return `<rect x="${f(p[0])}" y="${f(p[1])}" width="${f(width * s)}" height="${f(height * s)}" ${attrs}/>`;
  };
  const text = (x, y, z, size, value, attrs = '') => {
    const p = q(x, y, z);
    return `<text x="${f(p[0])}" y="${f(p[1])}" font-size="${f(size * scaleAt(z))}" ${attrs}>${value}</text>`;
  };
  const cp = (u, v) => q(u, 312 + 26 * v, 58 * (1 - v));
  const cpz = (v) => 58 * (1 - v);
  const cpQuad = (u0, u1, v0, v1) => [cp(u0, v0), cp(u1, v0), cp(u1, v1), cp(u0, v1)];
  const cpl = Math.sqrt(26 * 26 + 58 * 58);
  const fore = (u, v) => {
    const a = cp(u, v - 0.05);
    const b = cp(u, v + 0.05);
    const l = cp(u - cpl * 0.05, v);
    const r = cp(u + cpl * 0.05, v);
    return Math.abs(b[1] - a[1]) / Math.abs(r[0] - l[0]);
  };
  const uid = `home-cab-${id}`;
  let svg = `<defs>
    <linearGradient id="${uid}-lam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#110D17"/><stop offset=".55" stop-color="#1A1423"/><stop offset="1" stop-color="#0D0A12"/></linearGradient>
    <linearGradient id="${uid}-bez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E0B13"/><stop offset=".5" stop-color="#1A1422"/><stop offset="1" stop-color="#120E18"/></linearGradient>
    <linearGradient id="${uid}-side" x1="${sx === W ? 0 : 1}" y1="0" x2="${sx === W ? 1 : 0}" y2="0"><stop offset="0" stop-color="#2B2137"/><stop offset=".45" stop-color="#17111F"/><stop offset="1" stop-color="#0A080E"/></linearGradient>
    <linearGradient id="${uid}-mq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFE4FF"/><stop offset=".35" stop-color="#C79BFF"/><stop offset="1" stop-color="#7A4FB5"/></linearGradient>
    <linearGradient id="${uid}-cp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2439"/><stop offset="1" stop-color="#18121F"/></linearGradient>
    <linearGradient id="${uid}-cpf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E1727"/><stop offset="1" stop-color="#0D0A12"/></linearGradient>
    <linearGradient id="${uid}-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B57CFF" stop-opacity=".35"/><stop offset="1" stop-color="#B57CFF" stop-opacity="0"/></linearGradient>
    <linearGradient id="${uid}-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6B6178"/><stop offset=".3" stop-color="#352D40"/><stop offset=".55" stop-color="#4C4258"/><stop offset="1" stop-color="#1B1622"/></linearGradient>
    <linearGradient id="${uid}-shaft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A3245"/><stop offset=".45" stop-color="#A198A8"/><stop offset="1" stop-color="#2A2333"/></linearGradient>
    <linearGradient id="${uid}-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F5F0FA" stop-opacity="0"/><stop offset=".5" stop-color="#F5F0FA" stop-opacity=".55"/><stop offset="1" stop-color="#F5F0FA" stop-opacity="0"/></linearGradient>
    <radialGradient id="${uid}-ball" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#F5F0FA"/><stop offset=".22" stop-color="#DCC8FF"/><stop offset=".68" stop-color="#B57CFF"/><stop offset="1" stop-color="#3A2852"/></radialGradient>
    <radialGradient id="${uid}-tb" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#F5F0FA" stop-opacity=".95"/><stop offset=".3" stop-color="#DCC8FF" stop-opacity=".85"/><stop offset="1" stop-color="#6E47A3" stop-opacity=".9"/></radialGradient>
    <pattern id="${uid}-px" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#07060B" fill-opacity=".1"/></pattern>
    <filter id="${uid}-b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="${uid}-b10" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10"/></filter>
    <clipPath id="${uid}-mqc">${rect(10, 8, W - 20, 64, 40)}</clipPath>
    ${sx !== null ? `<clipPath id="${uid}-sc">${poly(profile(sx).concat([q(sx, H, D), q(sx, 0, D)]))}</clipPath>` : ''}
  </defs>`;

  let p = q(W / 2, 0, 40);
  svg += `<ellipse cx="${f(p[0])}" cy="${f(p[1] + 30)}" rx="120" ry="44" fill="#B57CFF" opacity=".22" filter="url(#${uid}-b10)"/>`;
  p = q(W / 2, H, 32);
  svg += `<ellipse cx="${f(p[0] + (sx === W ? 16 : sx === 0 ? -16 : 0))}" cy="${f(p[1] - 2)}" rx="150" ry="11" fill="#000" opacity=".75" filter="url(#${uid}-b3)"/><ellipse cx="${f(p[0])}" cy="${f(p[1] + 6)}" rx="110" ry="8" fill="#B57CFF" opacity=".14" filter="url(#${uid}-b10)"/>`;
  svg += poly(profile(0).concat(profile(W).reverse()), 'fill="#040307"');
  const inner = PROF.slice(1, 5);
  if (cx > T) svg += poly(inner.map(([y, z]) => q(T, y, z)).concat(inner.slice().reverse().map(([y, z]) => q(T, y, z + 40))), 'fill="#1A1422"');
  if (cx < W - T) svg += poly(inner.map(([y, z]) => q(W - T, y, z)).concat(inner.slice().reverse().map(([y, z]) => q(W - T, y, z + 40))), 'fill="#1A1422"');
  svg += poly(quad(T, W - T, 80, 40, 96, zb(96)), 'fill="#0B0910"');
  let p2 = q(T + 6, 84, 48);
  let p3 = q(W - T - 6, 84, 48);
  svg += `<line x1="${f(p2[0])}" y1="${f(p2[1])}" x2="${f(p3[0])}" y2="${f(p3[1])}" stroke="#DCC8FF" stroke-width="1.4" opacity=".55" filter="url(#${uid}-b3)"/>`;
  svg += poly(quad(T, W - T, 96, zb(96), 300, zb(300)), `fill="url(#${uid}-bez)"`);
  const holes = [];
  [[30, 92], [W - 92, W - 30]].forEach(([from, to]) => {
    for (let x = from; x <= to; x += 5) for (let y = 100; y <= 106; y += 5) {
      const hp = q(x, y, zb(y));
      holes.push(`<circle cx="${f(hp[0])}" cy="${f(hp[1])}" r="${f(1.25 * scaleAt(zb(y)))}"/>`);
    }
  });
  svg += `<g fill="#040307">${holes.join('')}</g>`;
  svg += text(W / 2, 106, zb(106), 5.5, 'PROCOM', 'text-anchor="middle" font-family="Press Start 2P, monospace" fill="#493460" letter-spacing=".6"');
  svg += poly(quad(SCREEN.x0 - 8, SCREEN.x1 + 8, SCREEN.y0 - 8, zb(SCREEN.y0 - 8), SCREEN.y1 + 8, zb(SCREEN.y1 + 8)), 'fill="none" stroke="#493460" stroke-width=".9"');
  svg += poly(quad(SCREEN.x0 - 11, SCREEN.x1 + 11, SCREEN.y0 - 11, zb(SCREEN.y0 - 11), SCREEN.y1 + 11, zb(SCREEN.y1 + 11)), 'fill="none" stroke="#B57CFF" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 3"');
  svg += poly(quad(SCREEN.x0 - 4, SCREEN.x1 + 4, SCREEN.y0 - 4, zb(SCREEN.y0 - 4), SCREEN.y1 + 4, zb(SCREEN.y1 + 4)), `class="cab-glow" fill="#B57CFF" opacity=".42" filter="url(#${uid}-b10)"`);
  svg += poly(quad(SCREEN.x0 - 3, SCREEN.x1 + 3, SCREEN.y0 - 3, zb(SCREEN.y0 - 3), SCREEN.y1 + 3, zb(SCREEN.y1 + 3)), 'fill="#030205"');
  svg += text(W / 2, 298, zb(298), 4.2, 'INSERT COIN · PRESS START', 'text-anchor="middle" font-family="Press Start 2P, monospace" fill="#A198A8" fill-opacity=".55" letter-spacing=".4"');
  svg += poly(quad(T, W - T, 300, zb(300), 312, 58), 'fill="#2A2134"');

  svg += poly(quad(0, W, 378, 26, 500, 26), `fill="url(#${uid}-lam)"`);
  svg += poly(quad(W * 0.64, W * 0.72, 378, 26, 500, 26), 'fill="#F5F0FA" fill-opacity=".025"');
  svg += rect(72, 392, 96, 96, 26, `rx="2" fill="url(#${uid}-metal)" stroke="#07060B" stroke-width="1.2"`);
  svg += rect(76, 396, 88, 88, 26, 'rx="1.5" fill="none" stroke="#F5F0FA" stroke-opacity=".12" stroke-width=".6"');
  [86, 128].forEach((mx, i) => {
    svg += `<g class="cab-coin" data-coin="${i}">${rect(mx - 2, 400, 30, 52, 26, 'fill="#000" fill-opacity="0"')}${rect(mx, 402, 26, 11, 26, 'class="cab-plate" fill="#B57CFF" stroke="#07060B" stroke-width=".8"')}${text(mx + 13, 409.6, 26, 4, '1 CREDIT', 'text-anchor="middle" font-family="Press Start 2P, monospace" fill="#07060B" pointer-events="none"')}${rect(mx + 5, 417, 16, 24, 26, 'fill="#0B0910" stroke="#4C4258" stroke-width=".8"')}${rect(mx + 12, 421, 2.2, 16, 26, 'class="cab-slit" fill="#DCC8FF"')}${rect(mx + 7, 445, 12, 6, 26, 'fill="#2A2333" stroke="#07060B" stroke-width=".6"')}</g>`;
  });
  p = q(120, 468, 26);
  svg += `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(4.4 * scaleAt(26))}" fill="url(#${uid}-metal)" stroke="#07060B" stroke-width=".8"/>${rect(119.4, 466, 1.2, 4, 26, 'fill="#07060B"')}`;
  svg += text(120, 482, 26, 3.6, 'INSERT COIN', 'text-anchor="middle" font-family="Press Start 2P, monospace" fill="#F5F0FA" fill-opacity=".35"');
  svg += poly(quad(T, W - T, 500, 32, 520, 32), 'fill="#050409"');
  for (let x = 56; x < W - 56; x += 14) svg += rect(x, 506, 8, 1.5, 32, 'fill="#1A1422"');

  svg += poly(cpQuad(0, W, 0, 1), `fill="url(#${uid}-cp)"`);
  svg += poly(cpQuad(0, W, 0, 0.55), `fill="url(#${uid}-spill)"`);
  svg += poly(cpQuad(0, W, 0.8, 0.87), 'fill="#B57CFF" fill-opacity=".45"');
  svg += poly(cpQuad(0, W, 0.9, 0.93), 'fill="#DCC8FF" fill-opacity=".3"');
  const controls = [
    ...starts.map(([u, v, text]) => ({ u, v, kind: 'start', text })),
    ...sticks.map(([u, v]) => ({ u, v, kind: 'stick' })),
    ...buttons.map(([u, v, color]) => ({ u, v, kind: 'button', color })),
    ...(ball ? [{ u: ball[0], v: ball[1], kind: 'ball' }] : []),
  ].sort((a, b) => a.v - b.v);
  controls.forEach((item) => {
    const pos = cp(item.u, item.v);
    const s = scaleAt(cpz(item.v));
    const ratio = fore(item.u, item.v);
    const [x, y] = pos.map(f);
    if (item.kind === 'button' || item.kind === 'start') {
      const radius = (item.kind === 'start' ? 4.4 : 7.6) * s;
      const height = (item.kind === 'start' ? 2 : 3.3) * s;
      const color = item.kind === 'start' ? '#DCC8FF' : COLORS[item.color];
      svg += `<g class="cab-pb${item.kind === 'start' ? ' cab-st' : ''}"><ellipse cx="${x}" cy="${y}" rx="${f(radius * 1.36)}" ry="${f(radius * 1.36 * ratio)}" fill="#07060B" stroke="#F5F0FA" stroke-opacity=".14" stroke-width=".7"/><g class="cab-cap"><path d="M${f(x - radius)} ${f(y - height)}V${y}A${f(radius)} ${f(radius * ratio)} 0 0 0 ${f(x + radius)} ${y}V${f(y - height)}Z" fill="${color}"/><path d="M${f(x - radius)} ${f(y - height)}V${y}A${f(radius)} ${f(radius * ratio)} 0 0 0 ${f(x + radius)} ${y}V${f(y - height)}Z" fill="#07060B" fill-opacity=".45"/><ellipse ${item.kind === 'start' ? 'class="cab-sl" ' : ''}cx="${x}" cy="${f(y - height)}" rx="${f(radius)}" ry="${f(radius * ratio)}" fill="${color}"/><ellipse cx="${x}" cy="${f(y - height + radius * ratio * 0.12)}" rx="${f(radius * 0.7)}" ry="${f(radius * 0.7 * ratio)}" fill="#07060B" fill-opacity=".2"/><ellipse cx="${f(x - radius * 0.3)}" cy="${f(y - height - radius * ratio * 0.45)}" rx="${f(radius * 0.34)}" ry="${f(radius * 0.16)}" fill="#F5F0FA" fill-opacity=".6"/></g></g>`;
      if (item.kind === 'start') {
        const label = cp(item.u, item.v + 0.2);
        svg += `<text x="${f(label[0])}" y="${f(label[1] + 2)}" font-size="${f(3.6 * s)}" text-anchor="middle" font-family="Press Start 2P, monospace" fill="#A198A8">${item.text}</text>`;
      }
    } else if (item.kind === 'stick') {
      const radius = 9.6 * s;
      const length = 27 * s;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${f(radius * 1.45)}" ry="${f(radius * 1.45 * ratio)}" fill="#07060B" stroke="#4C4258" stroke-width=".7"/><g class="cab-stick" style="transform-origin:${x}px ${y}px"><ellipse cx="${x}" cy="${f(y - 1.5 * s)}" rx="${f(radius * 0.85)}" ry="${f(radius * 0.85 * ratio)}" fill="#1A1422"/><rect x="${f(x - 1.8 * s)}" y="${f(y - length)}" width="${f(3.6 * s)}" height="${f(length)}" fill="url(#${uid}-shaft)"/><circle cx="${x}" cy="${f(y - length - radius * 0.55)}" r="${f(radius)}" fill="url(#${uid}-ball)"/><ellipse cx="${f(x - radius * 0.32)}" cy="${f(y - length - radius)}" rx="${f(radius * 0.32)}" ry="${f(radius * 0.2)}" fill="#F5F0FA" fill-opacity=".75"/></g>`;
    } else {
      const radius = 16 * s;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${f(radius * 1.38)}" ry="${f(radius * 1.38 * ratio)}" fill="url(#${uid}-metal)" stroke="#07060B" stroke-width=".8"/><ellipse cx="${x}" cy="${y}" rx="${f(radius * 1.08)}" ry="${f(radius * 1.08 * ratio)}" fill="#040307"/><ellipse class="cab-glow" cx="${x}" cy="${f(y - 2 * s)}" rx="${f(radius * 1.1)}" ry="${f(radius * 0.9)}" fill="#B57CFF" opacity=".45" filter="url(#${uid}-b3)"/><g class="cab-pb"><g class="cab-cap"><ellipse cx="${x}" cy="${f(y - radius * 0.42)}" rx="${f(radius)}" ry="${f(radius * 0.86)}" fill="url(#${uid}-tb)"/><ellipse cx="${f(x - radius * 0.32)}" cy="${f(y - radius * 0.85)}" rx="${f(radius * 0.3)}" ry="${f(radius * 0.17)}" fill="#F5F0FA" fill-opacity=".8"/></g></g>`;
    }
  });
  svg += poly(quad(0, W, 338, 0, 366, 0), `fill="url(#${uid}-cpf)"`);
  svg += rect(4, 339, W - 8, 1.6, 0, 'class="cab-led" fill="#B57CFF"');
  svg += rect(4, 339, W - 8, 1.6, 0, `class="cab-led" fill="#B57CFF" filter="url(#${uid}-b3)"`);
  svg += text(W / 2, 356, 0, 5.2, label, 'text-anchor="middle" font-family="Press Start 2P, monospace" fill="#DCC8FF" fill-opacity=".6" letter-spacing=".5"');

  svg += poly(quad(0, W, 0, 40, 80, 40), 'fill="#0B0910"');
  const lines = marquee.split('|');
  const fontSize = Math.min(lines.length > 1 ? 15 : 18, 188 / Math.max(...lines.map((line) => line.length)));
  svg += `<g class="cab-mq-light">${rect(10, 8, W - 20, 64, 40, `fill="url(#${uid}-mq)"`)}${rect(10, 8, W - 20, 64, 40, `fill="url(#${uid}-px)"`)}<g clip-path="url(#${uid}-mqc)">`;
  for (let i = 0; i < 7; i += 1) svg += rect(14 + i * 32, 8, 14, 64, 40, 'fill="#F5F0FA" fill-opacity=".07" transform="skewX(-20)"');
  svg += `${rect(10, 8, 40, 64, 40, `class="cab-sweep" fill="url(#${uid}-sweep)"`)}</g>`;
  lines.forEach((line, i) => {
    const y = 40 + (i - (lines.length - 1) / 2) * fontSize * 1.35 + fontSize * 0.38;
    const pos = q(W / 2, y, 40);
    const size = f(fontSize * scaleAt(40));
    svg += `<text x="${f(pos[0] + 1.6)}" y="${f(pos[1] + 1.6)}" font-size="${size}" text-anchor="middle" font-family="Press Start 2P, monospace" letter-spacing=".5" fill="#2A1A40">${line}</text><text x="${f(pos[0])}" y="${f(pos[1])}" font-size="${size}" text-anchor="middle" font-family="Press Start 2P, monospace" letter-spacing=".5" fill="#F5F0FA" stroke="#2A1A40" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round">${line}</text>`;
  });
  svg += `</g>${rect(10, 8, W - 20, 64, 40, 'fill="none" stroke="#07060B" stroke-width="1.5"')}`;

  if (sx !== null) {
    const sideShape = profile(sx).concat([q(sx, H, D), q(sx, 0, D)]);
    svg += poly(sideShape, `fill="url(#${uid}-side)"`);
    const sidePoly = (list, attrs) => poly(list.map(([y, z]) => q(sx, y, z)), attrs);
    let art = '';
    if (side === 'bands') {
      art += sidePoly([[430, 0, 0], [120, D, 0], [175, D, 0], [485, 0, 0]], 'fill="#B57CFF" fill-opacity=".55"');
      art += sidePoly([[500, 0, 0], [195, D, 0], [215, D, 0], [520, 0, 0]], 'fill="#DCC8FF" fill-opacity=".35"');
      art += sidePoly([[110, 0, 0], [0, 140, 0], [0, 190, 0], [150, 0, 0]], 'fill="#493460" fill-opacity=".9"');
    } else {
      [[150, 90, 46, 70], [250, 150, 40, 90], [360, 70, 52, 80], [60, 200, 34, 70]].forEach(([x, y, width, height], i) => {
        const opacityColor = i % 2 ? 'fill="#DCC8FF" fill-opacity=".35"' : 'fill="#B57CFF" fill-opacity=".55"';
        art += sidePoly([[x, y, 0], [x, y + height, 0], [x + width, y + height, 0], [x + width, y, 0]], opacityColor);
        art += sidePoly([[x + width, y + 12, 0], [x + width + 14, y + 8, 0], [x + width, y + 26, 0]], opacityColor);
      });
    }
    svg += `<g clip-path="url(#${uid}-sc)">${art}</g><polyline points="${points([q(sx, 0, 40), q(sx, 0, D)])}" fill="none" stroke="#F5F0FA" stroke-opacity=".18" stroke-width=".8"/>`;
  }
  const tmL = profile(0).concat(profile(T).reverse());
  const tmR = profile(W - T).concat(profile(W).reverse());
  svg += `<g class="cab-tm-glow" filter="url(#${uid}-b3)" opacity=".85">${poly(tmL, 'fill="#B57CFF"')}${poly(tmR, 'fill="#B57CFF"')}</g>${poly(tmL, 'fill="#B57CFF"')}${poly(tmR, 'fill="#B57CFF"')}<polyline points="${points(profile(sx === 0 ? 0 : W))}" fill="none" stroke="#F5F0FA" stroke-opacity=".5" stroke-width=".7"/>`;

  const screenQuad = [
    q(SCREEN.x0, SCREEN.y0, zb(SCREEN.y0)),
    q(SCREEN.x1, SCREEN.y0, zb(SCREEN.y0)),
    q(SCREEN.x1, SCREEN.y1, zb(SCREEN.y1)),
    q(SCREEN.x0, SCREEN.y1, zb(SCREEN.y1)),
  ];
  return { svg, viewBoxHeight: vbh, screenTransform: quadMatrix(192, 180, screenQuad) };
}

function quadMatrix(width, height, q) {
  const [x0, y0] = q[0];
  const [x1, y1] = q[1];
  const [x2, y2] = q[2];
  const [x3, y3] = q[3];
  const dx1 = x1 - x2; const dx2 = x3 - x2; const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2; const dy2 = y3 - y2; const dy3 = y0 - y1 + y2 - y3;
  let g = 0; let h = 0;
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const denominator = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / denominator;
    h = (dx1 * dy3 - dx3 * dy1) / denominator;
  }
  const a = x1 - x0 + g * x1; const b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1; const e = y3 - y0 + h * y3;
  const values = [a / width, d / width, 0, g / width, b / height, e / height, 0, h / height, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${values.map((value) => Number(value.toFixed(7))).join(',')})`;
}

function CabinetArtwork({ id }) {
  if (id === 'a') {
    return (
      <svg viewBox="0 0 320 280" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <rect width="320" height="280" fill="#0B0910" />
        <path d="M24 24H296V256H24Z" stroke="#493460" />
        <g fill="#100C16" stroke="#493460">
          <rect x="44" y="44" width="44" height="26" /><rect x="100" y="44" width="44" height="26" />
          <rect x="156" y="44" width="44" height="26" /><rect x="212" y="44" width="44" height="26" />
          <rect x="44" y="150" width="44" height="26" /><rect x="100" y="150" width="44" height="26" /><rect x="212" y="150" width="44" height="26" />
        </g>
        <rect className="cab-blink" x="156" y="44" width="44" height="26" fill="#B57CFF" />
        <rect className="cab-blink2" x="156" y="150" width="44" height="26" fill="#B57CFF" />
        <path d="M34 112H290" stroke="#493460" strokeDasharray="4 6" />
        <g className="cab-walk" fill="#DCC8FF"><rect x="40" y="102" width="12" height="12" /><rect x="43" y="96" width="6" height="6" /></g>
      </svg>
    );
  }
  if (id === 'b') {
    return (
      <svg viewBox="0 0 320 280" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <rect width="320" height="280" fill="#0B0910" /><path d="M24 240H296" stroke="#493460" />
        <g className="cab-rocket">
          <rect x="190" y="150" width="64" height="12" fill="#DCC8FF" /><rect x="198" y="142" width="48" height="8" fill="#DCC8FF" />
          <rect x="206" y="146" width="4" height="4" fill="#0B0910" /><rect x="222" y="144" width="4" height="4" fill="#0B0910" /><rect x="236" y="146" width="4" height="4" fill="#0B0910" />
          <rect x="186" y="164" width="72" height="6" fill="#B57CFF" /><rect x="188" y="172" width="68" height="10" fill="#493460" /><rect x="186" y="184" width="72" height="6" fill="#B57CFF" /><rect x="190" y="192" width="64" height="12" fill="#DCC8FF" />
        </g>
        <g><rect x="270" y="132" width="34" height="8" fill="#B57CFF" /><path d="M272 140H302L296 204H278Z" fill="#DCC8FF" /><rect x="278" y="160" width="18" height="6" fill="#493460" /><rect x="290" y="104" width="4" height="30" fill="#B57CFF" /><rect x="290" y="104" width="14" height="4" fill="#B57CFF" /></g>
        <g fill="#493460"><rect className="cab-bar" style={{ '--n': 0 }} x="204" y="120" width="4" height="10" /><rect className="cab-bar" style={{ '--n': 1 }} x="220" y="112" width="4" height="14" /><rect className="cab-bar" style={{ '--n': 2 }} x="236" y="120" width="4" height="10" /></g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 280" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <rect width="320" height="280" fill="#0B0910" /><path d="M24 236H296" stroke="#493460" />
      <g fill="#493460"><rect x="52" y="200" width="56" height="36" /><rect x="132" y="200" width="56" height="36" /><rect x="212" y="200" width="56" height="36" /></g>
      <g fill="#DCC8FF"><rect x="72" y="176" width="16" height="16" /><rect x="152" y="176" width="16" height="16" /><rect x="232" y="176" width="16" height="16" /></g>
      <g className="cab-bub" style={{ '--n': 0 }}><rect x="40" y="96" width="96" height="46" stroke="#DCC8FF" strokeWidth="2" /><path d="M70 142v16l16-16" fill="#DCC8FF" /><g fill="#DCC8FF"><rect x="56" y="114" width="10" height="10" /><rect x="74" y="114" width="10" height="10" /><rect x="92" y="114" width="10" height="10" /></g></g>
      <g className="cab-bub" style={{ '--n': 1 }}><rect x="120" y="60" width="104" height="50" fill="#B57CFF" /><path d="M164 110v16l14-16" fill="#B57CFF" /><rect x="134" y="76" width="70" height="6" fill="#0B0910" /><rect x="134" y="90" width="46" height="6" fill="#0B0910" /></g>
      <g className="cab-bub" style={{ '--n': 2 }}><rect x="186" y="104" width="96" height="44" stroke="#DCC8FF" strokeWidth="2" /><path d="M244 148v16l-16-16" fill="#DCC8FF" /><rect x="200" y="120" width="60" height="6" fill="#DCC8FF" /></g>
    </svg>
  );
}

function Cabinet({ cabinet, index, active, dx, wrapped, onSideClick, playSound, scheduleTimeout, navigate }) {
  const stageRef = useRef(null);
  const planeRef = useRef(null);
  const busyRef = useRef(false);
  const geometry = cabinetGeometry(cabinet);
  const [credits, setCredits] = useState(0);
  const [starting, setStarting] = useState(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const plane = planeRef.current;
    if (!stage || !plane) return undefined;
    const fit = () => {
      const scale = stage.clientWidth / VBW;
      plane.style.setProperty('--k', scale.toFixed(4));
    };
    fit();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', fit);
      return () => window.removeEventListener('resize', fit);
    }
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const start = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    playSound('start');
    stageRef.current?.closest('.cab')?.querySelectorAll('.cab-st').forEach((button) => {
      button.classList.add('is-press');
      scheduleTimeout(() => button.classList.remove('is-press'), 180);
    });
    setStarting(true);
    scheduleTimeout(() => {
      setStarting(false);
      busyRef.current = false;
      setCredits((count) => {
        const remaining = count > 0 ? count - 1 : 0;
        if (remaining === 0) {
          const insertion = stageRef.current?.querySelector('.cab__ins');
          if (insertion) insertion.textContent = 'Insert coin';
        }
        return remaining;
      });
      navigate(cabinet.route);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500);
  }, [cabinet.route, navigate, playSound, scheduleTimeout]);

  const handleClick = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const coin = target.closest('.cab-coin');
    if (coin) {
      setCredits((count) => Math.min(99, count + 1));
      const insertion = stageRef.current?.querySelector('.cab__ins');
      if (insertion) insertion.textContent = 'Press start';
      playSound('coin');
      coin.classList.add('is-hit');
      scheduleTimeout(() => coin.classList.remove('is-hit'), 260);
      return;
    }
    const control = target.closest('.cab-pb');
    if (control) {
      control.classList.add('is-press');
      scheduleTimeout(() => control.classList.remove('is-press'), 160);
      start();
      return;
    }
    if (target.closest('.cab__start')) start();
  };

  return (
    <article
      className={`cab is-built${active ? ' is-c' : ' is-side'}${wrapped ? ' is-wrap' : ''}${starting ? ' is-starting' : ''}`}
      data-cab={cabinet.id}
      data-route={cabinet.route}
      data-mq={cabinet.marquee}
      data-reveal
      aria-current={active ? 'true' : 'false'}
      style={{ '--dx': dx }}
      onClickCapture={(event) => onSideClick(event, index)}
      onClick={handleClick}
    >
      <div className="cab__stage" ref={stageRef} style={{ aspectRatio: `${VBW} / ${geometry.viewBoxHeight}` }}>
        <svg className="cab__body" viewBox={`0 0 ${VBW} ${geometry.viewBoxHeight}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: geometry.svg }} />
        <div className="cab__plane" ref={planeRef}>
          <div className="cab__scr" style={{ transform: geometry.screenTransform }}>
            <span className="cab__art" aria-hidden="true"><CabinetArtwork id={cabinet.id} /></span>
            <div className="cab__hud" aria-hidden="true"><span>1UP 00000</span><span>HI 27027</span></div>
            <div className="cab__ui">
              <h3>{cabinet.title}</h3>
              <p className="cab__tag">{cabinet.tag}<span className="sr-only">{cabinet.description}</span></p>
              <button className="cab__start" type="button" aria-label={cabinet.startLabel}><i className="i i-play" aria-hidden="true" />Start game</button>
            </div>
            <div className="cab__cred" aria-hidden="true"><span>Credit <b>{String(credits).padStart(2, '0')}</b></span><span className="cab__ins">{credits ? 'Press start' : 'Insert coin'}</span></div>
            <div className="cab__p1" aria-hidden="true"><b>Player 1</b><span>Loading<br />{cabinet.loading}</span><i /></div>
            <span className="cab__crt" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MoreAtProcomSection() {
  const arcadeRef = useRef(null);
  const timersRef = useRef(new Set());
  const audioRef = useRef({ context: null, nodes: new Set() });
  const orderRef = useRef([0, 1, 2]);
  const holdRef = useRef(false);
  const seenRef = useRef(false);
  const untilRef = useRef(0);
  const [order, setOrder] = useState([0, 1, 2]);
  const [wrapIndex, setWrapIndex] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const [, navigate] = useLocation();

  const scheduleTimeout = useCallback((callback, delay) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const playSound = useCallback((name) => {
    const referenceSound = window.PROCOM?.kit?.sfx;
    if (typeof referenceSound?.play === 'function') {
      referenceSound.play(name);
      return;
    }
    const audio = audioRef.current;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audio.context || audio.context.state === 'closed') audio.context = new AudioContextClass();
    const context = audio.context;
    if (context.state === 'suspended') context.resume();
    const notes = {
      start: [[220, 0], [330, 0.08], [440, 0.16]],
      coin: [[880, 0], [1320, 0.06]],
      blip: [[440, 0]],
    }[name];
    if (!notes) return;
    notes.forEach(([frequency, offset]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = context.currentTime + offset;
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.08, at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => {
        audio.nodes.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      audio.nodes.add(oscillator);
      oscillator.start(at);
      oscillator.stop(at + 0.1);
    });
  }, []);

  const applyOrder = useCallback((nextOrder, wrappedIndex) => {
    orderRef.current = nextOrder;
    setOrder(nextOrder);
    setWrapIndex(wrappedIndex);
    if (wrappedIndex >= 0) {
      scheduleTimeout(() => setWrapIndex(-1), 650);
    }
  }, [scheduleTimeout]);

  const step = useCallback((direction) => {
    const nextOrder = [...orderRef.current];
    const wrapped = direction > 0 ? nextOrder[2] : nextOrder[0];
    if (direction > 0) nextOrder.unshift(nextOrder.pop());
    else nextOrder.push(nextOrder.shift());
    applyOrder(nextOrder, wrapped);
  }, [applyOrder]);

  const handleNavigation = (direction) => {
    step(direction);
    untilRef.current = Date.now() + 5000;
    playSound('blip');
  };

  const handleSideClick = (event, index) => {
    const slot = orderRef.current.indexOf(index);
    if (slot === 1) return;
    event.preventDefault();
    event.stopPropagation();
    step(slot === 0 ? 1 : -1);
    untilRef.current = Date.now() + 5000;
    playSound('blip');
  };

  const handlePause = () => {
    const nextPaused = !paused;
    holdRef.current = nextPaused;
    setPaused(nextPaused);
  };

  const handlePointerEnter = (event) => {
    if (event.pointerType === 'mouse') holdRef.current = true;
  };

  const handlePointerLeave = () => {
    holdRef.current = false;
    untilRef.current = Date.now() + 600;
  };

  const handleFocus = () => { holdRef.current = true; };
  const handleBlur = () => { holdRef.current = false; };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(media.matches);
    media.addEventListener('change', updateMotion);
    return () => media.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    const arcade = arcadeRef.current;
    if (!arcade) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      seenRef.current = true;
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => { seenRef.current = entry.isIntersecting; }, { threshold: 0.35 });
    observer.observe(arcade);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const interval = window.setInterval(() => {
      if (holdRef.current || Date.now() < untilRef.current || document.hidden || !seenRef.current) return;
      step(1);
    }, 1600);
    return () => window.clearInterval(interval);
  }, [reducedMotion, step]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    const audio = audioRef.current;
    audio.nodes.forEach((node) => node.stop());
    audio.nodes.clear();
    if (audio.context && audio.context.state !== 'closed') audio.context.close();
    audio.context = null;
  }, []);

  return (
    <section className="section section--alt" id="more" aria-labelledby="more-title" data-munch="signal" data-munch-label="More at PROCOM">
      <div className="container">
        <header className="sh" data-reveal>
          <div>
            <p className="sh__label t-label"><i className="i i-square" aria-hidden="true" />05 / More at PROCOM</p>
            <h2 className="sh__title t-d2" id="more-title">More at <span className="t-soft">PROCOM</span></h2>
          </div>
          <p className="sh__desc t-body-lg">Discover what’s happening beyond the competitions. Pick a machine and press start.</p>
        </header>
        <div
          className="arcade is-car"
          data-stagger
          ref={arcadeRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocusCapture={handleFocus}
          onBlurCapture={handleBlur}
        >
          {homeMoreCabinets.map((cabinet, index) => {
            const slot = order.indexOf(index);
            return (
              <Cabinet
                key={cabinet.id}
                cabinet={cabinet}
                index={index}
                active={slot === 1}
                dx={slot - index}
                wrapped={wrapIndex === index}
                onSideClick={handleSideClick}
                playSound={playSound}
                scheduleTimeout={scheduleTimeout}
                navigate={(route) => {
                  const referenceRouter = window.PROCOM?.kit?.goRoute;
                  if (typeof referenceRouter === 'function') {
                    referenceRouter(route);
                    return;
                  }
                  const destinations = { jobOrbit: '/job-orbit', foodfest: '/foodfest', panels: '/panel-discussions' };
                  navigate(destinations[route] || '/');
                }}
              />
            );
          })}
        </div>
        <div className="arc__nav">
          <button className="arc__b" type="button" data-d="-1" aria-label="Previous machine" onClick={() => handleNavigation(-1)}><i className="i i-chevron-left" aria-hidden="true" /></button>
          <span className="arc__dots" aria-hidden="true">{homeMoreCabinets.map((cabinet, index) => <i key={cabinet.id} className={order[1] === index ? 'on' : ''} />)}</span>
          <button className="arc__b arc__pp" type="button" aria-pressed={paused} aria-label={paused ? 'Play the machines' : 'Pause the machines'} onClick={handlePause}><i className={`i ${paused ? 'i-play' : 'i-minus'}`} aria-hidden="true" /><span>{paused ? 'Play' : 'Pause'}</span></button>
          <button className="arc__b" type="button" data-d="1" aria-label="Next machine" onClick={() => handleNavigation(1)}><i className="i i-chevron-right" aria-hidden="true" /></button>
        </div>
      </div>
    </section>
  );
}
