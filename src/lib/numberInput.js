/** Number-input spinner clicks focus the field and browsers scroll it into view. */
export function restoreWindowScroll() {
  if (typeof window === 'undefined') return;
  const x = window.scrollX;
  const y = window.scrollY;
  const restore = () => {
    if (window.scrollX !== x || window.scrollY !== y) window.scrollTo(x, y);
  };
  requestAnimationFrame(restore);
  setTimeout(restore, 0);
}

export function numberFocusGuards() {
  return {
    onMouseDown(e) {
      restoreWindowScroll();
      if (document.activeElement !== e.currentTarget) {
        e.preventDefault();
        e.currentTarget.focus({ preventScroll: true });
      }
    },
    onWheel(e) {
      e.currentTarget.blur();
    },
  };
}
