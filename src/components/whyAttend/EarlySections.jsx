import { useWhy } from "./useWhy.js";
import DATA from "./referenceData.js";
import { Icon, Mark, StickFigure } from "./Visuals.jsx";
import { useHero, useWorldMap, useLobby } from "./earlyHooks.js";
import { useBrickBreaker } from "./useBrickBreaker.js";
import { PATHS, CATEGORIES, CONNECTIONS } from "./earlyData.js";

function ConnectionSymbol({ type }) {
  if (type === "pro")
    return (
      <svg viewBox="0 0 16 16">
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          fill="#100C16"
          stroke="#DCC8FF"
          strokeWidth="1.5"
        />
        <rect x="5" y="5" width="6" height="6" fill="#B57CFF" />
      </svg>
    );
  if (type === "sponsor")
    return (
      <svg viewBox="0 0 16 16">
        <path
          d="M8 1 15 8 8 15 1 8Z"
          fill="#100C16"
          stroke="#B57CFF"
          strokeWidth="1.5"
        />
        <rect x="6" y="6" width="4" height="4" fill="#DCC8FF" />
      </svg>
    );
  if (type === "speaker")
    return (
      <svg viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" fill="#B57CFF" />
        <circle cx="8" cy="8" r="2.5" fill="#07060B" />
      </svg>
    );
  return (
    <svg viewBox="0 0 16 16">
      <rect x="2" y="2" width="12" height="12" fill="#DCC8FF" />
    </svg>
  );
}

