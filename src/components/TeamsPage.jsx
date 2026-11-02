import { useState } from 'react';
import { Link } from 'wouter';
import { TeamBanner } from './Letterhead.jsx';
import TeamLeadershipPreview from './TeamLeadershipPreview.jsx';
import { TEAM_GROUPS, teamsInGroup, teamPath, TEAMS_PATH, ALL_TEAMS, COMPETITION_TEAMS, SUPPORT_TEAMS, countWord } from '../data/teams.js';

// Every team on one page, the way the wireframe lays out "Meet the Teams":
// a card each, with filters so nobody has to read fifteen of them to find the
// one they want.
// The chosen filter lives in the query string, so a filtered view can be
// linked to and the footer can point straight at one.
function groupFromUrl() {
  const asked = new URLSearchParams(window.location.search).get('group');
  return TEAM_GROUPS.some((item) => item.key === asked) ? asked : 'all';
}

export default function TeamsPage() {
  const [group, setGroup] = useState(groupFromUrl);
  const active = TEAM_GROUPS.find((item) => item.key === group) || TEAM_GROUPS[0];
  const teams = teamsInGroup(group);

  function choose(key) {
    setGroup(key);
    const url = key === 'all' ? TEAMS_PATH : `${TEAMS_PATH}?group=${key}`;
    window.history.replaceState({}, '', url);
  }

  return (
    <>
      <section className="shell teams-head" aria-labelledby="teams-page-title">
        <h1 id="teams-page-title" className="team-title" data-load style={{ '--d': '160ms' }}>
          Meet the teams
        </h1>
        <p className="lead" data-load style={{ '--d': '220ms' }}>
          {countWord(ALL_TEAMS.length).charAt(0).toUpperCase() + countWord(ALL_TEAMS.length).slice(1)} student
          teams run PROCOM&apos;27 — {countWord(COMPETITION_TEAMS.length)} that run the competitions
          and {countWord(SUPPORT_TEAMS.length)} that build the event around them. All of them are recruiting.
        </p>

        <div className="filters" role="group" aria-label="Filter teams" data-load style={{ '--d': '300ms' }}>
          {TEAM_GROUPS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="filter"
              aria-pressed={item.key === group}
              onClick={() => choose(item.key)}
            >
              {item.label}
              <span className="filter-count">{teamsInGroup(item.key).length}</span>
            </button>
          ))}
        </div>

        <p className="muted small filters-note" aria-live="polite" data-load style={{ '--d': '340ms' }}>
          {active.note}
        </p>
      </section>

      <section className="shell section-end" aria-label={`${active.label}: ${teams.length} teams`}>
        {/* `data-load` rather than `data-reveal`: the scroll observer is set up
            once per route, so cards added by a filter would never be told to
            appear. A mount animation replays for each newly shown card. */}
        <ul className="tile-grid teams-grid">
          {teams.map((team, index) => (
            <li key={team.slug} data-load style={{ '--d': `${60 + (index % 8) * 45}ms` }}>
              <Link href={teamPath(team.slug)} className="tile team-tile team-tile-static">
                <TeamBanner team={team} />
                <div className="tile-body">
                  <h3>{team.name}</h3>
                  <p className="muted">{team.note}</p>
                </div>
                <TeamLeadershipPreview team={team} />
                <span className="tile-action">View team →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
