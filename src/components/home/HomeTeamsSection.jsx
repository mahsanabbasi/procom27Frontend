import { Link } from 'wouter';
import { homeTeamCode, homeTeamDept, homeTeams } from '../../data/homeTeams.js';

function hashCode(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRng(seed) {
  let random = (seed >>> 0) || 1;
  return () => {
    random ^= random << 13;
    random >>>= 0;
    random ^= random >> 17;
    random ^= random << 5;
    random >>>= 0;
    return random / 4294967296;
  };
}

// The reference builds each pixel glyph from the team-name hash and seeded RNG.
function glyph(seed, offsetX, offsetY, size) {
  const random = makeRng(seed);
  let out = '';

  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      let on = random() > (x === 2 ? 0.38 : 0.5);
      if (y === 2 && x === 2) on = true;
      if (!on) continue;

      const fill = random() > 0.7 ? '#B57CFF' : '#DCC8FF';
      out += `<rect x="${offsetX + x * size}" y="${offsetY + y * size}" width="${size}" height="${size}" fill="${fill}" />`;
      if (x !== 2) {
        out += `<rect x="${offsetX + (4 - x) * size}" y="${offsetY + y * size}" width="${size}" height="${size}" fill="${fill}" />`;
      }
    }
  }

  return out;
}

const FRAMES = {
  ops: '<path d="M20 4H44L60 20V44L44 60H20L4 44V20Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M22 9H42L55 22V42L42 55H22L9 42V22Z" stroke="#493460" stroke-width="1.2" fill="none"/>',
  outreach: '<circle cx="32" cy="32" r="28" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><circle cx="32" cy="32" r="23" fill="none" stroke="#493460" stroke-width="1.2" stroke-dasharray="3 3"/>',
  creative: '<path d="M32 2L62 32L32 62L2 32Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M32 9L55 32L32 55L9 32Z" fill="none" stroke="#493460" stroke-width="1.2"/>',
  tech: '<path d="M10 4H54L60 10V54L54 60H10L4 54V10Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M4 22H0M4 32H0M4 42H0M60 22H64M60 32H64M60 42H64" stroke="#B57CFF" stroke-width="2"/>',
  comp: '<path d="M32 3L58 12V33C58 47 46 56 32 61C18 56 6 47 6 33V12Z" fill="#100C16" stroke="#DCC8FF" stroke-width="2"/><path d="M32 9L52 16V33C52 44 43 51 32 55C21 51 12 44 12 33V16Z" fill="none" stroke="#493460" stroke-width="1.2"/>',
};

function TeamEmblem({ team }) {
  const frame = FRAMES[team.dept] || FRAMES.ops;
  const glyphMarkup = glyph(hashCode(team.name), 19.5, team.dept === 'comp' ? 20 : 19.5, 5);

  return (
    <svg viewBox="-2 -2 68 68" fill="none" aria-hidden="true" dangerouslySetInnerHTML={{
      __html: `${frame}<g shape-rendering="crispEdges">${glyphMarkup}</g>`,
    }} />
  );
}

export default function HomeTeamsSection() {
  const selectedTeam = homeTeams[0];

  return (
    <section className="section section--alt" id="teams" aria-labelledby="teams-title" data-munch="users" data-munch-label="Teams">
      <div className="container">
        <div className="row-head" data-reveal>
          <div>
            <p className="sh__label t-label"><i className="i i-square" aria-hidden="true" />03 / Teams</p>
            <h2 className="t-d2" id="teams-title">Meet the <span className="t-soft">teams</span></h2>
            <p className="t-body-lg">The people behind PROCOM ’27.</p>
          </div>
          <Link className="link-action" href="/teams">
            Meet all teams<i className="i i-arrow" aria-hidden="true" />
          </Link>
        </div>

        <div className="mts" id="mts" data-reveal>
          <aside className="mts__p1" id="mtsP1" aria-label="Selected team" style={{ '--tone': selectedTeam.accent }}>
            <div className="mts__hud t-label">
              <span className="mts__tag">1P</span>
              <span>
                Team <b id="mtsIdx">01</b> / 04
              </span>
            </div>

            <div className="mts__stage" aria-hidden="true">
              <span className="mts__burst" />
              <span className="mts__code" id="mtsCode">{homeTeamCode[selectedTeam.slug]}</span>
              <span className="mts__em" id="mtsEm"><TeamEmblem team={selectedTeam} /></span>
              <span className="mts__flash" />
              <span className="mts__stamp">Team<br />selected!</span>
            </div>

            <div className="mts__plate">
              <span className="mts__dept" id="mtsDept">{homeTeamDept[selectedTeam.dept]}</span>
              <h3 className="mts__name" id="mtsName" aria-live="polite">{selectedTeam.name}</h3>
            </div>

            <p className="mts__role" id="mtsRole">{selectedTeam.role}</p>
            <Link className="btn btn--arcade" href="/teams">
              <i className="i i-play" aria-hidden="true" />Select team
            </Link>
          </aside>

          <div className="mts__pick">
            <ul className="mts__grid" id="mtsGrid" aria-label="Featured teams">
              {homeTeams.map((team, index) => (
                <li key={team.slug}>
                  <button type="button" className={`mtile${index === 0 ? ' is-cur' : ''}`} style={{ '--tone': team.accent, '--n': index }} aria-label={`${team.name}, ${homeTeamDept[team.dept]}. Select to open the team`}>
                    <span className="mtile__in">
                      <span className="mtile__code" aria-hidden="true">{homeTeamCode[team.slug]}</span>
                      <span className="mtile__em"><TeamEmblem team={team} /></span>
                      <span className="mtile__nm">{team.name}</span>
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <Link className="mtile mtile--all" href="/teams" style={{ '--tone': '#B57CFF', '--n': 4 }}>
                  <span className="mtile__in">
                    <span className="mtile__q" aria-hidden="true">?</span>
                    <span className="mtile__nm">All 36 teams</span>
                  </span>
                </Link>
              </li>
            </ul>
            <div className="mts__cursor" id="mtsCur" aria-hidden="true" hidden>
              <i />
              <b>1P</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
