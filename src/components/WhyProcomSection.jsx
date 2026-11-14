import { PixelIcon } from './PixelIcon.jsx';
import { ALL_TEAMS, COMPETITION_TEAMS, countWord } from '../data/teams.js';

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// The wireframe's benefit row: an icon, a name, two short lines, one link.
const REASONS = [
  {
    icon: 'trophy',
    accent: '#b995e6',
    title: 'Compete & win',
    lines: [`${capitalise(countWord(COMPETITION_TEAMS.length))} competition teams, open to any university.`, 'Judged by faculty and industry.'],
    cta: { label: 'View categories', href: '#competitions' },
  },
  {
    icon: 'clipboard',
    accent: '#4df3ff',
    title: 'Run the event',
    lines: [`${capitalise(countWord(ALL_TEAMS.length))} teams, all recruiting now.`, 'Experience that counts as work.'],
    cta: { label: 'Join a team', href: '#teams' },
  },
  {
    icon: 'briefcase',
    accent: '#ff4fd1',
    title: 'Meet who is hiring',
    lines: ['A job fair and a startup showcase.', 'Sponsors on campus for three days.'],
    cta: { label: 'What is PROCOM', href: '#about' },
  },
  {
    icon: 'book',
    accent: '#b995e6',
    title: 'Learn & network',
    lines: ['Workshops, talks and panel discussions.', 'No competition entry needed.'],
    cta: { label: 'See Intro Day', href: '#schedule' },
  },
];

export const WhyProcomSection = () => {
  return (
    <section id="why" className="shell section" aria-labelledby="why-title" data-munch="flag" data-munch-label="Why attend">
      <header className="section-head" data-reveal>
        <h2 id="why-title" className="heading">Why be part of PROCOM?</h2>
        <p className="muted">Two ways in: compete, or build the thing everyone turns up for.</p>
      </header>

      <ul className="tile-grid" style={{ marginTop: 'clamp(28px, 4vh, 44px)' }}>
        {REASONS.map((reason, index) => (
          <li key={reason.title} data-reveal style={{ '--i': index }}>
            <div className="tile">
              <span className="letterhead" aria-hidden="true" style={{ '--mark': reason.accent }}>
                <PixelIcon name={reason.icon} />
              </span>
              <div className="tile-body">
                <h3>{reason.title}</h3>
                {reason.lines.map((line) => (
                  <p key={line} className="muted">{line}</p>
                ))}
              </div>
              <a href={reason.cta.href} className="tile-action tile-action-link">
                {reason.cta.label} →
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
