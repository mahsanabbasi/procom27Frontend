import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Starfield } from '../Starfield.jsx';
import { Scanlines } from '../Scanlines.jsx';
import { HeroGrid } from '../HeroGrid.jsx';
import { drawPixelMark } from '../../utils/pixelMark.js';
import { collisionPlacement, contactRow } from './collision.js';
import dinoSheet from './assets/chrome-dino-run.png';
import './rocket-initialization.css';

// Native right edges of the cropped original running frames; only the leg rows differ.
const dinoNoseRows = [38, 38, 40, 40, 40, 40, 40, 40, 40, 40, 40, 30, 30, 36, 36, 28, 28, 28, 28, 32, 32, 32, 32, 28, 28, 28, 28, 28, 26, 26, 26, 24, 24, 22, 22, 25, 25, 14, 14, 12, 12, 14, 14];

export default function DinoInitialization({ controller, children, preview = false, forceFlight = false, onReveal }) {
  const readiness = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const [visible, setVisible] = useState(() => preview || forceFlight || controller.requiresIntro || controller.getSnapshot() === 'pending');
  const wasVisible = useRef(visible);
  const [phase, setPhase] = useState('establish');
  const overlay = useRef(null), mark = useRef(null), dino = useRef(null), content = useRef(null);

  useLayoutEffect(() => {
    if (!visible) {
      if (wasVisible.current) { wasVisible.current = false; onReveal?.(); }
      return;
    }
    wasVisible.current = true;
    let alive=true, finished=false, impacted=false, movement, reveal, resizeFrame=0, generation=0;
    const timers=new Set();
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const schedule=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)fn();},ms);timers.add(id);return id;};
    const finish=()=>{if(alive)setVisible(false);};
    drawPixelMark(mark.current,'#B995E6');
    const pixels=mark.current.getContext('2d').getImageData(0,0,22,30).data;
    const markRows=Array.from({length:30},(_,y)=>{for(let x=0;x<22;x++)if(pixels[(y*22+x)*4+3])return x;return -1;});
    let placement, markBounds, dinoBounds, assetReady=false;
    const image=new Image();
    const measure=()=>{
      const scale=Math.max(3,Math.min(7,Math.floor(Math.min(innerWidth*.12,innerHeight*.26)/22)));
      overlay.current.style.setProperty('--mark-unit',`${scale}px`);
      markBounds=mark.current.getBoundingClientRect();
      dinoBounds=dino.current.getBoundingClientRect();
      placement=collisionPlacement(dinoBounds,markBounds,{dpr:devicePixelRatio});
      dino.current.style.top=`${placement.top}px`;
      const y=contactRow(dinoNoseRows,markRows,{height:dinoBounds.height,top:placement.top},markBounds);
      overlay.current.style.setProperty('--hit-x',`${placement.x}px`);
      overlay.current.style.setProperty('--hit-y',`${y}px`);
      content.current.style.setProperty('--reveal-x',`${placement.x}px`);
      content.current.style.setProperty('--reveal-y',`${y}px`);
      overlay.current.dataset.contactX=String(placement.contact);
    };
    measure();
    dino.current.style.transform=`translateX(${placement.start}px)`;

    const impact=()=>{
      if(!alive||impacted||!finished)return;
      if(controller.getSnapshot()==='pending'||!assetReady){setPhase('hold');return;}
      if(media.matches){finish();return;}
      impacted=true;
      movement?.cancel();
      measure();
      dino.current.style.transform=`translateX(${placement.contact}px)`;
      setPhase('collision');
      schedule(()=>{
        setPhase('glitch');
        const x=placement.x/innerWidth*100, y=parseFloat(overlay.current.style.getPropertyValue('--hit-y'))/innerHeight*100;
        // Connected rectangular regions grow from the actual impact; no opacity fade or canvas processing.
        const blocks=[
          `polygon(${x-2}% ${y-3}%,${x+3}% ${y-3}%,${x+3}% ${y+3}%,${x-2}% ${y+3}%)`,
          `polygon(${x-12}% ${y-12}%,${x+12}% ${y-12}%,${x+12}% ${y-3}%,${x+23}% ${y-3}%,${x+23}% ${y+8}%,${x+8}% ${y+8}%,${x+8}% ${y+17}%,${x-18}% ${y+17}%,${x-18}% ${y+3}%,${x-12}% ${y+3}%)`,
          'polygon(0 21%,72% 21%,72% 12%,100% 12%,100% 76%,84% 76%,84% 91%,18% 91%,18% 78%,0 78%)',
          'polygon(0 0,100% 0,100% 100%,0 100%)',
        ];
        reveal=content.current.animate(blocks.map((clipPath,i)=>({clipPath,transform:`translateX(${[-6,7,-3,0][i]}px)`})),{duration:preview?450:140,easing:'steps(5, end)'});
        schedule(finish,preview?450:140);
      },preview?150:80);
    };
    const ready=()=>{
      if(media.matches){if(controller.getSnapshot()!=='pending')finish();return;}
      if(!preview&&controller.getSnapshot()!=='pending'&&movement?.playState==='running')movement.updatePlaybackRate(2.5);
      impact();
    };
    image.onload=()=>{assetReady=true;impact();};
    image.onerror=finish;
    image.src=dinoSheet;
    assetReady=image.complete&&image.naturalWidth>0;
    // A missing or stalled essential sprite fails open rather than animating an invisible Dino.
    schedule(()=>{if(!assetReady)finish();},1600);
    const unsubscribe=controller.subscribe(ready);
    const run=(from,duration)=>{
      const token=++generation;
      movement?.cancel();
      movement=dino.current.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${placement.approach}px)`}],{duration,easing:'cubic-bezier(.4,.32,.7,.76)',fill:'forwards'});
      movement.finished.then(()=>{if(alive&&token===generation){finished=true;impact();}}).catch(()=>{});
    };
    if(media.matches){ready();}else{
      schedule(()=>{setPhase('run');run(placement.start,preview?950:500);ready();},preview?200:0);
    }
    const resize=()=>{
      cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{
        if(!alive)return;
        const current=dino.current.getBoundingClientRect().left;
        const remaining=Math.max(40,(preview?950:500)-Number(movement?.currentTime||0));
        measure();
        if(impacted){dino.current.style.transform=`translateX(${placement.contact}px)`;return;}
        if(movement&&!finished)run(Math.min(current,placement.approach),remaining);
        else {movement?.cancel();dino.current.style.transform=`translateX(${finished?placement.approach:placement.start}px)`;}
      });
    };
    const hidden=()=>{if(document.hidden)finish();};
    const motion=()=>{if(media.matches){movement?.cancel();setPhase('hold');ready();}};
    window.addEventListener('resize',resize);document.addEventListener('visibilitychange',hidden);media.addEventListener('change',motion);
    return()=>{alive=false;image.onload=null;image.onerror=null;if(!assetReady)image.src='';generation++;timers.forEach(clearTimeout);movement?.cancel();reveal?.cancel();cancelAnimationFrame(resizeFrame);unsubscribe();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',hidden);media.removeEventListener('change',motion);};
  },[controller,preview,visible,onReveal]);

  return <div className="site-initialization" data-font-fallback={readiness==='fallback'}>
    <link rel="preload" as="image" href={dinoSheet}/>
    <div className="initialization-content" ref={content} inert={visible} style={{visibility:visible&&phase!=='glitch'?'hidden':'visible'}}>{children}</div>
    {visible&&<div ref={overlay} className="dino-initialization" data-phase={phase} role="status" aria-label="Preparing PROCOM 27">
      <div className="initialization-atmosphere" aria-hidden="true"><Starfield/><HeroGrid/><Scanlines/></div>
      <canvas className="initialization-mark" ref={mark} width="22" height="30" aria-hidden="true"/>
      <div ref={dino} className="initialization-dino" style={{backgroundImage:`url(${dinoSheet})`}} aria-hidden="true"/>
      <div className="initialization-impact" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div className="initialization-slices" aria-hidden="true"><i/><i/><i/></div>
    </div>}
  </div>;
}
