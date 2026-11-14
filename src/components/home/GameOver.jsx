import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { homeGameOver } from "../../data/homeGameOver.js";

export default function GameOver() {
  const sectionRef = useRef(null);
  const swapRef = useRef(null);
  const [word, setWord] = useState(homeGameOver.words[0]);
  const previousWord = useRef(word);

  useLayoutEffect(() => {
    if (previousWord.current === word) return;
    previousWord.current = word;

    const swap = swapRef.current;
    if (!swap) return;

    swap.classList.remove("is-flip");
    void swap.offsetWidth;
    swap.classList.add("is-flip");
  }, [word]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let intervalId;
    let started = false;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-in");
        if (started || prefersReducedMotion) return;

        started = true;
        intervalId = window.setInterval(() => {
          setWord((current) =>
            current === homeGameOver.words[0]
              ? homeGameOver.words[1]
              : homeGameOver.words[0],
          );
        }, 3000);
      },
      { threshold: 0.3 },
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
    };
  }, []);

  const renderLetters = (text, start) =>
    [...text].map((letter, index) => (
      <span key={`${start}-${index}`} style={{ "--i": start + index }}>
        {letter}
      </span>
    ));

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

    // Focus the page landmark without triggering a second scroll.
    const topTarget =
      document.querySelector("header, [role='banner']") || document.body;
    if (!topTarget.hasAttribute("tabindex")) {
      topTarget.setAttribute("tabindex", "-1");
    }
    topTarget.focus({ preventScroll: true });
  };

  return (
    <section
      ref={sectionRef}
      className="gameover"
      id="gameover"
      aria-labelledby="go-title"
      data-munch="check"
      data-munch-label="Game over"
    >
      <div className="container">
        <h2
          className="go__title"
          id="go-title"
          aria-label={`Game ${word.toLowerCase()}`}
        >
          {renderLetters(homeGameOver.title, 0)}
          <span className="gap" style={{ "--i": 4 }} />
          <span ref={swapRef} className="go__swap" aria-hidden="true">
            {renderLetters(word, 5)}
          </span>
        </h2>
        <p className="go__meta">
          <span>
            Score <b id="goXP">{homeGameOver.score}</b>
          </span>
          <span>
            Level <b id="goLv">{homeGameOver.level}</b>
          </span>
          <span>
            Quests <b id="goQ">{homeGameOver.quests}</b>
          </span>
        </p>
        <p className="go__cont is-end" id="goCont">
          {homeGameOver.continue}
        </p>
        <div className="btn-row">
          <Link to={homeGameOver.registerHref} className="btn btn--arcade">
            <i className="i i-play" aria-hidden="true" />
            Register
          </Link>
          <button
            className="btn btn--secondary"
            type="button"
            id="goTop"
            onClick={scrollToTop}
          >
            <i className="i i-chevron-up" aria-hidden="true" />
            Back to start
          </button>
        </div>
      </div>
    </section>
  );
}
