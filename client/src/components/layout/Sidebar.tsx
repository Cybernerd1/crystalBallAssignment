import { NavLink } from 'react-router-dom';

import { useTheme } from '../../hooks/useTheme';
import { PRESETS } from '../../theme/presets';
import Icon, { type IconName } from '../ui/Icon';

interface SidebarProps {
  open: boolean;
  onOpenTheme: () => void;
}

const NAV_ITEMS: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/users', label: 'Users', icon: 'users' },
];

export default function Sidebar({ open, onOpenTheme }: SidebarProps) {
  const { state, accent } = useTheme();

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <span className="brand-mark">F</span>
        <span className="brand-name">Forma</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button type="button" className="nav-item" onClick={onOpenTheme}>
          <Icon name="palette" />
          <span>Customize</span>
        </button>
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__hint">Personalize colors &amp; typography</p>
        <button type="button" className="theme-chip" onClick={onOpenTheme}>
          <span className="theme-chip__dot" style={{ background: accent }} />
          {PRESETS[state.preset].label} theme
        </button>
      </div>
    </aside>
  );
}
