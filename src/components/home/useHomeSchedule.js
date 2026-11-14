import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { homeScheduleDays, homeScheduleSessions } from '../../data/homeSchedule.js';

const HELP = {
  participant: 'Find competition timings, venues, and session details.',
  spectator: 'Find sessions open to visitors and see what’s happening next.',
};
const ACCESS = {
  open: 'Open to spectators',
  viewing: 'Spectator viewing available',
  participants: 'Participant-only session',
};
const CAMPUS = 'FAST-NUCES Karachi';
const UTC_OFFSET = '+05:00';

export function toMinutes(time) {
  const match = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(time || '');
  if (!match) return null;
  const hour = Number(match[1]) % 12 + (/pm/i.test(match[3]) ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function isOpen(session) {
  return session.access === 'open' || session.access === 'viewing';
}

function sessionsFor(day) {
  return homeScheduleSessions
    .filter((session) => session.day === day && toMinutes(session.time) !== null)
    .slice()
    .sort((a, b) => (toMinutes(a.time) || 0) - (toMinutes(b.time) || 0));
}

function sessionDate(dayNumber, time) {
  const day = homeScheduleDays.find((item) => item.n === dayNumber);
  const minutes = toMinutes(time);
  if (!day?.date || minutes === null) return null;
  const midnight = new Date(`${day.date}T00:00:00${UTC_OFFSET}`);
  return new Date(midnight.getTime() + minutes * 60_000);
}

export function statusOf(session, now = 0) {
  const start = sessionDate(session.day, session.time);
  if (!start) return null;
  const end = session.end
    ? sessionDate(session.day, session.end)
    : new Date(start.getTime() + 60 * 60_000);
  if (now < start.getTime()) return null;
  if (now < end.getTime()) return 'now';
  return 'done';
}

function makeDefaultSession(sessions, mode, now) {
  return sessions.find((session) =>
    statusOf(session, now) !== 'done' && (mode !== 'spectator' || isOpen(session))) ||
    sessions[0];
}

function getPlan() {
  try {
    const plan = JSON.parse(localStorage.getItem('procom27-plan') || '[]');
    if (Array.isArray(plan)) return plan;
    console.warn('Ignoring an invalid saved schedule plan.');
    return [];
  } catch (error) {
    console.warn('Unable to read the saved schedule plan.', error);
    return [];
  }
}

function getDayStart(dayNumber) {
  const day = homeScheduleDays.find((item) => item.n === dayNumber);
  return day?.date ? new Date(`${day.date}T00:00:00${UTC_OFFSET}`) : null;
}

function playBlip(audioContextRef) {
  const procomSfx = window.PROCOM?.kit?.sfx;
  if (procomSfx) {
    procomSfx.play('blip');
    return;
  }

  try {
    if (localStorage.getItem('procom27-sfx') !== '1') return;
  } catch (error) {
    console.warn('Unable to read the sound preference.', error);
    return;
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') {
      context.resume().catch((error) => {
        console.warn('Unable to resume the schedule sound context.', error);
      });
    }
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + 0.01;
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, start);
    gain.gain.setValueAtTime(0.05, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.04);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.06);
  } catch (error) {
    console.warn('Unable to play the schedule selection sound.', error);
  }
}

