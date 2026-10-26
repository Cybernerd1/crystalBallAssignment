import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Icon from './Icon';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/** Right-side sliding panel (theme panel, user details). */
export default function Drawer({ open, onClose, children, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="overlay overlay--right"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className={`drawer ${className ?? ''}`} role="dialog" aria-modal="true">
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
