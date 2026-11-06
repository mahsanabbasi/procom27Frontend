// React port of the reference homepage hero and handheld console markup.
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { homeHeroContent } from "../../data/homeContent.js";
import useHeroCanvas from "./useHeroCanvas.js";
import "../../styles/hero.css";

function Statistics() {
  return (
    <div className="stats scr-in" id="stats" style={{ "--i": 4 }}>
      {homeHeroContent.stats.map(({ label, value, note, noteTitle }) => (
        <div className="card stat fx-spot" key={label}>
          <span className="stat__v">{value}</span>
          {note && (
            <span className="tbc" title={noteTitle}>
              [{note}]
            </span>
          )}
          <span className="stat__l">{label}</span>
        </div>
      ))}
    </div>
  );
}

function CategoryTicker() {
  const tickerItems = [
    ...homeHeroContent.categories.map(({ label, icon }) => ({ label, icon })),
    ...homeHeroContent.tickerExtras.map((label) => ({
      label,
      icon: "i-square",
    })),
  ];
  const repeatedTickerItems = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track" id="ticker">
        {repeatedTickerItems.map(({ label, icon }, index) => (
          <span className="ticker__item" key={`${label}-${index}`}>
            <i className={`i ${icon}`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Keep spaces and punctuation inside the same accessible, individually styled glyph spans.
function HeadlineLine({ children, className = "" }) {
  return (
    <span className={`row ${className}`.trim()} data-decode aria-hidden="true">
      {Array.from(children).map((character, index) => (
        <span className="headline-letter" aria-hidden="true" key={index}>
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const headlineRef = useRef(null);
  const headlineFrameRef = useRef(0);
  const headlinePointerRef = useRef({ x: 0, y: 0 });
  const {
    consoleRef,
    screenRef,
    logoCanvasRef,
    waveCanvasRef,
    visualRef,
    orbitRef,
    nubRef,
    selectedCategory,
    isScreenOn,
    isScreenOff,
    isConsoleSleeping,
    isBootVisible,
    isBootRunning,
    isBootDone,
    soundEnabled,
    osd,
  } = useHeroCanvas(navigate);

  // Throttle cursor-distance updates to one pass per animation frame.
  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return undefined;

    function updateGlow(event) {
      if (
        event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      headlinePointerRef.current = { x: event.clientX, y: event.clientY };
      if (headlineFrameRef.current) return;

      headlineFrameRef.current = window.requestAnimationFrame(() => {
        const { x, y } = headlinePointerRef.current;
        headline.querySelectorAll(".headline-letter").forEach((letter) => {
          const bounds = letter.getBoundingClientRect();
          const distance = Math.hypot(
            x - (bounds.left + bounds.width / 2),
            y - (bounds.top + bounds.height / 2),
          );
          const intensity = Math.max(0, 1 - distance / 105) ** 2;
          const base = letter.closest(".row")?.classList.contains("t-soft")
            ? [220, 200, 255]
            : [245, 240, 250];
          const glowColor = base
            .map((channel) =>
              Math.round(channel + (255 - channel) * intensity * 0.45),
            )
            .join(" ");

          letter.style.setProperty("--glow", intensity.toFixed(3));
          letter.style.setProperty("--glow-color", `rgb(${glowColor})`);
        });
        headlineFrameRef.current = 0;
      });
    }

    function resetGlow() {
      if (headlineFrameRef.current) {
        window.cancelAnimationFrame(headlineFrameRef.current);
        headlineFrameRef.current = 0;
      }
      headline.querySelectorAll(".headline-letter").forEach((letter) => {
        letter.style.setProperty("--glow", "0");
        letter.style.removeProperty("--glow-color");
      });
    }

    headline.addEventListener("pointermove", updateGlow);
    headline.addEventListener("pointerleave", resetGlow);
    return () => {
      headline.removeEventListener("pointermove", updateGlow);
      headline.removeEventListener("pointerleave", resetGlow);
      resetGlow();
    };
  }, []);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div
          className={`console${isConsoleSleeping ? " is-sleep" : ""}`}
          id="console"
          ref={consoleRef}
        >
          <button
            className="console__sh console__sh--l"
            type="button"
            data-act="L"
            aria-label="Previous category"
          >
            L
          </button>
          <button
            className="console__sh console__sh--r"
            type="button"
            data-act="R"
            aria-label="Next category"
          >
            R
          </button>
          <div className="console__shell">
            <div className="console__side console__side--l">
              <div className="dpad" role="group" aria-label="Direction pad">
                <button
                  className="dpad__b dpad__b--u"
                  type="button"
                  data-act="up"
                  aria-label="Back to top"
                >
                  <i className="i i-chevron-up" aria-hidden="true" />
                </button>
                <button
                  className="dpad__b dpad__b--l"
                  type="button"
                  data-act="left"
                  aria-label="Previous category"
                >
                  <i className="i i-chevron-left" aria-hidden="true" />
                </button>
                <span className="dpad__c" aria-hidden="true" />
                <button
                  className="dpad__b dpad__b--r"
                  type="button"
                  data-act="right"
                  aria-label="Next category"
                >
                  <i className="i i-chevron-right" aria-hidden="true" />
                </button>
                <button
                  className="dpad__b dpad__b--d"
                  type="button"
                  data-act="down"
                  aria-label="Jump to registration"
                >
                  <i className="i i-chevron-down" aria-hidden="true" />
                </button>
              </div>
              <button
                className="nub"
                id="nub"
                type="button"
                aria-label="Analog stick: drag it to push the pixels around"
                ref={nubRef}
              >
                <span className="nub__cap" />
                <span className="nub__lbl" aria-hidden="true">
                  Drag
                </span>
              </button>
              <span className="grille" aria-hidden="true" />
            </div>

            <div className="console__mid">
              <div className="console__glass">
                <div
                  className={`screen${isScreenOn ? " is-on" : ""}${isScreenOff ? " is-off" : ""}`}
                  id="screen"
                  ref={screenRef}
                >
                  <canvas
                    className="screen__wave"
                    id="scrWave"
                    width="240"
                    height="135"
                    aria-hidden="true"
                    ref={waveCanvasRef}
                  />
                  <div className="screen__status t-label" aria-hidden="true">
                    <span className="ss__l">
                      <i className="i i-square" />
                      {homeHeroContent.systemLabel}
                      <span className="ss__dim">{homeHeroContent.systemVersion}</span>
                    </span>
                    <span className="ss__r">
                      <span id="scrClock">--:--</span>
                      <span className="ss__dim">{homeHeroContent.timezone}</span>
                      <i className="i i-signal" />
                      <span className="batt">
                        <i />
                      </span>
                    </span>
                  </div>

                  <div className="scr">
                    <div className="scr__copy">
                      <p className="hero__id t-label scr-in" style={{ "--i": 0 }}>
                        <i className="i i-square" aria-hidden="true" />
                        {homeHeroContent.eventDetails[0]}
                        <span className="sep">•</span>
                        <span id="heroDates">{homeHeroContent.eventDetails[1]}</span>
                        <span className="sep">•</span>
                        <span id="heroCampus">{homeHeroContent.eventDetails[2]}</span>
                      </p>
                      <h1
                        className="t-d1 t-extrude"
                        id="hero-title"
                        ref={headlineRef}
                        aria-label="Compete. Connect. Create what’s next."
                      >
                        <HeadlineLine>Compete.</HeadlineLine>
                        <HeadlineLine>Connect.</HeadlineLine>
                        <HeadlineLine className="t-soft">Create</HeadlineLine>
                        <HeadlineLine className="t-soft">what’s next.</HeadlineLine>
                      </h1>
                      <p className="t-body-lg scr-in" style={{ "--i": 2 }}>
                        {homeHeroContent.description}
                      </p>
                      <div className="btn-row scr-in" style={{ "--i": 3 }}>
                        <Link className="btn btn--arcade" to="/register">
                          <i className="i i-play" aria-hidden="true" />
                          Register now
                        </Link>
                        <Link className="btn btn--secondary" to="/competitions">
                          Explore competitions
                          <i className="i i-arrow" aria-hidden="true" />
                        </Link>
                      </div>
                      <Statistics />
                    </div>

                    <div className="scr__visual scr-in" style={{ "--i": 2 }}>
                      <div
                        className="visual"
                        style={{ height: "clamp(240px,30cqi,320px)" }}
                        ref={visualRef}
                      >
                        <canvas
                          id="logoCanvas"
                          aria-label="Animated PROCOM ’27 logo made of pixels"
                          role="img"
                          ref={logoCanvasRef}
                        />
                        <nav
                          className="orbit"
                          id="orbit"
                          aria-label="Competition categories"
                          ref={orbitRef}
                        >
                          {homeHeroContent.categories.map(
                            ({ id, label, icon }) => (
                              <Link
                                className="orb"
                                to={`/competitions/${id}`}
                                aria-label={`${label} competitions`}
                                key={id}
                              >
                                <i className={`i ${icon}`} aria-hidden="true" />
                                <span className="orb__tip" aria-hidden="true">
                                  {label}
                                </span>
                              </Link>
                            ),
                          )}
                        </nav>
                      </div>
                      <nav
                        className={`scr-sel${selectedCategory ? " is-on" : ""}`}
                        id="scrSel"
                        aria-live="polite"
                      >
                        {selectedCategory && (
                          <>
                            <span className="key">
                              <i className="i i-chevron-left" aria-hidden="true" />
                            </span>
                            <span className="scr-sel__txt">
                              <b>{selectedCategory.label}</b>
                              <span>press <i className="i i-check" aria-hidden="true" /> to open</span>
                            </span>
                            <span className="key">
                              <i className="i i-chevron-right" aria-hidden="true" />
                            </span>
                          </>
                        )}
                      </nav>
                      <p className="vhint t-label" aria-hidden="true">
                        <i className="i i-square" />
                        Click the P · hover the icons · try the buttons
                      </p>
                    </div>
                  </div>
                  <div
                    className={`osd${osd ? " is-on" : ""}`}
                    id="scrOsd"
                    aria-hidden="true"
                  >
                    {osd && (
                      <>
                        <span className="t-label">{osd.label}</span>
                        <span className="osd__bars">
                          {Array.from({ length: 10 }, (_, index) => (
                            <i
                              className={index < osd.activeBars ? "on" : ""}
                              key={index}
                            />
                          ))}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="sleep" aria-hidden="true">
                    <span className="t-label">Sleep mode</span>
                    <span>Press POWER to wake the screen</span>
                  </div>
                  <div
                    className={`boot${isBootRunning ? " is-run" : ""}${isBootDone ? " is-done" : ""}`}
                    id="scrBoot"
                    aria-hidden="true"
                    hidden={!isBootVisible}
                  >
                    <div className="boot__in">
                      <span className="boot__mark" id="bootMark" />
                      <span className="boot__word">PROCOM ’27</span>
                      <span className="boot__bar">
                        <i />
                      </span>
                      <span className="boot__hint">Press any button</span>
                    </div>
                  </div>
                  <span className="screen__dim" aria-hidden="true" />
                  <span className="screen__fx" aria-hidden="true" />
                </div>
              </div>

              <div className="console__bar">
                <div className="console__grp">
                  <button
                    className="sysb"
                    type="button"
                    data-act="power"
                    aria-pressed={isScreenOff}
                    aria-label={
                      isScreenOff
                        ? "Power: wake the screen"
                        : "Power: put the screen to sleep"
                    }
                  >
                    <span className="sysb__k">
                      <span className="console__led" aria-hidden="true" />
                    </span>
                    Power
                  </button>
                  <button
                    className="sysb sysb--round"
                    type="button"
                    data-act="home"
                    aria-label="Home: replay the start-up screen"
                  >
                    <span className="sysb__k">
                      <i className="i i-square" aria-hidden="true" />
                    </span>
                    Home
                  </button>
                  <button
                    className="sysb"
                    type="button"
                    data-act="bright"
                    aria-label="Screen brightness"
                  >
                    <span className="sysb__k">
                      <i className="i i-eye" aria-hidden="true" />
                    </span>
                    Bright
                  </button>
                  <button
                    className="sysb"
                    type="button"
                    data-act="voldown"
                    aria-label={soundEnabled ? "Sound off" : "Sound is off"}
                  >
                    <span className="sysb__k">
                      <i className="i i-minus" aria-hidden="true" />
                    </span>
                    Vol
                  </button>
                  <button
                    className="sysb"
                    type="button"
                    data-act="volup"
                    aria-label={soundEnabled ? "Sound is on" : "Sound on"}
                  >
                    <span className="sysb__k">
                      <i className="i i-plus" aria-hidden="true" />
                    </span>
                    Vol
                  </button>
                </div>
                <span className="console__brand" aria-hidden="true">
                  {homeHeroContent.consoleLabel}
                </span>
                <div className="console__grp">
                  <button
                    className="sysb"
                    type="button"
                    data-act="select"
                    aria-label="Select: scatter the logo pixels"
                  >
                    <span className="sysb__k" />
                    Select
                  </button>
                  <Link
                    className="sysb"
                    to="/register"
                    data-act="start"
                    aria-label="Start: register"
                  >
                    <span className="sysb__k">
                      <i className="i i-play" aria-hidden="true" />
                    </span>
                    Start
                  </Link>
                </div>
              </div>
            </div>

            <div className="console__side console__side--r">
              <div className="face" role="group" aria-label="Quick actions">
                <Link
                  className="face__b face__b--t"
                  to="/competitions"
                  data-act="face"
                  aria-label="Competitions"
                >
                  <i className="i i-trophy" aria-hidden="true" />
                  <span className="face__tip" aria-hidden="true">
                    Competitions
                  </span>
                </Link>
                <Link
                  className="face__b face__b--l"
                  to="/schedule"
                  data-act="face"
                  aria-label="Schedule"
                >
                  <i className="i i-calendar" aria-hidden="true" />
                  <span className="face__tip" aria-hidden="true">
                    Schedule
                  </span>
                </Link>
                <Link
                  className="face__b face__b--r"
                  to="/register"
                  data-act="face"
                  aria-label="Register"
                >
                  <i className="i i-play" aria-hidden="true" />
                  <span className="face__tip" aria-hidden="true">
                    Register
                  </span>
                </Link>
                <button
                  className="face__b face__b--b"
                  type="button"
                  data-act="ok"
                  aria-label="Open the selected category"
                >
                  <i className="i i-check" aria-hidden="true" />
                  <span className="face__tip" aria-hidden="true">
                    Open category
                  </span>
                </button>
              </div>
              <span className="grille" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <CategoryTicker />
    </>
  );
}
