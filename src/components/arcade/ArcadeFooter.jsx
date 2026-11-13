import { useRef, useState } from 'react';
import BrandMark from './BrandMark.jsx';
import Icon from './Icon.jsx';
import RouteLink from './RouteLink.jsx';
import BitRunner from './BitRunner.jsx';
import { CONTACT, SOCIAL } from '../../data/procomEvent.js';
import { COMPETITION_TEAMS, teamPath } from '../../data/teams.js';
import { href } from '../../utils/arcade/routes.js';
import { burst } from '../../utils/arcade/burst.js';
import { sfx } from '../../utils/arcade/sfx.js';
import { toast } from '../../utils/arcade/toast.js';
import { quest } from '../../utils/arcade/xp.js';

function readCredits() {
  try {
    return +sessionStorage.getItem('procom27-credits') || 0;
  } catch {
    return 0;
  }
}

/** footer: insert coin */
function Coin() {
  const [credits, setCredits] = useState(readCredits);
  const btnRef = useRef(null);
  const coinRef = useRef(null);
  return (
    <button
      ref={btnRef}
      type="button"
      className="coin"
      aria-label="Insert coin"
      onClick={() => {
        const next = credits + 1;
        setCredits(next);
        try {
          sessionStorage.setItem('procom27-credits', String(next));
        } catch {
          /* storage unavailable */
        }
        const r = coinRef.current.getBoundingClientRect();
        burst(r.left + 5, r.top + 5, { n: 10, spread: 40 });
        quest('coin', btnRef.current);
        sfx.play('coin');
        if (next === 27) toast('27 credits. That’s the PROCOM ’27 high score.');
      }}
    >
      <i aria-hidden="true" ref={coinRef} />
      <span>Insert coin</span>
      <b>Credits {String(credits).padStart(2, '0')}</b>
    </button>
  );
}

function FooterLink({ to, page, children }) {
  const cur = href(to) === href(page) || to === page;
  return (
    <li>
      <RouteLink to={to} aria-current={cur ? 'page' : undefined}>
        {children}
      </RouteLink>
    </li>
  );
}

function ContactItem({ val, label, kind }) {
  if (val) {
    return (
      <li>
        <a href={(kind === 'email' ? 'mailto:' : kind === 'phone' ? 'tel:' : '#') + val}>{val}</a>
      </li>
    );
  }
  return (
    <li>
      <span>[{label}]</span>
    </li>
  );
}

const SOCIALS = [
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
  ['facebook', 'Facebook'],
];

export default function ArcadeFooter({ page = '' }) {
  const socials = SOCIALS.filter(([k]) => SOCIAL[k]);
  return (
    <footer className="footer">
      <div className="shell">
        <BitRunner />
        <div className="footer__grid footer__grid--4">
          <div>
            <RouteLink to="home" className="brand" aria-label="PROCOM’27 home">
              <BrandMark />
              <span className="brand__word">PROCOM’27</span>
            </RouteLink>
            <p className="footer__tag t-label mt-6!">Where skill meets scale</p>
            <p className="footer__about">Bringing students together to compete, connect, and explore new opportunities.</p>
            {socials.length > 0 && (
              <div className="socials">
                {socials.map(([k, label]) => (
                  <a key={k} className="icon-btn" href={SOCIAL[k]} rel="noopener noreferrer" target="_blank" aria-label={label}>
                    <Icon name={k} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <nav aria-label="Quick links">
            <h2>Quick links</h2>
            <ul>
              <FooterLink to="home" page={page}>Home</FooterLink>
              <FooterLink to="competitions" page={page}>Competitions</FooterLink>
              <FooterLink to="teams" page={page}>Teams</FooterLink>
              <FooterLink to="schedule" page={page}>Schedule</FooterLink>
              <FooterLink to="aboutUs" page={page}>About Us</FooterLink>
              <FooterLink to="sponsors" page={page}>Sponsors</FooterLink>
              <FooterLink to="jobOrbit" page={page}>Job Orbit</FooterLink>
              <FooterLink to="workshops" page={page}>Workshops</FooterLink>
              <FooterLink to="contact" page={page}>Contact</FooterLink>
            </ul>
          </nav>
          <nav aria-label="Competitions">
            <h2>Competitions</h2>
            <ul>
              {COMPETITION_TEAMS.map((c) => (
                <li key={c.slug}>
                  <RouteLink path={teamPath(c.slug)}>{c.name}</RouteLink>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2>Contact</h2>
            <ul>
              <ContactItem val={CONTACT.email} label="Official email" kind="email" />
              <ContactItem val={CONTACT.phone} label="Official phone number" kind="phone" />
              <ContactItem val={CONTACT.address} label="Campus address" />
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© PROCOM ’27. All rights reserved.</span>
          <Coin />
          <ul className="footer__legal">
            <li><RouteLink to="privacy">Privacy Policy</RouteLink></li>
            <li><RouteLink to="terms">Terms &amp; Conditions</RouteLink></li>
            <li><RouteLink to="refund">Return &amp; Refund Policy</RouteLink></li>
            <li><RouteLink to="shipping">Shipping Policy</RouteLink></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
