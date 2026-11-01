import { useCallback, useRef, useState } from 'react';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import DinoInitialization from './components/initialization/DinoInitialization.jsx';
import { getSiteInitialization } from './components/initialization/initialization.js';

const initialization = getSiteInitialization();
// Explicit animation preview only; never enabled in a production build.
const debugCold = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debugLoader') === 'cold';

/** One initialization boundary outside the page router, shared by every requested URL. */
export default function AppShell() {
  const [replay, setReplay] = useState(0);
  const replayScroll = useRef(null);
  const afterReveal = useCallback(() => {
    if (replayScroll.current) {
      window.scrollTo({ ...replayScroll.current, behavior:'instant' });
      replayScroll.current = null;
      return;
    }
    // The approved reveal temporarily clips its content to the viewport. Restore a
    // requested fragment after that clip is removed, without changing the route.
    try {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) document.getElementById(id)?.scrollIntoView({ behavior:'instant', block:'start' });
    } catch { /* An invalid fragment must not prevent the page from being usable. */ }
  }, []);
  return <>
    <DinoInitialization key={replay} controller={initialization} preview={import.meta.env.DEV && (debugCold || replay > 0)} onReveal={afterReveal}>
      <AuthProvider><App /></AuthProvider>
    </DinoInitialization>
    {import.meta.env.DEV && <div className="initialization-demo-controls"><button type="button" onClick={() => { replayScroll.current = { left:scrollX, top:scrollY }; setReplay(value => value + 1); }}>Replay Loader ↗</button></div>}
  </>;
}
