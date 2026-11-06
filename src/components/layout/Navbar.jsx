// Shared arcade navbar, registration countdown, mobile menu, and scroll muncher.
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { navbarContent } from "../../data/navigation.js";
import "../../styles/navbar.css";

const mascot = {
  shut: [
    ".....B.......",
    ".....B.......",
    ".##########..",
    "############.",
    "#######wk###.",
    "#######wk###.",
    "############.",
    "#######www##.",
    "############.",
    "############.",
    ".##########..",
    ".##.....##...",
  ],
  open: [
    ".....B.......",
    ".....B.......",
    ".##########..",
    "############.",
    "#######wk###.",
    "#######wk###.",
    "#######w.w.w.",
    "#######......",
    "#######.w.w..",
    "############.",
    ".##########..",
    ".##.....##...",
  ],
};
const mascotColors = {
  "#": "#B57CFF",
  B: "#DCC8FF",
  w: "#F5F0FA",
  k: "#07060B",
};
const markerPaths = {
  ticket: "M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z M14 7v10",
  trophy:
    "M7 4h10v5a5 5 0 0 1-10 0z M7 6H3v2a4 4 0 0 0 4 4m10-6h4v2a4 4 0 0 1-4 4M12 14v4M8 21h8M9 18h6",
  play: "M8 5v14l11-7z",
  flag: "M5 21V4h12l-2 4 2 4H5",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m12 10v-2a4 4 0 0 0-3-3.87m-1-12.13a4 4 0 0 1 0 7.75",
  calendar: "M4 5h16v16H4z M8 3v4m8-4v4M4 10h16",
  signal: "M3 20h3v-5H3zm5 0h3V10H8zm5 0h3V6h-3zm5 0h3V3h-3z",
  check: "M4 12l5 5L20 6",
};
const markerIcons = {
  calendar: "calendar",
  check: "check",
  flag: "flag",
  play: "play",
  signal: "signal",
  ticket: "ticket",
  trophy: "trophy",
  users: "users",
};
const registrationDeadline = Date.parse(navbarContent.registrationDeadline);

function getCountdown() {
  const milliseconds = registrationDeadline - Date.now();
  if (!Number.isFinite(registrationDeadline)) {
    return { remaining: null, closed: false };
  }
  if (milliseconds <= 0) return { remaining: null, closed: true };

  return {
    closed: false,
    remaining: {
      days: Math.floor(milliseconds / 86400000),
      hours: Math.floor(milliseconds / 3600000) % 24,
    },
  };
}

