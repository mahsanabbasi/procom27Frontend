import { useState } from "react";
import searchIcon from "../assets/panel-search-icon.svg";
import PanelCard from "./PanelCard.jsx";
import { SectionHeading } from "./PanelPrimitives.jsx";

export default function UpcomingPanels({ panels, onSelectPanel }) {
  const [topic, setTopic] = useState("ALL");
  const [query, setQuery] = useState("");
  const topics = ["ALL", ...new Set(panels.map((panel) => panel.topic))];
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePanels = panels.filter((panel) => {
    const matchesTopic = topic === "ALL" || topic === panel.topic;
    const searchableText =
      `${panel.title} ${panel.topic} ${panel.meta} ${panel.facts} ${panel.description}`.toLowerCase();
    return matchesTopic && searchableText.includes(normalizedQuery);
  });

  return (
    <section className="w-full px-6 pb-16 md:px-16" id="upcoming-panels">
      <div className="mx-auto flex w-full max-w-300 flex-col gap-6">
        <SectionHeading
          description="Filter by topic or day, or search for a panel or speaker."
          eyebrow="// 04 PANELS"
          title="UPCOMING PANELS"
        />
        <form
          className="flex flex-wrap items-center gap-4 rounded-sm border border-line-subtle bg-bg-100 p-4 sm:p-6"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="flex items-center gap-2">
            <label
              className="w-11 font-pixel text-[10px] tracking-[1.8px] text-ink-muted"
              htmlFor="topic-filter"
            >
              TOPIC
            </label>
            <div className="relative">
              <select
                className="h-8 appearance-none rounded-xs border border-violet-500 border-b-2 bg-violet-tint-14 pl-3 pr-8 font-pixel text-[11px] tracking-[1.8px] text-violet-200 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                id="topic-filter"
                onChange={(event) => setTopic(event.target.value)}
                value={topic}
              >
                {topics.map((item) => (
                  <option className="bg-bg-200" key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-[7px] h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-violet-200"
              />
            </div>
          </div>
          <label
            className="flex h-10 min-w-[220px] flex-1 items-center gap-2.5 rounded-xs border border-violet-800 bg-bg-000 px-3 focus-within:ring-2 focus-within:ring-violet-500 sm:max-w-[320px]"
            htmlFor="panel-search"
          >
            <img
              alt=""
              aria-hidden="true"
              className="h-4.5 w-4.5 shrink-0"
              height="18"
              src={searchIcon}
              width="18"
            />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-ink outline-none placeholder:text-ink-muted"
              id="panel-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search panels or speakers"
              type="search"
              value={query}
            />
          </label>
        </form>
        <div className="flex items-center justify-between text-[13px] leading-5 text-ink-muted">
          <p>
            Showing {visiblePanels.length}{" "}
            {visiblePanels.length === 1 ? "panel" : "panels"}
          </p>
          <p>Sorted by time</p>
        </div>
        {visiblePanels.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visiblePanels.map((panel) => (
              <PanelCard
                key={panel.id}
                onSelect={onSelectPanel}
                panel={panel}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-sm border border-line-subtle bg-bg-200 px-5 py-8 text-center text-[14px] text-ink-muted">
            No panels match your filters.
          </p>
        )}
      </div>
    </section>
  );
}
