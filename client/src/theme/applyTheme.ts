import { PRESETS } from './presets';
import { effectiveAccent } from './presets';
import { CUSTOM_FONT_FAMILY_CSS } from './font';
import { mixHex, pickOnAccent } from './color';
import type { ThemeState } from '../types/theme';

/**
 * Writes the theme state onto CSS custom properties of <html>.
 * Everything downstream (components) reads vars like --color-accent, so this
 * is the only place that touches colors at runtime.
 */
export function applyTheme(state: ThemeState): void {
  const root = document.documentElement;

  const preset = PRESETS[state.preset];
  const accent = effectiveAccent(state);

  // When the accent is overridden we synthesize hover / readable-text colors,
  // since the preset's built-in ones may clash with the custom hue.
  const isDark = state.preset === 'dark';
  const hover = state.accentOverride
    ? mixHex(accent, isDark ? '#ffffff' : '#000000', 0.14)
    : preset.tokens['color-accent-hover'];
  const onAccent = state.accentOverride ? pickOnAccent(accent) : preset.tokens['color-on-accent'];

  for (const [key, value] of Object.entries(preset.tokens)) {
    root.style.setProperty(`--${key}`, String(value));
  }

  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-accent-hover', hover);
  root.style.setProperty('--color-on-accent', onAccent);

  if (state.customFontDataUrl && state.customFontName) {
    root.style.setProperty(
      '--font-family',
      `${CUSTOM_FONT_FAMILY_CSS}, var(--font-family-base)`,
    );
  } else {
    root.style.removeProperty('--font-family');
  }
}
