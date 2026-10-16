import arrowIcon from "../assets/panel-primary-arrow.svg";
import leadIcon from "../assets/panel-primary-icon.svg";
import heroScanlines from "../assets/panel-hero-scanlines.svg";
import { panels } from "../data/panels.js";
import { PrimaryButton, SecondaryButton } from "./ActionButtons.jsx";
import { CardAction } from "./PanelPrimitives.jsx";

function Stat({ value, label }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-stat text-[20px] leading-7 text-ink">{value}</span>
      <span className="font-pixel text-[10px] leading-[14px] tracking-[1.8px] text-ink-muted">
        {label}
      </span>
    </div>
  );
}

function NextUpCard({ panel, onSelectPanel }) {
  return (
    <aside className="relative z-[1] flex w-full shrink-0 flex-col items-start gap-3 rounded-sm border border-violet-800 bg-bg-200 p-5 sm:p-6 lg:w-[380px]">
      <p className="flex items-center gap-2 font-stat text-[10px] leading-4 text-violet-200">
        <span aria-hidden="true" className="h-3 w-3 bg-violet-500" />
        // NEXT UP · DAY 1
      </p>
      <h2 className="text-[20px] font-bold leading-7 text-ink">
        {panel.title}
      </h2>
      <p className="text-[13px] leading-5 text-ink-muted">
        02:00 PM · Main Auditorium
      </p>
      <p className="text-[13px] leading-5 text-violet-200">
        4 speakers · 60 min
      </p>
      <CardAction onClick={() => onSelectPanel(panel)} />
    </aside>
  );
}

export default function PanelHero({ onViewPanels, onSelectPanel }) {
  return (
    <>
      <div className="w-full px-6 pt-5 md:px-16 md:pt-10" id="top">
        <p className="mx-auto w-full max-w-300 text-[12px] leading-4 text-ink-muted">
          Home&nbsp; / &nbsp;Panel Discussions
        </p>
      </div>
      <section className="w-full px-6 pb-16 pt-6 md:px-16 md:pt-8">
        <div className="relative mx-auto flex w-full max-w-300 flex-col items-start gap-8 overflow-hidden rounded-sm border border-line-subtle bg-bg-000 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-12">
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-px -top-px h-[797px] w-[1200px] max-w-none opacity-80"
            src={heroScanlines}
          />
          <div className="relative z-[1] flex min-w-0 flex-1 flex-col items-start gap-6">
            <p className="font-stat text-[10px] leading-4 text-violet-200 sm:text-[12px]">
              // PROCOM’27 · TALKS &amp; PANELS
            </p>
            <h1 className="font-stat text-[28px] leading-9 text-ink sm:text-[40px] sm:leading-[1.25] lg:text-[48px] lg:leading-[56px]">
              PANEL DISCUSSIONS
            </h1>
            <p className="max-w-[720px] text-[14px] leading-[22px] text-ink-muted sm:text-[16px] sm:leading-[26px]">
              Hear from industry leaders, academics and experienced
              professionals. Pick the panels you want, save them to your
              schedule and bring your questions.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton
                arrowSrc={arrowIcon}
                iconSrc={leadIcon}
                label="VIEW SCHEDULE"
                onClick={onViewPanels}
              />
              <SecondaryButton
                arrowSrc={arrowIcon}
                label="ALL PANELS"
                onClick={onViewPanels}
              />
            </div>
            <div className="flex flex-wrap gap-8 pt-2 sm:gap-12">
              <Stat value="04" label="PANELS" />
              <Stat value="16" label="SPEAKERS" />
              <Stat value="03" label="DAYS" />
            </div>
          </div>
          <NextUpCard onSelectPanel={onSelectPanel} panel={panels[0]} />
        </div>
      </section>
    </>
  );
}
