import React, { useMemo } from 'react';
export const Starfield = () => {
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
    return (<div aria-hidden="true" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
        }}>
      <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '2px',
            height: '2px',
            boxShadow: starsStyle.layer1,
        }}/>
      <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            height: '3px',
            boxShadow: starsStyle.layer2,
            animation: 'ptw 2.4s steps(2) infinite',
        }}/>
      <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '2px',
            height: '2px',
            boxShadow: starsStyle.layer3,
            animation: 'ptw 3.2s steps(2) .8s infinite',
        }}/>
    </div>);
};
