/* Departments — one animated pixel scene per department (240×150 viewBox) */
const L = '#B57CFF';
const B = '#DCC8FF';
const W = '#F5F0FA';
const DIM = '#493460';
const CARD = '#100C16';
const BG = '#0B0910';

/* Operations — mission control: a supply cart runs the route past logistics, security and food checkpoints */
function Ops() {
  return (
    <>
      <path d="M22 118H70V78H124V112H170V70" stroke={DIM} strokeWidth="5" strokeLinejoin="square" />
      <path className="sc-ants" d="M22 118H70V78H124V112H170V70" stroke={L} strokeWidth="1.6" strokeDasharray="4 5" />
      <g>
        <rect x="8" y="104" width="28" height="28" fill={CARD} stroke={B} strokeWidth="1.6" />
        <path d="M15 126V110h11l-3 3 3 3H17" fill={L} />
        <text x="22" y="143" textAnchor="middle" className="sc-t">HQ</text>
      </g>
      <g className="sc-cp" style={{ '--d': '2s' }}>
        <rect x="60" y="68" width="20" height="20" fill={CARD} stroke={L} strokeWidth="1.6" />
        <path d="M64 72h12v12H64zM64 72l12 12M76 72L64 84" stroke={B} strokeWidth="1.4" />
      </g>
      <g className="sc-cp" style={{ '--d': '4s' }}>
        <rect x="114" y="102" width="20" height="20" fill={CARD} stroke={L} strokeWidth="1.6" />
        <path d="M118 105h12v6c0 4-3 7-6 8-3-1-6-4-6-8z" fill={B} />
      </g>
      <g className="sc-cp" style={{ '--d': '6s' }}>
        <rect x="160" y="60" width="20" height="20" fill={CARD} stroke={L} strokeWidth="1.6" />
        <path d="M163 69h14c0 4-3 7-7 7s-7-3-7-7z" fill={B} />
        <path d="M167 66v-3M170 66v-4M173 66v-3" stroke={L} strokeWidth="1.4" />
      </g>
      <g className="sc-cart">
        <g shapeRendering="crispEdges">
          <rect x="-8" y="-7" width="11" height="7" fill={W} />
          <rect x="3" y="-5" width="5" height="5" fill={L} />
          <rect x="4" y="-4" width="3" height="2" fill={BG} />
          <rect x="-7" y="0" width="3" height="3" fill={B} />
          <rect x="3" y="0" width="3" height="3" fill={B} />
        </g>
      </g>
    </>
  );
}

/* Outreach — broadcast: a megaphone pushes signal rings while a feed of replies pops in */
function Outreach() {
  return (
    <>
      <g className="sc-ring">
        <path d="M74 66a24 24 0 0 1 0 38" stroke={B} strokeWidth="2.4" />
      </g>
      <g className="sc-ring sc-d2">
        <path d="M74 66a24 24 0 0 1 0 38" stroke={B} strokeWidth="2.4" />
      </g>
      <g shapeRendering="crispEdges">
        <rect x="16" y="76" width="14" height="18" fill={B} />
        <path d="M30 76l34-20v58L30 94z" fill={L} />
        <rect x="60" y="54" width="6" height="62" fill={B} />
        <rect x="20" y="94" width="6" height="16" fill={DIM} />
      </g>
      <g className="sc-bub" style={{ '--d': '0s' }}>
        <rect x="132" y="14" width="92" height="30" fill={CARD} stroke={B} strokeWidth="1.4" />
        <path d="M140 44v7l7-7" fill={B} />
        <path d="M142 24h4v2h2v-2h4v4l-5 5-5-5z" fill={L} />
        <rect x="160" y="23" width="52" height="4" fill={DIM} />
        <rect x="160" y="31" width="34" height="4" fill={DIM} />
      </g>
      <g className="sc-bub" style={{ '--d': '.9s' }}>
        <rect x="112" y="58" width="92" height="30" fill={L} />
        <path d="M196 88v7l-7-7" fill={L} />
        <text x="121" y="77" className="sc-t sc-t--dk">@PROCOM</text>
        <rect x="174" y="70" width="22" height="5" fill={BG} />
      </g>
    </>
  );
}

/* Media & Creative — studio: a camera fires its flash inside a viewfinder while the film strip rolls */
const FILM = Array.from({ length: 12 }, (_, i) => i);
const HOLES = Array.from({ length: 24 }, (_, i) => 4 + i * 10);
function Creative() {
  return (
    <>
      <path d="M14 12h14M14 12v12M226 12h-14M226 12v12M14 108h14M14 108V96M226 108h-14M226 108V96" stroke={B} strokeWidth="2" />
      <g shapeRendering="crispEdges">
        <rect x="86" y="46" width="68" height="46" fill={CARD} stroke={B} strokeWidth="2" />
        <rect x="94" y="38" width="16" height="8" fill={B} />
        <rect x="140" y="52" width="8" height="5" fill={L} />
      </g>
      <circle cx="120" cy="69" r="17" fill={BG} stroke={L} strokeWidth="3" />
      <circle cx="120" cy="69" r="9" fill={DIM} />
      <circle cx="116" cy="65" r="3" fill={W} />
      <g className="sc-flash">
        <path d="M102 24l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill={W} />
      </g>
      <g className="sc-film">
        <g>
          {FILM.map((i) => (
            <g key={i}>
              <rect x={i * 40} y="116" width="38" height="30" fill={CARD} stroke={DIM} />
              <rect
                x={i * 40 + 5}
                y="123"
                width="28"
                height="16"
                fill={i % 3 === 0 ? L : i % 3 === 1 ? DIM : B}
                opacity={i % 3 === 1 ? 1 : 0.55}
              />
            </g>
          ))}
        </g>
      </g>
      <g fill={BG}>
        {HOLES.map((x) => (
          <g key={x}>
            <rect x={x} y="117" width="4" height="3" />
            <rect x={x} y="142" width="4" height="3" />
          </g>
        ))}
      </g>
    </>
  );
}

