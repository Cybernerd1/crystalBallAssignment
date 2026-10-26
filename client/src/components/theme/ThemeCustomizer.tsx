import { useEffect } from 'react';

import { useTheme } from '../../hooks/useTheme';
import { DEFAULT_PRESET, PRESETS } from '../../themes/presets';
import AccentPicker from './AccentPicker';
import FontUploader from './FontUploader';
import PresetPicker from './PresetPicker';

interface ThemeCustomizerProps {
  onReset?: () => void;
}

/**
 * The shared theme editor body: presets, button-color override and custom
 * font. "Reset" returns to the Blue preset with no override and no font — the
 * PRD's explicit reset semantics (a preset switch alone never does that).
 */
export default function ThemeCustomizer({ onReset }: ThemeCustomizerProps) {
  const { notice, dismissNotice, state, setPreset, setButtonColor, clearFont } = useTheme();

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(dismissNotice, 6000);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);

  function resetAll() {
    setPreset(DEFAULT_PRESET);
    setButtonColor(null);
    clearFont();
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
        <h3 className="theme-customizer__heading">Button color</h3>
        <p className="theme-customizer__hint">Overrides the primary buttons only — links, badges and the sidebar keep the preset accent.</p>
        <AccentPicker />
      </section>

      <section className="theme-customizer__section">
        <h3 className="theme-customizer__heading">Typography</h3>
        <FontUploader />
      </section>

      <footer className="theme-customizer__footer">
        <span className="muted">
          Preset: {PRESETS[state.presetId].label} · Preferences are saved in this browser.
        </span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={resetAll}>
          Reset all
        </button>
      </footer>
    </div>
  );
}
