import { PRESETS, PRESET_IDS } from '../../theme/presets';
import { useTheme } from '../../hooks/useTheme';

/** Four coordinate presets shown as mini previews. */
export default function PresetPicker() {
  const { state, setPreset } = useTheme();

  return (
    <div className="preset-grid" role="group" aria-label="Theme preset">
      {PRESET_IDS.map((id) => {
        const preset = PRESETS[id];
        const isActive = state.preset === id;
        return (
          <button
            key={id}
            type="button"
            className={`preset-card ${isActive ? 'preset-card--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => setPreset(id)}
          >
            <span
              className="preset-card__preview"
              style={{ background: preset.tokens['color-bg'] }}
            >
              <span
                className="preset-card__bar"
                style={{ background: preset.tokens['color-sidebar'] }}
              />
              <span className="preset-card__surface" style={{ background: preset.tokens['color-surface'] }}>
                <span
                  className="preset-card__dot"
                  style={{ background: preset.tokens['color-accent'] }}
                />
                <span
                  className="preset-card__line"
                  style={{ background: preset.tokens['color-border'] }}
                />
                <span
                  className="preset-card__line preset-card__line--short"
                  style={{ background: preset.tokens['color-border'] }}
                />
              </span>
            </span>
            <span className="preset-card__label">{preset.label}</span>
            <span className="preset-card__description">{preset.description}</span>
          </button>
        );
      })}
    </div>
  );
}
