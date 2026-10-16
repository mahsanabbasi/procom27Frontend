import EventCard from "./EventCard.jsx";
import { DirectorCard, PersonCard } from "./TeamCards.jsx";
import TeamHero from "./TeamHero.jsx";
import SiteFooter from "./SiteFooter.jsx";
import { SectionHeading } from "./PanelPrimitives.jsx";

const coDirectors = [
  "Problem setting",
  "Datasets & judging",
  "Outreach & sponsors",
  "Event-day operations",
];

const events = [
  {
    title: "AI & Data Challenge",
    meta: "Day 1 · 02:30 PM · Lab 2",
    description:
      "Build a model on a fresh dataset in four hours, then present your results.",
  },
  {
    title: "Prompt Engineering Sprint",
    meta: "Day 2 · 10:00 AM · Lab 1",
    description:
      "Solve practical tasks with LLMs. The fastest correct solutions win.",
  },
  {
    title: "ML Model Showdown",
    meta: "Day 3 · 11:00 AM · Lab 2",
    description: "Bring a trained model and defend it in front of the judges.",
  },
];

export default function TeamDetailPage() {
  function showEvents() {
    document.getElementById("team-events")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <>
      <main className="min-h-screen bg-bg-000 text-ink">
        <TeamHero onViewEvents={showEvents} />
        <section className="w-full px-6 pb-16 md:px-16" id="team-leadership">
          <div className="mx-auto flex w-full max-w-300 flex-col items-start gap-8">
            <SectionHeading
              description="The director and co-directors who run the AI team. Reach out if you want to help with the next edition."
              eyebrow="// TEAM LEADERSHIP"
              title="MEET THE TEAM"
            />
            <DirectorCard />
            <div className="flex w-full flex-col items-start gap-4">
              <h3 className="font-pixel text-[14px] leading-5 tracking-[2.52px] text-ink sm:text-[16px] sm:tracking-[2.88px]">
                CO-DIRECTORS
              </h3>
              <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {coDirectors.map((focus, index) => (
                  <PersonCard focus={focus} key={`co-director-${index}`} />
                ))}
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full border-t border-line-subtle px-6 pb-20 pt-16 md:px-16"
          id="team-events"
        >
          <div className="mx-auto flex w-full max-w-300 flex-col items-start gap-8">
            <SectionHeading
              description="Competitions the AI team runs at PROCOM’27."
              eyebrow="// EVENTS"
              title="EVENTS BY THIS TEAM"
            />
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard event={event} key={event.title} />
              ))}
            </div>
            <a
              className="inline-flex items-center gap-2 border-b border-violet-500/45 pb-1 font-pixel text-[10px] font-bold tracking-[1.8px] text-violet-500 hover:text-violet-200 sm:text-[11px] sm:tracking-[1.98px]"
              href="/#upcoming-panels"
            >
              VIEW ALL EVENTS
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
