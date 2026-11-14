import { useEffect, useState } from 'react';
import ArcadeNav from './ArcadeNav.jsx';
import ArcadeFooter from './ArcadeFooter.jsx';
import Toast from './Toast.jsx';
import XPHud from './XPHud.jsx';
import OneUp from './OneUp.jsx';
import GlobalFX from './GlobalFX.jsx';
import { ContactModal } from '../modals/ContactModal.jsx';
import '../../styles/arcade/index.css';

/**
 * Page shell for the arcade design: nav (+ breadcrumb, mobile menu), <main>,
 * footer with Bit Runner, toast, XP quest log, 1UP and the arcade effects.
 * Everything renders inside `.pd`, the scope of the design's stylesheet.
 * `after` renders between <main> and the footer (e.g. a page's overlay view).
 */
export default function ArcadeLayout({ page, active, crumbs, skip, after, children }) {
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('pd-page');
    const open = () => setContactOpen(true);
    document.addEventListener('procom:contact', open);
    return () => {
      root.classList.remove('pd-page', 'menu-open', 'kb', 'cheat');
      document.removeEventListener('procom:contact', open);
    };
  }, []);

  return (
    <>
      <div className="pd">
        {skip && (
          <a className="skip-link" href={skip.href}>
            {skip.label}
          </a>
        )}
        <ArcadeNav page={page} active={active} crumbs={crumbs} />
        <main id="main">{children}</main>
        {after}
        <ArcadeFooter page={page} />
        <Toast />
        <XPHud />
        <OneUp />
        <GlobalFX />
      </div>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
