import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppShellContext, type AppShellContextValue } from '../../context/AppShellContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CommandPalette from './CommandPalette';
import ThemePanel from '../theme/ThemePanel';

/**
 * Shared shell: sidebar + topbar + routed content. Stays mounted while the
 * pages swap beneath it, so the theme and the appearance drawer survive
 * navigation.
 */
export default function AppLayout() {
  const location = useLocation();
  const contentRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const openPalette = useCallback(() => {
    setSidebarOpen(false);
    setPaletteOpen(true);
  }, []);

  const openAppearance = useCallback(() => {
    setSidebarOpen(false);
    setAppearanceOpen(true);
  }, []);

  // Close the (mobile) sidebar whenever the route changes, and start each new
  // page at the top of the workspace scroller.
  useEffect(() => {
    setSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Cmd/Ctrl + K is the single global shortcut for the palette.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSidebarOpen(false);
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const shellValue = useMemo<AppShellContextValue>(
    () => ({ openAppearance, openPalette }),
    [openAppearance, openPalette],
  );

  return (
    <AppShellContext.Provider value={shellValue}>
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <div className="app">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
        {sidebarOpen ? (
          <div
            className="sidebar-scrim"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        <div className="app__main">
          <Topbar
            onMenu={() => setSidebarOpen((open) => !open)}
            onOpenPalette={openPalette}
            onOpenAppearance={openAppearance}
          />
          <main className="app__content" id="content" ref={contentRef} tabIndex={-1}>
            <Outlet />
          </main>
        </div>

        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onOpenAppearance={openAppearance}
        />
        <ThemePanel open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
      </div>
    </AppShellContext.Provider>
  );
}
