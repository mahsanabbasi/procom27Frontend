import { useId } from 'react';

/** PROCOM’27 brand mark (from the brand kit, recoloured to the web palette) */
export default function BrandMark({ className = 'brand__mark' }) {
  const id = 'pmg' + useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 186 251" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCC8FF" />
          <stop offset="1" stopColor="#B57CFF" />
        </linearGradient>
      </defs>
      <path d="M8 8L186 71V135L106 178V151L88 155V221L36 251V153L133 103L36 63Z" fill="#493460" />
      <path d="M0 0L178 63V127L98 170V143L80 147V213L28 243V145L125 95L28 55Z" fill={`url(#${id})`} />
    </svg>
  );
}
