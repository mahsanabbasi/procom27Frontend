/* =====================================================================
   XP + QUEST LOG — points for exploring. Saved on this device, shared
   across every PROCOM page. Award with quest('id', element).
   ===================================================================== */
import { createElement } from 'react';
import { burst } from './burst.js';
import { sfx } from './sfx.js';
import { toast } from './toast.js';
import { MOTION, pad } from './util.js';

const KEY = 'procom27-xp';
export const STEPS = [0, 60, 150, 280, 450, 660, 920, 1240, 1620, 2060, 2600];
export const QUESTS = [
  { id: 'boot', label: 'Power on the console', pts: 10 },
  { id: 'explore', label: 'Collect every power-up in the HP bar', pts: 60 },
  { id: 'start', label: 'Press START GAME', pts: 40 },
  { id: 'claw', label: 'Win a prize from the claw machine', pts: 60 },
  { id: 'cart', label: 'Swap a cartridge in the handheld', pts: 30 },
  { id: 'sched', label: 'Inspect a session on the schedule', pts: 25 },
  { id: 'plan', label: 'Star a session for your plan', pts: 40 },
  { id: 'cab', label: 'Start an arcade machine', pts: 40 },
  { id: 'shoot', label: 'Blast a target in Why Attend', pts: 40 },
  { id: 'brick', label: 'Clear the brick wall on Why Attend', pts: 50 },
  { id: 'lobby', label: 'Join the lobby on Why Attend', pts: 20 },
  { id: 'boss', label: 'Defeat the final boss on Why Attend', pts: 60 },
  { id: 'team', label: 'Pick a team on the Teams page', pts: 40 },
  { id: 'party', label: 'Climb to the top rank on the Teams page', pts: 25 },
  { id: 'over', label: 'Reach the GAME OVER screen', pts: 40 },
  { id: 'runner', label: 'Play Bit Runner in the footer', pts: 50 },
  { id: 'champ', label: 'Take the Bit Runner champion spot', pts: 100 },
  { id: 'coin', label: 'Insert a coin', pts: 10 },
  { id: 'konami', label: 'Enter the secret cheat code', pts: 150, secret: true },
];

let st = { xp: 0, got: {} };
try {
  const s = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (s && typeof s.xp === 'number' && s.got) st = s;
} catch {
  /* storage unavailable */
}

const listeners = new Set();
let hudBtn = null; // the XP button, origin for floating "+XP" labels
let munchItems = []; // power-ups the header muncher can eat ({ id })

export const lvl = (x) => {
  let l = 0;
  while (l < STEPS.length - 1 && x >= STEPS[l + 1]) l++;
  return l + 1;
};
export const frac = (x) => {
  const l = lvl(x) - 1;
  const a = STEPS[l];
  const b = STEPS[l + 1];
  return b ? Math.min(1, (x - a) / (b - a)) : 1;
};

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(st));
  } catch {
    /* storage unavailable */
  }
}

export const has = (id) => !!st.got[id];
export const secGot = () => munchItems.filter((it) => st.got['sec:' + it.id]).length;
export const munchCount = () => munchItems.length;

export function getState() {
  const level = lvl(st.xp);
  return {
    xp: st.xp,
    level,
    done: QUESTS.filter((q) => has(q.id)).length,
    total: QUESTS.length,
    next: STEPS[level] || null,
  };
}

function emit(bump) {
  listeners.forEach((fn) => fn({ ...getState(), bump }));
  document.dispatchEvent(new CustomEvent('procom:xp', { detail: getState() }));
}

export function subscribeXP(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function registerHud(el) {
  hudBtn = el;
}

export function setMunchItems(items) {
  munchItems = items;
  emit(false);
}

function float(pts, at) {
  let x;
  let y;
  const fromHud = () => {
    if (!hudBtn) return false;
    const r = hudBtn.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top;
    return true;
  };
  if (at && at.getBoundingClientRect) {
    const r = at.getBoundingClientRect();
    x = r.left + r.width / 2;
    y = r.top;
  } else if (!fromHud()) return;
  if ((y < 20 || y > window.innerHeight) && !fromHud()) return;
  const f = document.createElement('span');
  f.className = 'xpf';
  f.textContent = '+' + pts + ' XP';
  f.style.left = x + 'px';
  f.style.top = y + 'px';
  document.body.appendChild(f);
  if (MOTION && f.animate) {
    f.animate(
      [
        { transform: 'translate(-50%,0)', opacity: 0 },
        { transform: 'translate(-50%,-12px)', opacity: 1, offset: 0.2 },
        { transform: 'translate(-50%,-46px)', opacity: 0 },
      ],
      { duration: 1150, easing: 'steps(9)' },
    ).onfinish = () => f.remove();
  } else setTimeout(() => f.remove(), 1000);
}

export function award(id, pts, at) {
  if (!id || st.got[id]) return false;
  const before = lvl(st.xp);
  st = { xp: st.xp + pts, got: { ...st.got, [id]: 1 } };
  save();
  float(pts, at);
  emit(true);
  const after = lvl(st.xp);
  if (after > before) {
    setTimeout(() => {
      toast(createElement('span', null, 'Level up! You reached ', createElement('code', null, 'LV ' + pad(after))));
      if (hudBtn) {
        const r = hudBtn.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top, { n: 24, spread: 110 });
      }
      sfx.play('up');
    }, 450);
  } else sfx.play('xp');
  if (id.indexOf('sec:') === 0 && munchItems.length && secGot() === munchItems.length) {
    setTimeout(() => quest('explore'), 600);
  }
  return true;
}

export function quest(id, at) {
  const q = QUESTS.find((x) => x.id === id);
  return q ? award(id, q.pts, at) : false;
}

export function resetXP() {
  st = { xp: 0, got: {} };
  save();
  emit(true);
}
