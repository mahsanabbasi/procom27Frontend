export const MOVE_LABELS = {
  open: "Open to all",
  free: "Free roam",
  net: "Networking",
  orbit: "Job Orbit",
  deadline: "Deadline",
};
export const MOVE_SUBTITLES = {
  open: "Competitions",
  free: "No pressure",
  net: "People",
  orbit: "Careers",
  deadline: "Dates",
};
export function registrationInfo(data, now = Date.now()) {
  const deadline = data.registration?.deadline
    ? new Date(data.registration.deadline)
    : null;
  const valid = deadline && Number.isFinite(deadline.getTime());
  return {
    closed: !!(
      data.registration?.closed ||
      (valid && now > deadline.getTime())
    ),
    text: valid
      ? deadline.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: data.event?.ianaZone,
        })
      : null,
    left: valid ? Math.floor((deadline.getTime() - now) / 864e5) : 0,
  };
}
export function bossRounds(data, now = Date.now()) {
  const info = registrationInfo(data, now),
    dates = data.event?.dates || "the event dates";
  return [
    {
      say: "“I’m not technical.”",
      mv: "open",
      hit: "There are competitions for tech and non-tech students. Business is non-technical, and General Challenges are open to all.",
    },
    {
      say: "“Competing isn’t really my thing.”",
      mv: "free",
      hit: "You don’t have to compete to enjoy PROCOM. Meet people, explore careers, or sit in on talks and workshops.",
    },
    {
      say: "“I won’t know anyone there.”",
      mv: "net",
      hit: "That’s the point. Industry professionals, sponsors, speakers, and students from your campus and others. You meet them between sessions.",
    },
    {
      say: "“I’m not job hunting yet.”",
      mv: "orbit",
      hit: "Job Orbit lets you browse career opportunities at your own pace. No pressure, just a look at what’s out there.",
    },
    {
      say: "“I’ll just go next year.”",
      mv: "deadline",
      hit: info.closed
        ? "PROCOM’27 runs " + dates + ". Next year is a different PROCOM."
        : "PROCOM’27 runs " +
          dates +
          (info.text ? ", and registration closes on " + info.text : "") +
          ". This one won’t wait for you.",
    },
  ];
}
export function haulRows(data) {
  const sessions = data.sessions || [],
    jf = sessions.find((s) => s.id === "job-fair");
  return [
    {
      k: "Competitions",
      n: (data.competitions || []).length,
      v: "to choose from",
    },
    { k: "Categories", n: 6, v: "tech and non-tech" },
    {
      k: "Days on campus",
      n: data.event?.days || (data.days || []).length,
      v: data.event?.dates || "",
    },
    {
      k: "Talks, panels & workshops",
      n: sessions.filter((s) => /^(Talk|Panel|Workshop)$/.test(s.type)).length,
      v: "on the schedule",
    },
    { k: "Job Fair", v: jf ? "Day " + jf.day + " · " + jf.time : "On campus" },
    { k: "Job Orbit", v: "Browse at your own pace" },
    { k: "People to meet", v: "Pros, sponsors, speakers, students" },
  ].filter((r) => r.n === undefined || r.n > 0);
}
