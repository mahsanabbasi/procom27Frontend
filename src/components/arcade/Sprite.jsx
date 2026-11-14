import { BIT } from '../../utils/arcade/bit.js';

export default function Sprite({ rows, className, colors = BIT.colors }) {
  const rects = [];
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const c = r[x];
      if (c === '.') continue;
      rects.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" fill={colors[c] || '#B57CFF'} />);
    }
  });
  return (
    <svg className={className} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  );
}