export function Hero() {
  const { motion, sound, notice, registerUrl } = useWhy();
  const {
    current: hCurrent,
    menuKey: hMenuKey,
    nextTip: hNextTip,
    onTipEnter: hOnTipEnter,
    onTipLeave: hOnTipLeave,
    root: hRoot,
    setCurrent: hSetCurrent,
    text: hText,
    tip: hTip,
  } = useHero(motion, sound);
  return (
    <section className="hero" aria-labelledby="hero-title" ref={hRoot}>
      <div className="tunnel" aria-hidden="true" data-tunnel="">
        <div className="tl" style={{ "--n": "0", "--sc": "1.75" }}></div>
        <div className="tl" style={{ "--n": "1", "--sc": "1.36" }}></div>
        <div className="tl" style={{ "--n": "2", "--sc": "1.06" }}></div>
        <div className="tl" style={{ "--n": "3", "--sc": ".82" }}></div>
        <div className="tl" style={{ "--n": "4", "--sc": ".64" }}></div>
        <div className="tl" style={{ "--n": "5", "--sc": ".5" }}></div>
        <div className="tl" style={{ "--n": "6", "--sc": ".39" }}></div>
        <div className="tl" style={{ "--n": "7", "--sc": ".3" }}></div>
        <div className="tl" style={{ "--n": "8", "--sc": ".23" }}></div>
        <div className="tl" style={{ "--n": "9", "--sc": ".175" }}>
          <div className="tl__core" data-mark="">
            <Mark className="core-mark" />
          </div>
        </div>
      </div>
      <div className="container hero__in">
        <ul
          className="ts-hud"
          data-in=""
          style={{ "--d": "0ms" }}
          aria-label="PROCOM’27 at a glance"
        >
          <li>
            <span>Player</span>
            <b>1P · You</b>
          </li>
          <li>
            <span>When</span>
            <b data-ev="dates">{DATA.event.dates}</b>
          </li>
          <li>
            <span>Where</span>
            <b data-ev="campus">{DATA.event.campus}</b>
          </li>
          <li>
            <span>Stages</span>
            <b>07</b>
          </li>
        </ul>
        <p className="sh__label t-label" data-in="" style={{ "--d": "60ms" }}>
          <i className="i i-square" aria-hidden="true"></i>// Why attend
          PROCOM’27?
        </p>
        <h1
          id="hero-title"
          className="t-d1 t-extrude"
          aria-label="More than a competition."
        >
          <span className="row" data-chars="" aria-hidden="true">
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              <span className="ch" style={{ "--ci": 0 }}>
                M
              </span>
              <span className="ch" style={{ "--ci": 1 }}>
                o
              </span>
              <span className="ch" style={{ "--ci": 2 }}>
                r
              </span>
              <span className="ch" style={{ "--ci": 3 }}>
                e
              </span>
            </span>{" "}
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              <span className="ch" style={{ "--ci": 5 }}>
                t
              </span>
              <span className="ch" style={{ "--ci": 6 }}>
                h
              </span>
              <span className="ch" style={{ "--ci": 7 }}>
                a
              </span>
              <span className="ch" style={{ "--ci": 8 }}>
                n
              </span>
            </span>{" "}
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              <span className="ch" style={{ "--ci": 10 }}>
                a
              </span>
            </span>
          </span>
          <span className="row t-soft" data-chars="" aria-hidden="true">
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              <span className="ch" style={{ "--ci": 11 }}>
                c
              </span>
              <span className="ch" style={{ "--ci": 12 }}>
                o
              </span>
              <span className="ch" style={{ "--ci": 13 }}>
                m
              </span>
              <span className="ch" style={{ "--ci": 14 }}>
                p
              </span>
              <span className="ch" style={{ "--ci": 15 }}>
                e
              </span>
              <span className="ch" style={{ "--ci": 16 }}>
                t
              </span>
              <span className="ch" style={{ "--ci": 17 }}>
                i
              </span>
              <span className="ch" style={{ "--ci": 18 }}>
                t
              </span>
              <span className="ch" style={{ "--ci": 19 }}>
                i
              </span>
              <span className="ch" style={{ "--ci": 20 }}>
                o
              </span>
              <span className="ch" style={{ "--ci": 21 }}>
                n
              </span>
              <span className="ch" style={{ "--ci": 22 }}>
                .
              </span>
            </span>
          </span>
        </h1>
        <p className="hero__copy" data-in="" style={{ "--d": "420ms" }}>
          Join competitions, meet new people, explore career opportunities, and
          learn something new at PROCOM’27.
        </p>
        <nav
          className="tmenu"
          id="tmenu"
          aria-label="Start menu"
          data-in=""
          style={{ "--d": "620ms" }}
        >
          <a
            className={"tmenu__it" + (hCurrent === 0 ? " is-cur" : "")}
            href="#path"
            onMouseEnter={() => hSetCurrent(0)}
            onFocus={() => hSetCurrent(0)}
            onKeyDown={(e) => hMenuKey(e, 0)}
            onClick={() => sound?.("start")}
          >
            <span className="tmenu__cur" aria-hidden="true"></span>
            <span className="tmenu__k" aria-hidden="true">
              Start
            </span>
            <span className="tmenu__t">Explore events</span>
          </a>
          <a
            className={"tmenu__it" + (hCurrent === 1 ? " is-cur" : "")}
            href="/#schedule"
            onMouseEnter={() => hSetCurrent(1)}
            onFocus={() => hSetCurrent(1)}
            onKeyDown={(e) => hMenuKey(e, 1)}
            onClick={() => sound?.("start")}
          >
            <span className="tmenu__cur" aria-hidden="true"></span>
            <span className="tmenu__k" aria-hidden="true">
              Plan
            </span>
            <span className="tmenu__t">View schedule</span>
          </a>
          <a
            className={"tmenu__it" + (hCurrent === 2 ? " is-cur" : "")}
            href={registerUrl || "#"}
            data-demo=""
            data-demo-kind="register"
            data-register=""
            onMouseEnter={() => hSetCurrent(2)}
            onFocus={() => hSetCurrent(2)}
            onKeyDown={(e) => hMenuKey(e, 2)}
            onClick={(e) => {
              sound?.("start");
              if (!registerUrl) {
                e.preventDefault();
                notice("Attendee registration is not available yet.");
              }
            }}
          >
            <span className="tmenu__cur" aria-hidden="true"></span>
            <span className="tmenu__k" aria-hidden="true">
              Join
            </span>
            <span className="tmenu__t">Register now</span>
          </a>
        </nav>
      </div>
      <div
        className="container hero__hud"
        data-in=""
        style={{ "--d": "760ms" }}
      >
        <p
          className="tip"
          onPointerEnter={hOnTipEnter}
          onPointerLeave={hOnTipLeave}
        >
          <span className="tip__k t-label">
            Tip <b className="js-tipn">{hTip + 1}</b>/5
          </span>
          <span className="tip__t js-tip">{hText}</span>
          <button
            className="tip__next"
            type="button"
            aria-label="Show the next tip"
            onClick={hNextTip}
          >
            <i className="i i-chevron-right" aria-hidden="true"></i>
          </button>
        </p>
        <a href="#path" className="t-label hero__scroll">
          <span className="key">
            <i className="i i-arrow-down" aria-hidden="true"></i>
          </span>
          Scroll
        </a>
      </div>
    </section>
  );
}

