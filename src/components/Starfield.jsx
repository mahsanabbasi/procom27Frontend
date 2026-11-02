import React, { useMemo, useState, useEffect } from 'react';

export const Starfield = () => {
  const [isVisible, setIsVisible] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Visibility change handler: pause CSS animation when tab is in background
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Media query listener for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  const starsStyle = useMemo(() => {
    const gen = (seed, n, color) => {
      let s = seed;
      const r = () => {
        s = (s * 48271) % 2147483647;
        return s / 2147483647;
      };
      const a = [];
      for (let i = 0; i < n; i++) {
        a.push(`${(r() * 100).toFixed(2)}vw ${(r() * 100).toFixed(2)}vh 0 0 ${color}`);
      }
      return a.join(',');
    };
    return {
      layer1: gen(7, 110, 'rgba(238,240,248,.5)'),
      layer2: gen(23, 40, '#B995E6'),
      layer3: gen(41, 24, 'rgba(77,243,255,.75)'),
    };
  }, []);

  const playState = isVisible ? 'running' : 'paused';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2px',
          height: '2px',
          boxShadow: starsStyle.layer1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '3px',
          boxShadow: starsStyle.layer2,
          animation: prefersReducedMotion ? 'none' : 'ptw 2.4s steps(2) infinite',
          animationPlayState: playState,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2px',
          height: '2px',
          boxShadow: starsStyle.layer3,
          animation: prefersReducedMotion ? 'none' : 'ptw 3.2s steps(2) .8s infinite',
          animationPlayState: playState,
        }}
      />
    </div>
  );
};
