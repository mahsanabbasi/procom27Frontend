// Composes the Home page and isolates its Home-specific design and navigation.
import { useEffect, useState } from 'react';
import './home.css';
import { HomeHeader } from './HomeHeader.jsx';
import HomeHero from './HomeHero.jsx';
import { AboutSection } from '../AboutSection.jsx';
import WhyAttendSection from './WhyAttendSection.jsx';
import HomeTeamsSection from './HomeTeamsSection.jsx';
import { IntroScheduleSection } from '../IntroScheduleSection.jsx';
import RegistrationCalloutSection from './RegistrationCalloutSection.jsx';
import HomeCompetitionCategoriesSection from './HomeCompetitionCategoriesSection.jsx';
import FeaturedCompetitionsSection from './FeaturedCompetitionsSection.jsx';
import { ensureHomeFontsReady } from './homeFonts.js';

export default function HomePage({ onContactClick }) {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let active = true;
    ensureHomeFontsReady().then(() => {
      if (active) setFontsReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`home-page${fontsReady ? ' home-fonts-ready' : ''}`}>
      <HomeHeader onContactClick={onContactClick} />
      <HomeHero />
      <RegistrationCalloutSection />
      <HomeCompetitionCategoriesSection />
      <FeaturedCompetitionsSection />
      <WhyAttendSection />
      <HomeTeamsSection />
      <AboutSection />
      <IntroScheduleSection />
    </div>
  );
}
