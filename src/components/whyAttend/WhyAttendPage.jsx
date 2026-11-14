import { WhyProvider } from "./WhyContext.jsx";
import { Hero, WorldMap, Challenge, Lobby } from "./EarlySections.jsx";
import { Careers, Ideas, Bonus, Boss, Finale } from "./LateSections.jsx";
import {
  ReferenceHeader,
  ReferenceFooter,
  ReferenceEffects,
} from "./ReferenceChrome.jsx";
import "./why-attend.css";

/** Isolated reference design within the existing router and initialization shell. */
export default function WhyAttendPage() {
  return (
    <div className="why-attend-page js" data-page="whyAttend">
      <WhyProvider>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ReferenceHeader />
        <main id="main">
          <Hero />
          <WorldMap />
          <Challenge />
          <Lobby />
          <Careers />
          <Ideas />
          <Bonus />
          <Boss />
          <Finale />
        </main>
        <ReferenceFooter />
        <ReferenceEffects />
      </WhyProvider>
    </div>
  );
}
