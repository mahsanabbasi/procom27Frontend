/* Arcade sound effects (WebAudio). Off until the visitor turns them on. */
const BANK = {
  blip: [[880, 0.04]],
  press: [[520, 0.035]],
  xp: [[1046, 0.05], [1568, 0.08]],
  coin: [[988, 0.07], [1319, 0.32]],
  jump: [[392, 0.12, 'square', 784]],
  grab: [[220, 0.09, 'sawtooth'], [170, 0.12, 'sawtooth']],
  drop: [[700, 0.26, 'triangle', 110]],
  miss: [[220, 0.32, 'sawtooth', 80]],
  win: [[523, 0.08], [659, 0.08], [784, 0.08], [1046, 0.26]],
  up: [[523, 0.07], [784, 0.07], [1046, 0.07], [1568, 0.22]],
  over: [[392, 0.16], [330, 0.16], [262, 0.42]],
  start: [[262, 0.06], [392, 0.06], [523, 0.06], [784, 0.2]],
};

let on = false;
let ac = null;
try {
  on = localStorage.getItem('procom27-sfx') === '1';
} catch {
  /* storage unavailable */
}

function play(name) {
  if (!on) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ac = ac || new AC();
    if (ac.state === 'suspended') ac.resume();
    let t = ac.currentTime + 0.01;
    (BANK[name] || BANK.blip).forEach((n) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = n[2] || 'square';
      o.frequency.setValueAtTime(n[0], t);
      if (n[3]) o.frequency.exponentialRampToValueAtTime(n[3], t + n[1]);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t);
      o.stop(t + n[1] + 0.02);
      t += n[1] * 0.92;
    });
  } catch {
    /* audio unavailable */
  }
}

function set(v) {
  on = !!v;
  try {
    localStorage.setItem('procom27-sfx', on ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
  document.dispatchEvent(new CustomEvent('procom:sfx', { detail: on }));
  if (on) play('blip');
}

export const sfx = {
  play,
  set,
  toggle() {
    set(!on);
    return on;
  },
  get on() {
    return on;
  },
};
