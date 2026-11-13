import { useEffect, useRef, useState } from 'react';
import BrandMark from './BrandMark.jsx';
import Icon from './Icon.jsx';
import RouteLink from './RouteLink.jsx';
import RegisterButton from './RegisterButton.jsx';
import Muncher from './Muncher.jsx';
import { NAV, href } from '../../utils/arcade/routes.js';
import { PROCOM_DATA as D } from '../../data/procomEvent.js';
import { deadline, fmtDeadline } from '../../utils/arcade/registration.js';
import { pad } from '../../utils/arcade/util.js';
import { lockScroll, unlockScroll } from '../../utils/arcade/scrollLock.js';

/* ---------- registration countdown (days + hours) ---------- */
function useNavCountdown() {
  const calc = () => {
    if (!deadline) return { kind: 'tba' };
    const ms = deadline.getTime() - Date.now();
    if (D.registration.closed || ms <= 0) return { kind: 'closed' };
    return { kind: 'open', d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24 };
  };
  const [v, setV] = useState(calc);
  useEffect(() => {
    const iv = setInterval(() => setV(calc()), 30000);
    return () => clearInterval(iv);
  }, []);
  return v;
}

function NavCountdown({ page }) {
  const v = useNavCountdown();
  const cdHref = (page === 'home' ? '' : href('home')) + '#play';
  let label = 'Reg closes in';
  let aria;
  let value;
  if (v.kind === 'tba') {
    value = 'TBA';
    aria = 'Registration deadline to be announced';
  } else if (v.kind === 'closed') {
    label = 'Registration';
    value = 'Closed';
    aria = 'Registration closed';
  } else {
    value = (
      <>
        <b>{v.d}</b>D<i>:</i>
        <b>{pad(v.h)}</b>H
      </>
    );
    aria = `Registration closes in ${v.d} day${v.d === 1 ? '' : 's'} and ${v.h} hour${v.h === 1 ? '' : 's'}`;
  }
  return (
    <a
      className={'navcd' + (v.kind === 'closed' ? ' is-closed' : '')}
      href={cdHref}
      aria-label={aria}
      title={deadline ? 'Registration deadline: ' + fmtDeadline(deadline, true) : undefined}
    >
      <Icon name="clock" />
      <span className="navcd__txt">
        <span className="navcd__lbl">{label}</span>
        <span className="navcd__v">{value}</span>
      </span>
    </a>
  );
}

/**
 * Shared navbar: brand, primary links, registration countdown, register CTA,
 * the muncher HP bar, breadcrumb and the mobile menu.
 */
export default function ArcadeNav({ page = '', active = '', crumbs = [] }) {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
    document.documentElement.classList.toggle('menu-open', open);
    if (open) lockScroll('menu');
    else unlockScroll('menu');
    if (open) {
      const f = menuRef.current && menuRef.current.querySelector('a');
      if (f) f.focus();
    }
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape' && openRef.current) {
        setOpen(false);
        if (burgerRef.current) burgerRef.current.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1100) setOpen(false);
    };
    document.addEventListener('procom:closemenu', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('procom:closemenu', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('menu-open');
      unlockScroll('menu');
    };
  }, []);

  function trap(e) {
    if (e.key !== 'Tab') return;
    const f = Array.from(menuRef.current.querySelectorAll('a')).concat([burgerRef.current]);
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && i === f.length - 1) {
      e.preventDefault();
      f[0].focus();
    }
  }

  return (
    <>
      <header className="nav" id="site-nav">
        <div className="shell nav__in">
          <RouteLink to="home" className="brand" aria-label="PROCOM’27 home">
            <BrandMark />
            <span className="brand__word">PROCOM’27</span>
          </RouteLink>
          <nav aria-label="Primary">
            <ul className="nav__links">
              {NAV.map(([key, label]) => (
                <li key={key}>
                  <RouteLink to={key} className="nav__link" aria-current={active === key ? 'page' : undefined}>
                    {label}
                  </RouteLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav__actions">
            <NavCountdown page={page} />
            <RegisterButton className="btn btn--register btn--sm" />
            <button
              ref={burgerRef}
              className="icon-btn nav__burger"
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        <Muncher />
      </header>

      {crumbs.length > 0 && (
        <div className="crumbs">
          <div className="shell crumbs__in">
            <span className="t-label">You are here</span>
            <nav aria-label="Breadcrumb">
              <ol>
                {crumbs.map((c, i) =>
                  i === crumbs.length - 1 ? (
                    <li key={c.label} aria-current="page">
                      {c.label}
                    </li>
                  ) : (
                    <li key={c.label}>
                      <RouteLink to={c.to || 'home'}>{c.label}</RouteLink>
                    </li>
                  ),
                )}
              </ol>
            </nav>
          </div>
        </div>
      )}

      <div className="mmenu" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" ref={menuRef} onKeyDown={trap}>
        <ul>
          {NAV.map(([key, label], i) => (
            <li key={key}>
              <RouteLink to={key} className="mmenu__link" aria-current={active === key ? 'page' : undefined}>
                <span>0{i + 1}</span>
                {label}
              </RouteLink>
            </li>
          ))}
          <li>
            <RouteLink to="contact" className="mmenu__link" aria-current={page === 'contact' ? 'page' : undefined}>
              <span>06</span>Contact
            </RouteLink>
          </li>
        </ul>
        <RegisterButton>Register for PROCOM’27</RegisterButton>
      </div>
    </>
  );
}
