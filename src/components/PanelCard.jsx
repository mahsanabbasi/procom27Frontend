import { CardAction, PanelMedia, PanelTag } from "./PanelPrimitives.jsx";

export default function PanelCard({ panel, onSelect }) {
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-sm border border-violet-800 bg-bg-200 p-4 sm:p-5">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:gap-5">
        <PanelMedia glyph={panel.glyph} />
        <div className="flex min-w-0 flex-col items-start gap-2">
          <PanelTag>{panel.topic}</PanelTag>
          <h3 className="text-[20px] font-bold leading-7 text-ink">
            {panel.title}
          </h3>
          <p className="text-[13px] leading-5 text-ink-muted">{panel.meta}</p>
          <p className="text-[13px] leading-5 text-violet-200">{panel.facts}</p>
        </div>
      </div>
      <p className="min-h-[44px] text-[14px] leading-5.5 text-ink-muted">
        {panel.description}
      </p>
      <div className="flex w-full items-center border-t border-line-subtle pt-4">
        <CardAction onClick={() => onSelect(panel)} />
      </div>
    </article>
  );
}
