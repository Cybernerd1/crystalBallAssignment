import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useScrollLock } from '../../hooks/useScrollLock';
import Icon from './Icon';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

/** Right-side sliding panel (appearance, user details). */
export default function Drawer({ open, onClose, children, className, ariaLabel }: DrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  useScrollLock(open);
  useDialogFocus(drawerRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // A modal or the command palette can sit above the drawer; its own
      // handler closes the top layer, so the drawer must not also disappear.
      if (document.querySelector('.modal, .palette')) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="overlay overlay--right"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={drawerRef}
        className={`drawer ${className ?? ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? 'Panel'}
        tabIndex={-1}
      >
        <button
          type="button"
          className="btn btn--icon btn--ghost drawer__close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <Icon name="close" size={18} />
        </button>
        {children}
      </aside>
    </div>,
    document.body,
  );
}
