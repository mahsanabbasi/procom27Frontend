import { useEffect, useRef, useState } from 'react';
import { drawPixelMark } from '../utils/pixelMark';
import { PROCOM_FORM_URL, EXTERNAL } from '../data/links.js';
import { TEAMS_PATH } from '../data/teams.js';

const LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Competitions', href: '/#competitions' },
  { label: 'Teams', href: TEAMS_PATH },
  { label: 'Intro Day', href: '/#schedule' },
];

// There is no account system yet, so the bar carries one action: the form that
// puts you on a team. Log in and the portal come back with the backend —
// `AuthModal` / `PortalModal` are still in src/components/modals/.
export const Navbar = ({ currentPath = window.location.pathname }) => {
  const markRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    drawPixelMark(markRef.current, '#B995E6');
  }, []);

  const close = () => setOpen(false);
  const isCurrent = (href) => !href.includes('#') && (currentPath.replace(/\/+$/, '') === href || (href === TEAMS_PATH && currentPath.startsWith(`${TEAMS_PATH}/`)));

  return (
    <header className="nav">
      <div className="shell nav-bar">
        <a href="/" className="nav-mark" aria-label="PROCOM'27 home">
          <canvas
            ref={markRef}
            width={11}
            height={15}
            aria-hidden="true"
            style={{ display: 'block', width: '14px', height: 'auto', imageRendering: 'pixelated' }}
          />
          PROCOM'27
        </a>

        <nav className="nav-links" aria-label="Sections">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link" aria-current={isCurrent(link.href) ? 'page' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <a href={PROCOM_FORM_URL} {...EXTERNAL} className="pixel-btn-primary pixel-btn-sm">
            Join the team
          </a>
          <button
            type="button"
            className="nav-text-btn nav-link nav-menu-btn"
            aria-expanded={open}
            aria-controls="nav-panel"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <nav id="nav-panel" className="shell nav-panel" aria-label="Sections" hidden={!open}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="nav-link" aria-current={isCurrent(link.href) ? 'page' : undefined} onClick={close}>
            {link.label}
          </a>
        ))}
        <a href={PROCOM_FORM_URL} {...EXTERNAL} className="pixel-btn-primary pixel-btn-sm" onClick={close}>
          Join the team
        </a>
      </nav>
    </header>
  );
};
