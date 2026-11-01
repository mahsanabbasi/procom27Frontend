/** Shared verbatim hero-grid styling for the homepage and initialization atmosphere. */
export function HeroGrid() {
  return <div aria-hidden="true" style={{
    position:'absolute', inset:0, pointerEvents:'none',
    backgroundImage:'linear-gradient(rgba(185,149,230,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(185,149,230,.09) 1px, transparent 1px)',
    backgroundSize:'32px 32px',
    maskImage:'radial-gradient(ellipse 70% 85% at 50% 45%, #000 15%, transparent 75%)',
  }}/>;
}
