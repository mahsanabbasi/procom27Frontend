/* =====================================================================
   ✏️  EDIT ROUTES HERE (links in the Teams page's nav and footer).
   Keys marked LIVE are real pages in this app; every other route is a
   placeholder that shows an honest notice when clicked. `contact` opens the
   site's contact dialog.
   ===================================================================== */
export const ROUTES = {
  home: '/',
  competitions: '/#competitions',
  teams: '/teams',
  schedule: '/#schedule',
  about: '/about',
  event: '/event',
  register: '/register',
  contact: '/contact',
  ambassadors: '/ambassadors',
  whyAttend: '/why-attend',
  sponsors: '/sponsors',
  jobFair: '/job-fair',
  jobOrbit: '/job-orbit',
  campusMap: '/campus-map',
  panels: '/panel-discussions',
  workshops: '/workshops',
  showcase: '/startup-showcase',
  privacy: '/privacy-policy',
  terms: '/terms',
  refund: '/refund-policy',
  shipping: '/shipping-policy',
  aboutUs: '/about',
};

export const LIVE = {
  home: true,
  competitions: true,
  teams: true,
  schedule: true,
  about: true,
  aboutUs: true,
  whyAttend: true,
};

export const href = (key) => ROUTES[key] || '#';
export const isLive = (key) => !!LIVE[key];

export const NAV = [
  ['home', 'Home'],
  ['competitions', 'Competitions'],
  ['teams', 'Teams'],
  ['schedule', 'Schedule'],
  ['about', 'About'],
];
