// The Teams page (character select) reads the confirmed registry in
// teams.js + teamMembers.js and shapes it for the roster: one department per
// team, a short code for each panel, and leads grouped by role.
// To add or edit a team, edit teams.js / teamMembers.js — not this file.
import { ALL_TEAMS, TEAMS_PATH } from './teams.js';

export const CONFIG = {
  ROUTE_BASE: `${TEAMS_PATH}/`,
};

// Departments, in the order the design shows them. `groups` are the
// registry's `group` keys that belong to each department.
export const CATEGORIES = [
  { id: 'ops', groups: ['events'], label: 'Operations', short: 'OPS', blurb: 'Planning, logistics, finance, security, food and the event floor.' },
  { id: 'outreach', groups: ['outreach'], label: 'Outreach & Relations', short: 'OUT', blurb: 'Marketing, partners, guests and how PROCOM reaches people.' },
  { id: 'creative', groups: ['creative'], label: 'Media & Creative', short: 'CRE', blurb: 'Photography, film, animation, branding and design.' },
  { id: 'tech', groups: ['tech'], label: 'Computing', short: 'COM', blurb: 'The systems, websites and interfaces behind the event.' },
  { id: 'comp', groups: ['competitions'], label: 'Competitions', short: 'CMP', blurb: 'The teams that design and run PROCOM’s competitions.' },
];

/* one screentone per department (all from the purple palette) */
export const TONES = { ops: '#DCC8FF', outreach: '#B57CFF', creative: '#F5F0FA', tech: '#A57BEA', comp: '#C9A2FF' };

/* Teams featured in "A few of our teams" (by slug) */
export const FEATURED = ['ui-ux', 'media', 'tech-operations', 'ai-data'];

/* The code printed on each roster panel and behind the portrait. */
const CODES = {
  programming: 'PRG',
  'software-engineering': 'SWE',
  development: 'DEV',
  'ai-data': 'AI',
  cybersecurity: 'CYB',
  ee: 'EE',
  business: 'BIZ',
  general: 'GEN',
  'tech-quest': 'TQ',
  'event-management': 'EVM',
  'event-operations': 'OPS',
  'em-competitions': 'EMC',
  'em-tech-fest': 'TFX',
  'internal-affairs': 'INT',
  security: 'SEC',
  resources: 'RES',
  food: 'FUD',
  'food-fest': 'FFX',
  logistics: 'LOG',
  'guest-relations': 'GST',
  'finance-registration': 'FIN',
  'external-affairs': 'EXT',
  marketing: 'MKT',
  'promotions-publications': 'PRO',
  'corporate-affairs': 'CORP',
  'social-media': 'SOC',
  media: 'MED',
  photography: 'PHO',
  videography: 'VID',
  cinematics: 'CIN',
  branding: 'BRD',
  'content-creation': 'CON',
  design: 'DSN',
  animation: 'ANI',
  creativity: 'CRE',
  'ui-ux': 'UX',
  'web-dev': 'WEB',
  'it-automation': 'ITA',
  'tech-operations': 'TOP',
};

/* Extra words people search for. */
const ALIASES = {
  programming: ['coding', 'code', 'competitive programming'],
  'software-engineering': ['software', 'se'],
  'ai-data': ['ai', 'data', 'machine learning', 'ml'],
  cybersecurity: ['cyber', 'security', 'ctf'],
  ee: ['electrical', 'hardware', 'robotics'],
  'event-operations': ['operations', 'ops'],
  'em-tech-fest': ['tech fest', 'techfest'],
  'finance-registration': ['registration', 'finance'],
  'corporate-affairs': ['corporate', 'sponsors'],
  'guest-relations': ['guests'],
  'promotions-publications': ['promotions', 'publications', 'pr'],
  'social-media': ['social'],
  photography: ['photo', 'coverage'],
  videography: ['video', 'coverage'],
  cinematics: ['film'],
  animation: ['motion'],
  branding: ['brand'],
  design: ['graphics'],
  creativity: ['creative'],
  'ui-ux': ['ui', 'ux', 'uiux', 'user experience'],
  'web-dev': ['web development', 'website', 'webdev'],
  'it-automation': ['it', 'automation'],
  'tech-operations': ['tech ops', 'techops'],
};

const LEAD_ROLES = ['Executive Director', 'Director', 'Deputy Director'];

export const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
export const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const catForGroup = (group) => CATEGORIES.find((c) => c.groups.includes(group)) || CATEGORIES[0];
const fallbackCode = (name) =>
  name
    .replace(/[^A-Za-z ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();

export const TEAMS = ALL_TEAMS.map((t, i) => {
  const cat = catForGroup(t.group);
  const leads = t.members
    .filter((m) => LEAD_ROLES.includes(m.designation))
    .map((m) => ({ role: m.designation, name: m.name }));
  return {
    id: i,
    slug: t.slug,
    name: t.name,
    code: CODES[t.slug] || fallbackCode(t.name),
    category: cat.id,
    cat,
    leads,
    // anyone listed with another designation shows as a team member
    members: t.members.filter((m) => !LEAD_ROLES.includes(m.designation)).map((m) => m.name),
    description: t.blurb || t.note || '',
    aliases: ALIASES[t.slug] || [],
    route: CONFIG.ROUTE_BASE + t.slug,
    tokens: t.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
    peopleNorm: leads.map((l) => norm(l.name)),
  };
});

/* display order: grouped by department, then registry order */
export const ORDER = TEAMS.slice().sort(
  (a, b) => CATEGORIES.indexOf(a.cat) - CATEGORIES.indexOf(b.cat) || a.id - b.id,
);
ORDER.forEach((t, i) => {
  t.n = i;
});
export const N = TEAMS.length;
export const teamBySlug = (slug) => TEAMS.find((t) => t.slug === slug) || null;
export const byRole = (t, r) => t.leads.filter((l) => l.role === r);

/** department for a registry group key (the footer links to /teams?group=…) */
export const catForGroupKey = (key) => {
  const c = CATEGORIES.find((x) => x.groups.includes(key));
  return c ? c.id : 'all';
};
