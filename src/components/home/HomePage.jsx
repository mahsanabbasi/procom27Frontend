// Composes the existing home-page sections without changing their behavior.
import { HeroSection } from '../HeroSection.jsx';
import { AboutSection } from '../AboutSection.jsx';
import { WhyProcomSection } from '../WhyProcomSection.jsx';
import { CompetitionCategoriesSection } from '../CompetitionCategoriesSection.jsx';
import { MeetTheTeamsSection } from '../MeetTheTeamsSection.jsx';
import { IntroScheduleSection } from '../IntroScheduleSection.jsx';
import { RegisterBand } from '../RegisterBand.jsx';

export default function HomePage() {
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
