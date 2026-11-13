import Emblem from './Emblem.jsx';
import P1Portrait from './P1Portrait.jsx';
import Icon from '../arcade/Icon.jsx';
import SectionLabel from '../arcade/SectionLabel.jsx';
import { CATEGORIES, N, ORDER, TONES, catById } from '../../data/teamDirectory.js';
import { pad } from '../../utils/arcade/util.js';
import { results } from './search.js';

const SUGGESTIONS = ['UI/UX', 'Media', 'AI', 'Web Dev', 'Logistics'];

/* backdrop: PROCOM crest lattice (our own pattern) */
function Lattice() {
  return (
    <svg aria-hidden="true">
      <defs>
        <pattern id="latP" width="120" height="120" patternUnits="userSpaceOnUse">
          <g stroke="#493460" strokeWidth="2" strokeDasharray="9 5" strokeLinecap="round" opacity=".4">
            <path d="M0 0L120 120M120 0L0 120" />
          </g>
          <g transform="translate(51 48) scale(.1)" opacity=".14">
            <path d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z" fill="#B57CFF" />
          </g>
          <g fill="#B57CFF" opacity=".2">
            <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" />
            <rect x="116" y="-4" width="8" height="8" />
            <rect x="-4" y="116" width="8" height="8" />
            <rect x="116" y="116" width="8" height="8" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#latP)" />
    </svg>
  );
}

/**
 * 01 — Team select (character select screen): 1P portrait + manga-panel roster.
 * All behaviour lives in the page controller (`ctl`); this renders state.
 */
