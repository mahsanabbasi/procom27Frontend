// Homepage footer with the local Bit Runner game.
import { Link } from 'wouter';
import { homeFooter } from '../../data/homeFooter.js';
import useBitRunner from './useBitRunner.js';

function FooterLink({ href, children }) {
  return <Link href={href}>{children}</Link>;
}

export default function HomeFooter() {
  const {
    rootRef,
    stageRef,
    canvasRef,
    overlayRef,
    player,
    playerInput,
    score,
    overlay,
    outcome,
    champion,
    board,
    error,
    start,
    showForm,
    updatePlayerInput,
    handleRollKeyDown,
    submitPlayer,
  } = useBitRunner();

  return (
    <>
      <section
        ref={rootRef}
        className={`frun${champion ? ' has-champion' : ''}`}
        data-runner
        aria-labelledby="frun-title"
      >
        <div className="frun__game">
          <div className="frun__hud">
            <h2 className="frun__title" id="frun-title">Bit Runner</h2>
            <span>Player <b>{player || homeFooter.runnerPlayer}</b></span>
            <span>Score <b>{score}</b></span>
          </div>
          <div
            ref={stageRef}
            className="frun__stage"
            data-r-stage
            tabIndex="-1"
            aria-label="Bit Runner game"
          >
            <canvas
              ref={canvasRef}
              width="400"
              height="100"
              data-r-canvas
              role="img"
              aria-label="Bit Runner, a pixel runner game. Jump over the bugs to score."
            />
            <div ref={overlayRef} className="frun__ov" data-r-ov>
              {overlay === 'form' && (
                <form className="frun__form" noValidate onSubmit={submitPlayer}>
                  <label className="frun__lbl" htmlFor="runner-roll">
                    Enter your roll no.
                  </label>
                  <div className="frun__row">
                    <input
                      className="frun__in"
                      id="runner-roll"
                      name="roll"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="2X-XXXX"
                      maxLength="7"
                      aria-describedby="runner-roll-help runner-roll-error"
                      aria-invalid={Boolean(error)}
                      value={playerInput}
                      onChange={(event) => updatePlayerInput(event.target.value)}
                      onKeyDown={handleRollKeyDown}
                    />
                    <button className="frun__go" type="submit">
                      Play <i className="i i-play" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="frun__hint" id="runner-roll-help">
                    Digits only · format 2X-XXXX
                  </p>
                  <p className="frun__err" id="runner-roll-error" role="alert">
                    {error}
                  </p>
                </form>
              )}
              {overlay === 'ready' && (
                <div className="frun__msg">
                  <p className="frun__k">Player <b>{player}</b></p>
                  <button className="frun__go" type="button" data-r-play onClick={start}>
                    Play <i className="i i-play" aria-hidden="true" />
                  </button>
                  <button className="frun__link" type="button" onClick={showForm}>
                    Not you? Change roll no.
                  </button>
                </div>
              )}
              {overlay === 'over' && outcome && (
                <div className="frun__msg">
                  <p className="frun__big">Game over</p>
                  <p className="frun__k">
                    {player} · <b>{String(outcome.score).padStart(5, '0')}</b>
                    {outcome.flag === 'champ'
                      ? ' · New champion!'
                      : outcome.flag === 'best' ? ' · Personal best' : ''}
                  </p>
                  <button className="frun__go" type="button" data-r-play onClick={start}>
                    Play again <i className="i i-refresh" aria-hidden="true" />
                  </button>
                  <button className="frun__link" type="button" onClick={showForm}>
                    Change roll no.
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="frun__help">{homeFooter.runnerHelp}</p>
        </div>
        <aside
          className={`frun__champ${outcome?.flag === 'champ' ? ' is-new' : ''}`}
          data-r-champ
          aria-live="polite"
          aria-label="Bit Runner champion"
          hidden={!champion}
        >
          <span className="frun__tape" aria-hidden="true" />
          <p className="frun__clbl">Champion</p>
          {champion ? (
            <>
              <p className="frun__roll">{champion.roll}</p>
              <p className="frun__cs">
                Hi-score <b>{String(champion.score).padStart(5, '0')}</b>
              </p>
            </>
          ) : (
            <>
              <p className="frun__roll frun__roll--empty">2X-XXXX</p>
              <p className="frun__cs">No champion yet. Be the first.</p>
            </>
          )}
          {board.length > 1 && (
            <ol className="frun__board">
              {board.slice(0, 5).map((entry, index) => (
                <li
                  className={entry.roll === player ? 'is-me' : undefined}
                  key={entry.roll}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{entry.roll}</span>
                  <b>{String(entry.score).padStart(5, '0')}</b>
                </li>
              ))}
            </ol>
          )}
          <p className="frun__note">{homeFooter.leaderboardNote}</p>
        </aside>
      </section>
      <footer className="footer">
        <div className="container">
          <div className="footer__grid footer__grid--4">
            <div>
              <Link className="brand" href="/" aria-label="PROCOM’27 home">
                <svg className="brand__mark" viewBox="0 0 186 251" aria-hidden="true">
                  <defs><linearGradient id="home-footer-mark-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DCC8FF" /><stop offset="1" stopColor="#B57CFF" /></linearGradient></defs>
                  <path d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z" fill="#493460" />
                  <path d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z" fill="url(#home-footer-mark-gradient)" />
                </svg>
                <span className="brand__word">{homeFooter.brand}</span>
              </Link>
              <p className="footer__tag t-label" style={{ marginTop: 'var(--s-3)' }}>{homeFooter.tagline}</p>
              <p className="footer__about">{homeFooter.about}</p>
              {homeFooter.socials.length > 0 && (
                <div className="socials">
                  {homeFooter.socials.map((social) => (
                    <a
                      className="icon-btn"
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <i className={`i i-${social.icon}`} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <nav aria-label="Quick links">
              <h2>Quick links</h2>
              <ul>{homeFooter.quickLinks.map((item) => <li key={item.href}><FooterLink href={item.href}>{item.label}</FooterLink></li>)}</ul>
            </nav>
            <nav aria-label="Competitions">
              <h2>Competitions</h2>
              <ul>
                {homeFooter.competitions.map((item) => (
                  <li key={item.id}><FooterLink href={`/competitions?cat=${item.id}`}>{item.label}</FooterLink></li>
                ))}
              </ul>
            </nav>
            <div>
              <h2>Contact</h2>
              <ul>
                {homeFooter.contact.map((item) => (
                  <li key={item.label}>
                    {item.href
                      ? <a href={item.href}>{item.label}</a>
                      : <span>{item.label}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span>{homeFooter.copyright}</span>
            <ul className="footer__legal">
              {homeFooter.legalLinks.map((item) => (
                <li key={item.href}><FooterLink href={item.href}>{item.label}</FooterLink></li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
