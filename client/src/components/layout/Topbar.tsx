import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { commandKeyLabel, commandShortcutLabel } from '../../utils/platform';
import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';

interface TopbarProps {
  onMenu: () => void;
  onOpenPalette: () => void;
  onOpenAppearance: () => void;
}

export default function Topbar({ onMenu, onOpenPalette, onOpenAppearance }: TopbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen && !accountOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target)) setNotificationsOpen(false);
      if (!accountRef.current?.contains(target)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setAccountOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [notificationsOpen, accountOpen]);

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn btn--icon btn--ghost topbar__menu"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" size={18} />
      </button>

      <button
        type="button"
        className="search-trigger"
        onClick={onOpenPalette}
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Icon name="search" size={16} className="search-trigger__icon" />
        <span className="visually-hidden">Open command palette: </span>
        <span className="search-trigger__text">Search users, pages, actions…</span>
        <span className="search-trigger__shortcut" aria-hidden="true">
          <kbd className="kbd">{commandKeyLabel()}</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>

      <div className="topbar__actions">
        <div className="topbar__popover-wrap" ref={notificationsRef}>
          <button
            type="button"
            className="btn btn--icon btn--ghost"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setAccountOpen(false);
              setNotificationsOpen((open) => !open);
            }}
          >
            <Icon name="bell" size={17} />
          </button>
          {notificationsOpen ? (
            <div className="popover topbar__notifications" role="region" aria-label="Notifications">
              <div className="popover__head">
                <p className="popover__title">Notifications</p>
                <span className="popover__meta">0 new</span>
              </div>
              <div className="popover__empty">
                <span className="popover__empty-icon">
                  <Icon name="inbox" size={16} />
                </span>
                <p>You&apos;re all caught up.</p>
                <span className="muted">Team activity will appear here.</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="topbar__popover-wrap" ref={accountRef}>
          <button
            type="button"
            className={`account-trigger ${accountOpen ? 'account-trigger--open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            title="Account menu"
            onClick={() => {
              setNotificationsOpen(false);
              setAccountOpen((open) => !open);
            }}
          >
            <Avatar name="Alex Doe" size="sm" decorative={false} />
            <span className="account-trigger__name">Alex Doe</span>
            <Icon name="chevron-down" size={14} className="account-trigger__chevron" />
          </button>

          {accountOpen ? (
            <div className="popover account-menu" role="menu" aria-label="Account menu">
              <div className="account-menu__head">
                <Avatar name="Alex Doe" size="md" />
                <span className="account-menu__identity">
                  <span className="account-menu__name">Alex Doe</span>
                  <span className="account-menu__workspace">Local workspace</span>
                </span>
              </div>

              <div className="account-menu__divider" role="presentation" />

              <Link
                to="/settings"
                className="menu-item"
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                <Icon name="settings" size={16} />
                Settings
              </Link>
              <button
                type="button"
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setAccountOpen(false);
                  onOpenAppearance();
                }}
              >
                <Icon name="palette" size={16} />
                Appearance
              </button>
              <button
                type="button"
                className="menu-item"
                role="menuitem"
                onClick={() => {
                  setAccountOpen(false);
                  onOpenPalette();
                }}
              >
                <Icon name="command" size={16} />
                Command palette
                <kbd className="kbd menu-item__hint">{commandShortcutLabel()}</kbd>
              </button>

              <div className="account-menu__divider" role="presentation" />
              <p className="account-menu__note">Demo workspace · no authentication</p>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
