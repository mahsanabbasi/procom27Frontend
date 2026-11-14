import { Link } from 'wouter';
import { homeScheduleDays, homeScheduleSessions } from '../../data/homeSchedule.js';
import useHomeSchedule, { statusOf, toMinutes } from './useHomeSchedule.js';

function dayLabel(day) {
  const date = new Date(`${day.date}T12:00:00+05:00`);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Karachi',
  });
}

function hourLabel(minutes) {
  const hour = Math.floor(minutes / 60) % 24;
  return `${hour % 12 || 12}${hour >= 12 ? ' PM' : ' AM'}`;
}

function shortTime(time) {
  const match = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(time || '');
  if (!match) return time || '';
  return `${Number(match[1])}${match[2] !== '00' ? `:${match[2]}` : ''}${match[3][0].toLowerCase()}`;
}

function renderDayTab(day, activeDay, chooseDay, index, onKeyDown) {
  const sessions = homeScheduleSessions
    .filter((session) => session.day === day.n && toMinutes(session.time) !== null)
    .sort((a, b) => (toMinutes(a.time) || 0) - (toMinutes(b.time) || 0));
  const slots = [0, 0, 0, 0, 0, 0];

  sessions.forEach((session) => {
    const minutes = toMinutes(session.time);
    const slot = Math.max(0, Math.min(5, Math.floor((minutes - 480) / 120)));
    slots[slot] += 1;
  });

  const maxSlot = Math.max(...slots) || 1;
  const competitionCount = sessions.filter((session) => session.comp).length;

  return (
    <button
      className="tab"
      key={day.n}
      role="tab"
      type="button"
      data-day={day.n}
      aria-selected={day.n === activeDay}
      tabIndex={day.n === activeDay ? 0 : -1}
      aria-controls="trkInner"
      onClick={() => chooseDay(day.n)}
      onKeyDown={(event) => onKeyDown(event, index)}
    >
      <b>Day {day.n}</b>
      <span>{day.date ? dayLabel(day) : <span className="tbc">[Date]</span>}</span>
      <small>{sessions.length} sessions · {competitionCount} comps</small>
      <span className="mini" aria-hidden="true">
        {slots.map((count, index) => (
          <i key={index} style={{ height: `${4 + (count / maxSlot) * 16}px` }} />
        ))}
      </span>
    </button>
  );
}

