import { forwardRef } from 'react';
import Emblem from './Emblem.jsx';
import Icon from '../arcade/Icon.jsx';
import { MAX, N, TONES, byRole } from '../../data/teamDirectory.js';
import { pad } from '../../utils/arcade/util.js';

function Bar({ v, max }) {
  const cells = [];
  for (let i = 0; i < max; i++) cells.push(<i key={i} className={i < v ? 'on' : ''} />);
  return (
    <span className="bar" aria-hidden="true">
      {cells}
    </span>
  );
}

/** 1P portrait: the selected team, character-select style */
const P1Portrait = forwardRef(function P1Portrait({ team: t, hit, onGo }, ref) {
  const ed = byRole(t, 'Executive Director');
  const d = byRole(t, 'Director');
  const dd = byRole(t, 'Deputy Director');
  const codeSize = Math.min(150, 300 / (t.code.length * 0.62)) + 'px';

  return (
    <aside className="p1" id="p1" aria-label="Selected team" ref={ref} style={{ '--tone': TONES[t.category] || '#B57CFF' }}>
      <div className="p1__hud t-label">
        <span className="p1__tag">1P</span>
        <span>
          Team <b>{pad(t.n + 1)}</b> / <span>{pad(N)}</span>
        </span>
      </div>
      <div className="p1__stage" aria-hidden="true">
        <span className="p1__burst" />
        <span className="p1__code" style={{ fontSize: codeSize }}>
          {t.code}
        </span>
        <span className="p1__em">
          <Emblem team={t} />
        </span>
        <span className="p1__flash" />
        <span className="p1__stamp">
          Team
          <br />
          selected!
        </span>
      </div>
      <div className="p1__plate">
        <span className="p1__dept">{t.cat.label}</span>
        <h2 className="p1__name" aria-live="polite">
          {t.name}
        </h2>
      </div>
      <div className="p1__body">
        <p className="p1__desc">
          {t.description || (
            <>
              Team description coming soon.<span className="placeholder-tag">Placeholder</span>
            </>
          )}
        </p>
        <p className="p1__hit" hidden={!hit}>
          {hit ? `Match: ${hit.name} (${hit.role})` : ''}
        </p>
        <ul className="p1__stats" aria-label="Team stats">
          <li>
            <span>Exec. directors</span>
            <Bar v={ed.length} max={MAX.ed} />
            <b>{pad(ed.length)}</b>
          </li>
          <li>
            <span>Directors</span>
            <Bar v={d.length} max={MAX.d} />
            <b>{pad(d.length)}</b>
          </li>
          <li>
            <span>Deputy directors</span>
            <Bar v={dd.length} max={MAX.dd} />
            <b>{pad(dd.length)}</b>
          </li>
          <li>
            <span>People listed</span>
            <Bar v={t.leads.length} max={MAX.all} />
            <b>{pad(t.leads.length)}</b>
          </li>
        </ul>
        <ul className="p1__leads" aria-label="Team leads">
          {ed.length > 0 && (
            <li>
              <span>Executive dir.</span>
              <span>{ed.map((l) => l.name).join(', ')}</span>
            </li>
          )}
          <li>
            <span>{d.length > 1 ? 'Directors' : 'Director'}</span>
            <span>
              {d.length ? (
                d.map((l) => l.name).join(', ')
              ) : (
                <span className="font-normal! text-(--c-text-2)!">Not listed</span>
              )}
            </span>
          </li>
        </ul>
        <button className="btn btn--arcade btn--block p1__go" type="button" id="pGo" aria-label={`Select ${t.name} and view team details`} onClick={onGo}>
          <Icon name="play" />
          Select team
        </button>
        <span className="p1__route t-label">Route: {t.route}</span>
      </div>
    </aside>
  );
});

export default P1Portrait;
