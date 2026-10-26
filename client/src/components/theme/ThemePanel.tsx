import Drawer from '../ui/Drawer';
import ThemeCustomizer from './ThemeCustomizer';

interface ThemePanelProps {
  open: boolean;
  onClose: () => void;
}

/** The right-side theme drawer shared by every page. */
export default function ThemePanel({ open, onClose }: ThemePanelProps) {
  return (
    <Drawer open={open} onClose={onClose} className="theme-panel">
      <header className="drawer__header">
        <h2 className="drawer__title">Customize theme</h2>
      </header>
      <div className="drawer__body">
        <ThemeCustomizer />
      </div>
    </Drawer>
  );
}
