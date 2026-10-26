import { useEffect } from 'react';

import { useTheme } from '../../hooks/useTheme';
import { PRESETS } from '../../theme/presets';
import AccentPicker from './AccentPicker';
import FontUploader from './FontUploader';
import PresetPicker from './PresetPicker';

interface ThemeCustomizerProps {
  onReset?: () => void;
}

/**
 * The shared theme editor body: presets, accent override and custom font.
 * Rendered inside the ThemePanel drawer and as a dashboard card.
 */
export default function ThemeCustomizer({ onReset }: ThemeCustomizerProps) {
  const { notice, dismissNotice, state, setPreset, setAccentOverride, clearCustomFont } = useTheme();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(dismissNotice, 6000);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);

  function resetAll() {
    setPreset('light');
    setAccentOverride(null);
    clearCustomFont();
    onReset?.();
  }

  return (
    <div className="theme-customizer">
      {notice ? (
        <p className={`notice notice--${notice.type}`} role="status">
          {notice.message}
        </p>
      ) : null}

      <section className="theme-customizer__section">
        <h3 className="theme-customizer__heading">Preset</h3>
        <PresetPicker />
      </section>

      <section className="theme-customizer__section">
        <h3 className="theme-customizer__heading">Accent color</h3>
        <AccentPicker />
      </section>

      <section className="theme-customizer__section">
        <h3 className="theme-customizer__heading">Typography</h3>
        <FontUploader />
      </section>

      <footer className="theme-customizer__footer">
        <span className="muted">
          Preset: {PRESETS[state.preset].label} · Preferences are saved in this browser.
        </span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={resetAll}>
          Reset all
        </button>
      </footer>
    </div>
  );
}
