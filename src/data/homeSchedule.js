// Demo schedule copied from the final homepage reference.
export const homeScheduleDays = [
  { n: 1, date: '2027-02-26', label: 'Fri 26 Feb', published: true },
  { n: 2, date: '2027-02-27', label: 'Sat 27 Feb', published: true },
  { n: 3, date: '2027-02-28', label: 'Sun 28 Feb', published: true },
];

const sessions = [
  { id: 'opening-ceremony', day: 1, time: '09:00 AM', title: 'Opening Ceremony', venue: 'Main Auditorium', type: 'Ceremony', access: 'open' },
  { id: 'keynote-talk', day: 1, time: '10:00 AM', title: 'Keynote Talk', venue: 'Main Auditorium', type: 'Talk', access: 'open' },
  { id: 'panel-day1', day: 1, time: '04:00 PM', title: 'Panel Discussion', venue: 'Main Auditorium', type: 'Panel', access: 'open' },
  { id: 'workshop-git', day: 2, time: '09:30 AM', title: 'Workshop: Git & GitHub Basics', venue: 'Seminar Hall 2', type: 'Workshop', access: 'participants' },
  { id: 'job-fair', day: 2, time: '12:00 PM', title: 'Job Fair', venue: 'Exhibition Hall', type: 'Career', access: 'open' },
  { id: 'panel-day2', day: 2, time: '03:00 PM', title: 'Panel Discussion: Careers in Tech', venue: 'Main Auditorium', type: 'Panel', access: 'open' },
  { id: 'startup-showcase', day: 3, time: '10:00 AM', title: 'Startup Showcase', venue: 'Exhibition Hall', type: 'Showcase', access: 'open' },
  { id: 'workshop-design', day: 3, time: '01:00 PM', title: 'Workshop: Designing for Users', venue: 'Design Studio', type: 'Workshop', access: 'participants' },
  { id: 'closing-ceremony', day: 3, time: '06:30 PM', title: 'Closing & Prize Ceremony', venue: 'Main Auditorium', type: 'Ceremony', access: 'open' },
];

const competitions = [
  { id: 'programming-competition', name: 'Programming Competition', day: 1, start: '11:30 AM', end: '02:30 PM', venue: 'Lab 1', access: 'participants' },
  { id: 'debugging-challenge', name: 'Debugging Challenge', day: 2, start: '10:00 AM', end: '12:00 PM', venue: 'Lab 3', access: 'participants' },
  { id: 'ai-data-challenge', name: 'AI & Data Challenge', day: 1, start: '02:30 PM', end: '05:30 PM', venue: 'Lab 2', access: 'participants' },
  { id: 'machine-learning-challenge', name: 'Machine Learning Challenge', day: 2, start: '01:00 PM', end: '04:00 PM', venue: 'Lab 2', access: 'participants' },
  { id: 'circuit-design-challenge', name: 'Circuit Design Challenge', day: 1, start: '12:00 PM', end: '03:00 PM', venue: 'EE Lab', access: 'participants' },
  { id: 'robotics-challenge', name: 'Robotics Challenge', day: 3, start: '10:00 AM', end: '01:00 PM', venue: 'Robotics Arena', access: 'viewing' },
  { id: 'ui-ux-design-challenge', name: 'UI/UX Design Challenge', day: 2, start: '11:00 AM', end: '02:00 PM', venue: 'Design Studio', access: 'participants' },
  { id: 'app-development-challenge', name: 'App Development Challenge', day: 3, start: '09:30 AM', end: '03:30 PM', venue: 'Lab 4', access: 'participants' },
  { id: 'business-case-challenge', name: 'Business Case Challenge', day: 2, start: '02:30 PM', end: '05:00 PM', venue: 'Seminar Hall', access: 'participants' },
  { id: 'startup-pitch-competition', name: 'Startup Pitch Competition', day: 3, start: '02:00 PM', end: '04:30 PM', venue: 'Main Auditorium', access: 'open' },
  { id: 'general-knowledge-quiz', name: 'General Knowledge Quiz', day: 1, start: '03:30 PM', end: '04:30 PM', venue: 'Seminar Hall', access: 'open' },
  { id: 'gaming-tournament', name: 'Gaming Tournament', day: 3, start: '11:00 AM', end: '06:00 PM', venue: 'Gaming Arena', access: 'viewing' },
  { id: 'code-golf-challenge', name: 'Code Golf Challenge', day: 2, start: '03:00 PM', end: '04:30 PM', venue: 'Lab 1', access: 'participants' },
  { id: 'data-structures-sprint', name: 'Data Structures Sprint', day: 3, start: '11:00 AM', end: '12:30 PM', venue: 'Lab 3', access: 'participants' },
  { id: 'computer-vision-challenge', name: 'Computer Vision Challenge', day: 3, start: '01:00 PM', end: '04:00 PM', venue: 'Lab 2', access: 'participants' },
  { id: 'prompt-engineering-challenge', name: 'Prompt Engineering Challenge', day: 1, start: '10:30 AM', end: '12:00 PM', venue: 'Lab 5', access: 'participants' },
  { id: 'embedded-systems-challenge', name: 'Embedded Systems Challenge', day: 2, start: '10:00 AM', end: '01:00 PM', venue: 'EE Lab', access: 'participants' },
  { id: 'line-follower-race', name: 'Line Follower Race', day: 3, start: '03:30 PM', end: '05:30 PM', venue: 'Robotics Arena', access: 'viewing' },
  { id: 'web-development-challenge', name: 'Web Development Challenge', day: 1, start: '01:00 PM', end: '05:00 PM', venue: 'Lab 3', access: 'participants' },
  { id: 'software-testing-challenge', name: 'Software Testing Challenge', day: 3, start: '09:30 AM', end: '11:30 AM', venue: 'Lab 5', access: 'participants' },
  { id: 'marketing-strategy-challenge', name: 'Marketing Strategy Challenge', day: 1, start: '11:00 AM', end: '01:30 PM', venue: 'Seminar Hall 2', access: 'participants' },
  { id: 'product-management-case', name: 'Product Management Case', day: 2, start: '10:30 AM', end: '12:30 PM', venue: 'Seminar Hall', access: 'participants' },
  { id: 'treasure-hunt', name: 'Treasure Hunt', day: 2, start: '03:30 PM', end: '05:30 PM', venue: 'Courtyard', access: 'open' },
  { id: 'speed-typing-contest', name: 'Speed Typing Contest', day: 1, start: '05:00 PM', end: '06:00 PM', venue: 'Lab 4', access: 'open' },
  { id: 'racing-game-cup', name: 'Racing Game Cup', day: 2, start: '01:00 PM', end: '05:00 PM', venue: 'Gaming Arena', access: 'viewing' },
  { id: 'strategy-game-showdown', name: 'Strategy Game Showdown', day: 1, start: '02:00 PM', end: '06:00 PM', venue: 'Gaming Arena', access: 'viewing' },
];

export const homeScheduleSessions = [
  ...sessions,
  ...competitions.map((competition) => ({
    id: `c-${competition.id}`,
    comp: competition.id,
    day: competition.day,
    time: competition.start,
    end: competition.end,
    title: competition.name,
    venue: competition.venue,
    type: 'Competition',
    access: competition.access,
  })),
];
