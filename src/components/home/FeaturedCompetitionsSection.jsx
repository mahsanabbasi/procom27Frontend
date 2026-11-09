// Renders the final-reference featured handheld and owns its slideshow lifecycle.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { homeCategories, homeCompetitions } from '../../data/homeCompetitions.js';
import { CompetitionArt, PixelBanner } from './FeaturedCompetitionArtwork.jsx';

const featuredCompetitions = homeCompetitions.filter(({ featured }) => featured);
const slideDuration = 6500;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ));

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event) => setReduced(event.matches);
    query.addEventListener?.('change', update);
    if (!query.addEventListener) query.addListener(update);
    return () => {
      query.removeEventListener?.('change', update);
      if (!query.removeEventListener) query.removeListener(update);
    };
  }, []);

  return reduced;
}

function Icon({ name }) {
  return <i className={`i i-${name}`} aria-hidden="true" />;
}

function DpadSprite() {
  return (
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
        <rect className="arm arm-u" x="7" y="1" width="5" height="6" fill="#07060B" />
        <rect className="arm arm-d" x="7" y="12" width="5" height="6" fill="#07060B" />
        <rect className="arm arm-l" x="1" y="7" width="6" height="5" fill="#07060B" />
        <rect className="arm arm-r" x="12" y="7" width="6" height="5" fill="#07060B" />
        <rect x="8" y="8" width="3" height="3" fill="#2E2140" />
        <rect x="9" y="9" width="1" height="1" fill="#7E62A0" />
        <g className="arr arr-u"><rect x="9" y="3" width="1" height="1" /><rect x="8" y="4" width="3" height="1" /></g>
        <g className="arr arr-d"><rect x="8" y="14" width="3" height="1" /><rect x="9" y="15" width="1" height="1" /></g>
        <g className="arr arr-l"><rect x="3" y="9" width="1" height="1" /><rect x="4" y="8" width="1" height="3" /></g>
        <g className="arr arr-r"><rect x="15" y="9" width="1" height="1" /><rect x="14" y="8" width="1" height="3" /></g>
      </svg>
    </span>
  );
}

function CompetitionFacts({ competition }) {
  return (
    <ul className="spot__facts" id="spFacts">
      <li><Icon name="calendar" /><span>Day {competition.day} · {competition.dateLabel} • {competition.start}–{competition.end}</span></li>
      <li><Icon name="pin" /><span>{competition.venue}</span></li>
      <li><Icon name="users" /><span>Team size: {competition.team}</span></li>
    </ul>
  );
}

