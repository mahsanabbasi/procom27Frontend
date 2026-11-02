import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'wouter';
import { drawPixelMark } from '../utils/pixelMark.js';
import { COMPETITION_TEAMS, TEAM_GROUPS, teamPath, TEAMS_PATH } from '../data/teams.js';
import { CreditsPanel, CreditsToggle } from './FooterCredits.jsx';

const PAGE_LINKS = [
  { label: 'About', href: '/about' },
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
            <Link href={link.href} className="text-link">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Footer = ({ onContactClick }) => {
  const markRef = useRef(null);
  // The credits key lives in the brand column, the panel it opens is wider
  // than that column, so the footer keeps the state that links the two.
  const [creditsOpen, setCreditsOpen] = useState(false);
  const creditsId = useId();
  const creditsPanelRef = useRef(null);

  useEffect(() => {
    drawPixelMark(markRef.current, '#b995e6');
  }, []);

  // The panel opens below the whole footer grid, so bring it into view.
  useEffect(() => {
    if (!creditsOpen) return undefined;
    const frame = requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      creditsPanelRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    });
    return () => cancelAnimationFrame(frame);
  }, [creditsOpen]);

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

            <CreditsToggle
              open={creditsOpen}
              panelId={creditsId}
              onToggle={() => setCreditsOpen((value) => !value)}
            />
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

        <CreditsPanel id={creditsId} hidden={!creditsOpen} panelRef={creditsPanelRef} />

        <div className="footer-legal">
          <p className="muted">© 2026 PROCOM, FAST NUCES Karachi.</p>
          <a href="#top" className="text-link">Back to top</a>
        </div>
      </div>
    </footer>
  );
};
