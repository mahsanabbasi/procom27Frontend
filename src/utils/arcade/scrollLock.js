/* body scroll lock shared by the mobile menu and overlay views (body.is-locked) */
const reasons = new Set();

const sync = () => document.body.classList.toggle('is-locked', reasons.size > 0);

export function lockScroll(reason) {
  reasons.add(reason);
  sync();
}

export function unlockScroll(reason) {
  reasons.delete(reason);
  sync();
}
