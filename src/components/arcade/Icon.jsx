/** CSS-mask icon from the design system: <Icon name="arrow" /> → <i class="i i-arrow"> */
export default function Icon({ name, className = '' }) {
  return <i className={`i i-${name}${className ? ' ' + className : ''}`} aria-hidden="true" />;
}
