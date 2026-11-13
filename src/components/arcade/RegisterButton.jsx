import Icon from './Icon.jsx';
import RouteLink from './RouteLink.jsx';
import { regClosed } from '../../utils/arcade/registration.js';

/** Register CTA: placeholder route while registration is open, disabled once it closes */
export default function RegisterButton({ className = 'btn btn--register', children = 'Register' }) {
  if (regClosed()) {
    return (
      <a className={className + ' is-closed'} aria-disabled="true" data-register="">
        <Icon name="square" />
        Registration closed
      </a>
    );
  }
  return (
    <RouteLink to="register" className={className} demoKind="register" data-register="">
      <Icon name="square" />
      {children}
      <Icon name="arrow" />
    </RouteLink>
  );
}