export default function FeaturedCompetitionsSection() {
  const [, navigate] = useLocation();
  const reduceMotion = usePrefersReducedMotion();
  const [infoIndex, setInfoIndex] = useState(0);
  const [screenIndex, setScreenIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const paused = reduceMotion || userPaused;
  const handheldRef = useRef(null);
  const infoPanelRef = useRef(null);
  const progressRef = useRef(null);
  const selectedRef = useRef(0);
  const pausedRef = useRef(reduceMotion);
  const reducedRef = useRef(reduceMotion);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);
  const interactingRef = useRef(false);
  const startTimeRef = useRef(0);
  const infoTimerRef = useRef(null);
  const screenTimerRef = useRef(null);
  const animationTimerRef = useRef(null);
  const pressTimerRef = useRef(null);
  const pressButtonRef = useRef(null);

  const clearSlideTimers = useCallback(() => {
    window.clearTimeout(infoTimerRef.current);
    window.clearTimeout(screenTimerRef.current);
    window.clearTimeout(animationTimerRef.current);
    infoTimerRef.current = null;
    screenTimerRef.current = null;
    animationTimerRef.current = null;
  }, []);

  const show = useCallback((requestedIndex, animate = true) => {
    const index = (requestedIndex + featuredCompetitions.length) % featuredCompetitions.length;
    const now = performance.now();
    selectedRef.current = index;
    startTimeRef.current = now;
    if (progressRef.current) progressRef.current.style.width = '0%';
    clearSlideTimers();

    const shouldAnimate = animate && !reducedRef.current;
    const handheld = handheldRef.current;
    const infoPanel = infoPanelRef.current;
    if (shouldAnimate && handheld && infoPanel) {
      handheld.classList.remove('is-swap');
      void handheld.offsetWidth;
      handheld.classList.add('is-swap');
      infoPanel.classList.remove('is-swapping');
      void infoPanel.offsetWidth;
      infoPanel.classList.add('is-swapping');
      screenTimerRef.current = window.setTimeout(() => {
        setScreenIndex(index);
        screenTimerRef.current = null;
      }, 280);
      infoTimerRef.current = window.setTimeout(() => {
        setInfoIndex(index);
        infoTimerRef.current = null;
      }, 200);
      animationTimerRef.current = window.setTimeout(() => {
        handheld.classList.remove('is-swap');
        infoPanel.classList.remove('is-swapping');
        animationTimerRef.current = null;
      }, 800);
    } else {
      setInfoIndex(index);
      setScreenIndex(index);
    }
  }, [clearSlideTimers]);

  const setPause = useCallback((nextPaused) => {
    pausedRef.current = nextPaused || reducedRef.current;
    setUserPaused(nextPaused && !reducedRef.current);
    startTimeRef.current = performance.now();
  }, []);

  const press = useCallback((button) => {
    if (!button) return;
    window.clearTimeout(pressTimerRef.current);
    if (pressButtonRef.current && pressButtonRef.current !== button) {
      pressButtonRef.current.classList.remove('is-press');
    }
    pressButtonRef.current = button;
    button.classList.remove('is-press');
    void button.offsetWidth;
    button.classList.add('is-press');
    pressTimerRef.current = window.setTimeout(() => {
      button.classList.remove('is-press');
      pressButtonRef.current = null;
      pressTimerRef.current = null;
    }, 170);
  }, []);

  const activate = useCallback((action, button) => {
    press(button);
    if (action === 'prev') show(selectedRef.current - 1);
    if (action === 'next') show(selectedRef.current + 1);
    if (action === 'a') navigate(`/competitions/${featuredCompetitions[selectedRef.current].id}`);
    if (action === 'b') setPause(!pausedRef.current);
  }, [navigate, press, setPause, show]);

  const updateInteraction = useCallback((pointerInside, focusInside) => {
    pointerInsideRef.current = pointerInside;
    focusInsideRef.current = focusInside;
    const interacting = pointerInside || focusInside;
    if (interactingRef.current && !interacting) startTimeRef.current = performance.now();
    interactingRef.current = interacting;
  }, []);

  const onPointerEnter = useCallback(() => {
    updateInteraction(true, focusInsideRef.current);
  }, [updateInteraction]);

  const onPointerLeave = useCallback(() => {
    updateInteraction(false, focusInsideRef.current);
  }, [updateInteraction]);

  const onFocusCapture = useCallback(() => {
    updateInteraction(pointerInsideRef.current, true);
  }, [updateInteraction]);

  const onBlurCapture = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      updateInteraction(pointerInsideRef.current, false);
    }
  }, [updateInteraction]);

  const onHandheldKeyDown = useCallback((event) => {
    const action = {
      ArrowLeft: 'prev',
      ArrowUp: 'prev',
      ArrowRight: 'next',
      ArrowDown: 'next',
    }[event.key];
    if (!action) return;
    event.preventDefault();
    press(handheldRef.current?.querySelector(`.dpad__b[data-gb="${action}"]`));
    show(selectedRef.current + (action === 'prev' ? -1 : 1));
  }, [press, show]);

  const onCartKeyDown = useCallback((event, index) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % featuredCompetitions.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + featuredCompetitions.length) % featuredCompetitions.length;
    if (nextIndex === null) return;
    event.preventDefault();
    show(nextIndex);
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  }, [show]);

  useEffect(() => {
    reducedRef.current = reduceMotion;
    pausedRef.current = reduceMotion || userPaused;
    startTimeRef.current = performance.now();
    if (reduceMotion) {
      handheldRef.current?.classList.remove('is-swap');
      infoPanelRef.current?.classList.remove('is-swapping');
    }
  }, [reduceMotion, userPaused]);

  useEffect(() => {
    let frame = 0;
    const animateProgress = (time) => {
      if (!pausedRef.current && !interactingRef.current && !document.hidden) {
        const progress = (time - startTimeRef.current) / slideDuration;
        if (progressRef.current) progressRef.current.style.width = `${Math.min(100, progress * 100)}%`;
        if (progress >= 1) show(selectedRef.current + 1);
      }
      frame = requestAnimationFrame(animateProgress);
    };
    frame = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(frame);
  }, [show]);

  useEffect(() => () => {
    clearSlideTimers();
    window.clearTimeout(pressTimerRef.current);
    pressButtonRef.current?.classList.remove('is-press');
  }, [clearSlideTimers]);

  const competition = featuredCompetitions[infoIndex];
  const category = homeCategories.find(({ id }) => id === competition.cat);
  const screenCompetition = featuredCompetitions[screenIndex];
  const screenCategory = homeCategories.find(({ id }) => id === screenCompetition.cat);

  return (
    <section
      className="section section--alt"
      id="featured"
      aria-labelledby="feat-title"
      data-munch="play"
      data-munch-label="Featured"
    >
      <div className="container">
        <div className="row-head" data-reveal>
          <div>
            <p className="sh__label t-label"><Icon name="square" />Spotlight</p>
            <h2 className="t-d2" id="feat-title">Featured <span className="t-soft">competitions</span></h2>
            <p className="t-body-lg">A quick look at a few of this year’s challenges.</p>
          </div>
        </div>
        <div className="pocket" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}>
          <div className="gb" id="gb" data-reveal="scale" ref={handheldRef} onKeyDown={onHandheldKeyDown}>
            <div className="gb__cart" id="gbCart" aria-hidden="true">
              <CompetitionArt competition={screenCompetition} />
              <b>{String(screenIndex + 1).padStart(2, '0')}</b>
            </div>
            <div className="gb__body">
              <div className="gb__grooves" aria-hidden="true"><i /><i /></div>
              <div className="gb__bezel">
                <span className="gb__pwr" aria-hidden="true"><i />Power</span>
                <div className="gb__screen" aria-hidden="true">
                  <div className="gbs">
                    <div className="gbs__top"><span>{String(screenIndex + 1).padStart(2, '0')}/{String(featuredCompetitions.length).padStart(2, '0')}</span><span>{screenCategory.short}</span></div>
                    <div className="gbs__art"><PixelBanner category={screenCompetition.cat} reduceMotion={reduceMotion} /></div>
                    <p className="gbs__name">{screenCompetition.name}</p>
                    <p className="gbs__meta">Day {screenCompetition.day} · {screenCompetition.start}<br />{screenCompetition.venue}</p>
                    <div className="gbs__bar"><i ref={progressRef} /></div>
                  </div>
                  <div className="gbs__load"><span>Loading</span><i /></div>
                  <span className="gbs__fx" />
                </div>
                <p className="gb__brand">PROCOM <em>Pocket</em></p>
              </div>
              <div className="gb__ctrl">
                <div className="dpad dpad--sm" role="group" aria-label="Switch competition">
                  <button className="dpad__b dpad__b--u" type="button" data-gb="prev" aria-label="Previous competition" onClick={(event) => activate('prev', event.currentTarget)}><Icon name="chevron-up" /></button>
                  <button className="dpad__b dpad__b--l" type="button" data-gb="prev" aria-label="Previous competition" onClick={(event) => activate('prev', event.currentTarget)}><Icon name="chevron-left" /></button>
                  <button className="dpad__b dpad__b--r" type="button" data-gb="next" aria-label="Next competition" onClick={(event) => activate('next', event.currentTarget)}><Icon name="chevron-right" /></button>
                  <button className="dpad__b dpad__b--d" type="button" data-gb="next" aria-label="Next competition" onClick={(event) => activate('next', event.currentTarget)}><Icon name="chevron-down" /></button>
                  <DpadSprite />
                </div>
                <div className="gb__ab">
                  <button className="gb__btn gb__btn--b" type="button" data-gb="b" aria-pressed={paused} aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'} onClick={(event) => activate('b', event.currentTarget)}><i className="gb__cap" aria-hidden="true" /><span aria-hidden="true">B</span></button>
                  <button className="gb__btn gb__btn--a" type="button" data-gb="a" aria-label="Open competition details" onClick={(event) => activate('a', event.currentTarget)}><i className="gb__cap" aria-hidden="true" /><span aria-hidden="true">A</span></button>
                </div>
              </div>
              <div className="gb__ss">
                <button type="button" data-gb="next" aria-label="Next competition" onClick={(event) => activate('next', event.currentTarget)}><i /><span>Select</span></button>
                <button type="button" data-gb="a" aria-label="Open competition details" onClick={(event) => activate('a', event.currentTarget)}><i /><span>Start</span></button>
              </div>
              <span className="gb__spk" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
            </div>
            <p className="gb__legend t-label" aria-hidden="true">
              <span className="key"><Icon name="chevron-left" /></span>
              <span className="key"><Icon name="chevron-right" /></span>
              switch · <span className="key">A</span>open · <span className="key">B</span>pause
            </p>
          </div>
          <div className="pocket__info">
            <div className="panel corners cinfo" id="spot" aria-live="polite" ref={infoPanelRef}>
              <div className="wipe" aria-hidden="true" />
              <div className="hud t-label"><span>Cartridge <b>{String(infoIndex + 1).padStart(2, '0')} / {String(featuredCompetitions.length).padStart(2, '0')}</b></span><b>{paused ? 'Paused' : 'Auto-play'}</b></div>
              <div className="cinfo__body swap-in">
                <span className="tag tag--accent"><Icon name={`cat-${competition.cat}`} />{category.label}</span>
                <h3 className="spot__name">{competition.name}</h3>
                <p className="spot__blurb">{competition.blurb}</p>
                <CompetitionFacts competition={competition} />
                <div className="spot__diff">
                  <span className="t-label">Difficulty</span>
                  <span className="pips">{Array.from({ length: 5 }, (_, index) => <i className={index < competition.difficulty ? 'on' : ''} key={index} />)}</span>
                  <span className="tbc" title="Demo value">Demo</span>
                </div>
                <div className="btn-row">
                  <Link className="btn btn--primary" href={`/competitions/${competition.id}`}>
                    <Icon name="play" />View details<Icon name="arrow" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="carts" id="spDots" role="tablist" aria-label="Choose a featured competition">
              {featuredCompetitions.map((item, index) => (
                <button
                  className="cart"
                  type="button"
                  role="tab"
                  aria-selected={index === infoIndex}
                  tabIndex={index === infoIndex ? 0 : -1}
                  aria-label={item.name}
                  key={item.id}
                  onClick={() => { if (index !== selectedRef.current) show(index); }}
                  onKeyDown={(event) => onCartKeyDown(event, index)}
                >
                  <span className="cart__art" aria-hidden="true"><CompetitionArt competition={item} /></span>
                  <span className="cart__lbl"><b>CART {String(index + 1).padStart(2, '0')}</b>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
