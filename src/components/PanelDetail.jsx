import registerArrow from "../assets/panel-action-arrow.svg";
import registerIcon from "../assets/panel-lead-icon.svg";
import linkArrow from "../assets/panel-detail-arrow.svg";
import { speakers } from "../data/panels.js";
import { RegisterButton } from "./ActionButtons.jsx";
import {
  InfoRow,
  LeadMarker,
  PanelMedia,
  PanelTag,
  SectionHeading,
} from "./PanelPrimitives.jsx";

function Speaker({ speaker }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xs border border-violet-800 bg-bg-200 font-stat text-[10px] text-violet-200">
        {speaker.initials}
      </div>
      <div className="min-w-0">
        {speaker.moderator && (
          <div className="mb-1">
            <PanelTag>MODERATOR</PanelTag>
          </div>
        )}
        <p className="text-[16px] font-medium leading-5.5 text-ink">
          {speaker.name}
        </p>
        <p className="text-[13px] leading-5 text-ink-muted">{speaker.role}</p>
      </div>
    </div>
  );
}

export default function PanelDetail({
  panel,
  isSaved,
  onToggleSaved,
  onViewSchedule,
}) {
  return (
    <section
      className="w-full border-t border-line-subtle px-6 pb-20 pt-16 md:px-16"
      id="panel-detail"
    >
      <div className="mx-auto flex w-full max-w-300 flex-col gap-8">
        <SectionHeading
          description="Who is speaking, what they will cover, and how to attend."
          eyebrow="// PANEL DETAIL"
          title="INSIDE THE PANEL"
        />
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <div className="flex min-w-0 flex-1 flex-col gap-8">
            <PanelMedia
              caption="// PANEL BANNER"
              glyph={panel.glyph}
              variant="banner"
            />
            <div className="flex w-full flex-col items-start gap-3">
              <PanelTag>{panel.topic}</PanelTag>
              <h3 className="text-[24px] font-bold leading-8 text-ink sm:text-[28px] sm:leading-9">
                {panel.title}
              </h3>
              <p className="text-[14px] leading-5.5 text-ink-muted sm:text-[16px] sm:leading-6.5">
                {panel.detailDescription || panel.description}
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-3">
              <h4 className="font-pixel text-[14px] leading-5 tracking-[2.52px] text-ink sm:text-[16px] sm:tracking-[2.88px]">
                WHAT THEY’LL DISCUSS
              </h4>
              <ul className="flex w-full flex-col gap-3">
                {panel.discussionPoints.map((point) => (
                  <li
                    className="flex items-start gap-3 text-[14px] leading-5.5 text-ink-muted"
                    key={point}
                  >
                    <LeadMarker />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full flex-col items-start gap-5">
              <h4 className="font-pixel text-[14px] leading-5 tracking-[2.52px] text-ink sm:text-[16px] sm:tracking-[2.88px]">
                ON THE PANEL
              </h4>
              <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                {speakers.map((speaker) => (
                  <Speaker key={speaker.initials} speaker={speaker} />
                ))}
              </div>
            </div>
          </div>
          <aside className="flex w-full shrink-0 flex-col items-start gap-4 rounded-sm border border-violet-800 bg-bg-200 p-5 sm:p-6 lg:w-95">
            <h3 className="font-pixel text-[14px] leading-5 tracking-[2.52px] text-ink sm:text-[16px] sm:tracking-[2.88px]">
              SESSION DETAILS
            </h3>
            <InfoRow label="DATE" value={panel.date} />
            <InfoRow label="TIME" value={panel.time} />
            <InfoRow label="VENUE" value={panel.venue} />
            <InfoRow label="TOPIC" value={panel.detailTopic} />
            <InfoRow label="FORMAT" value={panel.format} />
            <RegisterButton
              arrowSrc={registerArrow}
              className="w-full"
              iconSrc={registerIcon}
              label="ADD TO SCHEDULE"
              onClick={onToggleSaved}
              registered={isSaved}
              registeredLabel="ADDED TO SCHEDULE"
            />
            <p className="text-[12px] leading-4 text-ink-muted">
              Seats are first come, first served. Arrive 10 minutes early.
            </p>
            <button
              className="flex items-center gap-2 border-b border-violet-500/45 pb-1 font-pixel text-[10px] font-bold tracking-[1.8px] text-violet-500 transition-colors hover:border-violet-200 hover:text-violet-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-000 sm:text-[11px] sm:tracking-[1.98px]"
              onClick={onViewSchedule}
              type="button"
            >
              VIEW FULL SCHEDULE
              <img
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
                height="16"
                src={linkArrow}
                width="16"
              />
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
