import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

import type { User } from '../../types/user';
import Icon from '../ui/Icon';

interface UserActionsMenuProps {
  user: User;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface Position {
  top: number;
  left: number;
}

const MENU_WIDTH = 176;

/**
 * Contextual row menu. Rendered in a portal so it is never clipped by the
 * table's horizontal scroll container, with keyboard cycling and Esc support.
 */
export default function UserActionsMenu({
  user,
  onView,
  onEdit,
  onDelete,
}: UserActionsMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const height = menu?.offsetHeight ?? 112;
    const left = Math.min(
      Math.max(8, rect.right - MENU_WIDTH),
      Math.max(8, window.innerWidth - MENU_WIDTH - 8),
    );
    let top = rect.bottom + 6;
    if (top + height > window.innerHeight - 8) {
      top = Math.max(8, rect.top - height - 6);
    }
    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onResize = () => setOpen(false);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function closeAnd(action: () => void) {
    setOpen(false);
    action();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(index + 1) % items.length].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      items[0].focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      items[items.length - 1].focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`btn btn--icon btn--ghost row-menu__trigger ${open ? 'row-menu__trigger--open' : ''}`}
        aria-label={`Actions for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Icon name="more-horizontal" size={16} />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="row-menu"
              role="menu"
              aria-label={`Actions for ${user.name}`}
              style={
                position
                  ? { top: position.top, left: position.left, width: MENU_WIDTH }
                  : { top: -9999, left: -9999, width: MENU_WIDTH }
              }
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={handleMenuKeyDown}
            >
              <button
                type="button"
                role="menuitem"
                className="row-menu__item"
                onClick={() => closeAnd(onView)}
              >
                <Icon name="eye" size={15} />
                View details
              </button>
              <button
                type="button"
                role="menuitem"
                className="row-menu__item"
                onClick={() => closeAnd(onEdit)}
              >
                <Icon name="edit" size={15} />
                Edit user
              </button>
              <div className="row-menu__divider" role="separator" />
              <button
                type="button"
                role="menuitem"
                className="row-menu__item row-menu__item--danger"
                onClick={() => closeAnd(onDelete)}
              >
                <Icon name="trash" size={15} />
                Delete user
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
