import DeptScene from './DeptScenes.jsx';
import Icon from '../arcade/Icon.jsx';
import Reveal from '../arcade/Reveal.jsx';
import SectionLabel from '../arcade/SectionLabel.jsx';
import { CATEGORIES, ORDER, TONES } from '../../data/teamDirectory.js';
import { pad } from '../../utils/arcade/util.js';

/** 02 — Departments: one animated scene card per department */
export default function Departments({ onPick }) {
  return (
    <section className="section" id="divisions" aria-labelledby="div-title" data-munch="list" data-munch-label="Departments">
      <div className="shell">
        <Reveal as="header" className="sh">
          <div>
            <SectionLabel text="02 / Departments" />
            <h2 className="sh__title t-d2" id="div-title">
              <span className="ln" style={{ '--l': 0 }}>
                <span>Browse by</span>
              </span>
              <span className="ln" style={{ '--l': 1 }}>
                <span className="t-soft">department.</span>
              </span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">Every team belongs to a department. Pick one to see its teams in the list above.</p>
        </Reveal>
        <div className="divs" id="divs" data-stagger="">
          {CATEGORIES.map((c, i) => {
            const count = ORDER.filter((t) => t.category === c.id).length;
            return (
              <Reveal
                as="button"
                key={c.id}
                type="button"
                className="card card--interactive div"
                style={{ '--i': i, '--tone': TONES[c.id] || '#B57CFF' }}
                aria-label={`Show the ${c.label} department (${count} teams)`}
                onClick={() => onPick(c.id)}
              >
                <span className="div__art" aria-hidden="true">
                  <DeptScene id={c.id} />
                </span>
                <span className="div__body">
                  <span className="div__k t-label">
                    Dept {pad(i + 1)} · {pad(count)} teams
                  </span>
                  <h3>{c.label}</h3>
                  <p>{c.blurb || ''}</p>
                  <span className="link-action">
                    Show department
                    <Icon name="arrow" />
                  </span>
                </span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
