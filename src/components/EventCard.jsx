import { useState } from "react";
import { RegisterButton } from "./ActionButtons.jsx";
import { TeamEventAction } from "./TeamCards.jsx";
import { PanelTag } from "./PanelPrimitives.jsx";

export default function EventCard({ event }) {
  const [registered, setRegistered] = useState(false);

  function viewEvents() {
    document.getElementById("team-events")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <article className="flex min-w-0 flex-col items-start gap-3 rounded-sm border border-violet-800 bg-bg-200 px-4 py-5">
      <PanelTag>COMPETITION</PanelTag>
      <h3 className="text-[18px] font-bold leading-6 text-ink">
        {event.title}
      </h3>
      <p className="text-[13px] leading-5 text-ink-muted">{event.meta}</p>
      <p className="min-h-[44px] text-[14px] leading-5.5 text-ink-muted">
        {event.description}
      </p>
      <div className="flex w-full flex-col items-stretch gap-2 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <RegisterButton
          className="w-full sm:w-auto"
          label="REGISTER"
          onClick={() => setRegistered((current) => !current)}
          registered={registered}
        />
        <TeamEventAction onClick={viewEvents} />
      </div>
    </article>
  );
}
