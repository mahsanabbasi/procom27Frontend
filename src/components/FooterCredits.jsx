import { countWord, getTeamBySlug, teamPath } from '../data/teams.js';
import { Letterhead } from './Letterhead.jsx';

// The two teams that built this site. The roster is read from the same file
// every team page reads, so the credits can never drift from the roster.
const CREDIT_TEAMS = ['ui-ux', 'web-dev'].map(getTeamBySlug).filter(Boolean);

// The key sits under the social links in the footer brand column; the panel it
// opens is wider than that column, so the two are separate pieces and the
// footer holds the state that links them.
export function CreditsToggle({ open, onToggle, panelId }) {
  return (
    <div className="credits">
      <button
        type="button"
        className="credits-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="credits-toggle-glyph" aria-hidden="true">+</span>
        <span className="credits-toggle-label">Credits</span>
        <span className="credits-toggle-note" aria-hidden="true">UI/UX + WEB DEV</span>
        <span className="caret credits-toggle-caret" aria-hidden="true" />
      </button>
    </div>
  );
}

export function CreditsPanel({ id, hidden, panelRef }) {
  return (
    <div id={id} className="credits-panel" hidden={hidden} ref={panelRef}>
      <div className="credits-panel-bar">
        <span className="credits-panel-title">Credits</span>
        <span className="credits-panel-dots" aria-hidden="true" />
        <span className="credits-panel-path" aria-hidden="true">procom_credits.log</span>
      </div>

      <div className="credits-teams">
        {CREDIT_TEAMS.map((team) => (
          <section className="credits-team" key={team.slug} style={{ '--mark': team.accent }}>
            <span className="credits-team-corner" aria-hidden="true" />
            <div className="credits-team-head">
              <Letterhead team={team} size={40} />
              <div className="credits-team-headings">
                <h3 className="credits-team-name">{team.name}</h3>
                <p className="credits-team-count">
                  {countWord(team.members.length)} {team.members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            <p className="credits-team-note">{team.note}</p>

            {/* The roster is four names wide on a wide screen, two on a
                tablet and one on a phone: the column count comes from the
                team itself, so a team of a different size still fits. */}
            <dl className="credits-people" style={{ '--credits-count': team.members.length }}>
              {team.members.map((person) => (
                <div className="credits-person" key={person.name}>
                  <dt>{person.designation}</dt>
                  <dd>{person.name}</dd>
                </div>
              ))}
            </dl>

            <a className="text-link credits-team-link" href={teamPath(team.slug)}>
              See the {team.name} team
            </a>
          </section>
        ))}
      </div>

      <p className="credits-foot muted small">
        This site was designed by the UI/UX team and built by the Web Dev team.
      </p>
    </div>
  );
}
