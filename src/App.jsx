import { useState, useEffect } from 'react';
import { Starfield } from './components/Starfield.jsx';
import { Navbar } from './components/Navbar.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { AboutSection } from './components/AboutSection.jsx';
import AboutPage from './components/AboutPage.jsx';
import { CompetitionCategoriesSection } from './components/CompetitionCategoriesSection.jsx';
import { WhyProcomSection } from './components/WhyProcomSection.jsx';
import { MeetTheTeamsSection } from './components/MeetTheTeamsSection.jsx';
import { IntroScheduleSection } from './components/IntroScheduleSection.jsx';
import { RegisterBand } from './components/RegisterBand.jsx';
import { Footer } from './components/Footer.jsx';
import TeamDetailPage from './components/TeamDetailPage.jsx';
import TeamsPage from './components/TeamsPage.jsx';

// Accounts are not built yet, so nothing opens AuthModal, PortalModal or
// CompetitionsModal: every call to action goes to the membership form in
// src/data/links.js. They stay in src/components/modals/ for when the backend
// lands — mount them here again and give the navbar back its Log in button.
import { ContactModal } from './components/modals/ContactModal.jsx';

import { getTeamBySlug } from './data/teams.js';

// Sections arrive as they enter the viewport, once. Content is visible without
// script: the hidden state only applies under html.js.
function useEntrances(key) {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    elements.forEach((el) => observer.observe(el));
    // Safety: if the observer is throttled (background tab), show whatever is
    // already on screen after a moment rather than leave it at opacity 0.
    const safety = setTimeout(() => {
      elements.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      });
    }, 2500);
    return () => {
      observer.disconnect();
      clearTimeout(safety);
    };
  }, [key]);
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAboutPage = /^\/about\/?$/.test(currentPath);
  const isTeamsIndex = /^\/teams\/?$/.test(currentPath);
  const teamSlug = !isTeamsIndex && currentPath.startsWith('/teams/')
    ? decodeURIComponent(currentPath.slice('/teams/'.length).replace(/\/+$/, ''))
    : null;

  useEffect(() => {
    if (isAboutPage) {
      document.title = "About Us | PROCOM'27";
    } else if (isTeamsIndex) {
      document.title = "Teams | PROCOM'27";
    } else if (teamSlug) {
      const team = getTeamBySlug(teamSlug);
      document.title = team ? `${team.name} team | PROCOM'27` : `Team not found | PROCOM'27`;
    } else {
      document.title = "PROCOM'27 | FAST NUCES Karachi";
    }
  }, [isAboutPage, isTeamsIndex, teamSlug]);

  useEntrances(currentPath);

  // Direct links such as /#competitions arrive before React mounts the section.
  useEffect(() => {
    if (!window.location.hash) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [currentPath]);

  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Starfield />

      <div id={isAboutPage || isTeamsIndex || teamSlug ? 'top' : undefined} style={{ position: 'relative', zIndex: 1, minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
        <Navbar currentPath={currentPath} />

        <main style={{ flex: 1 }}>
          {isAboutPage ? (
            <AboutPage />
          ) : isTeamsIndex ? (
            <TeamsPage />
          ) : teamSlug ? (
            <TeamDetailPage slug={teamSlug} />
          ) : (
            <>
              <HeroSection />
              <AboutSection />
              <WhyProcomSection />
              <CompetitionCategoriesSection />
              <MeetTheTeamsSection />
              <IntroScheduleSection />
              <RegisterBand />
            </>
          )}
        </main>

        <Footer onContactClick={() => setContactOpen(true)} />
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
