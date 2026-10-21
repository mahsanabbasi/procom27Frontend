// Outbound links the site hands people off to.
//
// PROCOM'27 has no accounts yet: the participant portal is not built, so the
// one live action on the site is applying to join a team. That runs on a
// Google Form. Swap the URL below when the real form is ready — it is the only
// place it appears.

// TODO: replace with the real PROCOM'27 membership Google Form link.
export const PROCOM_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScf8UBmYCRpBOGqQ_YXbckMX1OOB9YqmQRKr1YKRISx2hLkzw/viewform';

// Every outbound CTA opens in a new tab and carries the same rel.
export const EXTERNAL = { target: '_blank', rel: 'noopener noreferrer' };

// Intro Day runs its live audience bits — the panel Q&A and the quiz — on its
// own site, so the schedule points people at it by name.
export const INTRO_PLATFORM_URL = 'https://intro.procom27.com';
export const INTRO_PLATFORM_NAME = 'intro.procom27.com';
