// Composes the Home page and isolates its Home-specific design and navigation.
import './home.css';
import { HomeHeader } from './HomeHeader.jsx';
import { HeroSection } from '../HeroSection.jsx';
import { AboutSection } from '../AboutSection.jsx';
import { WhyProcomSection } from '../WhyProcomSection.jsx';
import { CompetitionCategoriesSection } from '../CompetitionCategoriesSection.jsx';
import { MeetTheTeamsSection } from '../MeetTheTeamsSection.jsx';
import { IntroScheduleSection } from '../IntroScheduleSection.jsx';
import { RegisterBand } from '../RegisterBand.jsx';

export default function HomePage({ onContactClick }) {
  return (
    <div className="home-page">
      <HomeHeader onContactClick={onContactClick} />
      <HeroSection />
      <AboutSection />
      <WhyProcomSection />
      <CompetitionCategoriesSection />
      <MeetTheTeamsSection />
      <IntroScheduleSection />
      <RegisterBand />
    </div>
  );
}
