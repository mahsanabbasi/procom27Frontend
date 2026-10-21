import { PixelIcon } from './PixelIcon.jsx';

// A team has no logo yet, so its icon and monogram stand in for one. Two
// sizes: a badge that heads a tile, and a banner that heads a card or a page.
// Both are drawn, not written — the point is to break up the text.

export function Letterhead({ team, size = 48 }) {
  return (
    <span className="letterhead" aria-hidden="true" style={{ '--mark': team.accent, '--size': `${size}px` }}>
      <PixelIcon name={team.icon} size={Math.round(size * 0.5)} />
    </span>
  );
}

export function TeamBanner({ team }) {
  return (
    <div className="banner" aria-hidden="true" style={{ '--mark': team.accent }}>
      <span className="banner-grid" />
      <span className="banner-art">
        <PixelIcon name={team.icon} size={60} />
      </span>
    </div>
  );
}
