import { useState } from "react";
import PanelDetail from "./PanelDetail.jsx";
import PanelHero from "./PanelHero.jsx";
import SiteFooter from "./SiteFooter.jsx";
import UpcomingPanels from "./UpcomingPanels.jsx";
import { panels } from "../data/panels.js";

export default function PanelDiscussionsPage() {
  const [selectedPanel, setSelectedPanel] = useState(panels[0]);
  const [isSaved, setIsSaved] = useState(false);

  function showPanels() {
    document.getElementById("upcoming-panels")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function selectPanel(panel) {
    setSelectedPanel(panel);
    setIsSaved(false);
    window.setTimeout(() => {
      document.getElementById("panel-detail")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 0);
  }

  return (
    <main className="min-h-screen bg-bg-000 text-ink">
      <PanelHero onSelectPanel={selectPanel} onViewPanels={showPanels} />
      <UpcomingPanels onSelectPanel={selectPanel} panels={panels} />
      <PanelDetail
        isSaved={isSaved}
        onToggleSaved={() => setIsSaved((saved) => !saved)}
        onViewSchedule={showPanels}
        panel={selectedPanel}
      />
      <SiteFooter />
    </main>
  );
}