export function WorldMap() {
  const { motion, setState, sound, notice } = useWhy();
  const {
    bindNode: wBindNode,
    bindPath: wBindPath,
    choose: wChoose,
    cleared: wCleared,
    displayed: wDisplayed,
    field: wField,
    keyDown: wKeyDown,
    points: wPoints,
    road: wRoad,
    segments: wSegments,
    selected: wSelected,
    size: wSize,
    svg: wSvg,
    swap: wSwap,
    trail: wTrail,
    walker: wWalker,
  } = useWorldMap(
    motion,
    (key) => setState((s) => ({ ...s, path: key })),
    sound,
  );
  const data = PATHS[wDisplayed];
  return (
    <section
      className="section"
      id="path"
      aria-labelledby="path-title"
      data-munch="flag"
      data-munch-label="Pick a stage"
    >
      <div className="container">
        <header className="sh" data-reveal="">
          <div>
            <p className="sh__label t-label">
              <i className="i i-square" aria-hidden="true"></i>01 / What’s on
            </p>
            <h2 className="sh__title t-d2" id="path-title">
              <span className="ln" style={{ "--l": "0" }}>
                <span>What are you</span>
              </span>
              <span className="ln" style={{ "--l": "1" }}>
                <span className="t-soft">interested in?</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            You don’t have to compete to enjoy PROCOM. Pick a stage on the map
            to see what’s there for you.
          </p>
        </header>
        <div className="wm" data-reveal="">
          <div className="wm__map">
            <div className="wm__hud t-label" aria-hidden="true">
              <span>World 27 · Stage select</span>
              <span>
                Stage <b className="js-pnum">{PATHS[wSelected].n}</b>
              </span>
            </div>
            <div className="wm__field" id="wmField" ref={wField}>
              <svg
                className="wm__road"
                aria-hidden="true"
                viewBox={`0 0 ${wSize.width} ${wSize.height}`}
                ref={wSvg}
              >
                <path className="wm__bed" d={wRoad} />
                <path className="wm__dash" d={wRoad} />
                <path className="wm__trail" d={wTrail} />
                {wSegments.map((d, i) => (
                  <path key={i} d={d} fill="none" ref={wBindPath(i)} />
                ))}
              </svg>
              <span
                className="wm__start t-label"
                aria-hidden="true"
                style={{ left: wPoints[0].x, top: wPoints[0].y }}
              >
                Start
              </span>
              <div
                className="wm__nodes"
                role="tablist"
                aria-label="Choose your path"
              >
                <button
                  className={
                    "wnode" + (wCleared.includes(0) ? " is-cleared" : "")
                  }
                  type="button"
                  role="tab"
                  id="tab-compete"
                  data-path="compete"
                  aria-selected={wSelected === "compete"}
                  aria-controls="stage"
                  tabIndex={wSelected === "compete" ? 0 : -1}
                  ref={wBindNode(0)}
                  style={{ left: wPoints[1].x, top: wPoints[1].y }}
                  onClick={() => wChoose("compete")}
                  onKeyDown={(e) => wKeyDown(e, 0)}
                >
                  <span className="wnode__card">
                    <span className="wnode__ic">
                      <i className="i i-trophy" aria-hidden="true"></i>
                    </span>
                    <span className="wnode__tx">
                      <span className="wnode__no">1-1</span>
                      <span className="wnode__nm">Compete</span>
                    </span>
                  </span>
                  <span className="wnode__dot" aria-hidden="true"></span>
                </button>
                <button
                  className={
                    "wnode" + (wCleared.includes(1) ? " is-cleared" : "")
                  }
                  type="button"
                  role="tab"
                  id="tab-connect"
                  data-path="connect"
                  aria-selected={wSelected === "connect"}
                  aria-controls="stage"
                  tabIndex={wSelected === "connect" ? 0 : -1}
                  ref={wBindNode(1)}
                  style={{ left: wPoints[2].x, top: wPoints[2].y }}
                  onClick={() => wChoose("connect")}
                  onKeyDown={(e) => wKeyDown(e, 1)}
                >
                  <span className="wnode__card">
                    <span className="wnode__ic">
                      <i className="i i-users" aria-hidden="true"></i>
                    </span>
                    <span className="wnode__tx">
                      <span className="wnode__no">1-2</span>
                      <span className="wnode__nm">Meet people</span>
                    </span>
                  </span>
                  <span className="wnode__dot" aria-hidden="true"></span>
                </button>
                <button
                  className={
                    "wnode" + (wCleared.includes(2) ? " is-cleared" : "")
                  }
                  type="button"
                  role="tab"
                  id="tab-discover"
                  data-path="discover"
                  aria-selected={wSelected === "discover"}
                  aria-controls="stage"
                  tabIndex={wSelected === "discover" ? 0 : -1}
                  ref={wBindNode(2)}
                  style={{ left: wPoints[3].x, top: wPoints[3].y }}
                  onClick={() => wChoose("discover")}
                  onKeyDown={(e) => wKeyDown(e, 2)}
                >
                  <span className="wnode__card">
                    <span className="wnode__ic">
                      <i className="i i-arrow-ne" aria-hidden="true"></i>
                    </span>
                    <span className="wnode__tx">
                      <span className="wnode__no">1-3</span>
                      <span className="wnode__nm">Careers</span>
                    </span>
                  </span>
                  <span className="wnode__dot" aria-hidden="true"></span>
                </button>
                <button
                  className={
                    "wnode" + (wCleared.includes(3) ? " is-cleared" : "")
                  }
                  type="button"
                  role="tab"
                  id="tab-learn"
                  data-path="learn"
                  aria-selected={wSelected === "learn"}
                  aria-controls="stage"
                  tabIndex={wSelected === "learn" ? 0 : -1}
                  ref={wBindNode(3)}
                  style={{ left: wPoints[4].x, top: wPoints[4].y }}
                  onClick={() => wChoose("learn")}
                  onKeyDown={(e) => wKeyDown(e, 3)}
                >
                  <span className="wnode__card">
                    <span className="wnode__ic">
                      <i className="i i-chat" aria-hidden="true"></i>
                    </span>
                    <span className="wnode__tx">
                      <span className="wnode__no">1-4</span>
                      <span className="wnode__nm">Learn</span>
                    </span>
                  </span>
                  <span className="wnode__dot" aria-hidden="true"></span>
                </button>
              </div>
              <div
                className="walker sfig"
                id="wmWalker"
                aria-hidden="true"
                ref={wWalker}
              >
                <StickFigure />
              </div>
            </div>
            <p className="wm__keys t-label" aria-hidden="true">
              <span className="key">
                <i className="i i-chevron-left"></i>
              </span>
              <span className="key">
                <i className="i i-chevron-right"></i>
              </span>
              Tap a stage or use the arrow keys
            </p>
          </div>
          <div
            className={"stage" + (wSwap ? " is-swapping" : "")}
            id="stage"
            role="tabpanel"
            aria-labelledby={`tab-${wSelected}`}
            key={wSwap}
          >
            <div className="wipe" aria-hidden="true" />
            <div className={"stage__body swap-in"} aria-live="polite">
              <p className="stage__k t-label">
                Stage <b className="js-pnum2">{data.n}</b> ·{" "}
                <span className="js-pboost">{data.boost}</span>
              </p>
              <h3 className="stage__name js-pname">{data.name}</h3>
              <p className="stage__for js-pfor">{data.for}</p>
              <p className="stage__desc js-pdesc">{data.desc}</p>
              <p className="stage__lk t-label">In this stage</p>
              <ul className="stage__loot js-ploot">
                {data.loot.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="btn-row">
                <a
                  className="btn btn--primary js-pcta"
                  href={data.href}
                  data-demo=""
                  onClick={(e) => {
                    if (data.href === "/sponsors") {
                      e.preventDefault();
                      notice("Sponsor details are not available yet.");
                    }
                  }}
                >
                  <i className="i i-play" aria-hidden="true"></i>
                  <span className="js-pctat">{data.cta}</span>
                  <i className="i i-arrow" aria-hidden="true"></i>
                </a>
                <a
                  className="link-action js-pmore"
                  href={data.more}
                  hidden={data.href === data.more}
                >
                  More below
                  <i className="i i-arrow-down" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Challenge() {
  const { motion, setState, sound, burst, quest } = useWhy();
  const {
    ball: bBall,
    bindBrick: bBindBrick,
    bindMeter: bBindMeter,
    blur: bBlur,
    broken: bBroken,
    clear: bClear,
    cracking: bCracking,
    done: bDone,
    field: bField,
    flash: bFlash,
    hit: bHit,
    keyDown: bKeyDown,
    keyUp: bKeyUp,
    lit: bLit,
    live: bLive,
    message: bMessage,
    move: bMove,
    paddle: bPaddle,
    pointerDown: bPointerDown,
    popping: bPopping,
    reset: bReset,
    selected: bSelected,
  } = useBrickBreaker({
    motion,
    onProgress: (n) =>
      setState((s) => ({ ...s, bricks: Math.max(s.bricks, n) })),
    sound,
    burst,
    quest,
  });
  const category = bSelected === null ? null : CATEGORIES[bSelected];
  const competitions = category
    ? DATA.competitions.filter((c) => c.cat === category.dc)
    : [];
  return (
    <section
      className="section section--alt"
      id="challenge"
      aria-labelledby="ch-title"
      data-munch="trophy"
      data-munch-label="Competitions"
    >
      <div className="container">
        <header className="sh" data-reveal="">
          <div>
            <p className="sh__label t-label">
              <i className="i i-square" aria-hidden="true"></i>02 / Competitions
            </p>
            <h2 className="sh__title t-d2" id="ch-title">
              <span className="ln" style={{ "--l": "0" }}>
                <span>Put your skills</span>
              </span>
              <span className="ln" style={{ "--l": "1" }}>
                <span className="t-soft">to the test.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            There are competitions for tech and non-tech students. Break a
            brick, or just tap one, to see what each category is about.
          </p>
        </header>
        <div className="bb" data-reveal="">
          <div className="bb__game">
            <div className="bb__hud t-label" aria-hidden="true">
              <span>
                Bricks <b id="bbCount">{bBroken.length}</b>/6
              </span>
              <span className="bb__msg" id="bbMsg">
                {bMessage}
              </span>
              <span>
                Balls <b>∞</b>
              </span>
            </div>
            <div
              className={"bb__field" + (bLive ? " is-live" : "")}
              id="bbField"
              tabIndex="0"
              role="group"
              aria-label="Brick breaker. Move the paddle with the mouse or the arrow keys and press Space to launch. You can also select a brick directly."
              ref={bField}
              onPointerMove={bMove}
              onPointerDown={bPointerDown}
              onKeyDown={bKeyDown}
              onKeyUp={bKeyUp}
              onBlur={bBlur}
            >
              <div className="bb__bricks">
                <button
                  className={
                    "brick" +
                    (bBroken.includes(0) ? " is-broken" : "") +
                    (bBroken.length > 0 && bSelected === 0 ? " is-sel" : "") +
                    (bCracking === 0 ? " is-crack" : "")
                  }
                  type="button"
                  data-cat="programming"
                  data-dc="cs"
                  data-kind="Technical"
                  data-desc="Solve coding problems quickly and correctly."
                  ref={bBindBrick(0)}
                  onClick={() => bHit(0)}
                  onPointerEnter={() => {
                    if (bBroken.includes(0)) bHit(0);
                  }}
                >
                  <span className="brick__in">
                    <i className="i i-cat-cs" aria-hidden="true"></i>
                    <span>
                      <b>Programming</b>
                      <small>Technical</small>
                    </span>
                  </span>
                </button>
                <button
                  className={
                    "brick" +
                    (bBroken.includes(1) ? " is-broken" : "") +
                    (bBroken.length > 0 && bSelected === 1 ? " is-sel" : "") +
                    (bCracking === 1 ? " is-crack" : "")
                  }
                  type="button"
                  data-cat="ai"
                  data-dc="ai"
                  data-kind="Technical"
                  data-desc="Work with data and build AI models."
                  ref={bBindBrick(1)}
                  onClick={() => bHit(1)}
                  onPointerEnter={() => {
                    if (bBroken.includes(1)) bHit(1);
                  }}
                >
                  <span className="brick__in">
                    <i className="i i-cat-ai" aria-hidden="true"></i>
                    <span>
                      <b>Artificial Intelligence</b>
                      <small>Technical</small>
                    </span>
                  </span>
                </button>
                <button
                  className={
                    "brick" +
                    (bBroken.includes(2) ? " is-broken" : "") +
                    (bBroken.length > 0 && bSelected === 2 ? " is-sel" : "") +
                    (bCracking === 2 ? " is-crack" : "")
                  }
                  type="button"
                  data-cat="engineering"
                  data-dc="ee"
                  data-kind="Technical"
                  data-desc="Design, build and fix things with your team."
                  ref={bBindBrick(2)}
                  onClick={() => bHit(2)}
                  onPointerEnter={() => {
                    if (bBroken.includes(2)) bHit(2);
                  }}
                >
                  <span className="brick__in">
                    <i className="i i-cat-ee" aria-hidden="true"></i>
                    <span>
                      <b>Engineering</b>
                      <small>Technical</small>
                    </span>
                  </span>
                </button>
                <button
                  className={
                    "brick" +
                    (bBroken.includes(3) ? " is-broken" : "") +
                    (bBroken.length > 0 && bSelected === 3 ? " is-sel" : "") +
                    (bCracking === 3 ? " is-crack" : "")
                  }
                  type="button"
                  data-cat="business"
                  data-dc="biz"
                  data-kind="Non-technical"
                  data-desc="Plan, pitch and present your business ideas."
                  ref={bBindBrick(3)}
                  onClick={() => bHit(3)}
                  onPointerEnter={() => {
                    if (bBroken.includes(3)) bHit(3);
                  }}
                >
                  <span className="brick__in">
                    <i className="i i-cat-biz" aria-hidden="true"></i>
                    <span>
                      <b>Business</b>
                      <small>Non-technical</small>
                    </span>
                  </span>
                </button>
                <button
                  className={
                    "brick" +
                    (bBroken.includes(4) ? " is-broken" : "") +
                    (bBroken.length > 0 && bSelected === 4 ? " is-sel" : "") +
                    (bCracking === 4 ? " is-crack" : "")
                  }
                  type="button"
                  data-cat="gaming"
                  data-dc="gaming"
                  data-kind="E-sports"
                  data-desc="Play in team and solo gaming matches."
                  ref={bBindBrick(4)}
                  onClick={() => bHit(4)}
                  onPointerEnter={() => {
                    if (bBroken.includes(4)) bHit(4);
                  }}
                >
                  <span className="brick__in">
                    <i className="i i-cat-gaming" aria-hidden="true"></i>
                    <span>
                      <b>Gaming</b>
                      <small>E-sports</small>
                    </span>
                  </span>
                </button>
                <button
                  className={
                    "brick" +
                    (bBroken.includes(5) ? " is-broken" : "") +
                    (bBroken.length > 0 && bSelected === 5 ? " is-sel" : "") +
                    (bCracking === 5 ? " is-crack" : "")
                  }
                  type="button"
                  data-cat="general"
                  data-dc="gen"
                  data-kind="Open to all"
                  data-desc="Fun challenges that anyone can join."
                  ref={bBindBrick(5)}
                  onClick={() => bHit(5)}
                  onPointerEnter={() => {
                    if (bBroken.includes(5)) bHit(5);
                  }}
                >
                  <span className="brick__in">
                    <i className="i i-cat-gen" aria-hidden="true"></i>
                    <span>
                      <b>General Challenges</b>
                      <small>Open to all</small>
                    </span>
                  </span>
                </button>
              </div>
              <div
                className="bb__paddle"
                id="bbPaddle"
                aria-hidden="true"
                ref={bPaddle}
              ></div>
              <div
                className="bb__ball"
                id="bbBall"
                aria-hidden="true"
                ref={bBall}
              ></div>
              <p className="bb__hint t-label" id="bbHint" aria-hidden="true">
                Click to launch · or tap a brick
              </p>
              <div
                className="bb__clear"
                id="bbClear"
                hidden={!bDone}
                ref={bClear}
              >
                <p className="bb__clear-k">All clear</p>
                <p className="bb__clear-t">
                  6 categories, tech and non-tech. One of them is yours.
                </p>
                <div className="btn-row">
                  <a className="btn btn--primary" href="/#competitions">
                    <i className="i i-play" aria-hidden="true"></i>See all
                    competitions
                  </a>
                  <button
                    className="btn btn--secondary"
                    type="button"
                    id="bbAgain"
                    onClick={bReset}
                  >
                    <i className="i i-refresh" aria-hidden="true"></i>Play again
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className={"bbi corners" + (bFlash && motion ? " flash" : "")}
            id="bbInfo"
            aria-live="polite"
            key={bFlash}
          >
            <span className="bbi__ic" aria-hidden="true">
              <Icon name={category?.icon || "trophy"} />
            </span>
            <p className="bbi__k t-label">
              {category ? `Category · ${category.kind}` : "6 categories"}
            </p>
            <p className="bbi__t">{category?.name || "Pick one"}</p>
            <p className="bbi__d">
              {category?.desc ||
                "Break a brick or tap it to see what it is about."}
            </p>
            <div className="bbi__more" hidden={!competitions.length}>
              <p className="t-label bbi__n">
                {competitions.length} competition
                {competitions.length === 1 ? "" : "s"} in this category
              </p>
              <ul className="bbi__list">
                {competitions.slice(0, 3).map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="pmw" data-reveal="">
          <div className="pmw__hd">
            <p
              className="sh__label t-label"
              style={{ color: "var(--c-text-2)" }}
            >
              <i className="i i-square" aria-hidden="true"></i>Why take part?
            </p>
            <p className="pmw__st t-label" id="pmState" aria-hidden="true">
              Power meter <b>{bLit.length === 5 ? "MAX" : bLit.length}</b>
              {bLit.length === 5 ? null : "/5"}
            </p>
          </div>
          <ol
            className={"pmeter" + (bLit.length === 5 ? " is-max" : "")}
            id="pmeter"
          >
            <li
              className={
                "pm" +
                (bLit.includes(0) ? " is-lit" : "") +
                (bPopping === 0 ? " is-pop" : "")
              }
              ref={bBindMeter(0)}
            >
              <span className="pm__k t-label">PWR 01</span>
              <span className="pm__ic">
                <i className="i i-chevron-up i--lg" aria-hidden="true"></i>
              </span>
              <h3 className="pm__t">Test yourself</h3>
              <p>See how much you really know.</p>
            </li>
            <li
              className={
                "pm" +
                (bLit.includes(1) ? " is-lit" : "") +
                (bPopping === 1 ? " is-pop" : "")
              }
              ref={bBindMeter(1)}
            >
              <span className="pm__k t-label">PWR 02</span>
              <span className="pm__ic">
                <i className="i i-users i--lg" aria-hidden="true"></i>
              </span>
              <h3 className="pm__t">Work as a team</h3>
              <p>Split the work and solve problems together.</p>
            </li>
            <li
              className={
                "pm" +
                (bLit.includes(2) ? " is-lit" : "") +
                (bPopping === 2 ? " is-pop" : "")
              }
              ref={bBindMeter(2)}
            >
              <span className="pm__k t-label">PWR 03</span>
              <span className="pm__ic">
                <i className="i i-plus i--lg" aria-hidden="true"></i>
              </span>
              <h3 className="pm__t">Try new ideas</h3>
              <p>Fresh thinking often beats memorised answers.</p>
            </li>
            <li
              className={
                "pm" +
                (bLit.includes(3) ? " is-lit" : "") +
                (bPopping === 3 ? " is-pop" : "")
              }
              ref={bBindMeter(3)}
            >
              <span className="pm__k t-label">PWR 04</span>
              <span className="pm__ic">
                <i className="i i-check i--lg" aria-hidden="true"></i>
              </span>
              <h3 className="pm__t">Use what you learn</h3>
              <p>Apply your classwork to real problems.</p>
            </li>
            <li
              className={
                "pm" +
                (bLit.includes(4) ? " is-lit" : "") +
                (bPopping === 4 ? " is-pop" : "")
              }
              ref={bBindMeter(4)}
            >
              <span className="pm__k t-label">PWR 05</span>
              <span className="pm__ic">
                <i className="i i-pin i--lg" aria-hidden="true"></i>
              </span>
              <h3 className="pm__t">Compete outside class</h3>
              <p>A different setting from your usual exams.</p>
            </li>
          </ol>
          <div className="cap">
            <p className="t-body-lg" style={{ maxWidth: "48ch" }}>
              Rules, team sizes and sign-up details are on the competitions
              page.
            </p>
            <a className="btn btn--primary" href="/#competitions">
              <i className="i i-play" aria-hidden="true"></i>See all
              competitions<i className="i i-arrow" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Lobby() {
  const { motion, setState, sound, notice, registerUrl, quest, burst } =
    useWhy();
  const {
    counts: lCounts,
    filter: lFilter,
    highlight: lHighlight,
    join: lJoin,
    joined: lJoined,
    log: lLog,
    root: lRoot,
    waiting: lWaiting,
  } = useLobby(
    motion,
    () => setState((s) => ({ ...s, lobby: true })),
    sound,
    quest,
    burst,
  );
  return (
    <section
      className="section"
      id="connect"
      aria-labelledby="cn-title"
      data-munch="users"
      data-munch-label="Industry"
    >
      <div className="container conn">
        <div data-reveal="">
          <p className="sh__label t-label">
            <i className="i i-square" aria-hidden="true"></i>03 / Industry
          </p>
          <h2 className="t-d2" id="cn-title">
            <span className="ln" style={{ "--l": "0" }}>
              <span>Meet industry</span>
            </span>
            <span className="ln" style={{ "--l": "1" }}>
              <span className="t-soft">professionals.</span>
            </span>
          </h2>
          <p className="t-body-lg conn__p">
            PROCOM brings companies to campus. Talk to people working in your
            field, ask them questions, and meet other students with the same
            interests.
          </p>
          <div
            className="legend"
            role="group"
            aria-label="Highlight a type of connection"
          >
            <button
              className="lg card card--interactive"
              type="button"
              data-type="pro"
              aria-pressed={lFilter === "pro"}
              onClick={() => lHighlight("pro")}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect
                  x="1.5"
                  y="1.5"
                  width="13"
                  height="13"
                  fill="#100C16"
                  stroke="#DCC8FF"
                  strokeWidth="1.5"
                />
                <rect x="5" y="5" width="6" height="6" fill="#B57CFF" />
              </svg>
              <span>
                <b>Industry professionals</b>
                <span>People working in tech and business</span>
              </span>
              <span className="t-label">
                {lFilter === "pro" ? "On" : "Show"}
              </span>
            </button>
            <button
              className="lg card card--interactive"
              type="button"
              data-type="sponsor"
              aria-pressed={lFilter === "sponsor"}
              onClick={() => lHighlight("sponsor")}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M8 1 15 8 8 15 1 8Z"
                  fill="#100C16"
                  stroke="#B57CFF"
                  strokeWidth="1.5"
                />
                <rect x="6" y="6" width="4" height="4" fill="#DCC8FF" />
              </svg>
              <span>
                <b>Sponsors</b>
                <span>Companies that support PROCOM</span>
              </span>
              <span className="t-label">
                {lFilter === "sponsor" ? "On" : "Show"}
              </span>
            </button>
            <button
              className="lg card card--interactive"
              type="button"
              data-type="speaker"
              aria-pressed={lFilter === "speaker"}
              onClick={() => lHighlight("speaker")}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="7" fill="#B57CFF" />
                <circle cx="8" cy="8" r="2.5" fill="#07060B" />
              </svg>
              <span>
                <b>Speakers</b>
                <span>Guests who give talks and join panels</span>
              </span>
              <span className="t-label">
                {lFilter === "speaker" ? "On" : "Show"}
              </span>
            </button>
            <button
              className="lg card card--interactive"
              type="button"
              data-type="student"
              aria-pressed={lFilter === "student"}
              onClick={() => lHighlight("student")}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="5" y="5" width="6" height="6" fill="#DCC8FF" />
              </svg>
              <span>
                <b>Fellow students</b>
                <span>Students from your campus and others</span>
              </span>
              <span className="t-label">
                {lFilter === "student" ? "On" : "Show"}
              </span>
            </button>
          </div>
          <a
            className="btn btn--primary"
            href="/sponsors"
            data-demo=""
            onClick={(e) => {
              e.preventDefault();
              notice("Sponsor details are not available yet.");
            }}
          >
            <i className="i i-play" aria-hidden="true"></i>See our sponsors
            <i className="i i-arrow" aria-hidden="true"></i>
          </a>
        </div>
        <div
          className="lobby"
          id="lobby"
          data-reveal="scale"
          ref={lRoot}
          data-filter={lFilter || undefined}
        >
          <div className="lobby__hud t-label">
            <span>
              <i className="lobby__on" aria-hidden="true"></i>Lobby · PROCOM’27
            </span>
            <span className="lobby__srv">
              Server · <b data-ev="campus">FAST-NUCES Karachi</b>
            </span>
          </div>
          <ul className="lobby__rows" aria-label="Who you will meet">
            <li
              className={
                "lrow" +
                (lCounts.pro >= CONNECTIONS.find((c) => c.id === "pro").n
                  ? " is-full"
                  : "") +
                (lFilter === "pro" ? " is-hot" : "")
              }
              data-type="pro"
            >
              <span className="lrow__nm">Industry pros</span>
              <span className="lrow__av" data-n="7" aria-hidden="true">
                {Array.from({ length: lCounts.pro }, (_, i) => (
                  <i
                    key={i}
                    className={"av av--pro" + (motion ? " av--in" : "")}
                  >
                    <ConnectionSymbol type="pro" />
                  </i>
                ))}
              </span>
              <span className="lrow__st t-label">
                {lCounts.pro >= CONNECTIONS.find((c) => c.id === "pro").n
                  ? "Joined"
                  : lCounts.pro > 0
                    ? "Joining"
                    : "Waiting"}
              </span>
            </li>
            <li
              className={
                "lrow" +
                (lCounts.sponsor >=
                CONNECTIONS.find((c) => c.id === "sponsor").n
                  ? " is-full"
                  : "") +
                (lFilter === "sponsor" ? " is-hot" : "")
              }
              data-type="sponsor"
            >
              <span className="lrow__nm">Sponsors</span>
              <span className="lrow__av" data-n="6" aria-hidden="true">
                {Array.from({ length: lCounts.sponsor }, (_, i) => (
                  <i
                    key={i}
                    className={"av av--sponsor" + (motion ? " av--in" : "")}
                  >
                    <ConnectionSymbol type="sponsor" />
                  </i>
                ))}
              </span>
              <span className="lrow__st t-label">
                {lCounts.sponsor >=
                CONNECTIONS.find((c) => c.id === "sponsor").n
                  ? "Joined"
                  : lCounts.sponsor > 0
                    ? "Joining"
                    : "Waiting"}
              </span>
            </li>
            <li
              className={
                "lrow" +
                (lCounts.speaker >=
                CONNECTIONS.find((c) => c.id === "speaker").n
                  ? " is-full"
                  : "") +
                (lFilter === "speaker" ? " is-hot" : "")
              }
              data-type="speaker"
            >
              <span className="lrow__nm">Speakers</span>
              <span className="lrow__av" data-n="4" aria-hidden="true">
                {Array.from({ length: lCounts.speaker }, (_, i) => (
                  <i
                    key={i}
                    className={"av av--speaker" + (motion ? " av--in" : "")}
                  >
                    <ConnectionSymbol type="speaker" />
                  </i>
                ))}
              </span>
              <span className="lrow__st t-label">
                {lCounts.speaker >=
                CONNECTIONS.find((c) => c.id === "speaker").n
                  ? "Joined"
                  : lCounts.speaker > 0
                    ? "Joining"
                    : "Waiting"}
              </span>
            </li>
            <li
              className={
                "lrow" +
                (lCounts.student >=
                CONNECTIONS.find((c) => c.id === "student").n
                  ? " is-full"
                  : "") +
                (lFilter === "student" ? " is-hot" : "")
              }
              data-type="student"
            >
              <span className="lrow__nm">Students</span>
              <span className="lrow__av" data-n="12" aria-hidden="true">
                {Array.from({ length: lCounts.student }, (_, i) => (
                  <i
                    key={i}
                    className={"av av--student" + (motion ? " av--in" : "")}
                  >
                    <ConnectionSymbol type="student" />
                  </i>
                ))}
              </span>
              <span className="lrow__st t-label">
                {lCounts.student >=
                CONNECTIONS.find((c) => c.id === "student").n
                  ? "Joined"
                  : lCounts.student > 0
                    ? "Joining"
                    : "Waiting"}
              </span>
            </li>
            <li
              className={
                "lrow lrow--you" +
                (lJoined ? " is-full" : lWaiting ? " is-wait" : "")
              }
              data-type="you"
            >
              <span className="lrow__nm">You</span>
              <span className="lrow__av" aria-hidden="true">
                <i className={lJoined ? "av av--you" : "av av--empty"}>
                  {lJoined ? "You" : null}
                </i>
              </span>
              <button
                className="lrow__join"
                type="button"
                id="joinBtn"
                onClick={lJoin}
                disabled={lJoined}
              >
                {lJoined ? "Ready" : "Join lobby"}
              </button>
            </li>
          </ul>
          <div className="lobby__log" id="lobbyLog" aria-hidden="true">
            {lLog.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <p className="lobby__note" id="lobbyNote" hidden={!lJoined}>
            <b>You’re in.</b> In spirit, anyway.{" "}
            <a
              href={registerUrl || "#"}
              data-demo=""
              data-demo-kind="register"
              data-register=""
              onClick={(e) => {
                if (!registerUrl) {
                  e.preventDefault();
                  notice("Attendee registration is not available yet.");
                }
              }}
            >
              Register to make it real
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
