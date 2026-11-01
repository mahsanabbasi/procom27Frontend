import React from 'react';
export const Scanlines = () => {
    return (<>
      <div aria-hidden="true" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 20,
            pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.26) 0 1px, transparent 1px 3px), radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,.5) 100%)',
        }}/>
      <div aria-hidden="true" style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            height: '18vh',
            zIndex: 20,
            pointerEvents: 'none',
            background: 'linear-gradient(180deg, transparent, rgba(185,149,230,.06) 50%, transparent)',
            animation: 'roll 9s linear infinite',
        }}/>
    </>);
};
