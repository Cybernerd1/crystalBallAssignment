import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ThemePanel from '../theme/ThemePanel';

/**
 * Shared shell: sidebar + topbar + routed content. Stays mounted while the
 * Dashboard/Users pages swap beneath it, so the selected theme is not reset
 * when navigating.
 */
export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  // Close the (mobile) sidebar whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // The showcase flow sets preferences on one page and navigates to another —
  // the drawer must not be per-page state.
  const openTheme = () => setThemeOpen(true);

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onOpenTheme={openTheme} />
      {sidebarOpen ? <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} /> : null}

      <div className="app__main">
        <Topbar onMenu={() => setSidebarOpen((open) => !open)} onOpenTheme={openTheme} />
        <main className="app__content" id="content">
          <Outlet />
        </main>
      </div>

      <ThemePanel open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
