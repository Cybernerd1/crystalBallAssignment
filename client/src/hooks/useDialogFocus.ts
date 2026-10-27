import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableIn(node: HTMLElement): HTMLElement[] {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hasAttribute('hidden') && element.getClientRects().length > 0,
  );
}

/**
 * Keeps keyboard focus inside an open dialog and restores it to the opener
 * when the dialog closes. Elements marked `data-autofocus` win over the first
 * focusable control (used by the delete dialog's Cancel button).
 */
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const preferred =
      node.querySelector<HTMLElement>('[data-autofocus]')
      ?? node.querySelector<HTMLElement>('[autofocus]')
      ?? focusableIn(node)[0]
      ?? node;

    const frame = window.requestAnimationFrame(() => preferred.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      // Only the dialog containing focus traps Tab. This lets a modal sit on
      // top of a drawer without the drawer stealing the focus cycle.
      if (!node.contains(document.activeElement)) return;

      const focusables = focusableIn(node);
      if (focusables.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [ref, active]);
}
