// Renders the reference Home hero inside its handheld-console shell.
import { Link } from 'wouter';
import { homeHeroContent } from '../../data/homeHero.js';

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
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="console" id="console">
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
              >
                <span className="nub__cap" />
                <span className="nub__lbl" aria-hidden="true">Drag</span>
              </button>
              <span className="grille" aria-hidden="true" />
            </div>

            <div className="console__mid">
              <div className="console__glass">
                <div className="screen" id="screen">
                  <canvas className="screen__wave" id="scrWave" aria-hidden="true" />
                  <div className="screen__status t-label" aria-hidden="true">
                    <span className="ss__l">
                      <Icon name="square" />PROCOM OS <span className="ss__dim">v27</span>
                    </span>
                    <span className="ss__r">
                      <span id="scrClock">--:--</span>
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
                      <h1 className="t-d1 t-extrude" id="hero-title" aria-label="Compete. Connect. Create what’s next.">
                        {homeHeroContent.title.map((line, index) => (
                          <span
                            className={`row${index > 1 ? ' t-soft' : ''}`}
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
                      <div className="visual">
                        <canvas
                          id="logoCanvas"
                          aria-label="Animated PROCOM ’27 logo made of pixels"
                          role="img"
                        />
                        <nav className="orbit" id="orbit" aria-label="Competition categories" />
                      </div>
                      <div className="scr-sel" id="scrSel" aria-live="polite" />
                      <p className="vhint t-label" aria-hidden="true">
                        <Icon name="square" />Click the P · hover the icons · try the buttons
                      </p>
                    </div>
                  </div>
                  <div className="osd" id="scrOsd" aria-hidden="true" />
                  <div className="sleep" aria-hidden="true">
                    <span className="t-label">Sleep mode</span>
                    <span>Press POWER to wake the screen</span>
                  </div>
                  <div className="boot" id="scrBoot" aria-hidden="true" hidden>
                    <div className="boot__in">
                      <span className="boot__mark" id="bootMark" />
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
                  <button className="sysb" type="button" data-act="power" aria-pressed="false" aria-label="Power: put the screen to sleep">
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
