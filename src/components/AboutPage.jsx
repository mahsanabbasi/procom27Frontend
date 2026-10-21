import AboutHistory from "./AboutHistory.jsx";
import "./AboutPage.css";

function PixelButton({ children, href }) {
  return <a className="pa-pixel-button" href={href}><span aria-hidden="true">▸</span>{children}<span aria-hidden="true">↗</span></a>;
}

export default function AboutPage() {
  return (
    <div className="procom-about">
      <a className="pa-skip-link" href="#what-is-procom">Skip to content</a>
        <section className="pa-introduction" id="what-is-procom" aria-labelledby="pa-intro-title">
          <div className="pa-shell">
            <div className="pa-intro-grid"><div className="pa-intro-copy"><p className="pa-eyebrow"><span className="pa-pixel-dot" /> A LITTLE ABOUT US</p><h1 id="pa-intro-title">What is<br /><span>PROCOM?</span></h1><p className="pa-intro-lead">Big ideas. Real challenges.<br />A whole lot of possibility.</p><p className="pa-intro-description">PROCOM is where students come together to build, compete and discover what they’re capable of. From a first line of code to a first conversation with industry, it’s a place for the next step.</p><p className="pa-intro-description">Organised by the students of FAST NUCES Karachi, and open to curious minds across Pakistan.</p><a className="pa-story-link" href="#pa-legacy">GET TO KNOW OUR STORY <span aria-hidden="true">↓</span></a></div>
              <figure className="pa-campus"><div className="pa-campus-frame"><img src="/images/history/fast-karachi-about.png" alt="FAST NUCES Karachi campus building overlooking the green lawn" width="1024" height="768" fetchPriority="high" /><div className="pa-campus-shade" /><div className="pa-campus-caption"><span>// THE HOME OF PROCOM</span><strong>FAST NUCES<br />KARACHI.</strong></div><span className="pa-campus-cross" aria-hidden="true">+</span></div><figcaption><span>STUDENT BUILT. STUDENT DRIVEN.</span><span>KARACHI CAMPUS</span></figcaption></figure>
            </div>
          </div>
        </section>

        <section className="pa-legacy pa-shell" id="pa-legacy" aria-labelledby="pa-legacy-title"><div className="pa-legacy-number" aria-label="26 plus years"><span>26</span><b>+</b><small>YEARS IN THE MAKING</small></div><div className="pa-legacy-copy"><p className="pa-eyebrow">// CODE. COMPETE. CONQUER.</p><h2 id="pa-legacy-title">More than an event.<br /><span>A legacy in the making.</span></h2><p>Across generations of FASTians and participants nationwide, PROCOM has been the launchpad for future leaders and tech pioneers. Over 26 years of endless lines of code, fierce competition, and unforgettable breakthroughs.</p><a className="pa-legacy-link" href="#our-story">SOME MOMENTS IN HISTORY <span aria-hidden="true">↘</span></a></div></section>

        <AboutHistory />

        <section className="pa-next-chapter" aria-labelledby="pa-next-title"><div className="pa-shell"><p className="pa-eyebrow">// THE NEXT CHAPTER HAS ROOM FOR YOU</p><h2 id="pa-next-title">26+ years of stories.<br /><span>Time to make yours.</span></h2><p>Bring an idea. Find your challenge.<br />Be part of what comes next.</p><PixelButton href="/#competitions">Join competitions</PixelButton><div className="pa-next-pixels" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div></div></section>
    </div>
  );
}
