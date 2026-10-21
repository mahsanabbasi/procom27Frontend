import { Letterhead } from './Letterhead.jsx';
import TeamLeadershipPreview from './TeamLeadershipPreview.jsx';
import { COMPETITION_TEAMS, ALL_TEAMS, teamPath, TEAMS_PATH } from '../data/teams.js';

// The wireframe's category grid: a letterhead, a name, one line, one way in.
// Each tile opens the student team that runs that category.
export const CompetitionCategoriesSection = () => {
  return (
    <section id="competitions" className="shell section" aria-labelledby="competitions-title">
      <header className="section-head" data-reveal>
        <h2 id="competitions-title" className="heading">Competition categories</h2>
        <p className="muted">Find the one that fits your field.</p>
      </header>

      <ul className="tile-grid" style={{ marginTop: 'clamp(28px, 4vh, 44px)' }}>
        {COMPETITION_TEAMS.map((team, index) => (
          <li key={team.slug} data-reveal style={{ '--i': index % 4 }}>
            <a href={teamPath(team.slug)} className="tile">
              <Letterhead team={team} />
              <div className="tile-body">
                <h3>{team.name}</h3>
                <p className="muted">{team.note}</p>
              </div>
              <TeamLeadershipPreview team={team} />
              <span className="tile-action">View team →</span>
            </a>
          </li>
        ))}

        <li data-reveal style={{ '--i': 3 }}>
          <a href={TEAMS_PATH} className="tile tile-more">
            <div className="tile-body">
              <h3>All {ALL_TEAMS.length} teams</h3>
              <p className="muted">Everyone who runs the event.</p>
            </div>
            <span className="tile-action">View all teams →</span>
          </a>
        </li>
      </ul>
    </section>
  );
};
