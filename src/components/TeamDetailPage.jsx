import { TeamBanner } from './Letterhead.jsx';
import { UNKNOWN } from '../data/reveals.js';
import { PROCOM_FORM_URL, EXTERNAL } from '../data/links.js';
import { getTeamBySlug } from '../data/teams.js';

function NotFound({ slug }) {
  return (
    <div className="shell notfound">
      <h1 className="team-title">No team at “{slug}”</h1>
      <p className="lead muted">Every PROCOM’27 team is listed on the home page.</p>
      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        <a href="/#competitions" className="text-link">Competition teams</a>
        <a href="/#teams" className="text-link">Other teams</a>
      </div>
    </div>
  );
}

export default function TeamDetailPage({ slug }) {
  const team = getTeamBySlug(slug);
  if (!team) return <NotFound slug={slug} />;

  const isCompetition = team.kind === 'competition';
  const whatItIs = isCompetition
    ? `The student team that runs ${team.name} at PROCOM’27.`
    : 'One of the teams that runs PROCOM’27.';
  const people = team.members.length
    ? team.members.map((person) => ({ label: person.designation, value: person.name }))
    : [
      { label: 'Director', value: UNKNOWN, unknown: true },
      { label: 'Deputy Directors', value: UNKNOWN, unknown: true },
    ];

  return (
    <>
      <section className="shell team-hero" aria-labelledby="team-title">
        <div className="team-head">
          <div className="team-head-mark" data-load style={{ '--d': '160ms' }}>
            <TeamBanner team={team} />
          </div>

          <div className="team-head-copy">
            <h1 id="team-title" className="team-title" data-load style={{ '--d': '200ms' }}>
              {team.name}
            </h1>
            <p className="lead" data-load style={{ '--d': '260ms' }}>{whatItIs}</p>
            {team.blurb && (
              <p className="body muted" data-load style={{ '--d': '300ms' }}>{team.blurb}</p>
            )}
            <div className="hero-actions" data-load style={{ '--d': '360ms' }}>
              <a href={PROCOM_FORM_URL} {...EXTERNAL} className="pixel-btn-primary">Apply to join</a>
              <a href="/teams" className="pixel-btn-secondary">All teams</a>
            </div>
          </div>
        </div>
      </section>

      <section className="shell section" aria-labelledby="team-people-title">
        <h2 id="team-people-title" className="heading" data-reveal>The team</h2>
        <dl className="people" style={{ marginTop: '32px' }}>
          {people.map((person, index) => (
            <div key={`${person.label}-${person.value}`} data-reveal style={{ '--i': index }}>
              <dt>{person.label}</dt>
              <dd className={person.unknown ? 'is-unknown' : undefined}>{person.value}</dd>
            </div>
          ))}
        </dl>
        <p className="muted small" style={{ marginTop: '24px' }} data-reveal>Additional members are selected through induction.</p>
      </section>

      <section id="team-apply" className="shell section section-end" aria-labelledby="team-apply-title">
        {/* One `data-reveal` on the grid, not on each child: the two columns sit
            on the same row, so revealing them separately showed half a row. */}
        <div className="apply-grid" data-reveal>
          <div>
            <h2 id="team-apply-title" className="heading">Apply to join</h2>
            <p className="muted" style={{ marginTop: '16px', maxWidth: '44ch' }}>
              Apply to {team.name} through the shared membership form. New members are
              selected during induction by the team’s leadership.
            </p>
          </div>
          <div>
            <a href={PROCOM_FORM_URL} {...EXTERNAL} className="pixel-btn-primary">Open the application form</a>
            <p className="muted small" style={{ marginTop: '16px' }}>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
