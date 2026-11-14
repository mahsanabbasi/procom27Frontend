/* Team emblems: department frame + a unique mirrored pixel glyph (each team's "character") */
import { memo } from 'react';
import { hash, rng } from '../../utils/arcade/util.js';

const FRAMES = {
  ops: (
    <>
      <path d="M20 4H44L60 20V44L44 60H20L4 44V20Z" fill="#100C16" stroke="#DCC8FF" strokeWidth="2" />
      <path d="M22 9H42L55 22V42L42 55H22L9 42V22Z" stroke="#493460" strokeWidth="1.2" fill="none" />
    </>
  ),
  outreach: (
    <>
      <circle cx="32" cy="32" r="28" fill="#100C16" stroke="#DCC8FF" strokeWidth="2" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#493460" strokeWidth="1.2" strokeDasharray="3 3" />
    </>
  ),
  creative: (
    <>
      <path d="M32 2L62 32L32 62L2 32Z" fill="#100C16" stroke="#DCC8FF" strokeWidth="2" />
      <path d="M32 9L55 32L32 55L9 32Z" fill="none" stroke="#493460" strokeWidth="1.2" />
    </>
  ),
  tech: (
    <>
      <path d="M10 4H54L60 10V54L54 60H10L4 54V10Z" fill="#100C16" stroke="#DCC8FF" strokeWidth="2" />
      <path d="M4 22H0M4 32H0M4 42H0M60 22H64M60 32H64M60 42H64" stroke="#B57CFF" strokeWidth="2" />
    </>
  ),
  comp: (
    <>
      <path d="M32 3L58 12V33C58 47 46 56 32 61C18 56 6 47 6 33V12Z" fill="#100C16" stroke="#DCC8FF" strokeWidth="2" />
      <path d="M32 9L52 16V33C52 44 43 51 32 55C21 51 12 44 12 33V16Z" fill="none" stroke="#493460" strokeWidth="1.2" />
    </>
  ),
};

function glyph(seed, ox, oy, s) {
  const R = rng(seed);
  const out = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      let on = R() > (x === 2 ? 0.38 : 0.5);
      if (y === 2 && x === 2) on = true;
      if (on) {
        const col = R() > 0.7 ? '#B57CFF' : '#DCC8FF';
        out.push(<rect key={`${x}-${y}`} x={ox + x * s} y={oy + y * s} width={s} height={s} fill={col} />);
        if (x !== 2) out.push(<rect key={`${4 - x}-${y}`} x={ox + (4 - x) * s} y={oy + y * s} width={s} height={s} fill={col} />);
      }
    }
  }
  return out;
}

function Emblem({ team }) {
  return (
    <svg viewBox="-2 -2 68 68" fill="none" aria-hidden="true">
      {FRAMES[team.category] || FRAMES.ops}
      <g shapeRendering="crispEdges">{glyph(hash(team.name), 19.5, team.category === 'comp' ? 20 : 19.5, 5)}</g>
    </svg>
  );
}

export default memo(Emblem);
