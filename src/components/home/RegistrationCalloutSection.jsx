// Renders the Home registration callout and its arcade-style start interaction.
import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { homeEvent } from '../../data/homeEvent.js';
import { homeRegistrationCalloutContent } from '../../data/homeRegistrationCallout.js';

const COIN_NOTES = [[988, 0.07], [1319, 0.32]];

function getDeadlineParts() {
  const timestamp = Date.parse(homeEvent.registration.deadline);
  if (!Number.isFinite(timestamp)) return null;

  const deadline = new Date(timestamp);
  const { timeZone, timeZoneLabel } = homeRegistrationCalloutContent;
  return {
    date: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone,
    }).format(deadline),
    dateTime: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(deadline) + ` ${timeZoneLabel}`,
  };
}

function playCoinSound(audioContextRef) {
  let soundEnabled = false;
  try {
    soundEnabled = window.localStorage.getItem('procom27-sfx') === '1';
  } catch {
    return;
  }
  if (!soundEnabled) return;

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return;

  try {
    const audioContext = audioContextRef.current
      || (audioContextRef.current = new AudioContextConstructor());
    if (audioContext.state === 'suspended') void audioContext.resume();

    let startTime = audioContext.currentTime + 0.01;
    COIN_NOTES.forEach(([frequency, duration]) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
      startTime += duration * 0.92;
    });
  } catch {
    // Audio is optional and must not interrupt the registration link.
  }
}

export default function RegistrationCalloutSection() {
  const contentRef = useRef(null);
  const buttonRef = useRef(null);
  const playerRef = useRef(null);
  const audioContextRef = useRef(null);
  const timersRef = useRef([]);
  const deadline = getDeadlineParts();
  const isDemo = Boolean(homeEvent.demoNotice);

  useEffect(() => {
    const content = contentRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!content || reduceMotion || !('IntersectionObserver' in window)) {
      content?.classList.add('is-in');
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    observer.observe(content);

    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach(window.clearTimeout);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close();
    }
  }, []);

  const handleStart = () => {
    playCoinSound(audioContextRef);

    const button = buttonRef.current;
    const player = playerRef.current;
    if (!button || !player || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    button.classList.remove('is-go');
    player.classList.remove('is-on');
    void button.offsetWidth;
    button.classList.add('is-go');
    player.classList.add('is-on');
    timersRef.current.push(window.setTimeout(() => button.classList.remove('is-go'), 900));
    timersRef.current.push(window.setTimeout(() => player.classList.remove('is-on'), 1400));
  };

  return (
    <section
      className="callout"
      id="play"
      aria-labelledby="call-title"
      data-munch="ticket"
      data-munch-label="Start game"
    >
      <div className="container callout__in" data-reveal ref={contentRef}>
        <div>
          <div className="coins" aria-hidden="true">
            <i style={{ '--n': 0 }} />
            <i style={{ '--n': 1 }} />
            <i style={{ '--n': 2 }} />
          </div>
          <h2 className="t-d2" id="call-title">
            {homeRegistrationCalloutContent.heading}
            <span className="t-soft">{homeRegistrationCalloutContent.headingAccent}</span>
          </h2>
          <p id="callLine">
            {homeRegistrationCalloutContent.introduction}{' '}
            {deadline?.date || <span className="tbc">[Registration deadline]</span>}.
          </p>
          <p className="callout__dl" id="callDeadline">
            Registration deadline:{' '}
            {deadline
              ? <b>{deadline.dateTime}</b>
              : <span className="tbc">[Date, time, and timezone]</span>}
            {isDemo && <> <span className="tbc" title="Demo value">Demo deadline</span></>}
          </p>
        </div>
        <div className="callout__cta">
          <span className="p1" id="p1" aria-hidden="true" ref={playerRef}>Player 1 ready</span>
          <p className="press" aria-hidden="true">Press start</p>
          <Link
            className="startbtn"
            id="startGame"
            href={homeRegistrationCalloutContent.registrationHref}
            data-demo
            data-demo-kind="register"
            data-register
            onClick={handleStart}
            ref={buttonRef}
          >
            <i className="i i-play" aria-hidden="true" />
            Start game
          </Link>
          <p className="callout__sub">
            <span className="slot" aria-hidden="true"><i /></span>
            <span className="t-label">Insert coin · 1 credit</span>
          </p>
          <Link className="link-action" href={homeRegistrationCalloutContent.informationHref} data-demo>
            Registration info<i className="i i-arrow" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
