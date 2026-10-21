import { PROCOM_FORM_URL, EXTERNAL } from '../data/links.js';
import { revealValue } from '../data/reveals.js';

// The one thing a visitor can act on today: join the team that runs the event.
// Competing comes later, with the participant portal.
export const RegisterBand = () => {
  return (
    <section id="register" className="band" aria-labelledby="register-title">
      <div className="shell band-inner">
        <div>
          <h2 id="register-title" className="heading">Applications to join are open</h2>
          <p>PROCOM&apos;27 is built by students. Pick a team, fill one form - be part of something bigger.</p>
        </div>
        <div className="band-action">
          <a href={PROCOM_FORM_URL} {...EXTERNAL} className="pixel-btn-dark">Join the team</a>
          <p className="band-note">Closes {revealValue('memberDeadline')}</p>
        </div>
      </div>
    </section>
  );
};
