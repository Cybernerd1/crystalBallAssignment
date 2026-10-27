import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useScrollLock } from '../../hooks/useScrollLock';
import { usersApi } from '../../services/usersApi';
import type { User } from '../../types/user';
import { commandKeyLabel } from '../../utils/platform';
import Avatar from '../ui/Avatar';
import Icon, { type IconName } from '../ui/Icon';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenAppearance: () => void;
}

type Group = 'Pages' | 'Actions' | 'Users';

interface Command {
  id: string;
  group: Group;
  label: string;
  description?: string;
  hint?: string;
  icon: IconName;
  keywords?: string;
  avatar?: string;
  run: () => void;
}

const GROUP_ORDER: Group[] = ['Pages', 'Actions', 'Users'];

export default function CommandPalette({ open, onClose, onOpenAppearance }: CommandPaletteProps) {
  const navigate = useNavigate();
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  useScrollLock(open);
  useDialogFocus(paletteRef, open);

  // Reset the query each time the palette opens.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    setUserResults([]);
  }, [open]);

  // Esc closes even if focus moved off the input.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Real backend search — the palette never invents people.
  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setUserResults([]);
      setUserLoading(false);
      return;
    }

    let cancelled = false;
    setUserLoading(true);
    const timer = window.setTimeout(() => {
      usersApi
        .list({ search: term, limit: 5 })
        .then((response) => {
          if (cancelled) return;
          setUserResults(response.data);
          setUserLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setUserResults([]);
          setUserLoading(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const runAndClose = useCallback(
    (action: () => void) => {
      onClose();
      action();
    },
    [onClose],
  );

  const baseCommands = useMemo<Command[]>(
    () => [
      {
        id: 'go-dashboard',
        group: 'Pages',
        label: 'Go to Dashboard',
        description: 'Workspace overview and recent members',
        icon: 'dashboard',
        keywords: 'home overview metrics',
        run: () => runAndClose(() => navigate('/dashboard')),
      },
      {
        id: 'go-users',
        group: 'Pages',
        label: 'Go to Users',
        description: 'Browse, search and manage the directory',
        icon: 'users',
        keywords: 'directory people table',
        run: () => runAndClose(() => navigate('/users')),
      },
      {
        id: 'go-settings',
        group: 'Pages',
        label: 'Go to Settings',
        description: 'Appearance, typography and preferences',
        icon: 'settings',
        keywords: 'preferences theme appearance',
        run: () => runAndClose(() => navigate('/settings')),
      },
      {
        id: 'add-user',
        group: 'Actions',
        label: 'Add a user',
        description: 'Create a new member record',
        icon: 'plus',
        keywords: 'new create member',
        run: () => runAndClose(() => navigate('/users/new')),
      },
      {
        id: 'open-appearance',
        group: 'Actions',
        label: 'Open appearance panel',
        description: 'Change preset, accent or typeface',
        icon: 'palette',
        keywords: 'theme customize accent font',
        run: () => runAndClose(onOpenAppearance),
      },
    ],
    [navigate, onOpenAppearance, runAndClose],
  );

  const commands = useMemo<Command[]>(() => {
    const term = query.trim().toLowerCase();
    const matchedBase = term
      ? baseCommands.filter((command) =>
          `${command.label} ${command.description ?? ''} ${command.keywords ?? ''}`
            .toLowerCase()
            .includes(term),
        )
      : baseCommands;

    const searchAll: Command[] = term
      ? [
          {
            id: 'search-all-users',
            group: 'Actions',
            label: `Search users for “${query.trim()}”`,
            description: 'Open the directory with this search applied',
            icon: 'search',
            hint: 'Enter',
            run: () =>
              runAndClose(() =>
                navigate(`/users?search=${encodeURIComponent(query.trim())}`),
              ),
          },
        ]
      : [];

    const people: Command[] = userResults.map((user) => ({
      id: `user-${user._id}`,
      group: 'Users',
      label: user.name,
      description: user.email,
      icon: 'users',
      avatar: user.name,
      run: () => runAndClose(() => navigate(`/users?user=${encodeURIComponent(user._id)}`)),
    }));

    return [...matchedBase, ...searchAll, ...people];
  }, [baseCommands, navigate, query, runAndClose, userResults]);

  // Keep the highlighted row valid as results stream in.
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(0, commands.length - 1)));
  }, [commands.length]);

  const activeId = commands[activeIndex] ? `command-option-${commands[activeIndex].id}` : undefined;

  useEffect(() => {
    if (!open || !activeId) return;
    const element = document.getElementById(activeId);
    element?.scrollIntoView({ block: 'nearest' });
  }, [activeId, open]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        items: commands.filter((command) => command.group === group),
      })).filter((entry) => entry.items.length > 0),
    [commands],
  );

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (commands.length === 0 ? 0 : (index + 1) % commands.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        commands.length === 0 ? 0 : (index - 1 + commands.length) % commands.length,
      );
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(Math.max(0, commands.length - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      commands[activeIndex]?.run();
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className="overlay palette-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={paletteRef}
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        tabIndex={-1}
      >
        <div className="palette__search">
          <Icon name="search" size={17} className="palette__search-icon" />
          <input
            ref={inputRef}
            data-autofocus
            className="palette__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-label="Search commands or users"
            placeholder="Search commands or users…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <kbd className="kbd">{commandKeyLabel()} K</kbd>
        </div>

        <div className="palette__body" id="palette-results" role="listbox" aria-label="Commands">
          {commands.length === 0 ? (
            <div className="palette__empty">
              <p className="palette__empty-title">No matches</p>
              <p className="muted">Try a page name, a person, or an action.</p>
            </div>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} className="palette__group" role="presentation">
                <p className="palette__group-label" role="presentation">
                  {group}
                </p>
                {items.map((command) => {
                  const index = commands.findIndex((item) => item.id === command.id);
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={command.id}
                      id={`command-option-${command.id}`}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      tabIndex={-1}
                      className={`palette__item ${isActive ? 'palette__item--active' : ''}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={command.run}
                    >
                      {command.avatar ? (
                        <Avatar name={command.avatar} size="sm" />
                      ) : (
                        <span className="palette__item-icon">
                          <Icon name={command.icon} size={16} />
                        </span>
                      )}
                      <span className="palette__item-text">
                        <span className="palette__item-label">{command.label}</span>
                        {command.description ? (
                          <span className="palette__item-description">{command.description}</span>
                        ) : null}
                      </span>
                      {command.hint ? <kbd className="kbd palette__item-hint">{command.hint}</kbd> : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}

          {userLoading ? (
            <p className="palette__loading">
              <span className="spinner" aria-hidden="true" /> Searching users…
            </p>
          ) : null}
        </div>

        <footer className="palette__footer">
          <span>
            <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="kbd">esc</kbd> close
          </span>
          <span className="palette__footer-brand">Forma</span>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
