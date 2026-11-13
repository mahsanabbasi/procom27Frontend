import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { MOTION } from '../../utils/arcade/util.js';

const CAN_TYPE = MOTION && typeof window !== 'undefined' && 'IntersectionObserver' in window;

/** `.sh__label` — types itself out the first time it scrolls into view */
export default function SectionLabel({ text, className = 'sh__label t-label' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(CAN_TYPE ? 0 : text.length);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!CAN_TYPE) return undefined;
    let timer;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        setTyping(true);
        let k = 0;
        const ty = () => {
          setShown(k);
          if (k++ < text.length) timer = setTimeout(ty, 28);
          else setTyping(false);
        };
        ty();
      },
      { threshold: 0.6 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [text]);

  return (
    <p ref={ref} className={className + (typing ? ' typing' : '')}>
      <Icon name="square" />
      {text.slice(0, shown)}
    </p>
  );
}
