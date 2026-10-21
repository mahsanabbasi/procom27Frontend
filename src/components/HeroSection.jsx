import { useEffect, useMemo, useRef, useState } from 'react';
import { drawPixelMark } from '../utils/pixelMark.js';
import { COUNTDOWN, UNKNOWN, isRevealed, revealValue } from '../data/reveals.js';
import { PROCOM_FORM_URL, EXTERNAL } from '../data/links.js';
import { TEAMS_PATH } from '../data/teams.js';

// The wireframe hero: the name and the two ways in on the left, the mark and
// the clock on the right. Every figure here is reveal-gated — until it is
// announced it prints `???` rather than a number nobody has agreed to.
const FACTS = [
  { key: 'competitionCount', label: 'Competitions' },
  { key: 'sponsorCount', label: 'Sponsors' },
];

function Unit({ value, label }) {
  return (
    <div className="clock-unit">
      <div className="clock-digit">{value}</div>
      <div className="clock-label">{label}</div>
    </div>
  );
}

function useCountdown(target) {
  const targetTimestamp = useMemo(() => Date.parse(target), [target]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const s = Math.max(0, Math.floor((targetTimestamp - now) / 1000));
  return {
    isLive: targetTimestamp - now <= 0,
    d: pad(Math.floor(s / 86400)),
    h: pad(Math.floor((s % 86400) / 3600)),
    m: pad(Math.floor((s % 3600) / 60)),
    s: pad(s % 60),
  };
}

// The clock keeps its own time so that its once-a-second tick re-renders
// these few digits and nothing else. When it lived in App the whole page,
// team cards and all, was rebuilt every second, which stalled the main thread
// and made the team roller stutter.
function Clock({ timed }) {
  const countdown = useCountdown(COUNTDOWN.target);

  return (
    <div className="clock">
      {timed && countdown.isLive ? (
        <>
          <p className="clock-title clock-title-live">Now playing</p>
          <p className="clock-live">PROCOM&apos;27 · Day 01 is live</p>
        </>
      ) : (
        <>
          <p className="clock-title">Time remaining</p>
          <div
            className={`clock-row${timed ? '' : ' is-unknown'}`}
            aria-label={timed
              ? `${Number(countdown.d)} days, ${Number(countdown.h)} hours, ${Number(countdown.m)} minutes and ${Number(countdown.s)} seconds to Day 1`
              : 'The start time has not been announced yet'}
          >
            <Unit value={timed ? countdown.d : UNKNOWN} label="Days" />
            <span className="clock-sep" aria-hidden="true">:</span>
            <Unit value={timed ? countdown.h : UNKNOWN} label="Hrs" />
            <span className="clock-sep" aria-hidden="true">:</span>
            <Unit value={timed ? countdown.m : UNKNOWN} label="Min" />
            <span className="clock-sep" aria-hidden="true">:</span>
            <Unit value={timed ? countdown.s : UNKNOWN} label="Sec" />
          </div>
        </>
      )}
      <p className="clock-foot">
        {timed ? 'Day 01 starts' : 'Date & time announcement pending'} · applications to join a team are open
      </p>
    </div>
  );
}

export const HeroSection = () => {
  const markRef = useRef(null);
  // The start time lands with the date & time announcement; until then the
  // clock is honest about not knowing.
  const timed = isRevealed('eventTimings');

  useEffect(() => {
    drawPixelMark(markRef.current, '#b995e6');
  }, []);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true" />

      <div className="shell hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-name" data-load style={{ '--d': '160ms' }}>
            <span className="hero-word">
              PROCOM
              <span aria-hidden="true" className="glitch glitch-a">PROCOM</span>
              <span aria-hidden="true" className="glitch glitch-b">PROCOM</span>
            </span>
            <span className="hero-word-row">
              <span className="hero-year">&apos;27</span>
              <span className="hero-tagline">Where skill meets scale</span>
            </span>
          </h1>

          <div className="hero-actions" data-load style={{ '--d': '280ms' }}>
            <a href={PROCOM_FORM_URL} {...EXTERNAL} className="pixel-btn-primary">
              <span className="caret caret-play" aria-hidden="true">▶</span>
              Join the team
            </a>
            <a href={TEAMS_PATH} className="pixel-btn-secondary">Explore teams</a>
          </div>

          <dl className="hero-facts" data-load style={{ '--d': '380ms', '--cols': FACTS.length }}>
            {FACTS.map((fact) => {
              const value = revealValue(fact.key);
              return (
                <div key={fact.key}>
                  <dt className={value === UNKNOWN ? 'is-unknown' : undefined}>{value}</dt>
                  <dd>{fact.label}</dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="hero-visual" data-load style={{ '--d': '320ms' }}>
          <div className="hero-mark">
            <canvas ref={markRef} width={22} height={30} role="img" aria-label="The PROCOM pixel mark" />
          </div>

          <Clock timed={timed} />
        </div>
      </div>
    </section>
  );
};
