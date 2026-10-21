// PROCOM'27 team registry.
//
// Team descriptions and categories, with confirmed leadership from the roster.
// Competition modules and additional members are settled through induction.
// `note` is the one line a card shows; `???` is an unannounced value.
// `icon` is the 12×12 pixel mark for what that team does (see PixelIcon.jsx).
import { TEAM_MEMBERS } from './teamMembers.js';

const teams = [
  {
    slug: 'programming',
    group: 'competitions',
    kind: 'competition',
    name: 'Programming',
    accent: '#b995e6',
    icon: 'terminal',
    note: 'Runs the contest programming rounds.',
    blurb:
      'Runs the programming contests: the problem sets, the judging and the contest floor on the day. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'software-engineering',
    group: 'competitions',
    kind: 'competition',
    name: 'Software Engineering',
    accent: '#4df3ff',
    icon: 'cog',
    note: 'Runs the software engineering contests.',
    blurb:
      'Runs the software engineering contests, where the entry is working software rather than a solution on paper. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'development',
    group: 'competitions',
    kind: 'competition',
    name: 'Development',
    accent: '#ff4fd1',
    icon: 'window',
    note: 'Runs the product-build contests.',
    blurb:
      'Runs the development contests — the briefs, the submissions and the judging. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'ai-data',
    group: 'competitions',
    kind: 'competition',
    name: 'AI & Data',
    accent: '#b995e6',
    icon: 'chip',
    note: 'Runs the AI and data contests.',
    blurb:
      'Runs the AI and data contests: the datasets, the evaluation and the judging panel. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'cybersecurity',
    group: 'competitions',
    kind: 'competition',
    name: 'CyberSecurity',
    accent: '#4df3ff',
    icon: 'lock',
    note: 'Runs the cyber security contest.',
    blurb:
      'Runs the cybersecurity contest: the challenges, the scoring and the judging. The format is decided once the team is formed.',
  },
  {
    slug: 'ee',
    group: 'competitions',
    kind: 'competition',
    name: 'Electrical Engineering',
    accent: '#ff4fd1',
    icon: 'bolt',
    note: 'Runs the electrical and hardware contests.',
    blurb:
      'Runs the electrical engineering contests: the arenas, the component kits, the lab safety and the referees. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'business',
    group: 'competitions',
    kind: 'competition',
    name: 'Business',
    accent: '#b995e6',
    icon: 'chart',
    note: 'Runs the business and case contests.',
    blurb:
      'Runs the business contests: the cases, the pitch rounds and the judges from industry. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'general',
    group: 'competitions',
    kind: 'competition',
    name: 'General',
    accent: '#4df3ff',
    icon: 'star',
    note: 'Runs the contests open to every student.',
    blurb:
      'Runs the competitions that need no particular degree: quizzes, photography, speed events and the formats that fit nowhere else. Competition modules are already in planning stages and open to new ideas, so be a step ahead and make them come to life!',
  },
  {
    slug: 'tech-quest',
    group: 'competitions',
    kind: 'competition',
    name: 'Tech Quest',
    accent: '#ff4fd1',
    icon: 'flag',
    note: 'Runs contests which combine tech, ciphers and mystery',
    blurb: 'Runs an exploration and tech-testing platform for digital + physical mystery, with ciphers and cyber puzzles to crack',
  },
  {
    slug: 'event-management',
    group: 'events',
    kind: 'support',
    name: 'Event Management',
    accent: '#4df3ff',
    icon: 'clipboard',
    note: 'Coordinates the event management teams.',
    blurb:
      'Connects the event management teams and their plans, from preparation to the closing ceremony.',
  },
  {
    slug: 'event-operations',
    group: 'events',
    kind: 'support',
    name: 'Event Operations',
    accent: '#b995e6',
    icon: 'calendar',
    note: 'Runs the event on the ground.',
    blurb:
      'Holds the three days together on the ground: the run sheet, the rooms and the calls that get made while it is happening.',
  },
  {
    slug: 'em-competitions',
    group: 'events',
    kind: 'support',
    name: 'EM Competitions',
    accent: '#4df3ff',
    icon: 'podium',
    note: 'Event management for the competitions.',
    blurb:
      'The event management side of the competitions: the rooms, the schedule, the stage and everything a contest needs to actually run. Not the contests themselves — those are the competition teams.',
  },
  {
    slug: 'em-tech-fest',
    group: 'events',
    kind: 'support',
    name: 'EM Tech Fest',
    accent: '#ff4fd1',
    icon: 'tent',
    note: 'Event management for the tech fest.',
    blurb:
      'The event management side of the tech fest: the floor, the stands, the schedule and everything that has to be in place before the doors open.',
  },
  {
    slug: 'internal-affairs',
    group: 'events',
    kind: 'support',
    name: 'Internal Affairs',
    accent: '#ff4fd1',
    icon: 'people',
    note: 'Coordinates affairs within the organising team.',
    blurb:
      'Keeps the organising teams connected through internal communication and coordination.',
  },
  {
    slug: 'security',
    group: 'events',
    kind: 'support',
    name: 'Security',
    accent: '#b995e6',
    icon: 'shield',
    note: 'Keeps the venue and the crowd safe.',
    blurb:
      'Looks after access, crowd safety and the venue across the three days.',
  },
  {
    slug: 'resources',
    group: 'events',
    kind: 'support',
    name: 'Resources',
    accent: '#4df3ff',
    icon: 'crate',
    note: 'Coordinates the materials teams need.',
    blurb:
      'Organises the shared resources and supplies the teams need to run the event.',
  },
  {
    slug: 'food',
    group: 'events',
    kind: 'support',
    name: 'Food',
    accent: '#ff4fd1',
    icon: 'cup',
    note: 'Feeds everyone across the three days.',
    blurb:
      'Catering, stalls and refreshments for participants, guests and the teams working the event.',
  },
  {
    slug: 'food-fest',
    group: 'events',
    kind: 'support',
    name: 'Food Fest',
    accent: '#4df3ff',
    icon: 'cup',
    note: 'Brings the food festival together.',
    blurb:
      'Organises the food festival, bringing its stalls and on-campus experience together.',
  },
  {
    slug: 'logistics',
    group: 'events',
    kind: 'support',
    name: 'Logistics (EA)',
    accent: '#b995e6',
    icon: 'truck',
    note: 'Moves everything and everyone into place.',
    blurb:
      'Plans the venues, the equipment and the movement of a thousand people across campus, and the schedule that holds it together.',
  },
  {
    slug: 'guest-relations',
    group: 'events',
    kind: 'support',
    name: 'Guest Relations',
    accent: '#4df3ff',
    icon: 'people',
    note: 'Looks after guests, judges and speakers.',
    blurb:
      'Hosts the guests, the judges and the speakers from the first invitation to the closing ceremony.',
  },
  {
    slug: 'finance-registration',
    group: 'events',
    kind: 'support',
    name: 'Finance & Registration',
    accent: '#ff4fd1',
    icon: 'coin',
    note: 'Handles the money and the sign-ups.',
    blurb:
      'Keeps the budget, the payments and the accounts for every team, and runs registration and the front desk.',
  },
  {
    slug: 'external-affairs',
    group: 'outreach',
    kind: 'support',
    name: 'External Affairs',
    accent: '#4df3ff',
    icon: 'building',
    note: 'Coordinates relations beyond the organising team.',
    blurb:
      'Supports PROCOM’s connections and coordination with people and organisations beyond the organising team.',
  },
  {
    slug: 'marketing',
    group: 'outreach',
    kind: 'support',
    name: 'Marketing',
    accent: '#b995e6',
    icon: 'megaphone',
    note: 'Acquiring the money and trust to make it all possible.',
    blurb:
      'Takes PROCOM’27 to every campus in the city: the announcements, the social accounts, the ambassadors and the registration drive.',
  },
  {
    slug: 'promotions-publications',
    group: 'outreach',
    kind: 'support',
    name: 'Promotions & Publications',
    accent: '#4df3ff',
    icon: 'newspaper',
    note: 'Grabbing the attention to where it belongs.',
    blurb:
      'The campaigns and everything PROCOM’27 puts out in writing, on screen and in print.',
  },
  {
    slug: 'corporate-affairs',
    group: 'outreach',
    kind: 'support',
    name: 'Corporate Affairs',
    accent: '#ff4fd1',
    icon: 'building',
    note: 'Bridging the gap between the employer and the employee.',
    blurb:
      'Brings in the companies that fund the event and the job fair, and looks after them from first call to the closing ceremony.',
  },
  {
    slug: 'social-media',
    group: 'creative',
    kind: 'support',
    name: 'Social Media',
    accent: '#ff4fd1',
    icon: 'megaphone',
    note: 'Coordinates PROCOM’s social media presence.',
    blurb:
      'Brings PROCOM’s announcements, stories and updates to its social media channels.',
  },
  {
    slug: 'media',
    group: 'creative',
    kind: 'support',
    name: 'Media',
    accent: '#b995e6',
    icon: 'mic',
    note: 'The record of what happened.',
    blurb:
      'Covers the event as it happens and runs the screens and sound on the day.',
  },
  {
    slug: 'photography',
    group: 'creative',
    kind: 'support',
    name: 'Coverage – Photography',
    accent: '#4df3ff',
    icon: 'camera',
    note: 'Photographs the event.',
    blurb:
      'Shoots the three days — the competitions, the people and the moments the event is remembered by.',
  },
  {
    slug: 'videography',
    group: 'creative',
    kind: 'support',
    name: 'Coverage – Videography',
    accent: '#ff4fd1',
    icon: 'clapper',
    note: 'Films and edits the event.',
    blurb:
      'Films the competitions, the people and the event floor as they happen.',
  },
  {
    slug: 'cinematics',
    group: 'creative',
    kind: 'support',
    name: 'Cinematics',
    accent: '#b995e6',
    icon: 'film',
    note: 'Creates cinematic stories from the event.',
    blurb:
      'Turns PROCOM’s moments into cinematic pieces, recaps and stories on screen.',
  },
  {
    slug: 'branding',
    group: 'creative',
    kind: 'support',
    name: 'Branding',
    accent: '#b995e6',
    icon: 'procom',
    note: 'Holds the PROCOM’27 identity together.',
    blurb:
      'Keeps one identity across every poster, screen, stage and post.',
  },
  {
    slug: 'content-creation',
    group: 'creative',
    kind: 'support',
    name: 'Content Creation',
    accent: '#4df3ff',
    icon: 'canvas',
    note: 'Writes what the event says.',
    blurb:
      'Writes the copy, the captions and the scripts the event speaks in.',
  },
  {
    slug: 'design',
    group: 'creative',
    kind: 'support',
    name: 'Design',
    accent: '#ff4fd1',
    icon: 'brush',
    note: 'Everything you look at.',
    blurb:
      'Makes everything you see: the print, the stage, the badges and the posts.',
  },
  {
    slug: 'animation',
    group: 'creative',
    kind: 'support',
    name: 'Animation',
    accent: '#b995e6',
    icon: 'film',
    note: 'Motion graphics and animated pieces.',
    blurb:
      'Builds the motion graphics, titles and animated pieces the event plays.',
  },
  {
    slug: 'creativity',
    group: 'creative',
    kind: 'support',
    name: 'Creatives',
    accent: '#4df3ff',
    icon: 'bulb',
    note: 'Develops creative ideas for PROCOM.',
    blurb:
      'Shapes creative concepts and experiences that bring PROCOM’s identity to life.',
  },
  {
    slug: 'ui-ux',
    group: 'tech',
    kind: 'support',
    name: 'UI/UX',
    accent: '#ff4fd1',
    icon: 'layout',
    note: 'Designs how the screens work.',
    blurb:
      'Designs the screens people actually use — the site, the portal and the tools the other teams work in.',
  },
  {
    slug: 'web-dev',
    group: 'tech',
    kind: 'support',
    name: 'Web Dev',
    accent: '#b995e6',
    icon: 'code',
    note: 'Builds the thing you are reading.',
    blurb:
      'Builds and runs this website, the registration portal and the tools the other teams use.',
  },
  {
    slug: 'it-automation',
    group: 'tech',
    kind: 'support',
    name: 'IT & Automation',
    accent: '#4df3ff',
    icon: 'server',
    note: 'The systems and automation behind the scenes.',
    blurb:
      'Runs the accounts, the systems and the automation the other teams depend on.',
  },
  {
    slug: 'tech-operations',
    group: 'tech',
    kind: 'support',
    name: 'Tech Operations',
    accent: '#ff4fd1',
    icon: 'screen',
    note: 'Keeps the tech running on the day.',
    blurb:
      'Keeps the networks, the machines and the screens working while the event is live.',
  },
];

