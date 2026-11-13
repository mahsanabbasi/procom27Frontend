import Emblem from './Emblem.jsx';
import Icon from '../arcade/Icon.jsx';
import Reveal from '../arcade/Reveal.jsx';
import RouteLink from '../arcade/RouteLink.jsx';
import SectionLabel from '../arcade/SectionLabel.jsx';
import { N, ORDER } from '../../data/teamDirectory.js';
import { pad } from '../../utils/arcade/util.js';

/* a ring of every team's emblem behind the closing message */
const RING = ORDER.map((t, i) => {
  const ang = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
  return { t, left: 50 + Math.cos(ang) * 46 + '%', top: 50 + Math.sin(ang) * 46 + '%' };
});

export default function FinalSection({ onSeeAll }) {
  return (
    <section className="final" id="final" aria-labelledby="final-title" data-munch="check" data-munch-label="Final">
      <div className="final-ring" id="ring" aria-hidden="true">
        {RING.map(({ t, left, top }) => (
          <span key={t.id} style={{ left, top }}>
            <Emblem team={t} />
          </span>
        ))}
      </div>
      <Reveal className="shell" variant="scale">
        <SectionLabel text="// The people behind PROCOM" />
        <h2 className="t-d2 t-extrude" id="final-title">
          It takes every team <span className="t-soft">to run PROCOM.</span>
        </h2>
        <p className="t-body-lg">From planning to event day, these teams do the work behind the scenes.</p>
        <div className="btn-row">
          <a className="btn btn--arcade" href="#arena" id="exploreAll" onClick={onSeeAll}>
            <Icon name="play" />
            See all teams
          </a>
          <RouteLink to="whyAttend" className="btn btn--secondary">
            Why attend PROCOM?
            <Icon name="arrow" />
          </RouteLink>
        </div>
        <p className="t-label mt-10! text-[8px]! text-(--c-text-2)!" aria-hidden="true">
          <span id="finalCount">{pad(N)}</span> teams · PROCOM’27
        </p>
      </Reveal>
    </section>
  );
}
