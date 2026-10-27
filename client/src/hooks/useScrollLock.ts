import { useEffect } from 'react';

let locks = 0;

/**
 * Locks body scroll while at least one overlay (modal, drawer, palette) is
 * open. Reference-counted so closing a delete dialog does not unlock the
 * drawer underneath it.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.body.classList.add('no-scroll');
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) document.body.classList.remove('no-scroll');
    };
  }, [active]);
}
