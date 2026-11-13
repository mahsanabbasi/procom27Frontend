/* tiny global toast store: toast(<>Message <code>x</code></>) */
let listener = null;

export function toast(content) {
  if (listener) listener(content);
}

export function subscribeToast(fn) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}
