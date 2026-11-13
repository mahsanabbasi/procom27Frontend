/* =====================================================================
   PROCOM’27 — SHARED EVENT DATA (one source for every page)
   DEMO = true → values marked (demo) are proposed sample content,
   not confirmed by the organizers.
   ===================================================================== */
export const PROCOM_DATA = {
  DEMO: true,

  event: {
    dates: '26–28 Feb 2027', // (demo)
    campus: 'FAST-NUCES Karachi', // (demo)
    timezone: 'PKT (UTC+5)', // (demo)
    utcOffset: '+05:00',
    ianaZone: 'Asia/Karachi',
    days: 3,
  },

  registration: {
    deadline: '2027-02-15T23:59:00+05:00', // (demo) drives the live countdown; a past date closes registration everywhere
    closed: false,
    url: '/register',
  },

};

/* Official contact details — leave empty to show clearly marked placeholders */
export const CONTACT = { email: '', phone: '', address: '' };
export const SOCIAL = {
  instagram: 'https://www.instagram.com/procom_fast/?hl=en',
  linkedin: 'https://pk.linkedin.com/company/procom-fast',
  youtube: '',
  facebook: '',
};
