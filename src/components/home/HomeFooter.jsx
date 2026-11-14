import { Link } from 'wouter';
import { homeFooter } from '../../data/homeFooter.js';

function FooterLink({ href, children }) {
  return <Link href={href}>{children}</Link>;
}

export default function HomeFooter() {
  return (
    <footer className="footer">
        <div className="container">
          <div className="footer__grid footer__grid--4">
            <div>
              <Link className="brand" href="/" aria-label="PROCOM’27 home">
                <svg className="brand__mark" viewBox="0 0 186 251" aria-hidden="true">
                  <defs><linearGradient id="home-footer-mark-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DCC8FF" /><stop offset="1" stopColor="#B57CFF" /></linearGradient></defs>
                  <path d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z" fill="#493460" />
                  <path d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z" fill="url(#home-footer-mark-gradient)" />
                </svg>
                <span className="brand__word">{homeFooter.brand}</span>
              </Link>
              <p className="footer__tag t-label" style={{ marginTop: 'var(--s-3)' }}>{homeFooter.tagline}</p>
              <p className="footer__about">{homeFooter.about}</p>
              {homeFooter.socials.length > 0 && (
                <div className="socials">
                  {homeFooter.socials.map((social) => (
                    <a
                      className="icon-btn"
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <i className={`i i-${social.icon}`} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <nav aria-label="Quick links">
              <h2>Quick links</h2>
              <ul>{homeFooter.quickLinks.map((item) => <li key={item.href}><FooterLink href={item.href}>{item.label}</FooterLink></li>)}</ul>
            </nav>
            <nav aria-label="Competitions">
              <h2>Competitions</h2>
              <ul>
                {homeFooter.competitions.map((item) => (
                  <li key={item.id}><FooterLink href={`/competitions?cat=${item.id}`}>{item.label}</FooterLink></li>
                ))}
              </ul>
            </nav>
            <div>
              <h2>Contact</h2>
              <ul>
                {homeFooter.contact.map((item) => (
                  <li key={item.label}>
                    {item.href
                      ? <a href={item.href}>{item.label}</a>
                      : <span>{item.label}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span>{homeFooter.copyright}</span>
            <ul className="footer__legal">
              {homeFooter.legalLinks.map((item) => (
                <li key={item.href}><FooterLink href={item.href}>{item.label}</FooterLink></li>
              ))}
            </ul>
          </div>
        </div>
    </footer>
  );
}
