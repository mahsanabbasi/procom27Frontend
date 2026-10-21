// PROCOM'27 — progressive reveal registry.
//
// A lot of the event is announced in stages: the date & time announcement, the
// full three-day schedule, the prize pool, the speaker line-up. Every one of
// those lives here as a single flag so that "announcing" something is a one-line
// edit instead of a hunt through the components.
//
// Any section that renders a reveal-gated value must go through `revealLabel()`
// or `isRevealed()` so an unannounced value degrades to a locked placeholder
// rather than leaking a draft date.

// Anything not announced yet prints as this, everywhere, so an unknown value
// reads as "we have not said yet" rather than as a missing field.
export const UNKNOWN = '???';

export const REVEALS = {
  eventDates: {
    revealed: true,
    value: '26–28 Feb 2027',
    locked: 'Dates to be announced',
  },
  venue: {
    revealed: true,
    value: 'FAST NUCES Karachi',
    locked: 'Venue to be announced',
  },
  // Joining a team. This is the one thing people can actually do right now:
  // it runs on a Google Form (see ./links.js), not on an account.
  memberApplications: {
    revealed: true,
    value: 'Open now',
    locked: 'Applications to be announced',
  },
  memberDeadline: {
    revealed: false,
    value: '31 Jan 2027',
    locked: 'Closing date to be announced',
  },
  // Entering the competitions as a participant. Needs the portal, which is not
  // built yet, so nothing on the site should imply it is open.
  participantRegistration: {
    revealed: false,
    value: '06 Oct 2026 – 31 Jan 2027',
    locked: 'Opens with the participant portal',
  },
  // The per-event start times across the three main days, and with them the
  // hour the event actually starts — so the countdown stays unknown until this
  // flips. Announced with the full schedule drop, after Intro Day.
  eventTimings: {
    revealed: false,
    value: 'Day-by-day timings live',
    locked: 'Exact timings to be announced',
  },
  // How many competitions run in total. Settled once every category team has
  // chosen its modules during induction.
  competitionCount: {
    revealed: false,
    value: '30+',
    locked: 'Competition count to be announced',
  },
  // Confirmed sponsors. The Sponsorship team is still in its first calls.
  sponsorCount: {
    revealed: false,
    value: '12+',
    locked: 'Sponsors to be announced',
  },
  // The full Day 01–03 schedule. Until this flips, the Schedule section shows
  // the Intro Day programme only and renders the three event days as locked.
  fullSchedule: {
    revealed: false,
    value: 'Full three-day schedule is live',
    locked: 'Full schedule revealed after Intro Day',
  },
  introDay: {
    revealed: true,
    value: 'Intro Day · 22 Oct 2026 · Main Auditorium',
    locked: 'Intro Day to be announced',
  },
  prizePool: {
    revealed: false,
    value: 'PKR 2,000,000+',
    locked: 'Prize pool to be announced',
  },
  speakers: {
    revealed: false,
    value: 'Full speaker line-up is live',
    locked: 'Speakers announced progressively',
  },
};

// What the site is counting down to right now. While the full schedule is still
// under wraps this points at the event start; once Intro Day is the nearer
// milestone, swap `target` and the hero countdown re-labels itself.
export const COUNTDOWN = {
  target: '2027-02-26T09:00:00+05:00',
  label: 'Time remaining',
  liveLabel: 'Now playing',
  subject: "PROCOM'27 · Day 01",
};

export function isRevealed(key) {
  return Boolean(REVEALS[key]?.revealed);
}

// The value a component should print for a reveal-gated field: the real thing
// once announced, `???` until then.
export function revealValue(key) {
  const entry = REVEALS[key];
  if (!entry) return UNKNOWN;
  return entry.revealed ? entry.value : UNKNOWN;
}

// The sentence form, for prose where a bare `???` would not read.
export function revealLabel(key, fallback = 'To be announced') {
  const entry = REVEALS[key];
  if (!entry) return fallback;
  return entry.revealed ? entry.value : entry.locked || fallback;
}

// Everything still under wraps, in announcement order. Listed in the About
// section until each one flips.
export const PENDING_REVEALS = [
  { key: 'participantRegistration', name: 'Competition registration' },
  { key: 'eventTimings', name: 'Exact timings' },
  { key: 'fullSchedule', name: 'The three-day schedule' },
  { key: 'competitionCount', name: 'The competition list' },
  { key: 'sponsorCount', name: 'Sponsors' },
  { key: 'speakers', name: 'Speakers' },
  { key: 'prizePool', name: 'Prize pool' },
];
