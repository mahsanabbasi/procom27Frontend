import { useLocation } from 'wouter';
import { href, isLive } from '../../utils/arcade/routes.js';
import { pixelNavigate } from '../../utils/arcade/pixelCover.js';
import { toast } from '../../utils/arcade/toast.js';
import { closeMenu, openContact } from '../../utils/arcade/menu.js';

/**
 * Link to a site route by key. LIVE routes navigate (with the pixel wipe);
 * placeholder routes show an honest notice instead, exactly like the design.
 */
export default function RouteLink({ to, path, demoKind, demoMsg, children, onClick, ...rest }) {
  const [, navigate] = useLocation();
  const url = path || href(to);
  const live = path ? true : isLive(to);

  function handle(e) {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (to === 'contact') {
      e.preventDefault();
      closeMenu();
      openContact();
      return;
    }
    if (!live) {
      e.preventDefault();
      if (demoKind === 'register') {
        toast(<>Registration runs on the official PROCOM portal. Demo route: <code>{url}</code></>);
      } else if (demoKind === 'social') {
        toast(<>Social link placeholder. Add the official handle in <code>SOCIAL</code>.</>);
      } else {
        toast(demoMsg || <>This page isn’t in the demo yet. Planned route: <code>{url}</code></>);
      }
      closeMenu();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    closeMenu();
    pixelNavigate(navigate, url);
  }

  return (
    <a href={url} data-demo={live ? undefined : ''} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
