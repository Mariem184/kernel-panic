/**
 * Adds a non-passive `wheel` listener on window — but only while NO pop-up
 * is open (`body.kp-modal-open`). It detaches the moment a pop-up opens and
 * re-attaches when it closes.
 *
 * Why: a non-passive wheel listener makes the browser wait for JavaScript
 * on every wheel tick before it may scroll anything. The Capabilities and
 * News sections need one (they turn one wheel step into one stage), but
 * while a pop-up is open it only slowed down scrolling inside the pop-up.
 *
 * Returns a cleanup function.
 */
export function attachModalAwareWheel(handler: (e: WheelEvent) => void): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  let attached = false;

  const sync = () => {
    const modalOpen = document.body.classList.contains('kp-modal-open');
    if (modalOpen && attached) {
      window.removeEventListener('wheel', handler);
      attached = false;
    } else if (!modalOpen && !attached) {
      window.addEventListener('wheel', handler, { passive: false });
      attached = true;
    }
  };

  const observer = new MutationObserver(sync);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();

  return () => {
    observer.disconnect();
    if (attached) window.removeEventListener('wheel', handler);
    attached = false;
  };
}
