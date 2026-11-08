import { useState, useEffect, lazy, Suspense } from 'react';
import { Router, Switch, Route, useLocation } from 'wouter';
import { Starfield } from './components/Starfield.jsx';
import { Navbar } from './components/Navbar.jsx';
import { HeroSection } from './components/HeroSection.jsx';
import { AboutSection } from './components/AboutSection.jsx';
import { CompetitionCategoriesSection } from './components/CompetitionCategoriesSection.jsx';
import { WhyProcomSection } from './components/WhyProcomSection.jsx';
import { MeetTheTeamsSection } from './components/MeetTheTeamsSection.jsx';
import { IntroScheduleSection } from './components/IntroScheduleSection.jsx';
import { RegisterBand } from './components/RegisterBand.jsx';
import { Footer } from './components/Footer.jsx';
import { ContactModal } from './components/modals/ContactModal.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { getTeamBySlug } from './data/teams.js';

const WhyAttendPage = lazy(() => import('./components/whyAttend/WhyAttendPage.jsx'));
const AboutPage = lazy(() => import('./components/AboutPage.jsx'));
const TeamsPage = lazy(() => import('./components/TeamsPage.jsx'));
const TeamDetailPage = lazy(() => import('./components/TeamDetailPage.jsx'));

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

function RetroLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '60px 16px',
        gap: '20px',
        width: '100%',
      }}
    >
      <div
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '11px',
          color: '#B995E6',
          textShadow: '0 0 10px rgba(185, 149, 230, 0.6)',
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span>&gt;&gt;</span>
        <span>LOADING...</span>
        <span className="caret" />
      </div>
      <div
        style={{
          width: '200px',
          height: '8px',
          background: 'rgba(24, 26, 48, 0.8)',
          border: '2px solid rgba(185, 149, 230, 0.4)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#B995E6',
            width: '60%',
            animation: 'pulse 1.2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <WhyProcomSection />
      <CompetitionCategoriesSection />
      <MeetTheTeamsSection />
      <IntroScheduleSection />
      <RegisterBand />
    </>
  );
}

function MainLayout() {
  const [location] = useLocation();
  const [contactOpen, setContactOpen] = useState(false);

  const isWhyAttend = /^\/why-attend\/?$/.test(location);
  const PageContainer = isWhyAttend ? 'div' : 'main';
  const isAboutPage = location === '/about' || location === '/about/';
  const isTeamsIndex = location === '/teams' || location === '/teams/';
  const teamMatch = location.match(/^\/teams\/([^/]+)/);
  const teamSlug = teamMatch ? decodeURIComponent(teamMatch[1]) : null;

  useEffect(() => {
    if (isWhyAttend) {
      document.title = 'Why Attend PROCOM’27 — Where Skill Meets Scale';
    } else if (isAboutPage) {
      document.title = "About Us | PROCOM'27";
    } else if (isTeamsIndex) {
      document.title = "Teams | PROCOM'27";
    } else if (teamSlug) {
      const team = getTeamBySlug(teamSlug);
      document.title = team ? `${team.name} team | PROCOM'27` : `Team not found | PROCOM'27`;
    } else {
      document.title = "PROCOM'27 | FAST NUCES Karachi";
    }
  }, [isWhyAttend, isAboutPage, isTeamsIndex, teamSlug]);

  useEntrances(location);

  // Smooth hash scroll navigation across routes and same-page clicks
  useEffect(() => {
    const scrollToTarget = () => {
      if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    const timer = setTimeout(scrollToTarget, 50);

    const onHashChange = () => {
      scrollToTarget();
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [location]);

  return (
    <>
      {!isWhyAttend && <Starfield />}

      <div
        id={location !== '/' ? 'top' : undefined}
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!isWhyAttend && <Navbar currentPath={location} />}

        <PageContainer style={{ flex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={<RetroLoader />}>
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/why-attend" component={WhyAttendPage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/teams" component={TeamsPage} />
                <Route path="/teams/:slug">
                  {(params) => <TeamDetailPage slug={decodeURIComponent(params.slug)} />}
                </Route>
                <Route component={HomePage} />
              </Switch>
            </Suspense>
          </ErrorBoundary>
        </PageContainer>

        {!isWhyAttend && <Footer onContactClick={() => setContactOpen(true)} />}
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MainLayout />
      </Router>
    </ErrorBoundary>
  );
}
