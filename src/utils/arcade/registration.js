import { PROCOM_DATA as D } from '../../data/procomEvent.js';

export const deadline = D.registration.deadline ? new Date(D.registration.deadline) : null;

export const regClosed = () => !!(D.registration.closed || (deadline && Date.now() > deadline.getTime()));

function fmt(d, o) {
  const opts = { ...o };
  if (D.event.ianaZone) opts.timeZone = D.event.ianaZone;
  try {
    return d.toLocaleString('en-GB', opts);
  } catch {
    delete opts.timeZone;
    return d.toLocaleString('en-GB', opts);
  }
}

export function fmtDeadline(d, withTime) {
  return (
    fmt(
      d,
      withTime
        ? { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }
        : { day: 'numeric', month: 'long', year: 'numeric' },
    ) + (withTime && D.event.timezone ? ' ' + D.event.timezone.split(' ')[0] : '')
  );
}
