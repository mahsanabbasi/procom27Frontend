import { BIT } from "./pixelSprites.js";
import { useId } from "react";
export function Icon({ name, extra = "" }) {
  return <i className={`i i-${name} ${extra}`} aria-hidden="true" />;
}
export function Mark({ className = "brand__mark" }) {
  const id = useId();
  return (
    <svg className={className} viewBox="0 0 186 251" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCC8FF" />
          <stop offset="1" stopColor="#B57CFF" />
        </linearGradient>
      </defs>
      <path
        d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z"
        fill="#493460"
      />
      <path
        d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
export function StickFigure({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 36"
      fill="none"
      stroke="#DCC8FF"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="6" r="4.3" fill="#0B0910" />
      <path d="M12 10.5V22" />
      <path className="sf-arm sf-l" d="M12 13.5L6.5 20" />
      <path className="sf-arm sf-r" d="M12 13.5L17.5 20" />
      <path className="sf-leg sf-l" d="M12 22L7.5 33" />
      <path className="sf-leg sf-r" d="M12 22L16.5 33" />
    </svg>
  );
}
export function Sprite({ rows, className = "", colors = BIT.colors }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rows.flatMap((row, y) =>
        Array.from(row, (c, x) =>
          c === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={colors[c] || "#B57CFF"}
            />
          ),
        ),
      )}
    </svg>
  );
}