function InlineIcon({ name, className = "" }) {
  const paths = {
    clock: (
      <>
        <rect x="3" y="3" width="18" height="18" />
        <path d="M12 7v5l3 3" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h12" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    square: <rect x="6" y="6" width="12" height="12" fill="currentColor" />,
    arrow: <path d="M3 12h16m-6-6 6 6-6 6" />,
  };
  return (
    <svg
      className={`nav-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill={name === "square" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 186 251" aria-hidden="true">
      <defs>
        <linearGradient id="procom-brand-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCC8FF" />
          <stop offset="1" stopColor="#B57CFF" />
        </linearGradient>
      </defs>
      <path
        d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z"
        fill="#493460"
      />
      <path
        d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z"
        fill="url(#procom-brand-gradient)"
      />
    </svg>
  );
}

function PixelMascot({ pattern, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 13 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {pattern.flatMap((row, y) =>
        Array.from(row, (pixel, x) =>
          pixel === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={mascotColors[pixel] || "#B57CFF"}
            />
          ),
        ),
      )}
    </svg>
  );
}

function Countdown() {
  const [countdown, setCountdown] = useState(getCountdown);
  const { remaining, closed } = countdown;

  useEffect(() => {
    const interval = window.setInterval(
      () => setCountdown(getCountdown()),
      30000,
    );
    return () => window.clearInterval(interval);
  }, []);

  const label = closed
    ? "Registration"
    : navbarContent.countdownLabel || "Reg closes in";
  const value = closed
    ? "Closed"
    : remaining
      ? `${remaining.days} days and ${remaining.hours} hours`
      : "TBA";
  const ariaLabel = closed
    ? "Registration closed"
    : remaining
      ? `Registration closes in ${value}`
      : "Registration deadline to be announced";

  return (
    <Link
      className={`navcd${closed ? " is-closed" : ""}`}
      to="/#play"
      aria-label={ariaLabel}
      title={`Registration deadline: ${new Date(registrationDeadline).toLocaleString()}`}
    >
      <InlineIcon name="clock" />
      <span className="navcd__txt">
        <span className="navcd__lbl">{label}</span>
        <span className="navcd__v" aria-hidden="true">
          {remaining ? (
            <>
              <b>{remaining.days}</b>D<i>:</i>
              <b>{String(remaining.hours).padStart(2, "0")}</b>H
            </>
          ) : (
            value
          )}
        </span>
      </span>
    </Link>
  );
}

function MunchBar() {
  const trackRef = useRef(null);
  const dotsRef = useRef(null);
  const botRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const track = trackRef.current;
    const dots = dotsRef.current;
    const bot = botRef.current;
    if (!track || !dots || !bot) return undefined;

    const gap = 10;
    const segments = [];
    let items = [];
    let trackWidth = 0;
    let lastY = window.scrollY;
    let idleTimer = 0;
    let scrollFrame = 0;
    let layoutTimer = 0;

    function layout() {
      trackWidth = track.clientWidth;
      const documentHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const navHeight =
        document.querySelector(".nav")?.getBoundingClientRect().height || 0;
      items = Array.from(document.querySelectorAll("[data-munch]")).map(
        (section) => {
          const top =
            section.getBoundingClientRect().top +
            window.scrollY -
            navHeight -
            8;
          const progress = Math.max(0, Math.min(1, top / documentHeight));
          return {
            id: section.id || section.getAttribute("data-munch-id"),
            icon: section.getAttribute("data-munch"),
            label: section.getAttribute("data-munch-label") || "",
            x: Math.round(progress * trackWidth),
            eaten: false,
            element: null,
          };
        },
      );

      dots.replaceChildren();
      segments.length = 0;
      const segmentCount = Math.max(4, Math.floor(trackWidth / gap));
      for (let index = 0; index < segmentCount; index += 1) {
        const x = index * gap + 2;
        if (items.some((item) => Math.abs(item.x - x) < 11)) continue;
        const element = document.createElement("i");
        element.className = "munch__seg";
        element.style.left = `${x}px`;
        dots.appendChild(element);
        segments.push({ element, x, eaten: false });
      }

      items.forEach((item) => {
        const element = document.createElement("span");
        element.className = "munch__item";
        element.style.left = `${item.x}px`;
        element.setAttribute("aria-label", item.label);
        const icon = document.createElement("svg");
        icon.classList.add("nav-marker-icon");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("aria-hidden", "true");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute(
          "d",
          markerPaths[markerIcons[item.icon]] || markerPaths.flag,
        );
        icon.appendChild(path);
        element.appendChild(icon);
        dots.appendChild(element);
        item.element = element;
      });

      update(true);
    }

    function update(silent = false) {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        maxScroll > 0
          ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
          : 0;
      const x = progress * trackWidth;
      bot.style.transform = `translateX(${x.toFixed(1)}px)`;

      if (!silent) {
        bot.classList.toggle("is-left", window.scrollY < lastY);
        bot.classList.add("is-moving");
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(
          () => bot.classList.remove("is-moving"),
          200,
        );
      }
      lastY = window.scrollY;

      segments.forEach((segment) => {
        const eaten = segment.x < x + 3;
        if (eaten === segment.eaten) return;
        segment.eaten = eaten;
        segment.element.classList.toggle("is-eaten", eaten);
      });
      items.forEach((item) => {
        const eaten = item.x <= x + 4;
        if (eaten === item.eaten) return;
        item.eaten = eaten;
        item.element.classList.toggle("is-eaten", eaten);
      });
    }

    function onScroll() {
      scrollFrame = 0;
      update();
    }

    function requestScrollUpdate() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(onScroll);
    }

    function scheduleLayout() {
      window.clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(layout, 180);
    }

    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(scheduleLayout) : null;
    resizeObserver?.observe(document.body);
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleLayout);
    window.addEventListener("load", scheduleLayout);
    layout();
    requestScrollUpdate();

    return () => {
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("resize", scheduleLayout);
      window.removeEventListener("load", scheduleLayout);
      window.clearTimeout(layoutTimer);
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(scrollFrame);
      resizeObserver?.disconnect();
      dots.replaceChildren();
    };
  }, [location.pathname, location.search]);

  return (
    <div className="munch" aria-hidden="true">
      <span className="munch__lbl">HP</span>
      <div className="munch__track" ref={trackRef}>
        <div className="munch__dots" ref={dotsRef} />
        <span className="munch__bot" ref={botRef}>
          <PixelMascot pattern={mascot.shut} className="m-c" />
          <PixelMascot pattern={mascot.open} className="m-o" />
        </span>
      </div>
    </div>
  );
}

function NavigationLinks({ onNavigate, mobile = false }) {
  return navbarContent.links.map(({ label, to }, index) => (
    <li key={to}>
      <NavLink
        to={to}
        end={to === "/"}
        onClick={onNavigate}
        className={mobile ? "mmenu__link" : "nav__link"}
      >
        {mobile && <span>0{index + 1}</span>}
        {label}
      </NavLink>
    </li>
  ));
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  const menuRef = useRef(null);
  function closeMenu() {
    setMenuOpen(false);
  }

  // Match the reference menu's escape, focus loop, and page-scroll lock.
  useEffect(() => {
    document.body.classList.toggle("is-locked", menuOpen);
    if (menuOpen) menuRef.current?.querySelector("a")?.focus();
    return () => document.body.classList.remove("is-locked");
  }, [menuOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!menuOpen) return;
      if (event.key === "Escape") {
        closeMenu();
        burgerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;
      const focusable = [
        ...menuRef.current.querySelectorAll("a[href]"),
        burgerRef.current,
      ].filter(Boolean);
      const currentIndex = focusable.indexOf(document.activeElement);
      if (event.shiftKey && currentIndex <= 0) {
        event.preventDefault();
        focusable.at(-1)?.focus();
      } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    }

    function handleResize() {
      if (window.innerWidth > 1100) closeMenu();
    }

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  return (
    <header className="nav">
      <div className="nav__container nav__in">
        <Link
          to={navbarContent.brand.to}
          className="brand"
          aria-label="PROCOM’27 home"
          onClick={closeMenu}
        >
          <BrandMark />
          <span className="brand__word">
            {navbarContent.brand.label.replace("'", "’")}
          </span>
        </Link>

        <nav aria-label={navbarContent.navigationLabel}>
          <ul className="nav__links">
            <NavigationLinks />
          </ul>
        </nav>

        <div className="nav__actions">
          <Countdown />
          <Link
            to={navbarContent.register.to}
            className="btn btn--register btn--sm"
            onClick={closeMenu}
          >
            <InlineIcon name="square" />
            {navbarContent.register.label}
            <InlineIcon name="arrow" />
          </Link>
          <button
            ref={burgerRef}
            className="nav__burger"
            type="button"
            aria-expanded={menuOpen}
            aria-controls={navbarContent.menu.id}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <InlineIcon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      <MunchBar />

      <div
        ref={menuRef}
        className={`mmenu${menuOpen ? " is-open" : ""}`}
        id={navbarContent.menu.id}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <ul>
          <NavigationLinks mobile onNavigate={closeMenu} />
          <li>
            <NavLink to="/contact" onClick={closeMenu} className="mmenu__link">
              <span>06</span>
              Contact
            </NavLink>
          </li>
        </ul>
        <Link
          to={navbarContent.register.to}
          className="btn btn--register"
          onClick={closeMenu}
        >
          <InlineIcon name="square" />
          Register for PROCOM’27
          <InlineIcon name="arrow" />
        </Link>
      </div>
    </header>
  );
}