export const ALL_TEAMS = teams.map((team) => ({ ...team, members: TEAM_MEMBERS[team.slug] || [] }));
export const COMPETITION_TEAMS = ALL_TEAMS.filter((team) => team.kind === 'competition');
export const SUPPORT_TEAMS = ALL_TEAMS.filter((team) => team.kind === 'support');

// Counts are written out in words wherever the copy reads as a sentence, so
// adding a team never leaves a stale number behind.
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function countWord(n) {
  if (n < 0 || n > 99 || !Number.isInteger(n)) return String(n);
  if (n === 0) return 'no';
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const unit = n % 10;
  return unit ? `${TENS[Math.floor(n / 10)]}-${ONES[unit]}` : TENS[Math.floor(n / 10)];
}

export function getTeamBySlug(slug) {
  return ALL_TEAMS.find((team) => team.slug === slug) || null;
}

export function teamPath(slug) {
  return `/teams/${slug}`;
}

export const TEAMS_PATH = '/teams';

// The filters on the all-teams page, in the order they are shown.
export const TEAM_GROUPS = [
  { key: 'all', label: 'All teams', note: 'Every team running PROCOM’27.' },
  { key: 'competitions', label: 'Competitions', note: 'The contests themselves — the ones you enter.' },
  { key: 'events', label: 'Event operations', note: 'Making three days on campus actually happen.' },
  { key: 'outreach', label: 'Marketing & outreach', note: 'Getting PROCOM’27 in front of people.' },
  { key: 'creative', label: 'Media & design', note: 'Everything PROCOM’27 looks and sounds like.' },
  { key: 'tech', label: 'Tech', note: 'The systems the whole event runs on.' },
];

export function teamsInGroup(key) {
  return key === 'all' ? ALL_TEAMS : ALL_TEAMS.filter((team) => team.group === key);
}
