import { useReveal } from '../../hooks/useReveal.js';

/** [data-reveal] motion utility as a component */
export default function Reveal({ as: Tag = 'div', variant = '', className = '', children, ...rest }) {
  const [ref, inView] = useReveal();
  return (
    <Tag ref={ref} data-reveal={variant} className={className + (inView ? ' is-in' : '')} {...rest}>
      {children}
    </Tag>
  );
}
