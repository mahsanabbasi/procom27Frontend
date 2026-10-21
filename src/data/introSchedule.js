// Intro Day: the on-campus session that introduces PROCOM'27. It is the only
// programme that is public. The three event days follow the date and time
// announcement (see ./reveals.js).

export const INTRO_DAY = {
  // Intro Day itself. Everything in the table below runs on this one date, in
  // Karachi time, so progress is read against it rather than against whatever
  // day the page happens to be open.
  date: '2026-10-22',
  dateLabel: '22 Oct 2026',
  venue: 'Main Auditorium, FAST NUCES Karachi',
  summary:
    'The session that opens PROCOM’27: the vision and logo reveal, the committee, guest speakers and a panel. Open to every student, no registration needed.',
};

// The running order, as issued. `to: 'onwards'` is the open-ended last slot.
// `live: true` marks the two slots the audience takes part in from their own
// phone — those carry the platform link (see ./links.js). `speakers: true`
// marks the slot whose line-up is still unannounced, so it prints `???`.
export const INTRO_SCHEDULE = [
  { from: '9:30', to: '9:40', title: 'Welcome & Host Introduction' },
  { from: '9:40', to: '9:45', title: 'Tilawat & National Anthem' },
  { from: '9:45', to: '9:55', title: 'PROCOM Vision, Objectives & Logo Reveal' },
  { from: '9:55', to: '10:00', title: 'Faculty Address' },
  { from: '10:00', to: '10:15', title: 'Faculty Introduction & Video' },
  { from: '10:15', to: '10:35', title: 'Faculty Leadership Addresses' },
  { from: '10:35', to: '10:40', title: 'Executive Committee Introduction Video' },
  { from: '10:40', to: '10:55', title: 'President & Vice President Addresses' },
  { from: '10:55', to: '11:00', title: 'Executive Committee Video & Event Date Reveal' },
  { from: '11:00', to: '12:45', title: 'Guest Speaker Sessions & Topic Announcements', speakers: true },
  { from: '12:50', to: '1:20', title: 'Panel Talk & Audience Q&A', live: true },
  { from: '1:20', to: '1:25', title: 'Guest Appreciation & Token Presentation' },
  { from: '1:25', to: '1:40', title: 'Quiz Activity & Giveaways', live: true },
  { from: '1:45', to: 'onwards', title: 'Closing & Member Induction Announcement' },
];

// Intro Day runs on Karachi time. The itinerary was issued in 12-hour form
// with no am/pm, so: 9, 10 and 11 are morning, 12 is noon, and 1 onwards is
// the afternoon.
export function slotMinutes(stamp) {
  if (!stamp || stamp === 'onwards') return null;
  const [hours, minutes] = stamp.split(':').map(Number);
  const hour = hours >= 9 ? hours : hours + 12;
  return hour * 60 + minutes;
}

// Where the clock in Karachi stands right now: the calendar date as
// YYYY-MM-DD, and the time as minutes since midnight. `hourCycle` is set
// explicitly because `hour12: false` reports midnight as hour 24 in some
// locales.
export function karachiNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
}

// 'done' once a slot's end time has passed, 'live' while it is running, 'next'
// for the one coming up and 'ahead' for the rest. Before the day nothing has
// started; after it, everything has finished. The last slot is open-ended, so
// it only ends with the day itself.
export function slotStatuses({ date, minutes }) {
  if (date < INTRO_DAY.date) return INTRO_SCHEDULE.map(() => 'ahead');
  if (date > INTRO_DAY.date) return INTRO_SCHEDULE.map(() => 'done');

  const statuses = INTRO_SCHEDULE.map((slot) => {
    const start = slotMinutes(slot.from);
    const end = slotMinutes(slot.to);
    if (minutes < start) return 'ahead';
    if (end === null || minutes < end) return 'live';
    return 'done';
  });
  if (!statuses.includes('live')) {
    const next = statuses.indexOf('ahead');
    if (next !== -1) statuses[next] = 'next';
  }
  return statuses;
}

export const STATUS_LABEL = { done: 'Done', live: 'On now', next: 'Next', ahead: '' };
