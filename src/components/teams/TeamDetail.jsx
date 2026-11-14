import { forwardRef } from 'react';
import Emblem from './Emblem.jsx';
import Icon from '../arcade/Icon.jsx';
import { N, ORDER, byRole } from '../../data/teamDirectory.js';
import { pad } from '../../utils/arcade/util.js';

const initials = (n) =>
  n
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

function PhotoPH({ name }) {
  return (
    <div className="media-ph" aria-hidden="true">
      <span className="media-ph__init">{initials(name)}</span>
      <span className="media-ph__cap">// Photo</span>
    </div>
  );
}

function PersonCard({ p, t, wide }) {
  const sub = p.role + ' · ' + t.name;
  if (wide) {
    return (
      <article className="card person person--wide">
        <PhotoPH name={p.name} />
        <div className="person">
          <span className="tag tag--accent">{p.role}</span>
          <h3 className="person__name">{p.name}</h3>
          <p className="person__sub">{sub}</p>
        </div>
      </article>
    );
  }
  return (
    <article className="card person">
      <PhotoPH name={p.name} />
      <span className="tag">{p.role}</span>
      <h3 className="person__name">{p.name}</h3>
      <p className="person__sub">{sub}</p>
    </article>
  );
}

const TIERS = [
  ['Executive Director', 'Executive Director', 'Executive Directors', true],
  ['Director', 'Director', 'Directors', true],
  ['Deputy Director', 'Deputy Director', 'Deputy Directors', false],
];

function Party({ t }) {
  const blocks = [];
  TIERS.forEach((tr, ti) => {
    const people = byRole(t, tr[0]);
    if (!people.length && tr[0] === 'Executive Director') return;
    blocks.push(
      <h3 key={'h' + ti} className="tierh t-label">
        Tier {ti + 1} · {people.length > 1 ? tr[2] : tr[1]} <b>{pad(people.length)}</b>
      </h3>,
      <div key={'p' + ti} className={'party' + (tr[3] ? ' party--lead' : '')}>
        {!people.length && (
          <article className="card person person--ph">
            <div className="media-ph" aria-hidden="true">
              <span className="media-ph__cap">// Open slot</span>
            </div>
            <span className="tag">{tr[1]}</span>
            <h3 className="person__name text-(--c-text-2)!">Not listed yet</h3>
          </article>
        )}
        {people.map((p, i) => (
          <PersonCard key={p.name + i} p={p} t={t} wide={tr[3]} />
        ))}
      </div>,
    );
  });
  return (
    <div id="dParty">
      {blocks}
      <h3 className="tierh t-label">
        Tier 4 · Team members <b>{pad(t.members.length)}</b>
      </h3>
      <div className="party">
        {t.members.length ? (
          t.members.map((m, i) => <PersonCard key={m + i} p={{ name: m, role: 'Member' }} t={t} wide={false} />)
        ) : (
          <article className="card person person--ph">
            <div className="media-ph" aria-hidden="true">
              <span className="media-ph__cap">// Members</span>
            </div>
            <span className="tag">Members</span>
            <h3 className="person__name text-(--c-text-2)!">Not listed yet</h3>
            <p className="person__sub">Add members in the team data.</p>
          </article>
        )}
      </div>
    </div>
  );
}

/** team detail view (route: /teams/:slug) */
const TeamDetail = forwardRef(function TeamDetail({ team: t, open, onBack, onGo, onKeyDown, nameRef }, ref) {
  if (!t) {
    return <div className="detail" id="detail" role="dialog" aria-modal="true" aria-hidden="true" ref={ref} />;
  }
  const i = ORDER.indexOf(t);
  const prev = ORDER[(i - 1 + N) % N];
  const next = ORDER[(i + 1) % N];
  const codeSize = Math.min(130, 240 / (t.code.length * 0.62)) + 'px';

  return (
    <div
      className={'detail' + (open ? ' is-open' : '')}
      id="detail"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dName"
      aria-hidden={!open}
      ref={ref}
      onKeyDown={onKeyDown}
    >
      <div className="detail__bar">
        <div className="shell">
          <button className="btn btn--secondary btn--sm" type="button" id="dBack" onClick={onBack}>
            <Icon name="arrow-left" />
            Back to teams
          </button>
          <span className="crumb">
            <span className="hide-sm">Teams</span>
            <span className="hide-sm">/</span>
            <span className="hide-sm">{t.cat.label}</span>
            <span className="hide-sm">/</span>
            <b>{t.name}</b>
          </span>
        </div>
      </div>
      {/* keyed by team so the entrance animation replays on every team */}
      <div className="shell detail__in" id="dIn" key={t.slug}>
        <div className="dhero">
          <div className="dhero__em corners" aria-hidden="true">
            <span className="dhero__burst" />
            <span className="dhero__tone" />
            <div className="code t-outline" style={{ fontSize: codeSize }}>
              {t.code}
            </div>
            <div className="e">
              <Emblem team={t} />
            </div>
          </div>
          <div>
            <span className="dsel" aria-hidden="true">
              Team selected
            </span>
            <br />
            <span className="tag tag--accent">
              <Icon name="square" />
              <span>{t.cat.label} department</span>
            </span>
            <h2 className="t-d2" id="dName" tabIndex={-1} ref={nameRef}>
              {t.name}
            </h2>
            <p className="t-body-lg">
              {t.description || (
                <>
                  Team description coming soon.<span className="placeholder-tag">Placeholder</span>
                </>
              )}
            </p>
            <div className="dmeta t-label">
              <span>
                Route: <b>{t.route}</b>
              </span>
              <span>
                People listed: <b>{pad(t.leads.length)}</b>
              </span>
            </div>
          </div>
        </div>
        <Party t={t} />
        <div className="dnav">
          <button className="btn btn--secondary btn--sm" type="button" id="dPrev" onClick={() => onGo(prev)}>
            <Icon name="arrow-left" />
            <span>{prev.name}</span>
          </button>
          <button className="btn btn--secondary btn--sm" type="button" id="dNext" onClick={() => onGo(next)}>
            <span>{next.name}</span>
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default TeamDetail;
