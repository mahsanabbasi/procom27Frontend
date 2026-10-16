import teamCardArrow from "../assets/team-card-arrow.svg";
import teamScanlines from "../assets/team-scanlines.svg";
import { CardAction, PanelMedia, PanelTag } from "./PanelPrimitives.jsx";
import { TextLink } from "./ActionButtons.jsx";

export function DirectorCard() {
  return (
    <article className="flex w-full flex-col items-start gap-6 rounded-sm border border-violet-800 bg-bg-200 p-4 sm:flex-row sm:gap-8 sm:p-6">
      <PanelMedia
        caption="// PHOTO"
        glyph="DN"
        scanlinesSrc={teamScanlines}
        variant="director"
      />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <PanelTag>DIRECTOR</PanelTag>
        <h3 className="text-[24px] font-bold leading-8 text-ink sm:text-[28px] sm:leading-9">
          Director Name
        </h3>
        <p className="text-[13px] leading-5 text-ink-muted">
          Director · Leads the AI team
        </p>
        <p className="text-[14px] leading-5.5 text-ink-muted sm:text-[16px] sm:leading-6.5">
          Owns the competition line-up, brings in judges and problem setters,
          and keeps the team on schedule from the first meeting to the prize
          ceremony.
        </p>
        <div className="flex flex-wrap gap-6 pt-2">
          <TextLink href="#team-leadership" label="LINKEDIN" />
          <TextLink href="mailto:team@procom.org" label="EMAIL" />
        </div>
      </div>
    </article>
  );
}

export function PersonCard({ focus }) {
  return (
    <article className="flex min-w-0 flex-col items-start gap-3 rounded-sm border border-violet-800 bg-bg-200 p-4">
      <PanelMedia
        caption="// PHOTO"
        glyph="CD"
        scanlinesSrc={teamScanlines}
        variant="portrait"
      />
      <PanelTag>CO-DIRECTOR</PanelTag>
      <h3 className="text-[18px] font-bold leading-6 text-ink">
        Co-Director Name
      </h3>
      <p className="text-[13px] leading-5 text-ink-muted">{focus}</p>
      <TextLink href="#team-leadership" label="LINKEDIN" />
    </article>
  );
}

export function TeamEventAction({ onClick }) {
  return (
    <CardAction arrowSrc={teamCardArrow} onClick={onClick}>
      VIEW
    </CardAction>
  );
}
