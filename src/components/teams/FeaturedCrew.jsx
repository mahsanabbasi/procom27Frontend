import Emblem from './Emblem.jsx';
import Icon from '../arcade/Icon.jsx';
import Reveal from '../arcade/Reveal.jsx';
import SectionLabel from '../arcade/SectionLabel.jsx';
import { FEATURED, TEAMS, byRole } from '../../data/teamDirectory.js';
import { pad } from '../../utils/arcade/util.js';

const CREW = FEATURED.map((s) => TEAMS.find((t) => t.slug === s)).filter(Boolean);

/** 03 — Featured teams */
export default function FeaturedCrew({ onView, onShow }) {
  return (
    <section className="section" id="crew" aria-labelledby="crew-title" data-munch="trophy" data-munch-label="Featured teams">
      <div className="shell">
        <Reveal as="header" className="sh">
          <div>
            <SectionLabel text="03 / Featured teams" />
            <h2 className="sh__title t-d2" id="crew-title">
              <span className="ln" style={{ '--l': 0 }}>
                <span>A few of</span>
              </span>
              <span className="ln" style={{ '--l': 1 }}>
                <span className="t-soft">our teams.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">A quick look at four teams, from website design to AI competitions.</p>
        </Reveal>
        <div className="crew" id="crewList" data-stagger="">
          {CREW.map((t, i) => {
            const d = byRole(t, 'Director');
            const ed = byRole(t, 'Executive Director');
            return (
              <Reveal as="article" key={t.slug} className="card cr" style={{ '--i': i }}>
                <div className="cr__top" aria-hidden="true">
                  <span className="cr__stage t-label">Team {pad(i + 1)}</span>
                  <span className="cr__code t-outline">{t.code}</span>
                  <span className="cr__em">
                    <Emblem team={t} />
                  </span>
                </div>
                <div className="cr__body">
                  <span className="tag">{t.cat.label}</span>
                  <h3 className="t-title">{t.name}</h3>
                  {ed.length > 0 && (
                    <p>
                      Executive Director: <b>{ed.map((l) => l.name).join(', ')}</b>
                    </p>
                  )}
                  {d.length > 0 && (
                    <p>
                      Led by <b>{d.map((l) => l.name).join(', ')}</b>
                    </p>
                  )}
                  <p>{t.leads.length} people listed</p>
                  <div className="btn-row mt-1.5!">
                    <button className="btn btn--card" type="button" onClick={(e) => onView(t, e.currentTarget)}>
                      View details
                      <Icon name="arrow" />
                    </button>
                    <button className="link-action" type="button" onClick={() => onShow(t)}>
                      Show on the ring
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
