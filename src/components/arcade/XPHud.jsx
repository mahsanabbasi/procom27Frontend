import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { sfx } from '../../utils/arcade/sfx.js';
import { toast } from '../../utils/arcade/toast.js';
import { pad, retrigger } from '../../utils/arcade/util.js';
import { QUESTS, frac, getState, has, munchCount, registerHud, resetXP, secGot, subscribeXP } from '../../utils/arcade/xp.js';

/** XP HUD (bottom-left) + quest log panel */
export default function XPHud() {
  const [s, setS] = useState(getState);
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(sfx.on);
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    registerHud(btnRef.current);
    const unsub = subscribeXP((next) => {
      setS(next);
      if (next.bump) retrigger(rootRef.current, 'bump');
    });
    const onSfx = () => setSound(sfx.on);
    document.addEventListener('procom:sfx', onSfx);
    return () => {
      unsub();
      registerHud(null);
      document.removeEventListener('procom:sfx', onSfx);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    if (closeRef.current) closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current.focus();
      }
    };
    const onDown = (e) => {
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const items = munchCount();

  return (
    <div className="xp" ref={rootRef}>
      <button
        ref={btnRef}
        className="xp__btn"
        type="button"
        aria-expanded={open}
        aria-controls="xpPanel"
        aria-label={`Level ${s.level}, ${s.xp} XP. Open quest log`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="xp__lv">LV {pad(s.level)}</span>
        <span className="xp__bar" aria-hidden="true" style={{ '--p': frac(s.xp).toFixed(3) }}>
          <i />
        </span>
        <span className="xp__pts">{s.xp} XP</span>
      </button>
      <div className="xp__panel" id="xpPanel" role="dialog" aria-label="Quest log" hidden={!open}>
        <div className="xp__head">
          <span className="t-label">Quest log</span>
          <button
            ref={closeRef}
            className="xp__x icon-btn"
            type="button"
            aria-label="Close quest log"
            onClick={() => {
              setOpen(false);
              btnRef.current.focus();
            }}
          >
            <Icon name="close" />
          </button>
        </div>
        <p className="xp__sum">
          <b>LV {pad(s.level)}</b> · {s.xp} XP{s.next ? ' · next level at ' + s.next : ' · max level'}
          <br />
          <span>
            {s.done} of {s.total} quests complete
          </span>
        </p>
        <ul className="xp__list">
          {QUESTS.map((q) => {
            const done = has(q.id);
            let label = q.label;
            if (q.id === 'explore') label += ' (' + secGot() + '/' + (items || '–') + ')';
            if (q.secret && !done) label = '??? Secret quest';
            return (
              <li key={q.id} className={done ? 'is-done' : ''}>
                <span className="xp__chk">{done && <Icon name="check" />}</span>
                <span>{label}</span>
                <b>+{q.pts}</b>
              </li>
            );
          })}
          <li className="xp__li-note">
            <span className="xp__chk">
              <Icon name="plus" />
            </span>
            <span>Each power-up the muncher eats</span>
            <b>+20</b>
          </li>
        </ul>
        <div className="xp__foot">
          <button className="xp__sfx btn btn--card" type="button" aria-pressed={sound} onClick={() => setSound(sfx.toggle())}>
            <Icon name={sound ? 'signal' : 'minus'} />
            Sound {sound ? 'on' : 'off'}
          </button>
          <button
            className="xp__reset link-action"
            type="button"
            onClick={() => {
              resetXP();
              toast(<>Progress reset. Back to <code>LV 01</code>.</>);
            }}
          >
            Reset progress
          </button>
        </div>
      </div>
    </div>
  );
}
