import { useEffect, useState, type KeyboardEvent } from 'react';

import { isValidHex } from '../../themes/color';
import { BUTTON_COLOR_SUGGESTIONS, PRESETS } from '../../themes/presets';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../ui/Icon';

/**
 * Action accent override: primary buttons and the active-navigation marker.
 * `null` falls back to the preset accent. Switching presets keeps the override.
 */
export default function AccentPicker() {
  const { state, setButtonColor } = useTheme();
  const presetAccent = PRESETS[state.presetId].tokens['color-accent'];
  const override = state.buttonColor;
  const effective = override ?? presetAccent;

  const [draft, setDraft] = useState(override ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(override ?? '');
    setError(null);
  }, [override]);

  function commitDraft() {
    const value = draft.trim();
    if (!value) {
      setButtonColor(null);
      setError(null);
      return;
    }
    if (!isValidHex(value)) {
      setError('Enter a 3- or 6-digit hex color, like #E64B35.');
      return;
    }
    setButtonColor(value.toLowerCase());
    setError(null);
  }

  function onHexKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitDraft();
    }
  }

  const suggestions = BUTTON_COLOR_SUGGESTIONS.filter(
    (color) => color.toLowerCase() !== presetAccent.toLowerCase(),
  );

  return (
    <div className="accent-picker">
      <div className="accent-picker__swatches" role="group" aria-label="Accent color">
        <button
          type="button"
          className={`swatch ${override === null ? 'swatch--active' : ''}`}
          style={{ background: presetAccent }}
          aria-pressed={override === null}
          aria-label="Use the preset accent"
          title="Use the preset accent"
          onClick={() => setButtonColor(null)}
        />

        {suggestions.map((color) => {
          const active = override?.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              className={`swatch ${active ? 'swatch--active' : ''}`}
              style={{ background: color }}
              aria-pressed={active}
              aria-label={`Use ${color}`}
              title={color}
              onClick={() => setButtonColor(color)}
            />
          );
        })}

        <label className="swatch swatch--custom" title="Choose a custom color">
          <span className="visually-hidden">Choose a custom accent color</span>
          <input
            type="color"
            className="swatch__input"
            aria-label="Choose a custom accent color"
            value={override && override.length === 7 ? override : presetAccent}
            onChange={(event) => setButtonColor(event.target.value)}
          />
          <span className="swatch__custom-icon" aria-hidden="true">
            <Icon name="plus" size={12} strokeWidth={2.2} />
          </span>
        </label>
      </div>

      <div className="accent-picker__custom">
        <span className="accent-picker__current">
          <span className="swatch-dot" style={{ background: effective }} aria-hidden="true" />
          {override ? 'Custom accent' : 'Preset accent'}
        </span>
        <div className="accent-picker__hex-row">
          <input
            className="input input--compact accent-picker__hex"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={onHexKeyDown}
            placeholder={presetAccent}
            aria-label="Custom accent hex color"
            spellCheck={false}
          />
          <button type="button" className="btn btn--secondary btn--sm" onClick={commitDraft}>
            Apply
          </button>
          {override ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setButtonColor(null);
                setDraft('');
                setError(null);
              }}
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="theme-hint">
        Applies to primary buttons and the active navigation marker. Other accent details
        follow the preset.
      </p>
    </div>
  );
}
