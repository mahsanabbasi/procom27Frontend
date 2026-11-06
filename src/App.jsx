// Defines the application routes and applies the shared site layout.
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/layout/Layout.jsx";
import PanelDiscussionsPage from "./components/PanelDiscussionsPage.jsx";
import TeamDetailPage from "./components/TeamDetailPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import CompetitionCategoryPage from "./pages/CompetitionCategoryPage.jsx";
import CompetitionDetailPage from "./pages/CompetitionDetailPage.jsx";
import CompetitionsPage from "./pages/CompetitionsPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import ExcomPage from "./pages/ExcomPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import PortalCompetitionPage from "./pages/PortalCompetitionPage.jsx";
import PortalLoginPage from "./pages/PortalLoginPage.jsx";
import PortalPage from "./pages/PortalPage.jsx";
import PortalPassPage from "./pages/PortalPassPage.jsx";
import RegisterCompetitionPage from "./pages/RegisterCompetitionPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RegisterSuccessPage from "./pages/RegisterSuccessPage.jsx";
import SchedulePage from "./pages/SchedulePage.jsx";
import SponsorsPage from "./pages/SponsorsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages share the global navbar layout. */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/excom" element={<ExcomPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/competitions/:categorySlug" element={<CompetitionCategoryPage />} />
          <Route path="/competitions/:categorySlug/:compSlug" element={<CompetitionDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/:competitionSlug" element={<RegisterCompetitionPage />} />
          <Route path="/register/success" element={<RegisterSuccessPage />} />
          {/* Portal pages retain the existing placeholder auth guard. */}
          <Route path="/portal/login" element={<PortalLoginPage />} />
          <Route path="/portal" element={<ProtectedRoute><PortalPage /></ProtectedRoute>} />
          <Route path="/portal/competition/:id" element={<ProtectedRoute><PortalCompetitionPage /></ProtectedRoute>} />
          <Route path="/portal/pass" element={<ProtectedRoute><PortalPassPage /></ProtectedRoute>} />
          <Route path="/panel-discussions" element={<PanelDiscussionsPage />} />
          <Route path="/teams/:teamSlug" element={<TeamDetailPage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
