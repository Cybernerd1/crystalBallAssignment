import { NavLink } from 'react-router-dom';

import { useTheme } from '../../hooks/useTheme';
import { PRESETS } from '../../themes/presets';
import Icon, { type IconName } from '../ui/Icon';

interface SidebarProps {
  /** Mobile drawer state. */
  open: boolean;
  /** Desktop compact mode. */
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const NAV_ITEMS: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/users', label: 'Users', icon: 'users' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ open, collapsed, onToggleCollapse }: SidebarProps) {
  const { state, buttonColor } = useTheme();
  const preset = PRESETS[state.presetId];

  return (
    <aside
      className={`sidebar ${open ? 'sidebar--open' : ''} ${collapsed ? 'sidebar--compact' : ''}`}
      aria-label="Workspace navigation"
    >
      <div className="sidebar__brand">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-mark" aria-hidden="true">
            F
          </span>
          <span className="brand-name">Forma</span>
          <span className="visually-hidden"> home</span>
        </NavLink>
      </div>

      <p className="sidebar__section-label">Workspace</p>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <span className="nav-item__icon">
              <Icon name={icon} size={17} />
            </span>
            <span className="nav-item__label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <NavLink
          to="/settings"
          className="sidebar-theme"
          title={collapsed ? `${preset.label} theme` : undefined}
        >
          <span className="sidebar-theme__dot" style={{ background: buttonColor }} aria-hidden="true" />
          <span className="sidebar-theme__text">
            <span className="sidebar-theme__label">{preset.label} theme</span>
            <span className="sidebar-theme__hint">
              {state.buttonColor || state.font ? 'Customized' : 'Default'}
            </span>
          </span>
        </NavLink>

        <button
          type="button"
          className="sidebar-collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="panel-left" size={16} />
          <span className="sidebar-collapse__label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
