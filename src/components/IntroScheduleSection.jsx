import { useEffect, useState } from 'react';
import {
  INTRO_DAY,
  INTRO_SCHEDULE,
  STATUS_LABEL,
  karachiNow,
  slotStatuses,
} from '../data/introSchedule.js';
import { EXTERNAL, INTRO_PLATFORM_NAME, INTRO_PLATFORM_URL } from '../data/links.js';
import { UNKNOWN, isRevealed, revealLabel, revealValue } from '../data/reveals.js';

// How often the table re-checks the clock. The shortest slot is five minutes,
// so half a minute is close enough and costs nothing.
const TICK_MS = 30_000;

const sameMoment = (a, b) => a.date === b.date && a.minutes === b.minutes;

export const IntroScheduleSection = () => {
  const speakersOut = isRevealed('speakers');
  const [now, setNow] = useState(karachiNow);

  // The programme follows the date and clock in Karachi, wherever the page is
  // being read from. Returning the previous reading leaves the table alone on
  // ticks where nothing has changed.
  useEffect(() => {
    const id = setInterval(() => {
      const reading = karachiNow();
      setNow((previous) => (sameMoment(previous, reading) ? previous : reading));
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const statuses = slotStatuses(now);

  return (
    <section id="schedule" className="shell section" aria-labelledby="schedule-title" data-munch="calendar" data-munch-label="Schedule">
      <header className="section-head" data-reveal>
        <h2 id="schedule-title" className="heading">Intro Day</h2>
        <p className="lead-date">{INTRO_DAY.dateLabel} · {INTRO_DAY.venue}</p>
        <p className="muted">{INTRO_DAY.summary}</p>
      </header>

      <table className="schedule" style={{ marginTop: 'clamp(28px, 4vh, 44px)' }} data-reveal>
        <caption className="sr-only">
          The Intro Day programme on {INTRO_DAY.dateLabel} at {INTRO_DAY.venue}, Karachi time
        </caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Itinerary item</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {INTRO_SCHEDULE.map((slot, index) => {
            const status = statuses[index];
            return (
              <tr key={slot.from} data-status={status}>
                <td>
                  <span className="slot-from">{slot.from}</span>
                  <span className="slot-to">{slot.to === 'onwards' ? 'onwards' : `– ${slot.to}`}</span>
                </td>
                <td>
                  <div className="session-title">{slot.title}</div>
                  {/* The two slots the room takes part in run on their own
                      site, so each says so in full rather than relying on a
                      footnote. */}
                  {slot.live ? (
                    <div className="session-note">
                      Take part live on{' '}
                      <a href={INTRO_PLATFORM_URL} {...EXTERNAL} className="session-link">
                        {INTRO_PLATFORM_NAME}
                      </a>
                    </div>
                  ) : null}
                  {slot.speakers ? (
                    <div className="session-note">
                      Speakers{' '}
                      {speakersOut ? revealValue('speakers') : <span className="is-unknown">{UNKNOWN}</span>}
                    </div>
                  ) : null}
                </td>
                <td className="slot-status">{STATUS_LABEL[status]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="muted small" style={{ marginTop: '24px' }} data-reveal>
        Progress follows Karachi time.{' '}
        {isRevealed('fullSchedule') ? revealLabel('fullSchedule') : 'The three-day schedule follows after Intro Day.'}
      </p>
    </section>
  );
};
