import heroScanlines from "../assets/team-hero-scanlines.svg";
import teamScanlines from "../assets/team-scanlines.svg";
import { PanelMedia, PanelTag } from "./PanelPrimitives.jsx";
import { PrimaryButton, SecondaryButton } from "./ActionButtons.jsx";

export default function TeamHero({ onViewEvents }) {
  function goToLeadership() {
    document.getElementById("team-leadership")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  return (
    <>
      <div className="w-full px-6 pb-6 pt-5 md:px-16 md:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto w-full max-w-300 text-[12px] leading-4 text-ink-muted"
        >
          <a className="hover:text-ink" href="/">
            Home
          </a>
          <span aria-hidden="true">&nbsp; / &nbsp;</span>
          <a className="hover:text-ink" href="/teams/artificial-intelligence">
            Teams
          </a>
          <span aria-hidden="true">&nbsp; / &nbsp;</span>
          <span aria-current="page">Artificial Intelligence</span>
        </nav>
      </div>
      <section className="w-full px-6 pb-16 md:px-16">
        <div className="relative mx-auto flex w-full max-w-300 flex-col items-start gap-8 overflow-hidden rounded-sm border border-line-subtle p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-12">
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -left-px -top-px h-[797px] w-[1200px] max-w-none"
            height="797"
            src={heroScanlines}
            width="1200"
          />
          <PanelMedia
            caption="// TEAM LOGO"
            glyph="AI"
            scanlinesSrc={teamScanlines}
            variant="square"
          />
          <div className="relative z-[1] flex min-w-0 flex-1 flex-col items-start gap-5">
            <p className="font-stat text-[10px] leading-4 text-violet-200 sm:text-[12px]">
              // PROCOM’27 · TEAM
            </p>
            <h1 className="font-stat text-[26px] leading-[1.3] text-ink sm:text-[36px] lg:text-[48px] lg:leading-[56px]">
              ARTIFICIAL INTELLIGENCE
            </h1>
            <div className="flex flex-wrap gap-2">
              <PanelTag>COMPETITION TEAM</PanelTag>
              <PanelTag>CATEGORY · AI</PanelTag>
            </div>
            <p className="max-w-[720px] text-[14px] leading-[22px] text-ink-muted sm:text-[16px] sm:leading-[26px]">
              Runs PROCOM’27’s AI and data competitions, from writing problem
              sets and datasets to judging the finals.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton label="VIEW EVENTS" onClick={onViewEvents} />
              <SecondaryButton label="JOIN THE TEAM" onClick={goToLeadership} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
