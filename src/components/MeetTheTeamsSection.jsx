import { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures';
import { TeamBanner } from './Letterhead.jsx';
import { SUPPORT_TEAMS, ALL_TEAMS, teamPath, TEAMS_PATH, countWord } from '../data/teams.js';

// Pixels the row travels per frame on its own: about 36px a second on a 60Hz
// screen, the pace the old CSS marquee ran at.
const ROLL_SPEED = 0.6;

// The teams that run the event, rolling past. Each card carries the team's
// letterhead banner so the row reads as cards rather than a ticker of names.
function TeamCard({ team }) {
  return (
    <a href={teamPath(team.slug)} className="tile team-tile">
      <TeamBanner team={team} />
      <div className="tile-body">
        <h3>{team.name}</h3>
        <p className="muted">{team.note}</p>
      </div>
      <span className="tile-action">View team →</span>
    </a>
  );
}

export const MeetTheTeamsSection = () => {
  // Embla drives the row on the compositor: it rolls by itself, loops without
  // a seam, can be dragged or flicked, scrolled sideways with a trackpad or
  // horizontal wheel, and swallows the click at the end of a drag so a card
  // does not open when you were only pulling the row along.
  const plugins = useMemo(() => {
    const wheel = WheelGesturesPlugin();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return [wheel];
    return [
      wheel,
      AutoScroll({
        speed: ROLL_SPEED,
        startDelay: 0,
        // Resting the cursor on the row holds it still, so a card can be read
        // and clicked. It rolls on again once the cursor leaves, and after a
        // drag, wheel or touch flick has settled.
        stopOnMouseEnter: true,
        stopOnInteraction: false,
        // A keyboard visit stops it as well, so cards can be tabbed through.
        stopOnFocusIn: true,
      }),
    ];
  }, []);

  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: true, align: 'start' }, plugins);

  return (
    <section id="teams" className="section" aria-labelledby="teams-title">
      <div className="shell">
        <header className="section-head section-head-row" data-reveal>
          <div>
            <h2 id="teams-title" className="heading">Meet the teams</h2>
            <p className="muted">The people behind PROCOM. All {countWord(ALL_TEAMS.length)} teams are recruiting.</p>
          </div>
          <a href={TEAMS_PATH} className="tile-action tile-action-link">View all teams →</a>
        </header>
      </div>

      <div className="marquee" ref={emblaRef} style={{ marginTop: 'clamp(28px, 4vh, 44px)' }} data-reveal>
        <div className="marquee-track">
          {SUPPORT_TEAMS.map((team) => (
            <TeamCard key={team.slug} team={team} />
          ))}
        </div>
      </div>
    </section>
  );
};
