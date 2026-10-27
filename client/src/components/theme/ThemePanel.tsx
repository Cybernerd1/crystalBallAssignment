import Drawer from '../ui/Drawer';
import ThemeCustomizer from './ThemeCustomizer';

interface ThemePanelProps {
  open: boolean;
  onClose: () => void;
}

/** The on-demand appearance drawer available from anywhere in the shell. */
export default function ThemePanel({ open, onClose }: ThemePanelProps) {
  return (
    <Drawer open={open} onClose={onClose} className="theme-panel" ariaLabel="Appearance settings">
      <header className="drawer__header">
        <p className="drawer__eyebrow">Preferences</p>
        <h2 className="drawer__title">Appearance</h2>
        <p className="drawer__subtitle">
          Presets, action accent and typography — applied live across the workspace.
        </p>
      </header>
      <div className="drawer__body drawer__body--flush">
        <ThemeCustomizer variant="drawer" />
      </div>
    </Drawer>
  );
}
