import { useEffect } from 'react';

import { useTheme } from '../../hooks/useTheme';
import { PRESETS } from '../../themes/presets';
import AccentPicker from './AccentPicker';
import FontUploader from './FontUploader';
import PresetPicker from './PresetPicker';
import ThemePreview from './ThemePreview';

interface ThemeCustomizerProps {
  variant?: 'page' | 'drawer';
  onReset?: () => void;
}

/**
 * Shared appearance editor: presets, action accent, typography and a live
 * preview driven by the real theme engine.
 */
export default function ThemeCustomizer({
  variant = 'page',
  onReset,
}: ThemeCustomizerProps) {
  const { state, notice, dismissNotice, resetTheme } = useTheme();
  const preset = PRESETS[state.presetId];
  const hasOverrides = Boolean(state.buttonColor || state.font);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(dismissNotice, 6000);
    return () => window.clearTimeout(timer);
  }, [notice, dismissNotice]);

  function resetAll() {
    resetTheme();
    onReset?.();
  }

  return (
    <div className={`appearance appearance--${variant}`}>
      {notice ? (
        <p className={`notice notice--${notice.type}`} role="status">
          {notice.message}
        </p>
      ) : null}

      <div className="appearance__summary">
        <div className="appearance__summary-main">
          <span
            className="appearance__swatch"
            style={{ background: preset.tokens['color-accent'] }}
            aria-hidden="true"
          />
          <span className="appearance__identity">
            <span className="appearance__label">Active preset</span>
            <span className="appearance__preset">{preset.label}</span>
          </span>
        </div>
        <div className="appearance__chips">
          <span className={`chip ${state.buttonColor ? 'chip--custom' : ''}`}>
            {state.buttonColor ? `Accent ${state.buttonColor}` : 'Preset accent'}
          </span>
          <span className={`chip ${state.font ? 'chip--custom' : ''}`}>
            {state.font ? 'Custom font' : 'System font'}
          </span>
          {hasOverrides ? <span className="chip chip--override">Customized</span> : null}
        </div>
      </div>

      <section className="appearance__section">
        <div className="appearance__section-head">
          <h3 className="appearance__heading">Theme preset</h3>
          <p className="appearance__hint">A coordinated palette, surface and border set.</p>
        </div>
        <PresetPicker />
      </section>

      <section className="appearance__section">
        <div className="appearance__section-head">
          <h3 className="appearance__heading">Action accent</h3>
          <p className="appearance__hint">Independent of the preset and kept on reload.</p>
        </div>
        <AccentPicker />
      </section>

      <section className="appearance__section">
        <div className="appearance__section-head">
          <h3 className="appearance__heading">Typography</h3>
          <p className="appearance__hint">Use the system interface font or upload your own.</p>
        </div>
        <FontUploader />
      </section>

      <section className="appearance__section">
        <div className="appearance__section-head">
          <h3 className="appearance__heading">Live preview</h3>
          <p className="appearance__hint">The real interface tokens, applied right now.</p>
        </div>
        <ThemePreview />
      </section>

      <footer className="appearance__footer">
        <p className="appearance__footer-note">
          Saved in this browser. Reset returns to Light with no accent or font override.
        </p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={resetAll}>
          Reset to default
        </button>
      </footer>
    </div>
  );
}
