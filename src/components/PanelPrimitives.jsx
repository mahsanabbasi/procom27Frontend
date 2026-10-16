import panelArrow from "../assets/panel-card-arrow.svg";
import leadIcon from "../assets/panel-lead-icon.svg";
import scanlines from "../assets/panel-detail-scanlines.svg";

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <header className="flex flex-col items-start gap-2">
      <p className="font-stat text-[12px] leading-4 text-violet-200">
        {eyebrow}
      </p>
      <h2 className="font-pixel text-[20px] leading-7 tracking-[3.2px] text-ink sm:text-[26px] sm:leading-8 sm:tracking-[4.16px]">
        {title}
      </h2>
      <p className="text-[14px] leading-5.5 text-ink-muted">{description}</p>
    </header>
  );
}

export function PanelTag({ children }) {
  return (
    <span className="inline-flex h-[22px] items-center rounded-xs border border-violet-800 px-2 font-pixel text-[10px] leading-3.5 tracking-[1.8px] text-violet-200">
      {children}
    </span>
  );
}

export function PanelMedia({
  glyph,
  caption = "// PANEL IMAGE",
  variant = "card",
  scanlinesSrc = scanlines,
}) {
  const variantClass = {
    banner: "h-[300px] w-full",
    card: "h-[150px] w-full sm:w-[200px]",
    director: "h-[220px] w-full sm:h-[200px] sm:w-[200px]",
    portrait: "h-[220px] w-full",
    square: "h-[200px] w-[200px]",
  }[variant];

  return (
    <div
      className={`relative flex shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-line-subtle bg-bg-100 ${variantClass}`}
    >
      <img
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -left-px -top-px h-[797px] w-[1440px] max-w-none"
        src={scanlinesSrc}
      />
      <span className="relative font-stat text-[20px] leading-7 text-violet-500">
        {glyph}
      </span>
      <span className="relative font-pixel text-[10px] leading-3.5 tracking-[1.8px] text-ink-muted">
        {caption}
      </span>
    </div>
  );
}

export function CardAction({
  onClick,
  children = "VIEW PANEL",
  arrowSrc = panelArrow,
  disabled = false,
}) {
  return (
    <button
      className="group flex h-10 items-center justify-center gap-3 rounded-xs border border-violet-800 px-4 font-pixel text-[13px] tracking-[2.34px] text-violet-200 transition-[background-color,border-color,transform] duration-150 hover:border-violet-500 hover:bg-violet-tint-14 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-000 disabled:pointer-events-none disabled:border-line-subtle disabled:bg-transparent disabled:text-ink-muted"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
      <img
        alt=""
        aria-hidden="true"
        className="h-4 w-4 group-disabled:opacity-40"
        height="16"
        src={arrowSrc}
        width="16"
      />
    </button>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex w-full flex-col items-start gap-1 border-b border-line-subtle pb-3">
      <p className="font-pixel text-[10px] leading-[14px] tracking-[1.8px] text-ink-muted">
        {label}
      </p>
      <p className="text-[16px] font-medium leading-[22px] text-ink">{value}</p>
    </div>
  );
}

export function LeadMarker() {
  return (
    <img
      alt=""
      aria-hidden="true"
      className="mt-[5px] h-3 w-3 shrink-0"
      height="12"
      src={leadIcon}
      width="12"
    />
  );
}
