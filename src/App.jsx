import { useEffect } from "react";
import PanelDiscussionsPage from "./components/PanelDiscussionsPage.jsx";
import TeamDetailPage from "./components/TeamDetailPage.jsx";

export default function App() {
  const isTeamPage = window.location.pathname.startsWith("/teams/");

  useEffect(() => {
    document.title = isTeamPage
      ? "PROCOM ’27 | Artificial Intelligence Team"
      : "PROCOM ’27 | Panel Discussions";
  }, [isTeamPage]);

  return isTeamPage ? <TeamDetailPage /> : <PanelDiscussionsPage />;
}