function addToCalendar(session, timersRef) {
  const start = sessionDate(session.day, session.time);
  if (!start) return;
  const end = session.end
    ? sessionDate(session.day, session.end)
    : new Date(start.getTime() + 60 * 60_000);
  const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PROCOM27//EN',
    'BEGIN:VEVENT',
    `UID:${session.id || session.title}@procom27`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${session.title} — PROCOM ’27`,
    `LOCATION:${session.venue || ''}${CAMPUS ? `, ${CAMPUS}` : ''}`,
    'DESCRIPTION:Demo schedule — confirm details before attending.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${session.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  const timer = window.setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
    timersRef.current.delete(timer);
  }, 500);
  timersRef.current.set(timer, { url, anchor });
}

function loadPlanFromStorage() {
  return getPlan();
}

function planChanged() {
  document.dispatchEvent(new CustomEvent('procom:plan'));
}

function laneSessionsFor(sessions) {
  const laneEnds = [];
  return sessions.map((session) => {
    const start = toMinutes(session.time);
    const end = toMinutes(session.end) ?? start + 60;
    const lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    const laneIndex = lane < 0 ? laneEnds.length : lane;
    laneEnds[laneIndex] = end;
    return { ...session, lane: laneIndex };
  });
}

export default function useHomeSchedule() {
  const [day, setDay] = useState(1);
  const [mode, setMode] = useState('participant');
  const [selectedId, setSelectedId] = useState(null);
  const [plan, setPlan] = useState(() => loadPlanFromStorage());
  const [clockNow, setClockNow] = useState(0);
  const [replay, setReplay] = useState(0);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const [motionAllowed, setMotionAllowed] = useState(() =>
    typeof window === 'undefined' ||
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [trackIn, setTrackIn] = useState(() =>
    typeof window === 'undefined' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window));
  const audioContextRef = useRef(null);
  const downloadTimersRef = useRef(new Map());
  const trackRef = useRef(null);
  const selectionRef = useRef(null);
  const tooltipRef = useRef(null);
  const setTrackNode = useCallback((node) => { trackRef.current = node; }, []);
  const setSelectionNode = useCallback((node) => { selectionRef.current = node; }, []);
  const setTooltipNode = useCallback((node) => { tooltipRef.current = node; }, []);

  const allSessions = useMemo(() => homeScheduleSessions.slice(), []);
  const timeline = useMemo(() => {
    let start = 24 * 60;
    let end = 0;
    allSessions.forEach((session) => {
      const sessionStart = toMinutes(session.time);
      if (sessionStart === null) return;
      const sessionEnd = toMinutes(session.end) ?? sessionStart + 60;
      start = Math.min(start, sessionStart);
      end = Math.max(end, sessionEnd);
    });
    if (end <= start) {
      start = 9 * 60;
      end = 18 * 60;
    }
    start = Math.floor(start / 60) * 60;
    end = Math.ceil(end / 60) * 60;
    return { start, end, span: end - start };
  }, [allSessions]);

  const sessions = useMemo(() => sessionsFor(day), [day]);
  const laneSessions = useMemo(() => laneSessionsFor(sessions), [sessions]);
  const laneCount = Math.max(1, ...laneSessions.map((session) => session.lane + 1));
  const selectedSession = sessions.find((session) => session.id === selectedId) ||
    makeDefaultSession(sessions, mode, clockNow);

  useEffect(() => {
    const syncPlan = () => setPlan(loadPlanFromStorage());
    window.addEventListener('storage', syncPlan);
    document.addEventListener('procom:plan', syncPlan);
    return () => {
      window.removeEventListener('storage', syncPlan);
      document.removeEventListener('procom:plan', syncPlan);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = (event) => {
      const allowed = !event.matches;
      setMotionAllowed(allowed);
      if (!allowed) setTrackIn(true);
    };
    query.addEventListener('change', updateMotion);
    return () => query.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    if (trackIn) return undefined;
    if (!motionAllowed || !trackRef.current || !('IntersectionObserver' in window)) {
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTrackIn(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, [motionAllowed, trackIn]);

  useEffect(() => {
    const refresh = () => setClockNow(Date.now());
    const initialTimer = window.setTimeout(refresh, 0);
    // Keep the live marker and session status aligned with event time.
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  useLayoutEffect(() => {
    if (!tooltip || !tooltipRef.current) return;
    const element = tooltipRef.current;
    let x = tooltip.x + 14;
    const y = tooltip.y - 12;
    if (x + element.offsetWidth > window.innerWidth - 8) {
      x = tooltip.x - element.offsetWidth - 14;
    }
    element.style.transform = `translate(${x}px, ${y - element.offsetHeight}px)`;
  }, [tooltip]);

  useEffect(() => () => {
    downloadTimersRef.current.forEach(({ url, anchor }, timer) => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      anchor.remove();
    });
    downloadTimersRef.current.clear();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch((error) => {
        console.warn('Unable to close the schedule sound context.', error);
      });
    }
  }, []);

  const chooseDay = useCallback((nextDay) => {
    setDay(nextDay);
    setSelectedId(null);
    setSelectionVersion(0);
    setReplay((value) => value + 1);
  }, []);

  const selectSession = useCallback((session, userInitiated = false) => {
    setSelectedId(session.id);
    if (!userInitiated) return;
    setSelectionVersion((value) => value + 1);
    const procom = window.PROCOM;
    procom?.XP?.quest('sched', selectionRef.current);
    playBlip(audioContextRef);
  }, []);

  const moveTooltip = useCallback((session, event) => {
    setTooltip({
      session,
      x: event.clientX,
      y: event.clientY,
    });
  }, []);
  const hideTooltip = useCallback(() => setTooltip(null), []);

  const togglePlan = useCallback((session, button) => {
    const next = plan.includes(session.id)
      ? plan.filter((id) => id !== session.id)
      : [...plan, session.id];
    setPlan(next);
    try {
      localStorage.setItem('procom27-plan', JSON.stringify(next));
    } catch (error) {
      console.warn('Unable to save the schedule plan.', error);
    }
    planChanged();

    const procom = window.PROCOM;
    if (!plan.includes(session.id)) {
      const rect = button.getBoundingClientRect();
      procom?.kit?.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, { n: 12 });
      procom?.XP?.quest('plan', button);
    }
    procom?.toast?.(
      `${plan.includes(session.id) ? 'Removed from your plan' : 'Added to your plan'}: <code>${session.title}</code>`,
    );
  }, [plan]);

  const changeMode = useCallback((nextMode) => {
    setMode(nextMode);
    setSelectedId(null);
    setSelectionVersion(0);
  }, []);

  const positionFor = useCallback((minutes) =>
    ((minutes - timeline.start) / timeline.span) * 100, [timeline]);
  const ticks = useMemo(() => {
    const values = [];
    for (let minutes = timeline.start; minutes <= timeline.end; minutes += 60) {
      values.push(minutes);
    }
    return values;
  }, [timeline]);
  const dayStart = getDayStart(day);
  const nowMinutes = dayStart ? (clockNow - dayStart.getTime()) / 60_000 : null;
  const nowPosition = nowMinutes >= timeline.start && nowMinutes <= timeline.end
    ? positionFor(nowMinutes)
    : null;
  const openCount = sessions.filter(isOpen).length;
  const competitionCount = sessions.filter((session) => session.comp).length;
  const addSessionToCalendar = useCallback((session) => {
    addToCalendar(session, downloadTimersRef);
  }, []);

  return {
    access: ACCESS,
    changeMode,
    chooseDay,
    clockNow,
    day,
    help: HELP[mode],
    laneCount,
    laneSessions,
    mode,
    motionAllowed,
    nowPosition,
    openCount,
    plan,
    positionFor,
    replay,
    selectSession,
    selectedId,
    selectedSession,
    setSelectionNode,
    setTrackNode,
    selectionVersion,
    sessions,
    ticks,
    timeline,
    trackIn,
    togglePlan,
    addSessionToCalendar,
    competitionCount,
    hideTooltip,
    moveTooltip,
    setTooltipNode,
    tooltip,
  };
}
