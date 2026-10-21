import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { procomMilestones } from "../data/procomMilestones.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const milestoneCount = procomMilestones.length;

function scrollStops(track, travel) {
  const centers = Array.from(track.children, card => card.offsetLeft + card.offsetWidth / 2);
  const span = centers.at(-1) - centers[0];
  return centers.map(center => span ? (center - centers[0]) / span * travel : 0);
}

function MilestoneVisual({ milestone }) {
  if (milestone.type === "photo") {
    return <img src={milestone.image} alt={milestone.alt} loading="lazy" draggable="false" />;
  }

  return (
    <div className={`pa-archive-art pa-archive-art--${milestone.type}`} aria-hidden="true">
      {milestone.type === "origin" && <>
        <span className="pa-art-meta">C:\PROCOM\THE_BEGINNING</span>
        <span className="pa-art-cursor">&gt;_</span>
        <span className="pa-art-word">HELLO,<br />POSSIBILITY.</span>
        <span className="pa-art-meta">A NEW STORY IS LOADING...</span>
      </>}
      {milestone.type === "institutions" && <>
        <span className="pa-art-meta">PROCOM.NET ’09</span>
        <strong>40<span>+</span></strong>
        <span className="pa-art-word">UNIVERSITIES.<br />ONE PLAYING FIELD.</span>
        <span className="pa-art-meta">10TH ALL-PAKISTAN EDITION</span>
      </>}
      {milestone.type === "newsletter" && <>
        <span className="pa-art-meta">FROM THE UNIVERSITY ARCHIVE</span>
        <span className="pa-news-masthead">FAST-NU<br />NEWSLETTER</span>
        <span className="pa-news-rule" />
        <span className="pa-news-title">‘PROCOM’ held at<br />FAST-NU Karachi Campus</span>
        <span className="pa-news-lines" />
        <span className="pa-art-meta">MAY 2012 / ARCHIVE NOTE</span>
      </>}
      {milestone.type === "network" && <>
        <span className="pa-art-meta">CONNECTION ESTABLISHED</span>
        <svg className="pa-network-diagram" viewBox="0 0 260 140" fill="none"><path d="M40 30h75v80H40zM115 70h100M165 30v80M40 70h175" stroke="currentColor" strokeWidth="2" /><path d="M30 20h20v20H30zM30 100h20v20H30zM105 60h20v20h-20zM155 20h20v20h-20zM205 60h20v20h-20zM155 100h20v20h-20z" fill="currentColor" /></svg>
        <span className="pa-art-word">BUILD.<br />TEST. REPEAT.</span>
        <span className="pa-art-meta">NETWORKING + PROJECT EXHIBITION</span>
      </>}
      {milestone.type === "industry" && <>
        <span className="pa-art-meta">PROCOM ’23 / BY THE NUMBERS</span>
        <div className="pa-art-stats"><div><strong>45<span>~</span></strong><span>COMPETITIONS</span></div><i /><div><strong>36</strong><span>COMPANIES</span></div></div>
        <span className="pa-art-word">TALENT, MEET<br />OPPORTUNITY.</span>
      </>}
      {milestone.type === "upcoming" && <>
        <span className="pa-art-meta">PROCOM ’27 / NEXT UP</span>
        <strong className="pa-upcoming-year">’27</strong>
        <span className="pa-art-word">COMING SOON<span className="pa-upcoming-cursor">_</span></span>
        <span className="pa-art-meta">THE NEXT CHAPTER IS LOADING...</span>
      </>}
    </div>
  );
}