export default function HomeScheduleSection() {
  const {
    access,
    addSessionToCalendar,
    changeMode,
    chooseDay,
    clockNow,
    competitionCount,
    day,
    help,
    laneCount,
    laneSessions,
    hideTooltip,
    mode,
    moveTooltip,
    nowPosition,
    openCount,
    plan,
    positionFor,
    replay,
    selectSession,
    selectedSession: activeSession,
    selectionVersion,
    sessions,
    setSelectionNode,
    setTrackNode,
    setTooltipNode,
    ticks,
    togglePlan,
    tooltip,
    trackIn,
  } = useHomeSchedule();
  const accessLabel = activeSession ? access[activeSession.access] || '' : '';

  function handleTabKeyDown(event, index) {
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % homeScheduleDays.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + homeScheduleDays.length) % homeScheduleDays.length;
    if (nextIndex === null) return;
    event.preventDefault();
    chooseDay(homeScheduleDays[nextIndex].n);
    event.currentTarget.parentElement
      ?.querySelectorAll('[role="tab"]')
      .item(nextIndex)
      ?.focus();
  }

  return (
    <section
      className="section"
      id="schedule"
      aria-labelledby="sch-title"
      data-munch="calendar"
      data-munch-label="Schedule"
    >
      <div className="container">
        <div className="sch-head is-in" data-reveal>
          <div>
            <p className="sh__label t-label"><i className="i i-square" aria-hidden="true" />04 / Schedule</p>
            <h2 className="t-d2" id="sch-title">Schedule</h2>
            <p className="t-body-lg">See what’s happening and plan your day.</p>
          </div>
          <div className="sch-ctrl">
            <div className="seg">
              <span className="seg__label t-label">View as</span>
              <div className="seg__group" role="group" aria-label="View as" id="viewAs">
                <button
                  type="button"
                  data-mode="participant"
                  aria-pressed={mode === 'participant'}
                  onClick={() => changeMode('participant')}
                >
                  Participant
                </button>
                <button
                  type="button"
                  data-mode="spectator"
                  aria-pressed={mode === 'spectator'}
                  onClick={() => changeMode('spectator')}
                >
                  Spectator
                </button>
              </div>
            </div>
            <p className="seg__help" id="viewHelp">{help}</p>
          </div>
        </div>
        <div
          className={`panel trk${trackIn ? ' is-in' : ''}`}
          id="trk"
          data-reveal
          ref={setTrackNode}
        >
          <div className="trk__top">
            <div className="tabs stages" role="tablist" aria-label="Choose a day" id="dayTabs">
              {homeScheduleDays.map((item, index) => renderDayTab(
                item,
                day,
                chooseDay,
                index,
                handleTabKeyDown,
              ))}
            </div>
            <div className="trk__info t-label" id="trkHud">
              <span className="trk__leg">
                <span><i className="lg-c" />Competition</span>
                <span><i />Session</span>
                {mode === 'spectator' && (
                  <span><i className="lg-d" />Participants only</span>
                )}
              </span>
              <b>
                {mode === 'spectator'
                  ? `${openCount} open to visitors`
                  : `${sessions.length} sessions · ${competitionCount} competitions`}
              </b>
            </div>
          </div>
          <div className="trk__scroll">
            <div className="trk__inner" id="trkInner" role="tabpanel" aria-label="Sessions for the selected day">
              {homeScheduleDays.find((item) => item.n === day)?.published === false ? (
                <div className="empty-state">
                  <span className="ic"><i className="i i-calendar" aria-hidden="true" /></span>
                  <h3 className="t-d3">Schedule coming soon</h3>
                  <p>Timings for this day have not been announced yet. Check back for updates.</p>
                </div>
              ) : (
                <>
                  <div className="trk__axis" aria-hidden="true">
                    {ticks.map((minutes) => (
                      <span
                        className="trk__tick"
                        key={minutes}
                        style={{ left: `${positionFor(minutes).toFixed(3)}%` }}
                      >
                        {hourLabel(minutes)}
                      </span>
                    ))}
                  </div>
                  <div className="trk__lanes" style={{ '--lanes': laneCount }}>
                    {ticks.map((minutes) => (
                      <span
                        className="trk__grid"
                        key={minutes}
                        style={{ left: `${positionFor(minutes).toFixed(3)}%` }}
                      />
                    ))}
                    {laneSessions.map((session) => {
                      const start = toMinutes(session.time);
                      const end = toMinutes(session.end) ?? start + 60;
                      const left = positionFor(start);
                      const width = positionFor(end) - left;
                      const isSelected = session.id === activeSession?.id;
                      const isDim = mode === 'spectator' &&
                        session.access !== 'open' && session.access !== 'viewing';
                      const status = statusOf(session, clockNow);

                      return (
                        <button
                          className={[
                            'blk',
                            session.comp && 'blk--comp',
                            isDim && 'is-dim',
                            plan.includes(session.id) && 'is-plan',
                            isSelected && 'is-sel',
                            status === 'now' && 'is-now',
                            status === 'done' && 'is-done',
                          ].filter(Boolean).join(' ')}
                          key={session.id}
                          type="button"
                          data-k={sessions.findIndex((item) => item.id === session.id)}
                          style={{
                            '--l': `${left.toFixed(3)}%`,
                            '--w': `${width.toFixed(3)}%`,
                            '--ln': session.lane,
                            '--d': (left / 100).toFixed(2),
                          }}
                          aria-label={`${session.title}, ${session.time}${session.end ? ` to ${session.end}` : ''}${session.venue ? `, ${session.venue}` : ''}${isDim ? ', participants only' : ''}`}
                          onClick={() => selectSession(session, true)}
                          onPointerMove={(event) => moveTooltip(session, event)}
                          onPointerLeave={(event) => {
                            if (document.activeElement !== event.currentTarget) hideTooltip();
                          }}
                          onFocus={(event) => {
                            const rect = event.currentTarget.getBoundingClientRect();
                            moveTooltip(session, {
                              clientX: rect.left + rect.width / 2,
                              clientY: rect.top + rect.height / 2,
                            });
                          }}
                          onBlur={hideTooltip}
                        >
                          <span className="blk__t">{session.title}</span>
                          <span className="blk__time" aria-hidden="true">{shortTime(session.time)}</span>
                        </button>
                      );
                    })}
                    {nowPosition !== null && (
                      <span
                        className="trk__now"
                        style={{ left: `${nowPosition.toFixed(2)}%` }}
                      />
                    )}
                    <span className="trk__sweep" key={replay} aria-hidden="true" />
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="trk__hint t-label" aria-hidden="true">Scroll the track<i className="i i-arrow" /></p>
          {activeSession && (
            <div
              className={`sel${selectionVersion ? ' is-swap' : ''}`}
              id="schSel"
              aria-live="polite"
              key={selectionVersion}
              ref={setSelectionNode}
            >
              <div>
                <span className="t-label">
                  {activeSession.comp ? 'Competition' : activeSession.type || 'Session'} · {activeSession.time}
                  {activeSession.end ? `–${activeSession.end}` : ''}
                </span>
                <h3 className="sel__t">{activeSession.title}</h3>
                <p className="srow__meta">
                  <span><i className="i i-pin" aria-hidden="true" />{activeSession.venue || <span className="tbc">[Venue]</span>}</span>
                  <span><i className="i i-list" aria-hidden="true" />{activeSession.type || 'Session'}</span>
                  {accessLabel && <span><i className="i i-eye" aria-hidden="true" />{accessLabel}</span>}
                </p>
                {!activeSession.comp && (
                  <p className="sel__more">
                    <span className="tbc">[Session description, speakers and access details will be added once confirmed]</span>
                  </p>
                )}
              </div>
              <div className="sel__act">
                <button
                  className="srow__icon"
                  type="button"
                  data-plan
                  aria-pressed={plan.includes(activeSession.id)}
                  aria-label={`Add ${activeSession.title} to my plan`}
                  title="Add to my plan"
                  onClick={(event) => togglePlan(activeSession, event.currentTarget)}
                >
                  <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true"><path d="M5 0h2v3h3v2H8v2l1 4H7L6 9 5 11H3l1-4V5H2V3h3z" /></svg>
                </button>
                <button
                  className="srow__icon"
                  type="button"
                  data-cal
                  aria-label={`Add ${activeSession.title} to your calendar`}
                  title="Add to calendar"
                  onClick={() => addSessionToCalendar(activeSession)}
                >
                  <i className="i i-calendar" aria-hidden="true" />
                </button>
                {activeSession.comp && (
                  <Link className="link-action" href={`/competitions/${activeSession.comp}`}>
                    View details<i className="i i-arrow" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="sched-foot">
          <Link className="btn btn--secondary" href="/schedule">
            View full schedule<i className="i i-arrow" aria-hidden="true" />
          </Link>
        </div>
      </div>
      {tooltip && (
        <div className="ktip on" role="status" ref={setTooltipNode}>
          <b>{tooltip.session.title}</b>
          {tooltip.session.time}
          {tooltip.session.end ? `–${tooltip.session.end}` : ''}
          {' · '}
          {tooltip.session.venue || ''}
        </div>
      )}
    </section>
  );
}
