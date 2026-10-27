import { createContext, useContext } from 'react';

export interface AppShellContextValue {
  /** Opens the appearance drawer without leaving the current route. */
  openAppearance: () => void;
  /** Opens the command palette (same as Cmd/Ctrl + K). */
  openPalette: () => void;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const value = useContext(AppShellContext);
  if (!value) {
    throw new Error('useAppShell must be used inside AppLayout');
  }
  return value;
}
