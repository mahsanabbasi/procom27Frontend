// Renders the reference Home hero inside its handheld-console shell.
import { useEffect } from 'react';
import { Link } from 'wouter';
import { homeHeroContent } from '../../data/homeHero.js';
import { useHomeHeroEffects } from './useHomeHeroEffects.js';

function Icon({ name }) {
  return <i className={`i i-${name}`} aria-hidden="true" />;
}

function CategoryTicker() {
  const items = [
    ...homeHeroContent.categories.map(({ id, label }) => ({ id: `cat-${id}`, label })),
    ...homeHeroContent.additionalTickerItems.map((label) => ({ id: 'square', label })),
  ];

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track" id="ticker">
        {[...items, ...items].map(({ id, label }, index) => (
          <span className="ticker__item" key={`${id}-${index}`}>
            <Icon name={id} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HomeHero() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'PROCOM’27 — Where skill meets scale.';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const {
    consoleRef,
    screenRef,
    logoCanvasRef,
    waveCanvasRef,
    visualRef,
    orbitRef,
    nubRef,
    selectedCategory,
    selectionVisible,
    screenOff,
    consoleSleeping,
    screenOn,
    bootVisible,
    bootRunning,
    bootDone,
    brightness,
    osd,
    clock,
  } = useHomeHeroEffects();
  const selected = homeHeroContent.categories[selectedCategory];

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className={`console${consoleSleeping ? ' is-sleep' : ''}`} id="console" ref={consoleRef}>
          <button className="console__sh console__sh--l" type="button" data-act="L" aria-label="Previous category">L</button>
          <button className="console__sh console__sh--r" type="button" data-act="R" aria-label="Next category">R</button>
          <div className="console__shell">
            <span className="console__light" aria-hidden="true" />
            <span className="console__screw console__screw--l" aria-hidden="true" />
            <span className="console__screw console__screw--r" aria-hidden="true" />

            <div className="console__side console__side--l">
              <div className="dpad" role="group" aria-label="Direction pad">
                <button className="dpad__b dpad__b--u" type="button" data-act="up" aria-label="Back to top">
                  <Icon name="chevron-up" />
                </button>
                <button className="dpad__b dpad__b--l" type="button" data-act="left" aria-label="Previous category">
                  <Icon name="chevron-left" />
                </button>
                <button className="dpad__b dpad__b--r" type="button" data-act="right" aria-label="Next category">
                  <Icon name="chevron-right" />
                </button>
                <button className="dpad__b dpad__b--d" type="button" data-act="down" aria-label="Jump to registration">
                  <Icon name="chevron-down" />
                </button>
                <span className="dpad__x" aria-hidden="true">
                  <svg viewBox="0 0 19 19">
                    <rect x="6" y="0" width="7" height="19" fill="#07060B" />
                    <rect x="0" y="6" width="19" height="7" fill="#07060B" />
                    <rect x="7" y="1" width="5" height="17" fill="#4A3562" />
                    <rect x="1" y="7" width="17" height="5" fill="#4A3562" />
                    <rect x="7" y="1" width="5" height="1" fill="#7E62A0" />
                    <rect x="7" y="1" width="1" height="6" fill="#7E62A0" />
                    <rect x="1" y="7" width="6" height="1" fill="#7E62A0" />
                    <rect x="1" y="7" width="1" height="5" fill="#7E62A0" />
                    <rect x="12" y="7" width="6" height="1" fill="#7E62A0" />
                    <rect x="7" y="12" width="1" height="6" fill="#7E62A0" />
                    <rect x="11" y="2" width="1" height="5" fill="#2E2140" />
                    <rect x="1" y="11" width="6" height="1" fill="#2E2140" />
                    <rect x="17" y="8" width="1" height="4" fill="#2E2140" />
                    <rect x="12" y="11" width="6" height="1" fill="#2E2140" />
                    <rect x="11" y="12" width="1" height="6" fill="#2E2140" />
                    <rect x="7" y="17" width="5" height="1" fill="#2E2140" />
                    <rect className="arm arm-u" x="7" y="1" width="5" height="6" fill="#07060B" opacity=".45" />
                    <rect className="arm arm-d" x="7" y="12" width="5" height="6" fill="#07060B" opacity=".45" />
                    <rect className="arm arm-l" x="1" y="7" width="6" height="5" fill="#07060B" opacity=".45" />
                    <rect className="arm arm-r" x="12" y="7" width="6" height="5" fill="#07060B" opacity=".45" />
                    <rect x="8" y="8" width="3" height="3" fill="#2E2140" />
                    <rect x="9" y="9" width="1" height="1" fill="#7E62A0" />
                    <g className="arr arr-u" fill="#B57CFF">
                      <rect x="9" y="3" width="1" height="1" />
                      <rect x="8" y="4" width="3" height="1" />
                    </g>
                    <g className="arr arr-d" fill="#B57CFF">
                      <rect x="8" y="14" width="3" height="1" />
                      <rect x="9" y="15" width="1" height="1" />
                    </g>
                    <g className="arr arr-l" fill="#B57CFF">
                      <rect x="3" y="9" width="1" height="1" />
                      <rect x="4" y="8" width="1" height="3" />
                    </g>
                    <g className="arr arr-r" fill="#B57CFF">
                      <rect x="15" y="9" width="1" height="1" />
                      <rect x="14" y="8" width="1" height="3" />
                    </g>
                  </svg>
                </span>
              </div>
              <button
                className="nub"
                id="nub"
                type="button"
                aria-label="Analog stick: drag it to push the pixels around"
                ref={nubRef}
              >
                <span className="nub__cap" />
                <span className="nub__lbl" aria-hidden="true">Drag</span>
              </button>
              <span className="grille" aria-hidden="true" />
            </div>

            <div className="console__mid">
              <div className="console__glass">
                <div
                  className={`screen${screenOff ? ' is-off' : ''}${screenOn ? ' is-on' : ''}`}
                  id="screen"
                  ref={screenRef}
                  style={{ '--dim': brightness }}
                >
                  <canvas className="screen__wave" id="scrWave" aria-hidden="true" ref={waveCanvasRef} />
                  <div className="screen__status t-label" aria-hidden="true">
                    <span className="ss__l">
                      <Icon name="square" />PROCOM OS <span className="ss__dim">v27</span>
                    </span>
                    <span className="ss__r">
                      <span id="scrClock">{clock}</span>
                      <span className="ss__dim">PKT</span>
                      <Icon name="signal" />
                      <span className="batt"><i /></span>
                    </span>
                  </div>
                  <div className="scr">
                    <div className="scr__copy">
                      <p className="hero__id t-label scr-in" style={{ '--i': 0 }}>
                        <Icon name="square" />PROCOM ’27 <span className="sep">•</span>
                        <span id="heroDates">{homeHeroContent.eventDates}</span>
                        <span className="sep">•</span>
                        <span id="heroCampus">{homeHeroContent.campus}</span>
                      </p>
                      <p className="hero__start t-label scr-in" style={{ '--i': 1 }}>Game start</p>
                      <h1 className="t-d1 t-extrude" id="hero-title" aria-label="Where skill meets scale.">
                        {homeHeroContent.title.map((line) => (
                          <span
                            className="row"
                            data-decode
                            aria-hidden="true"
                            key={line}
                          >
                            {line}
                          </span>
                        ))}
                      </h1>
                      <p className="t-body-lg scr-in" style={{ '--i': 2 }}>{homeHeroContent.description}</p>
                      <div className="btn-row scr-in" style={{ '--i': 3 }}>
                        <Link className="btn btn--arcade" href="/register" data-demo data-demo-kind="register" data-register>
                          <Icon name="play" />Register now
                        </Link>
                        <Link className="btn btn--secondary" href="/competitions">
                          Explore competitions<Icon name="arrow" />
                        </Link>
                      </div>
                      <div className="stats scr-in" id="stats" style={{ '--i': 4 }}>
                        {homeHeroContent.stats.map(({ label, value, note }) => (
                          <div className="card stat fx-spot" key={label}>
                            <span className="stat__v">{value ?? '--'}</span>
                            {value === null ? (
                              <span className="tbc">[{note}]</span>
                            ) : (
                              <span className="tbc" title="Counted from the demo competition list">{note}</span>
                            )}
                            <span className="stat__l">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="scr__visual scr-in" style={{ '--i': 2 }}>
                      <div className="visual" ref={visualRef}>
                        <canvas
                          id="logoCanvas"
                          aria-label="Animated PROCOM ’27 logo made of pixels"
                          role="img"
                          ref={logoCanvasRef}
                        />
                        <nav className="orbit" id="orbit" aria-label="Competition categories" ref={orbitRef}>
                          {homeHeroContent.categories.map(({ id, label }) => (
                            <Link
                              className="orb"
                              href="/#competitions"
                              aria-label={`${label} competitions`}
                              key={id}
                            >
                              <Icon name={`cat-${id}`} />
                              <span className="orb__tip" aria-hidden="true">{label}</span>
                            </Link>
                          ))}
                        </nav>
                      </div>
                      <div className={`scr-sel${selectionVisible ? ' is-on' : ''}`} id="scrSel" aria-live="polite">
                        {selected && (
                          <>
                            <span className="key"><Icon name="chevron-left" /></span>
                            <span className="scr-sel__txt">
                              <b>{selected.label}</b>
                              <span>{selected.count} {selected.count === 1 ? 'competition' : 'competitions'} · press <Icon name="check" /> to open</span>
                            </span>
                            <span className="key"><Icon name="chevron-right" /></span>
                          </>
                        )}
                      </div>
                      <p className="vhint t-label" aria-hidden="true">
                        <Icon name="square" />Click the P · hover the icons · try the buttons
                      </p>
                    </div>
                  </div>
                  <div className={`osd${osd ? ' is-on' : ''}`} id="scrOsd" aria-hidden="true">
                    {osd && (
                      <>
                        <span className="t-label">{osd.label}</span>
                        <span className="osd__bars">
                          {Array.from({ length: 10 }, (_, index) => (
                            <i className={index < osd.bars ? 'on' : ''} key={index} />
                          ))}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="sleep" aria-hidden="true">
                    <span className="t-label">Sleep mode</span>
                    <span>Press POWER to wake the screen</span>
                  </div>
                  <div className={`boot${bootRunning ? ' is-run' : ''}${bootDone ? ' is-done' : ''}`} id="scrBoot" aria-hidden="true" hidden={!bootVisible}>
                    <div className="boot__in">
                      <span className="boot__mark" id="bootMark">
                        <svg className="boot__svg" viewBox="0 0 186 251" aria-hidden="true">
                          <defs>
                            <linearGradient id="home-boot-logo-gradient" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0" stopColor="#DCC8FF" />
                              <stop offset="1" stopColor="#B57CFF" />
                            </linearGradient>
                          </defs>
                          <path d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z" fill="#493460" />
                          <path d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z" fill="url(#home-boot-logo-gradient)" />
                        </svg>
                      </span>
                      <span className="boot__word">PROCOM ’27</span>
                      <span className="boot__bar"><i /></span>
                      <span className="boot__hint">Press any button</span>
                    </div>
                  </div>
                  <span className="screen__dim" aria-hidden="true" />
                  <span className="screen__fx" aria-hidden="true" />
                </div>
              </div>
              <div className="console__bar">
                <div className="console__grp">
                  <button className="sysb" type="button" data-act="power" aria-pressed={screenOff} aria-label={screenOff ? 'Power: wake the screen' : 'Power: put the screen to sleep'}>
                    <span className="sysb__k"><span className="console__led" aria-hidden="true" /></span>Power
                  </button>
                  <button className="sysb sysb--round" type="button" data-act="home" aria-label="Home: replay the start-up screen">
                    <span className="sysb__k"><Icon name="square" /></span>Home
                  </button>
                  <button className="sysb" type="button" data-act="bright" aria-label="Screen brightness">
                    <span className="sysb__k"><Icon name="eye" /></span>Bright
                  </button>
                  <button className="sysb" type="button" data-act="voldown" aria-label="Sound off">
                    <span className="sysb__k"><Icon name="minus" /></span>Vol
                  </button>
                  <button className="sysb" type="button" data-act="volup" aria-label="Sound on">
                    <span className="sysb__k"><Icon name="plus" /></span>Vol
                  </button>
                </div>
                <span className="console__brand" aria-hidden="true">PROCOM · Portable</span>
                <div className="console__grp">
                  <button className="sysb" type="button" data-act="select" aria-label="Select: scatter the logo pixels">
                    <span className="sysb__k" />Select
                  </button>
                  <Link className="sysb" href="/register" data-demo data-demo-kind="register" data-act="start" aria-label="Start: register">
                    <span className="sysb__k"><Icon name="play" /></span>Start
                  </Link>
                </div>
              </div>
            </div>

            <div className="console__side console__side--r">
              <div className="face" role="group" aria-label="Quick actions">
                <Link className="face__b face__b--t" href="/competitions" data-act="face" aria-label="Competitions">
                  <span className="face__cap"><Icon name="trophy" /></span>
                  <span className="face__tip" aria-hidden="true">Competitions</span>
                </Link>
                <Link className="face__b face__b--l" href="/schedule" data-act="face" aria-label="Schedule">
                  <span className="face__cap"><Icon name="calendar" /></span>
                  <span className="face__tip" aria-hidden="true">Schedule</span>
                </Link>
                <Link className="face__b face__b--r" href="/register" data-demo data-demo-kind="register" data-act="face" aria-label="Register">
                  <span className="face__cap"><Icon name="play" /></span>
                  <span className="face__tip" aria-hidden="true">Register</span>
                </Link>
                <button className="face__b face__b--b" type="button" data-act="ok" aria-label="Open the selected category">
                  <span className="face__cap"><Icon name="check" /></span>
                  <span className="face__tip" aria-hidden="true">Open category</span>
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
