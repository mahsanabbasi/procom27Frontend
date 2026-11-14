import { ORDER, norm } from '../../data/teamDirectory.js';

/** how well a team matches a search string (score 3 = name/code, 2 = alias, 1 = loose / person) */
export function matchTeam(t, s) {
  const n = norm(s || '');
  if (!n) return { ok: true };
  if (norm(t.code).indexOf(n) === 0) return { ok: true, score: 3 };
  if (t.tokens.some((w) => w.indexOf(s.toLowerCase().trim()) === 0) || norm(t.name).indexOf(n) === 0) return { ok: true, score: 3 };
  if (t.aliases.some((a) => norm(a).indexOf(n) === 0)) return { ok: true, score: 2 };
  if (n.length >= 3 && norm(t.name).indexOf(n) > -1) return { ok: true, score: 2 };
  if (n.length >= 4 && (norm(t.cat.label).indexOf(n) > -1 || norm(t.description).indexOf(n) > -1)) return { ok: true, score: 1 };
  if (n.length >= 3) {
    for (let i = 0; i < t.leads.length; i++) {
      if (t.peopleNorm[i].indexOf(n) > -1) return { ok: true, score: 1, person: t.leads[i] };
    }
  }
  return { ok: false };
}

/** teams matching a department filter + search, in display order */
export function results(cat, q) {
  let out = [];
  ORDER.forEach((t) => {
    if (cat !== 'all' && t.category !== cat) return;
    const m = matchTeam(t, q);
    if (m.ok) out.push({ t, m });
  });
  if (out.some((r) => (r.m.score || 0) >= 2)) out = out.filter((r) => (r.m.score || 3) >= 2 || r.m.person);
  return out;
}
