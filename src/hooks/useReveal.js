import { useEffect, useRef, useState } from 'react';
import { MOTION } from '../utils/arcade/util.js';

const CAN_REVEAL = MOTION && typeof window !== 'undefined' && 'IntersectionObserver' in window;

/** adds `.is-in` the first time the element scrolls into view ([data-reveal] motion utility) */
export function useReveal() {
  const ref = useRef(null);
  const [inView, setInView] = useState(!CAN_REVEAL);
  useEffect(() => {
    if (!CAN_REVEAL || !ref.current) return undefined;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}
