// Ports the reference Home header, countdown, scroll muncher, and demo notice.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { homeEvent } from '../../data/homeEvent.js';
import { homeNavigation } from '../../data/homeNavigation.js';
import './home.css';

const bit = {
  shut: [
    '.....B.......', '.....B.......', '.##########..', '############.',
    '#######wk###.', '#######wk###.', '############.', '#######www##.',
    '############.', '############.', '.##########..', '.##.....##...',
  ],
  open: [
    '.....B.......', '.....B.......', '.##########..', '############.',
    '#######wk###.', '#######wk###.', '#######w.w.w.', '#######......',
    '#######.w.w..', '############.', '.##########..', '.##.....##...',
  ],
  colors: { '#': '#B57CFF', B: '#DCC8FF', w: '#F5F0FA', k: '#07060B' },
};

function Icon({ name }) {
  return <i className={`i i-${name}`} aria-hidden="true" />;
}

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 186 251" aria-hidden="true">
      <defs>
        <linearGradient id="home-brand-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCC8FF" />
          <stop offset="1" stopColor="#B57CFF" />
        </linearGradient>
      </defs>
      <path d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z" fill="#493460" />
      <path d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z" fill="url(#home-brand-gradient)" />
    </svg>
  );
}

function Countdown() {
  const [countdown, setCountdown] = useState(() => getCountdown());

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const { remaining, closed } = countdown;
  const label = closed ? 'Registration' : 'Reg closes in';
  const value = closed
    ? 'Closed'
    : remaining
      ? `${remaining.days}D:${String(remaining.hours).padStart(2, '0')}H`
      : 'TBA';
  const ariaLabel = closed
    ? 'Registration closed'
    : remaining
      ? `Registration closes in ${remaining.days} day${remaining.days === 1 ? '' : 's'} and ${remaining.hours} hour${remaining.hours === 1 ? '' : 's'}`
      : 'Registration deadline to be announced';

  return (
    <Link
      className={`navcd${closed ? ' is-closed' : ''}`}
      href="#play"
      aria-label={ariaLabel}
      title={`Registration deadline: ${homeEvent.registration.deadline ? new Date(homeEvent.registration.deadline).toLocaleString() : 'TBA'}`}
    >
      <Icon name="clock" />
      <span className="navcd__txt">
        <span className="navcd__lbl">{label}</span>
        <span className="navcd__v" aria-hidden="true">
          {remaining
            ? <><b>{remaining.days}</b>D<i>:</i><b>{String(remaining.hours).padStart(2, '0')}</b>H</>
            : value}
        </span>
      </span>
    </Link>
  );
}

function getCountdown() {
  const deadline = Date.parse(homeEvent.registration.deadline);
  if (!Number.isFinite(deadline)) return { remaining: null, closed: false };
  const milliseconds = deadline - Date.now();
  if (homeEvent.registration.closed || milliseconds <= 0) {
    return { remaining: null, closed: true };
  }
  return {
    closed: false,
    remaining: {
      days: Math.floor(milliseconds / 86400000),
      hours: Math.floor(milliseconds / 3600000) % 24,
    },
  };
}

function PixelMascot({ rows, className }) {
  return (
    <svg className={className} viewBox="0 0 13 12" shapeRendering="crispEdges" aria-hidden="true">
      {rows.flatMap((row, y) => Array.from(row, (pixel, x) => (
        pixel === '.' ? null : (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={bit.colors[pixel] || '#B57CFF'} />
        )
      )))}
    </svg>
  );
}

