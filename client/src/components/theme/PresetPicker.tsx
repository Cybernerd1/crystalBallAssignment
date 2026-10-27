import { PRESETS, PRESET_IDS } from '../../themes/presets';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../ui/Icon';

/** Four coordinated presets shown as small, token-accurate previews. */
export default function PresetPicker() {
  const { state, setPreset } = useTheme();

  return (
    <div className="preset-grid" role="group" aria-label="Theme preset">
      {PRESET_IDS.map((id) => {
        const preset = PRESETS[id];
        const tokens = preset.tokens;
        const isActive = state.presetId === id;

        return (
          <button
            key={id}
            type="button"
            className={`preset-card ${isActive ? 'preset-card--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => setPreset(id)}
            title={preset.description}
          >
            <span
              className="preset-card__preview"
              style={{ background: tokens['color-bg'], borderColor: tokens['color-border'] }}
            >
              <span
                className="preset-card__sidebar"
                style={{ background: tokens['color-sidebar'], borderColor: tokens['color-border'] }}
              />
              <span className="preset-card__canvas">
                <span
                  className="preset-card__topbar"
                  style={{ background: tokens['color-surface'], borderColor: tokens['color-border'] }}
                />
                <span
                  className="preset-card__surface"
                  style={{ background: tokens['color-surface'], borderColor: tokens['color-border'] }}
                >
                  <span
                    className="preset-card__line preset-card__line--strong"
                    style={{ background: tokens['color-text-muted'] }}
                  />
                  <span
                    className="preset-card__line"
                    style={{ background: tokens['color-border'] }}
                  />
                  <span
                    className="preset-card__line preset-card__line--short"
                    style={{ background: tokens['color-border'] }}
                  />
                  <span
                    className="preset-card__accent"
                    style={{ background: tokens['color-accent'] }}
                  />
                </span>
              </span>
              {isActive ? (
                <span className="preset-card__check" aria-hidden="true">
                  <Icon name="check" size={11} strokeWidth={2.4} />
                </span>
              ) : null}
            </span>

            <span className="preset-card__meta">
              <span className="preset-card__label">{preset.label}</span>
              <span className="preset-card__mood">{preset.mood}</span>
            </span>
            <span className="preset-card__description">{preset.description}</span>
          </button>
        );
      })}
    </div>
  );
}