export default function AboutHistory() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const trackRef = useRef(null);
  const modeRef = useRef({ driven: false, travel: 0 });
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function update() {
      frame = 0;
      const { driven, travel } = modeRef.current;
      const distance = driven
        ? clamp(64 - section.getBoundingClientRect().top, 0, travel)
        : stage.scrollLeft;
      if (driven) track.style.transform = `translate3d(${-distance}px, 0, 0)`;
      const cards = Array.from(track.children);
      const positions = driven ? scrollStops(track, travel) : cards.map(card => card.offsetLeft + card.offsetWidth / 2 - stage.clientWidth / 2);
      let closest = 0;
      let minimum = Infinity;
      positions.forEach((position, index) => {
        const difference = Math.abs(position - distance);
        if (difference < minimum) { minimum = difference; closest = index; }
      });
      if (distance < 2) closest = 0;
      if (distance >= travel - 2) closest = cards.length - 1;
      if (closest !== activeRef.current) {
        activeRef.current = closest;
        setActive(closest);
      }
      section.style.setProperty("--pa-progress", String(travel ? distance / travel : 0));
    }

    function schedule() { if (!frame) frame = requestAnimationFrame(update); }

    function measure() {
      const driven = window.innerWidth > 760 && !reducedMotion.matches;
      section.dataset.scrollDriven = String(driven);
      track.style.transform = "";
      const travel = Math.max(0, track.scrollWidth - stage.clientWidth);
      modeRef.current = { driven, travel };
      const height = section.querySelector(".pa-history-window").offsetHeight;
      section.style.height = driven ? `${height + travel}px` : "";
      update();
    }

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(track);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    stage.addEventListener("scroll", schedule, { passive: true });
    reducedMotion.addEventListener("change", measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      stage.removeEventListener("scroll", schedule);
      reducedMotion.removeEventListener("change", measure);
    };
  }, []);

  const goTo = useCallback((index) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const card = trackRef.current.children[clamp(index, 0, procomMilestones.length - 1)];
    const { driven, travel } = modeRef.current;
    const selectedIndex = clamp(index, 0, procomMilestones.length - 1);
    const target = driven
      ? scrollStops(trackRef.current, travel)[selectedIndex]
      : clamp(card.offsetLeft - (stage.clientWidth - card.offsetWidth) / 2, 0, travel);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (driven) {
      const top = window.scrollY + section.getBoundingClientRect().top - 64 + target;
      window.scrollTo({ top, behavior });
    } else {
      stage.scrollTo({ left: target, behavior });
    }
  }, []);

  return (
    <section className="pa-history" id="our-story" ref={sectionRef} aria-labelledby="pa-history-title">
      <div className="pa-history-window">
        <header className="pa-history-header pa-shell">
          <div><p className="pa-eyebrow">// THE PROCOM MEMORY BANK</p><h2 id="pa-history-title">Good things take time.<br /><span>Great stories take generations.</span></h2></div>
          <p className="pa-gallery-hint"><span className="pa-hint-desktop">SCROLL TO TRAVEL THROUGH TIME</span><span className="pa-hint-mobile">SWIPE TO TRAVEL THROUGH TIME</span><span aria-hidden="true">↘</span></p>
        </header>
        <div
          className="pa-milestone-stage"
          ref={stageRef}
          role="region"
          aria-label={`${milestoneCount} milestones in PROCOM history`}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight") { event.preventDefault(); goTo(activeRef.current + 1); }
            if (event.key === "ArrowLeft") { event.preventDefault(); goTo(activeRef.current - 1); }
            if (event.key === "Home") { event.preventDefault(); goTo(0); }
            if (event.key === "End") { event.preventDefault(); goTo(procomMilestones.length - 1); }
          }}
        >
          <div className="pa-milestone-track" ref={trackRef}>
            {procomMilestones.map((milestone, index) => (
              <article className={`pa-milestone pa-milestone--${milestone.className}`} key={milestone.year} aria-label={`${index + 1} of ${milestoneCount}: ${milestone.year}, ${milestone.title}`}>
                <p className="pa-milestone-label"><span>{String(index + 1).padStart(2, "0")}</span> {milestone.label}</p>
                {milestone.headline && <p className="pa-milestone-headline">{milestone.headline}</p>}
                <div className="pa-milestone-visual"><MilestoneVisual milestone={milestone} /></div>
                <div className="pa-milestone-copy"><h3>{milestone.title}</h3><p>{milestone.description}</p>{milestone.source && <a href={milestone.source} target="_blank" rel="noreferrer">{milestone.credit} <span aria-hidden="true">↗</span></a>}{milestone.imageSource && <a className="pa-milestone-image-credit" href={milestone.imageSource} target="_blank" rel="noreferrer">{milestone.imageCredit} <span aria-hidden="true">↗</span></a>}</div>
              </article>
            ))}
          </div>
        </div>
        <footer className="pa-history-controls pa-shell">
          <div className="pa-year-list" aria-label="Choose a milestone">{procomMilestones.map((milestone, index) => <button type="button" key={milestone.year} onClick={() => goTo(index)} aria-current={active === index ? "step" : undefined} aria-label={`View milestone ${milestone.year}`}>{milestone.year}<span /></button>)}</div>
          <div className="pa-gallery-arrows"><span className="pa-gallery-count">{String(active + 1).padStart(2, "0")} <i>/ {String(milestoneCount).padStart(2, "0")}</i></span><button type="button" aria-label="Previous milestone" disabled={active === 0} onClick={() => goTo(activeRef.current - 1)}>←</button><button type="button" aria-label="Next milestone" disabled={active === procomMilestones.length - 1} onClick={() => goTo(activeRef.current + 1)}>→</button></div>
        </footer>
        <div className="pa-history-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
