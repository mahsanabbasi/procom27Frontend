import { Link } from 'wouter';
import { isRevealed, revealValue } from '../data/reveals.js';
import { COMPETITION_TEAMS, countWord } from '../data/teams.js';

const FACTS = [
  { key: 'memberApplications', label: 'Joining a team' },
];

export const AboutSection = () => {
  return (
    <section id="about" className="shell section" aria-labelledby="about-title">
      <div className="about-grid">
        <div data-reveal>
          <h2 id="about-title" className="heading">What is PROCOM?</h2>
          <dl className="facts" style={{ marginTop: '28px' }}>
            {FACTS.map((fact) => (
              <div key={fact.key}>
                <dt>{fact.label}</dt>
                <dd className={isRevealed(fact.key) ? undefined : 'is-unknown'}>{revealValue(fact.key)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-reveal style={{ '--i': 1 }}>
          <p className="lead">
            The annual technology competition of FAST NUCES Karachi, organised entirely by its students
            and open to universities across Pakistan.
          </p>
          <p className="lead" style={{ marginTop: '20px' }}>
            1 day on campus: competitions across {countWord(COMPETITION_TEAMS.length)} categories, a job fair,
            a startup showcase, food stalls and more.
          </p>
          <Link href="/about" className="pixel-btn-secondary" style={{ marginTop: '28px' }}>Our story →</Link>
        </div>
      </div>

      {/* The campus photo is out until we have one that is actually FAST NUCES
          Karachi — the Wikimedia file that was here showed a different
          building. Drop the right image at public/images/ and restore:

          <figure className="about-photo" data-reveal>
            <img src="/images/<file>" width="1600" height="983" loading="lazy"
                 alt="The main building of FAST NUCES Karachi, seen across the front lawn" />
            <figcaption>FAST NUCES Karachi, main campus. The event runs here.</figcaption>
          </figure>

          If the replacement needs attribution, put the credit back in Footer.jsx. */}
    </section>
  );
};
