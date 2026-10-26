import { isValidHex } from '../../theme/color';
import { useTheme } from '../../hooks/useTheme';

const QUICK_SWATCHES = ['#f04c35', '#f59e0b', '#10b981', '#2563eb', '#7c3aed', '#ec4899', '#0d9488'];

/**
 * Recolors buttons/interactive elements independently from the preset.
 * `effectiveAccent = accentOverride ?? preset.accent` — switching presets keeps
 * a custom accent alive.
 */
export default function AccentPicker() {
  const { state, accent, setAccentOverride } = useTheme();
  const override = state.accentOverride;

  return (
    <div className="accent-picker">
      <div className="accent-picker__swatches">
        <button
          type="button"
          className={`swatch ${override === null ? 'swatch--active' : ''}`}
          style={{ background: accent }}
          aria-pressed={override === null}
          title="Preset accent"
          onClick={() => setAccentOverride(null)}
        />
        {QUICK_SWATCHES.map((color) => (
          <button
            key={color}
            type="button"
            className={`swatch ${override?.toLowerCase() === color.toLowerCase() ? 'swatch--active' : ''}`}
            style={{ background: color }}
            aria-pressed={override?.toLowerCase() === color.toLowerCase()}
            title={color}
            onClick={() => setAccentOverride(color)}
          />
        ))}
        <input
          type="color"
          className="swatch-input"
          aria-label="Custom accent color"
          value={override ?? accent}
          onChange={(event) => {
            const value = event.target.value;
            if (isValidHex(value)) setAccentOverride(value);
          }}
        />
      </div>
      <div className="accent-picker__meta">
        <span className="muted">Buttons use {override ? `${override} (custom)` : `${accent} (preset)`}</span>
        {override ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAccentOverride(null)}>
            Use preset accent
          </button>
        ) : null}
      </div>
    </div>
  );
}
