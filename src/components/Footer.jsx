import { useEffect, useRef } from 'react';
import { drawPixelMark } from '../utils/pixelMark.js';
import { COMPETITION_TEAMS, TEAM_GROUPS, teamPath, TEAMS_PATH } from '../data/teams.js';

const PAGE_LINKS = [
  { label: 'About', href: '/#about' },
  { label: 'Competitions', href: '/#competitions' },
  { label: 'Why PROCOM', href: '/#why' },
  { label: 'All teams', href: TEAMS_PATH },
  { label: 'Intro Day', href: '/#schedule' },
  { label: 'Join the team', href: '/#register' },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="text-link">{link.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Footer = ({ onContactClick }) => {
  const markRef = useRef(null);

  useEffect(() => {
    drawPixelMark(markRef.current, '#b995e6');
  }, []);

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <p className="footer-mark">
              <canvas ref={markRef} width={11} height={15} aria-hidden="true" />
              PROCOM&apos;27
            </p>
            <p className="muted">The annual technology competition of FAST NUCES Karachi, run by its students.</p>
            <div className="footer-places">
              <a href="https://www.instagram.com/procom_fast/?hl=en" target="_blank" rel="noopener noreferrer" className="text-link">Instagram</a>
              <a href="https://pk.linkedin.com/company/procom-fast" target="_blank" rel="noopener noreferrer" className="text-link">LinkedIn</a>
              <button type="button" onClick={onContactClick} className="text-link">Contact</button>
            </div>
          </div>

          <div className="footer-cols">
            <LinkColumn title="Site" links={PAGE_LINKS} />
            <LinkColumn title="Competitions" links={COMPETITION_TEAMS.map((team) => ({ label: team.name, href: teamPath(team.slug) }))} />
            {/* Thirty-odd organising teams will not fit here, so the footer
                points at the filters on /teams instead of listing them. */}
            <LinkColumn
              title="Teams"
              links={TEAM_GROUPS.filter((item) => item.key !== 'all').map((item) => ({
                label: item.label,
                href: `${TEAMS_PATH}?group=${item.key}`,
              }))}
            />
          </div>
        </div>

        <div className="footer-legal">
          <p className="muted">© 2026 PROCOM, FAST NUCES Karachi.</p>
          <a href="#top" className="text-link">Back to top</a>
        </div>
      </div>
    </footer>
  );
};