/* Computing — terminal: code types itself out while the server rack blinks */
const CODE_ROWS = [
  [40, 62, L],
  [52, 96, DIM],
  [64, 78, B],
  [76, 104, DIM],
  [88, 56, L],
  [100, 88, DIM],
  [112, 40, B],
];
const RACK = [24, 52, 80, 108];
function Tech() {
  return (
    <>
      <rect x="12" y="16" width="146" height="116" fill={BG} stroke={B} strokeWidth="1.6" />
      <rect x="12" y="16" width="146" height="12" fill={DIM} />
      <rect x="18" y="20" width="4" height="4" fill={B} />
      <rect x="25" y="20" width="4" height="4" fill={L} />
      <rect x="32" y="20" width="4" height="4" fill={W} opacity=".5" />
      <g shapeRendering="crispEdges">
        {CODE_ROWS.map((r, i) => (
          <g key={r[0]}>
            <rect x="20" y={r[0]} width="5" height="5" fill={L} opacity=".7" />
            <rect className="sc-type" style={{ animationDelay: i * 0.55 + 's' }} x="30" y={r[0]} width={r[1]} height="5" fill={r[2]} />
          </g>
        ))}
        <rect className="sc-caret" x="76" y="112" width="5" height="7" fill={W} />
      </g>
      <path d="M158 74h10" stroke={DIM} strokeWidth="2" />
      <path className="sc-ants" d="M158 74h10" stroke={B} strokeWidth="2" strokeDasharray="2 3" />
      <g shapeRendering="crispEdges">
        <rect x="168" y="16" width="60" height="116" fill={CARD} stroke={B} strokeWidth="1.6" />
        {RACK.map((y, i) => (
          <g key={y}>
            <rect x="174" y={y} width="48" height="20" fill={BG} stroke={DIM} />
            <path d={`M180 ${y + 6}h20M180 ${y + 10}h20M180 ${y + 14}h20`} stroke={DIM} />
            <rect className="sc-led" style={{ animationDelay: i * 0.37 + 's' }} x="208" y={y + 5} width="4" height="4" fill={L} />
            <rect className="sc-led" style={{ animationDelay: i * 0.53 + 0.2 + 's' }} x="214" y={y + 5} width="4" height="4" fill={B} />
            <rect x="208" y={y + 12} width="10" height="2" fill={DIM} />
          </g>
        ))}
      </g>
    </>
  );
}

/* Competitions — the bracket: rounds light up toward a glowing trophy */
const SEEDS = [22, 46, 82, 106];
const ROUNDS = [
  'M20 22H44V34H60M20 46H44V34M20 82H44V94H60M20 106H44V94M220 22H196V34H180M220 46H196V34M220 82H196V94H180M220 106H196V94',
  'M60 34H78V64H96M60 94H78V64M180 34H162V64H144M180 94H162V64',
  'M96 64H110M144 64H130',
];
function Comp() {
  return (
    <>
      {SEEDS.map((y) => (
        <g key={y}>
          <rect x="8" y={y - 6} width="12" height="12" fill={CARD} stroke={B} strokeWidth="1.2" />
          <rect x="220" y={y - 6} width="12" height="12" fill={CARD} stroke={B} strokeWidth="1.2" />
          <rect x="12" y={y - 2} width="4" height="4" fill={L} />
          <rect x="224" y={y - 2} width="4" height="4" fill={L} />
        </g>
      ))}
      {ROUNDS.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={DIM} strokeWidth="2" />
          <path className={`sc-br sc-br${i + 1}`} d={d} stroke={B} strokeWidth="2.2" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
        </g>
      ))}
      <g className="sc-cup">
        <g shapeRendering="crispEdges">
          <path d="M108 44h24v18c0 7-5 12-12 12s-12-5-12-12z" fill={B} />
          <path d="M104 46h4v10h-4zM132 46h4v10h-4z" fill={L} />
          <rect x="117" y="74" width="6" height="8" fill={L} />
          <rect x="110" y="82" width="20" height="6" fill={B} />
          <rect x="114" y="50" width="4" height="10" fill={W} opacity=".7" />
        </g>
      </g>
    </>
  );
}

const SCENES = { ops: Ops, outreach: Outreach, creative: Creative, tech: Tech, comp: Comp };

export default function DeptScene({ id }) {
  const Scene = SCENES[id] || Ops;
  return (
    <svg className={`sc sc--${id}`} viewBox="0 0 240 150" fill="none" preserveAspectRatio="xMidYMid meet">
      <Scene />
    </svg>
  );
}
