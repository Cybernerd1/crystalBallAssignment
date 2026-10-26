import { BUTTON_COLOR_SUGGESTIONS, PRESETS, DEFAULT_PRESET } from '../../themes/presets';
import { isValidHex } from '../../themes/color';
import { useTheme } from '../../hooks/useTheme';

/**
 * Button color override (PRD §5.4): replaces only the primary button tokens
 * (`--btn-bg` / `--btn-text`), never links, badges or other accent uses.
 * `null` falls back to the preset accent. Switching presets keeps the override.
 */
export default function AccentPicker() {
  const { state, setButtonColor } = useTheme();
  const override = state.buttonColor;

  return (
    <div className="accent-picker">
      <div className="accent-picker__swatches">
        <button
          type="button"
          className={`swatch ${override === null ? 'swatch--active' : ''}`}
          style={{ background: 'var(--color-accent)' }}
          aria-pressed={override === null}
          title="Preset accent"
          onClick={() => setButtonColor(null)}
        />
        {BUTTON_COLOR_SUGGESTIONS.map((color) => (
          <button
            key={color}
            type="button"
            className={`swatch ${override?.toLowerCase() === color.toLowerCase() ? 'swatch--active' : ''}`}
            style={{ background: color }}
            aria-pressed={override?.toLowerCase() === color.toLowerCase()}
            title={color}
            onClick={() => setButtonColor(color)}
          />
        ))}
        <input
          type="color"
          className="swatch-input"
          aria-label="Custom button color"
          value={override ?? PRESETS[DEFAULT_PRESET].tokens['color-accent']}
          onChange={(event) => {
            const value = event.target.value;
            if (isValidHex(value)) setButtonColor(value);
          }}
        />
      </div>
      <div className="accent-picker__meta">
        <span className="muted">
          Buttons use {override ? `${override}` : 'the preset accent'}
        </span>
        {override ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setButtonColor(null)}>
            Use preset accent
          </button>
        ) : null}
      </div>
    </div>
  );
}