export default function SelectArena({ ctl, cat, q, curTeam, hits, lockingId, introOn }) {
  const list = results(cat, q);
  const on = new Set(list.map((r) => r.t.id));
  const catLabel = cat === 'all' ? 'All teams' : catById[cat].label;
  const curEnabled = curTeam && on.has(curTeam.id);
  const { arena: arenaRef, p1: p1Ref, q: qRef, grid: gridRef, cursor: cursorRef, chips, depts, lis, btns } = ctl.refs;

  return (
    <section
      className={'sel' + (introOn ? ' is-on' : '')}
      id="arena"
      ref={arenaRef}
      aria-labelledby="sel-title"
      data-munch="users"
      data-munch-label="Team select"
    >
      <div className="sel__bg" aria-hidden="true">
        <Lattice />
      </div>
      <div className="shell">
        <header className="sel__top">
          <div>
            <SectionLabel text="// Meet our teams · PROCOM’27" />
            <h1 className="sel__h1" id="sel-title">
              <span style={{ '--i': 0 }}>Select</span> <span style={{ '--i': 1 }}>your</span>{' '}
              <span className="t-soft" style={{ '--i': 2 }}>
                team
              </span>
            </h1>
            <p className="sel__intro">These are the student teams who plan and run PROCOM’27. Search for a team or browse by department.</p>
          </div>
        </header>

        <div className="sel__screen">
          <P1Portrait ref={p1Ref} team={curTeam} hit={hits.get(curTeam.id)} onGo={(e) => ctl.lockIn(curTeam, e.currentTarget)} />

          <div className="pick">
            <div className="pick__bar" role="search">
              <div className="pick__row">
                <label className="search">
                  <span className="sr-only">Search teams</span>
                  <Icon name="search" />
                  <input
                    ref={qRef}
                    className="input"
                    type="search"
                    id="q"
                    placeholder="Search teams or people…"
                    autoComplete="off"
                    spellCheck="false"
                    aria-describedby="status"
                    value={q}
                    onChange={(e) => ctl.applyFilter(cat, e.target.value, false)}
                    onKeyDown={ctl.onSearchKey}
                  />
                  <button className="icon-btn" type="button" id="qclr" aria-label="Clear search" hidden={!q} onClick={ctl.clearSearch}>
                    <Icon name="close" />
                  </button>
                </label>
                <button className="pick__rand" type="button" id="rand" aria-label="Random select: pick a random team" onClick={ctl.roulette}>
                  <b aria-hidden="true">?</b>
                  <span>Random</span>
                </button>
              </div>
              <div className="chips" id="chips" role="group" aria-label="Filter by department">
                {[{ id: 'all', label: 'All teams' }].concat(CATEGORIES).map((c) => (
                  <button
                    key={c.id}
                    ref={(el) => chips.current.set(c.id, el)}
                    type="button"
                    className="chip"
                    aria-pressed={c.id === cat}
                    onClick={() => ctl.pickChip(c.id)}
                  >
                    {c.label}
                    <span className="count">{pad(results(c.id, q).length)}</span>
                  </button>
                ))}
              </div>
              <div className="status">
                <span id="status" aria-live="polite">
                  Showing <strong>{list.length}</strong> of {N} teams · <strong>{catLabel}</strong>
                  {q ? ` · “${q}”` : ''}
                </span>
                <button className="link-action" type="button" id="reset" hidden={!(cat !== 'all' || q)} onClick={ctl.resetAll}>
                  Show all teams
                </button>
              </div>
            </div>

            <div className="pick__grid" id="grid" aria-label="Teams by department" ref={gridRef} onKeyDown={ctl.onGridKey}>
              <div className="cursor" id="cursor" aria-hidden="true" hidden ref={cursorRef}>
                <i />
                <b>1P</b>
              </div>
              {CATEGORIES.map((c) => {
                const teams = ORDER.filter((t) => t.category === c.id);
                if (!teams.length) return null;
                const off = !teams.some((t) => on.has(t.id));
                return (
                  <section
                    key={c.id}
                    className={'dept' + (off ? ' is-off' : '')}
                    data-cat={c.id}
                    ref={(el) => depts.current.set(c.id, el)}
                    style={{ '--tone': TONES[c.id] || '#B57CFF' }}
                    aria-label={`${c.label} department, ${teams.length} teams`}
                  >
                    <h3 className="dept__h">
                      <span className="k">{c.short}</span>
                      <span>{c.label}</span>
                      <b>{pad(teams.length)}</b>
                    </h3>
                    <ul className="dept__row">
                      {teams.map((t) => {
                        const enabled = on.has(t.id);
                        const isCur = curTeam.id === t.id;
                        return (
                          <li key={t.id} ref={(el) => lis.current.set(t.id, el)}>
                            <button
                              ref={(el) => btns.current.set(t.id, el)}
                              type="button"
                              className={'tm' + (isCur ? ' is-cur' : '') + (lockingId === t.id ? ' is-lock' : '')}
                              data-id={t.id}
                              style={{ '--n': t.n }}
                              tabIndex={isCur && curEnabled ? 0 : -1}
                              disabled={!enabled}
                              aria-label={`${t.name}, ${c.label}`}
                              onPointerEnter={() => ctl.onTeamEnter(t)}
                              onFocus={() => ctl.onTeamFocus(t)}
                              onClick={(e) => ctl.onTeamClick(t, e.currentTarget)}
                            >
                              <span className="tm__in">
                                <span className="tm__code" aria-hidden="true">
                                  {t.code}
                                </span>
                                <span className="tm__em">
                                  <Emblem team={t} />
                                </span>
                                <span className="tm__nm">{t.name}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
              <div className="no-result" id="noRes" hidden={list.length > 0}>
                {list.length === 0 && (
                  <>
                    <b>No team found</b>No team matches “{q}”{cat !== 'all' ? ' in ' + catById[cat].label : ''}. Try one of these:
                    <div className="sugg">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} type="button" className="chip" onClick={() => ctl.applyFilter('all', s, true)}>
                          {s}
                        </button>
                      ))}
                      <button type="button" className="chip" onClick={ctl.resetAll}>
                        Show all teams
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="keys t-label" id="keys" aria-hidden="true">
              <span className="key">
                <i className="i i-chevron-up" />
              </span>
              <span className="key">
                <i className="i i-chevron-down" />
              </span>
              <span className="key">
                <i className="i i-chevron-left" />
              </span>
              <span className="key">
                <i className="i i-chevron-right" />
              </span>{' '}
              Move &nbsp; <span className="key">Enter</span> Select &nbsp; <span className="key">/</span> Search &nbsp;{' '}
              <span className="key">R</span> Random
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
