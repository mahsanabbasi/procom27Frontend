import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { subscribeToast } from '../../utils/arcade/toast.js';

export default function Toast() {
  const [msg, setMsg] = useState(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    let tt;
    const unsub = subscribeToast((content) => {
      setMsg(content);
      setOn(true);
      clearTimeout(tt);
      tt = setTimeout(() => setOn(false), 3600);
    });
    return () => {
      unsub();
      clearTimeout(tt);
    };
  }, []);
  return (
    <div className={'toast' + (on ? ' is-on' : '')} role="status" aria-live="polite">
      <Icon name="square" />
      <span className="toast__msg">{msg}</span>
    </div>
  );
}