function MunchBar() {
  const trackRef = useRef(null);
  const dotsRef = useRef(null);
  const botRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const dots = dotsRef.current;
    const bot = botRef.current;
    const line = lineRef.current;
    if (!track || !dots || !bot || !line) return undefined;

    const segments = [];
    let items = [];
    let trackWidth = 0;
    let lastY = window.scrollY;
    let idleTimer = 0;
    let scrollFrame = 0;
    let layoutTimer = 0;
    const gap = 24;

    function layout() {
      trackWidth = track.clientWidth;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const navHeight = track.closest('.nav')?.offsetHeight || 0;
      items = Array.from(document.querySelectorAll('[data-munch]')).map((section) => {
        const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        const progress = Math.max(0, Math.min(1, top / maxScroll));
        return {
          id: section.id || section.getAttribute('data-munch-id'),
          icon: section.getAttribute('data-munch'),
          label: section.getAttribute('data-munch-label') || '',
          x: Math.round(progress * trackWidth),
          eaten: false,
          element: null,
        };
      });

      const fragment = document.createDocumentFragment();
      segments.length = 0;
      dots.replaceChildren();
      const count = Math.max(4, Math.floor(trackWidth / gap));
      for (let index = 0; index < count; index += 1) {
        const x = index * gap + gap / 2;
        if (items.some((item) => Math.abs(item.x - x) < 12)) continue;
        const element = document.createElement('i');
        element.className = 'munch__seg';
        element.style.left = `${x}px`;
        fragment.appendChild(element);
        segments.push({ element, x, eaten: false });
      }

      items.forEach((item) => {
        const element = document.createElement('span');
        element.className = 'munch__item';
        element.style.left = `${item.x}px`;
        fragment.appendChild(element);
        item.element = element;
      });
      dots.appendChild(fragment);
      update(true);
    }

    function update(silent = false) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0;
      const x = progress * trackWidth;
      bot.style.transform = `translateX(${x.toFixed(1)}px)`;
      line.style.width = `${x.toFixed(1)}px`;

      if (!silent) {
        bot.classList.toggle('is-left', window.scrollY < lastY);
        bot.classList.add('is-moving');
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => bot.classList.remove('is-moving'), 200);
      }
      lastY = window.scrollY;

      segments.forEach((segment) => {
        const eaten = segment.x < x + 3;
        if (eaten === segment.eaten) return;
        segment.eaten = eaten;
        segment.element.classList.toggle('is-eaten', eaten);
      });
      items.forEach((item) => {
        const eaten = item.x <= x + 4;
        if (eaten === item.eaten) return;
        item.eaten = eaten;
        item.element.classList.toggle('is-eaten', eaten);
      });
    }

    function onScroll() {
      scrollFrame = 0;
      update();
    }

    function requestScrollUpdate() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(onScroll);
    }

    function scheduleLayout() {
      window.clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(layout, 180);
    }

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(scheduleLayout) : null;
    resizeObserver?.observe(document.body);
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('load', scheduleLayout);
    layout();
    requestScrollUpdate();

    return () => {
      window.removeEventListener('scroll', requestScrollUpdate);
      window.removeEventListener('resize', scheduleLayout);
      window.removeEventListener('load', scheduleLayout);
      window.clearTimeout(layoutTimer);
      window.clearTimeout(idleTimer);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      resizeObserver?.disconnect();
      dots.replaceChildren();
    };
  }, []);

  return (
    <div className="munch" aria-hidden="true">
      <div className="munch__track" ref={trackRef}>
        <span className="munch__line" ref={lineRef} />
        <div className="munch__dots" ref={dotsRef} />
        <span className="munch__bot" ref={botRef}>
          <PixelMascot rows={bit.shut} className="m-c" />
          <PixelMascot rows={bit.open} className="m-o" />
        </span>
      </div>
    </div>
  );
}

export function HomeHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  const homePageRef = useRef(null);

  useEffect(() => {
    const homePage = homePageRef.current?.closest('.home-page');
    if (!homePage) return undefined;
    const oldOverflow = document.body.style.overflow;
    homePage.classList.toggle('menu-open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : oldOverflow;
    if (menuOpen) menuRef.current?.querySelector('a')?.focus();
    return () => {
      homePage.classList.remove('menu-open');
      document.body.style.overflow = oldOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
      if (event.key !== 'Tab' || !menuRef.current) return;
      const focusable = [
        ...menuRef.current.querySelectorAll('a[href]'),
        burgerRef.current,
      ].filter(Boolean);
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        focusable.at(-1)?.focus();
      } else if (!event.shiftKey && index === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    }

    function onResize() {
      if (window.innerWidth > 1100) setMenuOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const links = homeNavigation.links.map(({ key, label, href }) => {
    const path = href.split('#')[0] || '/';
    const active = location === path && (path !== '/' || href === '/');
    return (
      <li key={key}>
        <Link href={href} className="nav__link" aria-current={active ? 'page' : undefined}>
          {label}
        </Link>
      </li>
    );
  });
  const mobileLinks = homeNavigation.links.map(({ key, label, href }, index) => {
    const path = href.split('#')[0] || '/';
    const active = location === path && (path !== '/' || href === '/');
    return (
      <li key={key}>
        <Link href={href} className="mmenu__link" aria-current={active ? 'page' : undefined} onClick={closeMenu}>
          <span>0{index + 1}</span>{label}
        </Link>
      </li>
    );
  });

  return (
    <>
      <header className="nav" id="site-nav" ref={homePageRef}>
        <div className="container nav__in">
          <Link href="/" className="brand" aria-label="PROCOM’27 home" onClick={closeMenu}>
            <BrandMark />
            <span className="brand__word">PROCOM’27</span>
          </Link>
          <nav aria-label="Primary">
            <ul className="nav__links">{links}</ul>
          </nav>
          <div className="nav__actions">
            <Countdown />
            <Link href="/register" className="btn btn--register btn--sm" onClick={closeMenu}>
              <Icon name="square" />Register<Icon name="arrow" />
            </Link>
            <button
              ref={burgerRef}
              className="icon-btn nav__burger"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
        <MunchBar />
      </header>
        <div
          ref={menuRef}
          className="mmenu"
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onClick={(event) => {
            if (event.target.closest('a') && !event.target.closest('a').hasAttribute('data-demo')) closeMenu();
          }}
        >
          <ul>
            {mobileLinks}
            <li><Link className="mmenu__link" href={homeNavigation.contact.href} onClick={closeMenu}><span>06</span>Contact</Link></li>
          </ul>
          <Link href="/register" className="btn btn--register" onClick={closeMenu}>
            <Icon name="square" />Register for PROCOM’27<Icon name="arrow" />
          </Link>
        </div>
        <div className="demo-bar" role="note">
          <div className="container">
            <span className="tag tag--accent"><Icon name="info" />{homeEvent.demoNotice.label}</span>
            <span>
              {homeEvent.demoNotice.message}{' '}
              <span className="tbc">{homeEvent.demoNotice.placeholder}</span>{' '}
              {homeEvent.demoNotice.ending}
            </span>
          </div>
        </div>
    </>
  );
}
