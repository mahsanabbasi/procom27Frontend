import { useCallback, useEffect, useRef, useState } from "react";
import { useWhy } from "./useWhy.js";
import data from "./referenceData.js";
import { StickFigure } from "./Visuals.jsx";
import {
  MOVE_LABELS,
  MOVE_SUBTITLES,
  bossRounds,
  haulRows,
  registrationInfo,
} from "./lateLogic.js";

// All scheduled work belongs to its component and is cancelled on route departure.
function useTimers() {
  const timers = useRef(new Set());
  const mounted = useRef(true);
  useEffect(() => {
    const pending = timers.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);
  const schedule = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      if (mounted.current) fn();
    }, ms);
    timers.current.add(id);
    return id;
  }, []);
  const wait = useCallback(
    (ms) => new Promise((resolve) => schedule(resolve, ms)),
    [schedule],
  );
  return { schedule, wait, mounted };
}
function useOnceVisible(ref, motion, threshold) {
  const [seen, setSeen] = useState(!motion);
  useEffect(() => {
    if (seen || !ref.current) return;
    if (!motion || !("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setSeen(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, motion, threshold, seen]);
  return seen;
}
function unavailable(event, notice, label) {
  event.preventDefault();
  notice(label + " is not available yet.");
}

const CAR = [
  "....########....",
  "...#wwwwwwww#...",
  "..##wwwwwwww##..",
  ".##############.",
  "################",
  "#RR##########RR#",
  "#RR###kkkk###RR#",
  "################",
  ".dd..........dd.",
  ".dd..........dd.",
];
const CAR_COLORS = {
  "#": "#B57CFF",
  w: "#3C2B52",
  R: "#F5F0FA",
  k: "#07060B",
  d: "#07060B",
};
function Car() {
  return (
    <svg
      className="car__px"
      viewBox="0 0 16 10"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {CAR.flatMap((row, y) =>
        [...row].flatMap((pixel, x) =>
          pixel === "."
            ? []
            : [
                <rect
                  key={y + "-" + x}
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill={CAR_COLORS[pixel]}
                />,
              ],
        ),
      )}
    </svg>
  );
}

export function Careers() {
  const { notice, sound } = useWhy();
  const [route, setRoute] = useState(null);
  const jobFair = (data.sessions || []).find((s) => s.id === "job-fair");
  function pick(key, audible = false) {
    if (key === route) return;
    setRoute(key);
    if (audible) sound?.("press");
  }
  return (
    <section
      className="section section--alt"
      id="opportunities"
      aria-labelledby="op-title"
      data-munch="pin"
      data-munch-label="Careers"
    >
      <div className="container">
        <header className="sh" data-reveal="">
          <div>
            <p className="sh__label t-label">
              <i className="i i-square" aria-hidden="true"></i>04 / Careers
            </p>
            <h2 className="sh__title t-d2" id="op-title">
              <span className="ln" style={{ "--l": "0" }}>
                <span>Explore career</span>
              </span>
              <span className="ln" style={{ "--l": "1" }}>
                <span className="t-soft">opportunities.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            PROCOM has two different career options: the Job Fair and Job Orbit.
            Here’s how they are different.
          </p>
        </header>
        <div
          className="race"
          id="race"
          data-reveal=""
          data-route={route || undefined}
        >
          <div className="race__hud t-label" aria-hidden="true">
            <span>Route select</span>
            <span className="race__st" id="raceSt">
              {route === "fair"
                ? "Route A · Job Fair"
                : route === "orbit"
                  ? "Route B · Job Orbit"
                  : "2 routes · take both"}
            </span>
          </div>
          <div className="race__view">
            <svg
              className="race__svg"
              viewBox="0 0 800 340"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#07060B" />
                  <stop offset="1" stopColor="#1A1226" />
                </linearGradient>
              </defs>
              <rect width="800" height="112" fill="url(#rsky)" />
              <g fill="#3C2B52" shapeRendering="crispEdges">
                <rect x="64" y="22" width="3" height="3" />
                <rect x="190" y="48" width="2" height="2" />
                <rect x="300" y="18" width="3" height="3" />
                <rect x="520" y="34" width="2" height="2" />
                <rect x="640" y="14" width="3" height="3" />
                <rect x="742" y="52" width="2" height="2" />
                <rect x="452" y="60" width="2" height="2" />
              </g>
              <g
                className="race__city"
                fill="#100C16"
                shapeRendering="crispEdges"
              >
                <path d="M0 112V88h40v-14h28v22h36V70h22v14h40v28zM170 112V92h30V66h26v18h34v-8h22v36zM470 112V80h24v-16h30v26h40V74h20v38zM600 112V90h44V68h22v16h38v-10h26v38h70v-8h0v8z" />
              </g>
              <g fill="#3C2B52" shapeRendering="crispEdges">
                <rect x="112" y="76" width="4" height="4" />
                <rect x="120" y="86" width="4" height="4" />
                <rect x="206" y="72" width="4" height="4" />
                <rect x="530" y="80" width="4" height="4" />
                <rect x="652" y="76" width="4" height="4" />
                <rect x="660" y="86" width="4" height="4" />
              </g>
              <rect y="112" width="800" height="228" fill="#0B0910" />
              <line
                x1="0"
                y1="112"
                x2="800"
                y2="112"
                stroke="#493460"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <path d="M150 340 L650 340 L438 214 L362 214 Z" fill="#17111F" />
              <path d="M356 216 L404 216 L196 112 L182 112 Z" fill="#17111F" />
              <path d="M396 216 L444 216 L618 112 L604 112 Z" fill="#17111F" />
              <g
                fill="none"
                stroke="#5B4277"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              >
                <path d="M150 340 L362 214 L182 112" />
                <path d="M650 340 L438 214 L618 112" />
                <path d="M404 216 L400 220 L396 216 M404 216 L196 112 M396 216 L604 112" />
              </g>
              <g
                className="race__lane"
                fill="none"
                stroke="#DCC8FF"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="12 14"
              >
                <path d="M400 214 L400 340" />
                <path d="M189 112 L380 214" />
                <path d="M611 112 L420 214" />
              </g>
              <g className="race__arrow race__arrow--l" fill="#B57CFF">
                <path d="M300 176 l-22 -4 l10 -10z" />
              </g>
              <g className="race__arrow race__arrow--r" fill="#B57CFF">
                <path d="M500 176 l22 -4 l-10 -10z" />
              </g>
            </svg>
            <button
              className={"rsign rsign--l" + (route === "fair" ? " is-on" : "")}
              aria-pressed={route === "fair"}
              onClick={() => pick("fair", true)}
              type="button"
              data-route="fair"
              aria-controls="route-fair"
            >
              <span className="rsign__ar" aria-hidden="true">
                <i className="i i-arrow-left"></i>
              </span>
              <span>
                <b>Job Fair</b>
                <small>In person</small>
              </span>
            </button>
            <button
              className={"rsign rsign--r" + (route === "orbit" ? " is-on" : "")}
              aria-pressed={route === "orbit"}
              onClick={() => pick("orbit", true)}
              type="button"
              data-route="orbit"
              aria-controls="route-orbit"
            >
              <span>
                <b>Job Orbit</b>
                <small>Browse</small>
              </span>
              <span className="rsign__ar" aria-hidden="true">
                <i className="i i-arrow-ne"></i>
              </span>
            </button>
            <div className="car" id="raceCar" aria-hidden="true">
              <Car />
            </div>
          </div>
        </div>
        <div className="routes">
          <article
            className={"route" + (route === "fair" ? " is-on" : "")}
            onPointerEnter={() => {
              if (matchMedia("(hover:hover) and (pointer:fine)").matches)
                pick("fair");
            }}
            onFocus={() => pick("fair")}
            id="route-fair"
            data-route="fair"
            data-reveal=""
            aria-labelledby="jf-title"
          >
            <span className="tag tag--accent">
              <i className="i i-square" aria-hidden="true"></i>Route A · Job
              Fair · In person
            </span>
            <h3 className="route__big t-expressive t-extrude" id="jf-title">
              <span>Job</span> <span className="t-soft">Fair</span>
            </h3>
            <p>
              Meet companies face to face on campus. Bring your CV, ask
              questions, and find out what roles they are looking to fill.
            </p>
            <ul className="route__facts" data-jobfair="">
              {jobFair && (
                <>
                  <li>
                    <span>When</span>
                    <b>
                      Day {jobFair.day} · {jobFair.time}
                    </b>
                  </li>
                  {jobFair.venue && (
                    <li>
                      <span>Where</span>
                      <b>{jobFair.venue}</b>
                    </li>
                  )}
                </>
              )}
              <li>
                <span>Bring</span>
                <b>Your CV</b>
              </li>
            </ul>
            <a
              className="btn btn--primary"
              href="/job-fair"
              onClick={(e) => unavailable(e, notice, "The Job Fair page")}
              data-demo=""
            >
              <i className="i i-play" aria-hidden="true"></i>About the Job Fair
              <i className="i i-arrow" aria-hidden="true"></i>
            </a>
          </article>
          <p className="routes__or t-label" aria-hidden="true">
            <span>Two separate options</span>
            <span>Take both</span>
          </p>
          <article
            className={
              "route route--orbit" + (route === "orbit" ? " is-on" : "")
            }
            onPointerEnter={() => {
              if (matchMedia("(hover:hover) and (pointer:fine)").matches)
                pick("orbit");
            }}
            onFocus={() => pick("orbit")}
            id="route-orbit"
            data-route="orbit"
            data-reveal=""
            aria-labelledby="jo-title"
          >
            <span className="tag tag--accent">
              <i className="i i-square" aria-hidden="true"></i>Route B · Job
              Orbit · Browse
            </span>
            <h3 className="route__big t-expressive t-extrude" id="jo-title">
              <span>Job</span> <span className="t-soft">Orbit</span>
            </h3>
            <p>
              A separate PROCOM page where you can browse career opportunities
              at your own pace and find ones that suit you.
            </p>
            <ul className="route__facts">
              <li>
                <span>Where</span>
                <b>Its own PROCOM page</b>
              </li>
              <li>
                <span>Pace</span>
                <b>Your own</b>
              </li>
            </ul>
            <a
              className="btn btn--secondary"
              href="/job-orbit"
              onClick={(e) => unavailable(e, notice, "Job Orbit")}
              data-demo=""
            >
              About Job Orbit<i className="i i-arrow" aria-hidden="true"></i>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export function Ideas() {
  const { motion, notice, sound } = useWhy();
  const machine = useRef(null),
    busy = useRef(false),
    started = useRef(false);
  const [count, setCount] = useState(0),
    [down, setDown] = useState(false);
  const { schedule } = useTimers();
  const seen = useOnceVisible(machine, motion, 0.3);
  const print = useCallback(() => {
    if (busy.current) return;
    if (!motion) {
      setCount(4);
      return;
    }
    busy.current = true;
    setDown(true);
    schedule(() => setDown(false), 140);
    setCount(0);
    let n = 0;
    const next = () => {
      if (n >= 4) {
        busy.current = false;
        return;
      }
      setCount(++n);
      sound?.("coin");
      schedule(next, 430);
    };
    schedule(next, 260);
  }, [motion, schedule, sound]);
  useEffect(() => {
    if (seen && !started.current) {
      started.current = true;
      print();
    }
  }, [seen, print]);
  function ticketTime(kind, networking) {
    const days = [
      ...new Set(
        (data.sessions || []).filter((s) => s.type === kind).map((s) => s.day),
      ),
    ].sort();
    return days.length ? (
      <>
        <b>{days.map((d) => "Day " + d).join(" · ")}</b>
        <br />
        See schedule
      </>
    ) : networking ? (
      "Between sessions"
    ) : (
      "Time: see schedule"
    );
  }
  return (
    <section
      className="section"
      id="ideas"
      aria-labelledby="id-title"
      data-munch="ticket"
      data-munch-label="Talks &amp; workshops"
    >
      <div className="container">
        <header className="sh" data-reveal="">
          <div>
            <p className="sh__label t-label">
              <i className="i i-square" aria-hidden="true"></i>05 / Talks &amp;
              workshops
            </p>
            <h2 className="sh__title t-d2" id="id-title">
              <span className="ln" style={{ "--l": "0" }}>
                <span>Learn something</span>
              </span>
              <span className="ln" style={{ "--l": "1" }}>
                <span className="t-soft">new.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            Learn from people who work in the field. Session times will be on
            the schedule.
          </p>
        </header>
        <div
          className={"tdisp" + (motion ? " tdisp--armed" : "")}
          ref={machine}
          id="tdisp"
          data-reveal="fade"
        >
          <div className="tm">
            <p className="tm__top t-label" aria-hidden="true">
              Ticket machine
            </p>
            <div className="tm__screen" aria-hidden="true">
              <span className="t-label">Tickets</span>
              <b id="tmCount">{String(motion ? count : 4).padStart(3, "0")}</b>
            </div>
            <button
              className={"tm__btn" + (down ? " is-down" : "")}
              onClick={() => {
                sound?.("press");
                print();
              }}
              id="tmBtn"
              type="button"
              aria-label="Print the tickets again"
            >
              <span aria-hidden="true">Print</span>
            </button>
            <p className="tm__lbl t-label" aria-hidden="true">
              1 press · 4 tickets
            </p>
            <div className="tm__slot" aria-hidden="true">
              <i></i>
            </div>
          </div>
          <div
            className="tstrip"
            id="tstrip"
            role="region"
            aria-label="Session tickets"
            tabIndex={0}
          >
            <article
              className={"tk" + (!motion || count > 0 ? " is-out" : "")}
              style={{ "--n": "0" }}
              data-type="Panel"
            >
              <div className="tk__top">
                <div className="tk__row t-label">
                  <span>Admit one</span>
                  <b>01</b>
                </div>
                <div className="tk__art" aria-hidden="true">
                  <svg viewBox="0 0 120 92" fill="none">
                    <rect
                      x="6"
                      y="20"
                      width="48"
                      height="30"
                      stroke="#DCC8FF"
                      strokeWidth="2"
                    />
                    <path d="M14 50v10l10-10" fill="#DCC8FF" />
                    <rect x="60" y="34" width="54" height="30" fill="#B57CFF" />
                    <path d="M104 64v10l-10-10" fill="#B57CFF" />
                    <rect x="16" y="31" width="6" height="6" fill="#DCC8FF" />
                    <rect x="27" y="31" width="6" height="6" fill="#DCC8FF" />
                    <rect x="38" y="31" width="6" height="6" fill="#DCC8FF" />
                  </svg>
                </div>
                <h3>Panel Discussions</h3>
                <p>
                  Experts discuss tech and careers. You can listen and ask
                  questions.
                </p>
              </div>
              <div className="tk__perf" aria-hidden="true"></div>
              <div className="tk__stub">
                <span className="t-label tk__when">
                  {ticketTime("Panel", false)}
                </span>
                <span className="bar" aria-hidden="true"></span>
              </div>
            </article>
            <article
              className={"tk" + (!motion || count > 1 ? " is-out" : "")}
              style={{ "--n": "1" }}
              data-type="Workshop"
            >
              <div className="tk__top">
                <div className="tk__row t-label">
                  <span>Admit one</span>
                  <b>02</b>
                </div>
                <div className="tk__art" aria-hidden="true">
                  <svg viewBox="0 0 120 92" fill="none">
                    <path
                      d="M30 24 10 46l20 22M90 24l20 22-20 22"
                      stroke="#DCC8FF"
                      strokeWidth="3"
                    />
                    <rect x="52" y="38" width="16" height="16" fill="#B57CFF" />
                  </svg>
                </div>
                <h3>Workshops</h3>
                <p>Hands-on sessions where you build something as you learn.</p>
              </div>
              <div className="tk__perf" aria-hidden="true"></div>
              <div className="tk__stub">
                <span className="t-label tk__when">
                  {ticketTime("Workshop", false)}
                </span>
                <span className="bar" aria-hidden="true"></span>
              </div>
            </article>
            <article
              className={"tk" + (!motion || count > 2 ? " is-out" : "")}
              style={{ "--n": "2" }}
              data-type="Talk"
            >
              <div className="tk__top">
                <div className="tk__row t-label">
                  <span>Admit one</span>
                  <b>03</b>
                </div>
                <div className="tk__art" aria-hidden="true">
                  <svg
                    viewBox="0 0 120 92"
                    fill="none"
                    shapeRendering="crispEdges"
                  >
                    <rect x="50" y="10" width="20" height="40" fill="#B57CFF" />
                    <rect x="40" y="40" width="40" height="6" fill="#493460" />
                    <rect x="58" y="50" width="4" height="22" fill="#DCC8FF" />
                    <rect x="44" y="72" width="32" height="6" fill="#DCC8FF" />
                    <rect x="88" y="20" width="4" height="10" fill="#DCC8FF" />
                    <rect x="96" y="14" width="4" height="22" fill="#DCC8FF" />
                    <rect x="28" y="20" width="4" height="10" fill="#DCC8FF" />
                    <rect x="20" y="14" width="4" height="22" fill="#DCC8FF" />
                  </svg>
                </div>
                <h3>Industry Talks</h3>
                <p>Short talks from people working in industry.</p>
              </div>
              <div className="tk__perf" aria-hidden="true"></div>
              <div className="tk__stub">
                <span className="t-label tk__when">
                  {ticketTime("Talk", false)}
                </span>
                <span className="bar" aria-hidden="true"></span>
              </div>
            </article>
            <article
              className={"tk" + (!motion || count > 3 ? " is-out" : "")}
              style={{ "--n": "3" }}
              data-type="Networking"
            >
              <div className="tk__top">
                <div className="tk__row t-label">
                  <span>Admit one</span>
                  <b>04</b>
                </div>
                <div className="tk__art" aria-hidden="true">
                  <svg viewBox="0 0 120 92" fill="none">
                    <path
                      d="M24 30 60 60 96 26M24 30 96 26M60 60 60 80"
                      stroke="#493460"
                      strokeWidth="2"
                    />
                    <rect x="16" y="22" width="16" height="16" fill="#DCC8FF" />
                    <rect x="88" y="18" width="16" height="16" fill="#DCC8FF" />
                    <rect x="52" y="52" width="16" height="16" fill="#B57CFF" />
                    <rect x="54" y="76" width="12" height="12" fill="#DCC8FF" />
                  </svg>
                </div>
                <h3>Networking</h3>
                <p>Meet students and professionals between sessions.</p>
              </div>
              <div className="tk__perf" aria-hidden="true"></div>
              <div className="tk__stub">
                <span className="t-label tk__when">
                  {ticketTime("Networking", true)}
                </span>
                <span className="bar" aria-hidden="true"></span>
              </div>
            </article>
          </div>
        </div>
        <div className="learn__foot" data-reveal="">
          <p>Check the schedule for dates, times and rooms.</p>
          <div className="btn-row">
            <a
              className="btn btn--primary"
              href="/panel-discussions"
              onClick={(e) => unavailable(e, notice, "Panel discussions")}
              data-demo=""
            >
              <i className="i i-play" aria-hidden="true"></i>See panel
              discussions<i className="i i-arrow" aria-hidden="true"></i>
            </a>
            <a className="btn btn--secondary" href="/#schedule" data-demo="">
              View schedule<i className="i i-arrow" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Bonus() {
  const { notice } = useWhy();
  return (
    <section
      className="section section--alt"
      id="beyond"
      aria-labelledby="by-title"
      data-munch="plus"
      data-munch-label="Bonus levels"
    >
      <div className="container">
        <header className="sh" data-reveal="">
          <div>
            <p className="sh__label t-label">
              <i className="i i-square" aria-hidden="true"></i>06 / More at
              PROCOM
            </p>
            <h2 className="sh__title t-d2" id="by-title">
              <span className="ln" style={{ "--l": "0" }}>
                <span>More to</span>
              </span>
              <span className="ln" style={{ "--l": "1" }}>
                <span className="t-soft">explore.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            A few other things you can check out. Bonus levels, unlocked for
            everyone.
          </p>
        </header>
        <nav
          className="bonus"
          aria-label="More PROCOM experiences"
          data-stagger=""
        >
          <a
            className="bl card card--interactive"
            href="/startup-showcase"
            onClick={(e) => unavailable(e, notice, "The Startup Showcase")}
            data-demo=""
            data-reveal=""
          >
            <span className="bl__hd">
              <span className="bl__n t-label">Bonus A</span>
              <span className="bl__lock" aria-hidden="true">
                <i className="bl__sh"></i>
                <i className="bl__bd"></i>
              </span>
            </span>
            <span className="bl__thumb" aria-hidden="true">
              <svg viewBox="0 0 300 210" fill="none">
                <g stroke="#493460">
                  <path d="M150 40 220 105 150 170 80 105Z" />
                  <path d="M150 62 198 105 150 148 102 105Z" />
                </g>
                <path
                  d="M30 180 H70 V160 H110 V140 H140 V105 H150"
                  stroke="#DCC8FF"
                  strokeWidth="2"
                />
                <path d="M150 88 167 105 150 122 133 105Z" fill="#B57CFF" />
                <rect x="66" y="156" width="8" height="8" fill="#B57CFF" />
                <rect x="106" y="136" width="8" height="8" fill="#B57CFF" />
              </svg>
            </span>
            <span className="bl__t">Startup Showcase</span>
            <span className="bl__d">
              See new startup ideas and the people working on them.
            </span>
            <span className="bl__go t-label">
              Enter<i className="i i-arrow" aria-hidden="true"></i>
            </span>
          </a>
          <a
            className="bl card card--interactive"
            href="/ambassadors"
            onClick={(e) => unavailable(e, notice, "The Ambassadors page")}
            data-reveal=""
          >
            <span className="bl__hd">
              <span className="bl__n t-label">Bonus B</span>
              <span className="bl__lock" aria-hidden="true">
                <i className="bl__sh"></i>
                <i className="bl__bd"></i>
              </span>
            </span>
            <span className="bl__thumb" aria-hidden="true">
              <svg viewBox="0 0 300 210" fill="none">
                <rect
                  x="40"
                  y="46"
                  width="92"
                  height="50"
                  stroke="#DCC8FF"
                  strokeWidth="2"
                />
                <path d="M54 96v16l16-16" fill="#DCC8FF" />
                <rect x="150" y="80" width="110" height="56" fill="#B57CFF" />
                <path d="M240 136v16l-16-16" fill="#B57CFF" />
                <g fill="#DCC8FF">
                  <rect x="56" y="66" width="8" height="8" />
                  <rect x="72" y="66" width="8" height="8" />
                  <rect x="88" y="66" width="8" height="8" />
                </g>
              </svg>
            </span>
            <span className="bl__t">Ambassadors</span>
            <span className="bl__d">
              Students who share PROCOM news at their universities.
            </span>
            <span className="bl__go t-label">
              Enter<i className="i i-arrow" aria-hidden="true"></i>
            </span>
          </a>
          <a
            className="bl card card--interactive"
            href="/campus-map"
            onClick={(e) => unavailable(e, notice, "The Campus Map")}
            data-demo=""
            data-reveal=""
          >
            <span className="bl__hd">
              <span className="bl__n t-label">Bonus C</span>
              <span className="bl__lock" aria-hidden="true">
                <i className="bl__sh"></i>
                <i className="bl__bd"></i>
              </span>
            </span>
            <span className="bl__thumb" aria-hidden="true">
              <svg viewBox="0 0 300 210" fill="none">
                <g stroke="#493460">
                  <path d="M30 30 H270 V180 H30Z" />
                  <path d="M30 80 H140 M180 80 H270 M140 30 V130 M180 80 V180 M30 130 H140" />
                </g>
                <path
                  d="M50 160 H160 V60 H240"
                  stroke="#DCC8FF"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <rect x="40" y="152" width="16" height="16" fill="#DCC8FF" />
                <rect x="232" y="44" width="20" height="20" fill="#B57CFF" />
                <path d="M232 64 H252 L242 74Z" fill="#B57CFF" />
              </svg>
            </span>
            <span className="bl__t">Campus Map</span>
            <span className="bl__d">
              Find rooms, halls and activities on campus.
            </span>
            <span className="bl__go t-label">
              Enter<i className="i i-arrow" aria-hidden="true"></i>
            </span>
          </a>
          <a className="bl card card--interactive" href="/teams" data-reveal="">
            <span className="bl__hd">
              <span className="bl__n t-label">Bonus D</span>
              <span className="bl__lock" aria-hidden="true">
                <i className="bl__sh"></i>
                <i className="bl__bd"></i>
              </span>
            </span>
            <span className="bl__thumb" aria-hidden="true">
              <svg
                viewBox="0 0 300 210"
                fill="none"
                shapeRendering="crispEdges"
              >
                <g fill="#DCC8FF">
                  <rect x="118" y="44" width="14" height="14" />
                  <rect x="134" y="44" width="14" height="14" />
                  <rect x="150" y="44" width="14" height="14" />
                  <rect x="118" y="60" width="14" height="14" />
                  <rect x="166" y="60" width="14" height="14" />
                  <rect x="118" y="76" width="14" height="14" />
                  <rect x="134" y="92" width="14" height="14" />
                  <rect x="150" y="92" width="14" height="14" />
                  <rect x="118" y="92" width="14" height="14" />
                  <rect x="118" y="108" width="14" height="14" />
                  <rect x="118" y="124" width="14" height="14" />
                  <rect x="118" y="140" width="14" height="14" />
                  <rect x="166" y="76" width="14" height="14" />
                </g>
                <rect x="182" y="44" width="14" height="14" fill="#B57CFF" />
                <g fill="#493460">
                  <rect x="70" y="40" width="14" height="14" />
                  <rect x="216" y="150" width="14" height="14" />
                  <rect x="60" y="150" width="14" height="14" />
                </g>
              </svg>
            </span>
            <span className="bl__t">Our Teams</span>
            <span className="bl__d">
              Meet the student teams who organize PROCOM.
            </span>
            <span className="bl__go t-label">
              Enter<i className="i i-arrow" aria-hidden="true"></i>
            </span>
          </a>
        </nav>
      </div>
    </section>
  );
}

export function Boss() {
  const { motion, setState, sound, burst, quest } = useWhy();
  const [round, setRound] = useState(0),
    [hits, setHits] = useState(0),
    [used, setUsed] = useState([]),
    [locked, setLocked] = useState(false);
  const [throwing, setThrowing] = useState(false),
    [reaction, setReaction] = useState(""),
    [damage, setDamage] = useState(""),
    [damageKey, setDamageKey] = useState(0),
    [missed, setMissed] = useState(""),
    [flash, setFlash] = useState(false),
    [defeated, setDefeated] = useState(false),
    [won, setWon] = useState(false);
  const [text, setText] = useState(
    "The Excuse blocks your way. Pick a move below.",
  );
  const rounds = bossRounds(data);
  const battle = useRef(null),
    boss = useRef(null),
    you = useRef(null),
    shot = useRef(null),
    win = useRef(null),
    animation = useRef(null),
    lock = useRef(false),
    misses = useRef(0);
  const { schedule, wait, mounted } = useTimers();
  useEffect(() => () => animation.current?.cancel(), []);
  useEffect(() => {
    if (won) win.current?.querySelector(".btn")?.focus({ preventScroll: true });
  }, [won]);
  async function fire() {
    if (!motion || !shot.current?.animate) return;
    const a = battle.current
        .querySelector(".bt__arena")
        .getBoundingClientRect(),
      y = you.current.getBoundingClientRect(),
      b = boss.current.querySelector(".bt__bubble").getBoundingClientRect();
    const x0 = y.right - a.left - 4,
      y0 = y.top - a.top + 8,
      x1 = b.left - a.left + b.width * 0.35,
      y1 = b.top - a.top + b.height * 0.55;
    animation.current = shot.current.animate(
      [
        { transform: `translate(${x0}px,${y0}px) scale(.6)`, opacity: 1 },
        {
          transform: `translate(${(x0 + x1) / 2}px,${Math.min(y0, y1) - 40}px) scale(1)`,
          opacity: 1,
          offset: 0.5,
        },
        { transform: `translate(${x1}px,${y1}px) scale(1.2)`, opacity: 1 },
      ],
      { duration: 380, easing: "cubic-bezier(.4,0,.8,.6)" },
    );
    try {
      await animation.current.finished;
    } catch {
      /* Route departure cancels the projectile. */
    }
  }
  function pop(value) {
    setDamage(value);
    setDamageKey((n) => n + 1);
  }
  async function performMove(key) {
    if (lock.current || hits === 5 || used.includes(key)) return;
    lock.current = true;
    setLocked(true);
    setThrowing(true);
    sound?.("press");
    await fire();
    if (!mounted.current) return;
    setThrowing(false);
    const current = rounds[round],
      label = MOVE_LABELS[key];
    if (key === current.mv) {
      misses.current = 0;
      setUsed((list) => [...list, key]);
      const nextHits = hits + 1;
      setHits(nextHits);
      setFlash(true);
      schedule(() => setFlash(false), 1100);
      setReaction("hit");
      schedule(() => setReaction(""), 520);
      pop(nextHits === 5 ? "K.O." : "-1 HP");
      sound?.("drop");
      burst?.(boss.current?.querySelector(".bt__bubble"), {
        n: 12,
        spread: 70,
      });
      setText(
        <>
          <b>{label}!</b> {current.hit}
        </>,
      );
      if (nextHits === 5) {
        await wait(motion ? 1500 : 0);
        if (!mounted.current) return;
        setDefeated(true);
        burst?.(boss.current, { n: 34, spread: 170 });
        sound?.("win");
        setText(
          <>
            <b>The Excuse is defeated.</b> Nothing left between you and
            PROCOM’27.
          </>,
        );
        schedule(() => setWon(true), motion ? 500 : 0);
        setState((previous) => ({ ...previous, boss: true }));
        quest?.("boss", boss.current);
      } else {
        await wait(motion ? 1100 : 0);
        if (!mounted.current) return;
        setRound((value) => value + 1);
      }
    } else {
      misses.current++;
      setReaction("block");
      schedule(() => setReaction(""), 460);
      pop("Miss");
      sound?.("miss");
      setMissed(key);
      schedule(() => setMissed(""), 320);
      setText(
        <>
          <b>{label}</b> doesn’t answer that one. The Excuse shrugs it off.
          {misses.current >= 2 ? (
            <em> Hint: try {MOVE_LABELS[current.mv]}.</em>
          ) : (
            " Try another move."
          )}
        </>,
      );
    }
    lock.current = false;
    setLocked(false);
  }
  function reset() {
    setRound(0);
    setHits(0);
    setUsed([]);
    setWon(false);
    setDefeated(false);
    setReaction("");
    setDamage("");
    setMissed("");
    setFlash(false);
    misses.current = 0;
    setText("The Excuse is back for a rematch. Pick a move below.");
    battle.current?.querySelector(".mv")?.focus();
  }
  return (
    <section
      className="section"
      id="boss"
      aria-labelledby="boss-title"
      data-munch="alert"
      data-munch-label="Final boss"
    >
      <div className="container">
        <header className="sh" data-reveal="">
          <div>
            <p className="sh__label t-label">
              <i className="i i-square" aria-hidden="true"></i>07 / Still not
              sure?
            </p>
            <h2 className="sh__title t-d2" id="boss-title">
              <span className="ln" style={{ "--l": "0" }}>
                <span>Beat the</span>
              </span>
              <span className="ln" style={{ "--l": "1" }}>
                <span className="t-soft">final boss.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            The last thing between you and PROCOM’27 is your list of reasons not
            to go. Pick the move that answers each one.
          </p>
        </header>
        <div className="battle" ref={battle} id="battle" data-reveal="">
          <div className="bt__top" inert={won}>
            <p className="bt__name">
              <span className="t-label">Boss</span>
              <b>The Excuse</b>
            </p>
            <div
              className="bt__hp"
              id="btHp"
              role="meter"
              aria-label="Boss health"
              aria-valuemin="0"
              aria-valuemax="5"
              aria-valuenow={5 - hits}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <i
                  key={i}
                  className={
                    (i >= 5 - hits ? "is-gone" : "") +
                    (i === 5 - hits && flash ? " is-flash" : "")
                  }
                />
              ))}
            </div>
            <p className="bt__round t-label">
              Round <b id="btRound">{Math.min(round + 1, 5)}</b>/5
            </p>
          </div>
          <div className="bt__arena" inert={won}>
            <div
              className={"bt__you sfig" + (throwing ? " is-throw" : "")}
              ref={you}
              id="btYou"
              aria-hidden="true"
            >
              <StickFigure />
            </div>
            <div
              className={
                "bt__boss" +
                (defeated ? " is-gone" : "") +
                (reaction ? " is-" + reaction : "")
              }
              style={{ "--s": (1 - round * 0.05).toFixed(2) }}
              ref={boss}
              id="btBoss"
            >
              <div className="bt__bubble">
                <span className="bt__eyes" aria-hidden="true">
                  <i></i>
                  <i></i>
                </span>
                <p
                  className={"bt__say" + (round ? " is-new" : "")}
                  key={round}
                  id="btSay"
                >
                  {rounds[round].say}
                </p>
              </div>
              <span
                className={"bt__dmg" + (damage ? " is-on" : "")}
                key={damageKey}
                id="btDmg"
                aria-hidden="true"
              >
                {damage}
              </span>
            </div>
            <span
              className="bt__shot"
              ref={shot}
              id="btShot"
              aria-hidden="true"
            ></span>
          </div>
          <div className="bt__ui" inert={won}>
            <div className="bt__box" aria-live="polite">
              <p id="btText">{text}</p>
            </div>
            <div
              className="bt__moves"
              id="btMoves"
              role="group"
              aria-label="Your moves"
            >
              {Object.entries(MOVE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={
                    "mv" +
                    (used.includes(key) ? " is-used" : "") +
                    (missed === key ? " is-miss" : "")
                  }
                  type="button"
                  data-mv={key}
                  aria-disabled={used.includes(key) || locked || undefined}
                  onClick={() => performMove(key)}
                >
                  <b>{label}</b>
                  <small>{MOVE_SUBTITLES[key]}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="bt__win" id="btWin" ref={win} hidden={!won}>
            <p className="bt__win-k">Boss defeated</p>
            <p className="bt__win-t">
              No excuses left. All that’s left is showing up.
            </p>
            <div className="btn-row">
              <a className="btn btn--arcade" href="#next-level">
                <i className="i i-play" aria-hidden="true"></i>See your haul
              </a>
              <button
                className="btn btn--secondary"
                type="button"
                id="btAgain"
                onClick={reset}
              >
                <i className="i i-refresh" aria-hidden="true"></i>Rematch
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HaulNumber({ to, active, motion }) {
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (!active || !motion) return;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 500);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, active, motion]);
  return <b data-n={to}>{value}</b>;
}
const PLAYER_CLASSES = {
  compete: "Competitor",
  connect: "Networker",
  discover: "Career hunter",
  learn: "Learner",
};
export function Finale() {
  const { state, motion, registerUrl, notice, sound } = useWhy();
  const haul = useRef(null),
    started = useRef(false);
  const [shown, setShown] = useState(0),
    [done, setDone] = useState(false);
  const { schedule } = useTimers();
  const seen = useOnceVisible(haul, motion, 0.45);
  const rows = haulRows(data),
    registration = registrationInfo(data);
  const personal = [];
  if (state.path)
    personal.push({
      key: "class",
      label: "Class",
      value: PLAYER_CLASSES[state.path],
    });
  if (state.bricks)
    personal.push({
      key: "bricks",
      label: "Bricks",
      value: state.bricks + "/6",
    });
  if (state.lobby)
    personal.push({ key: "lobby", label: "Lobby", value: "Ready" });
  if (state.boss)
    personal.push({ key: "boss", label: "Excuses left", value: "0" });
  useEffect(() => {
    if (!seen || started.current) return;
    started.current = true;
    if (!motion) return;
    let count = 0;
    const next = () => {
      if (count >= rows.length) {
        setDone(true);
        sound?.("up");
        return;
      }
      setShown(++count);
      sound?.("blip");
      schedule(next, 230);
    };
    next();
  }, [seen, motion, rows.length, schedule, sound]);
  return (
    <section
      className="finale"
      id="next-level"
      aria-labelledby="fn-title"
      data-munch="check"
      data-munch-label="Your haul"
    >
      <div className="tunnel" aria-hidden="true" data-tunnel="">
        <div className="tl" style={{ "--n": "0", "--sc": "1.7" }}></div>
        <div className="tl" style={{ "--n": "1", "--sc": "1.32" }}></div>
        <div className="tl" style={{ "--n": "2", "--sc": "1.03" }}></div>
        <div className="tl" style={{ "--n": "3", "--sc": ".8" }}></div>
        <div className="tl" style={{ "--n": "4", "--sc": ".62" }}></div>
        <div className="tl" style={{ "--n": "5", "--sc": ".48" }}></div>
        <div className="tl" style={{ "--n": "6", "--sc": ".37" }}></div>
        <div className="tl" style={{ "--n": "7", "--sc": ".29" }}></div>
        <div className="tl" style={{ "--n": "8", "--sc": ".22" }}></div>
        <div className="tl" style={{ "--n": "9", "--sc": ".17" }}></div>
      </div>
      <div className="horizon" aria-hidden="true"></div>
      <div className="floor" aria-hidden="true"></div>
      <div className="container fin">
        <p className="sh__label t-label" data-reveal="">
          <i className="i i-square" aria-hidden="true"></i>// Stage clear ·
          PROCOM’27
        </p>
        <div
          className={
            "haul" + (motion ? " haul--armed" : "") + (done ? " is-done" : "")
          }
          ref={haul}
          id="haul"
          data-reveal="scale"
          aria-labelledby="haul-title"
        >
          <div className="haul__hd">
            <h3 className="haul__ttl" id="haul-title">
              Your haul
            </h3>
            <span className="t-label">If you show up</span>
          </div>
          <p
            className="haul__you t-label"
            id="haulYou"
            hidden={!personal.length}
          >
            Player 1 ·{" "}
            {personal.map((bit, index) => (
              <span key={bit.key}>
                {index > 0 ? " · " : ""}
                {bit.label} <b>{bit.value}</b>
              </span>
            ))}
          </p>
          <ol className="haul__list" id="haulList">
            {rows.map((row, index) => (
              <li
                key={row.k}
                className={"hr" + (!motion || shown > index ? " is-on" : "")}
              >
                <span className="hr__k">{row.k}</span>
                <span className="hr__dots" aria-hidden="true" />
                <span className="hr__v">
                  {row.n !== undefined ? (
                    <>
                      <HaulNumber
                        to={row.n}
                        active={shown > index}
                        motion={motion}
                      />
                      <small>{row.v}</small>
                    </>
                  ) : (
                    row.v
                  )}
                </span>
              </li>
            ))}
          </ol>
          <div className="haul__total">
            <span>To unlock all of it</span>
            <b>1 registration</b>
          </div>
        </div>
        <div data-reveal="">
          <h2 id="fn-title">
            <span className="finale__small t-d3">Ready to join?</span>
            <span className="finale__big t-expressive t-extrude">
              See you there.
            </span>
          </h2>
          <p className="sup">
            Register for PROCOM’27, or look through the competitions first.
          </p>
          <div className="btn-row">
            <a
              className="btn btn--arcade"
              href={registerUrl || "/register"}
              onClick={(e) => {
                if (!registerUrl)
                  unavailable(e, notice, "Attendee registration");
              }}
              data-demo=""
              data-demo-kind="register"
              data-register=""
            >
              <i className="i i-play" aria-hidden="true"></i>Register now
            </a>
            <a
              className="btn btn--secondary"
              href="/#competitions"
              data-demo=""
            >
              See competitions<i className="i i-arrow" aria-hidden="true"></i>
            </a>
          </div>
          <p
            className="fin__dl"
            id="finDl"
            hidden={!registration.closed && !registration.text}
          >
            {registration.closed ? (
              "Registration for PROCOM’27 has closed."
            ) : (
              <>
                Registration closes <b>{registration.text}</b>
                {registration.left > 0
                  ? ` · ${registration.left} day${registration.left === 1 ? "" : "s"} left`
                  : ""}
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
