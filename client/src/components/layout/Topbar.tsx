import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';

interface TopbarProps {
  onMenu: () => void;
  onOpenTheme: () => void;
}

export default function Topbar({ onMenu, onOpenTheme }: TopbarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close the notifications popover on outside click.
  useEffect(() => {
    if (!notificationsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [notificationsOpen]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const term = search.trim();
    navigate(term ? `/users?search=${encodeURIComponent(term)}` : '/users');
    setSearch('');
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn btn--icon btn--ghost topbar__menu"
        onClick={onMenu}
        aria-label="Toggle navigation"
      >
        <Icon name="menu" />
      </button>

      <form className="topbar__search" role="search" onSubmit={handleSubmit}>
        <Icon name="search" size={16} className="topbar__search-icon" />
        <input
          type="search"
          className="input topbar__search-input"
          placeholder="Search users…"
          aria-label="Search users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </form>

      <div className="topbar__actions">
        <button
          type="button"
          className="btn btn--icon btn--ghost"
          onClick={onOpenTheme}
          aria-label="Customize theme"
        >
          <Icon name="palette" />
        </button>

        <div className="topbar__notifications" ref={notificationsRef}>
          <button
            type="button"
            className="btn btn--icon btn--ghost"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Icon name="bell" />
          </button>
          {notificationsOpen ? (
            <div className="topbar__popover" role="status">
              <p className="topbar__popover-title">Notifications</p>
              <p className="muted">You're all caught up.</p>
            </div>
          ) : null}
        </div>

        <div className="topbar__profile">
          <Avatar name="Alex Doe" size="sm" />
          <span className="topbar__profile-name">Alex Doe</span>
        </div>
      </div>
    </header>
  );
}
