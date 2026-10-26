import {
  CONTRAST_TEXT_COLORS,
  hexToRgb,
  mixRgb,
  pickContrastText,
  rgbCss,
} from './color';
import { DEFAULT_PRESET, PRESETS } from './presets';
import type { ThemeState } from '../types/theme';

/**
 * Pure theme resolver: `(ThemeState) → Record<string, string>` of CSS custom
 * properties. This is the only place layer merging happens:
 *
 * 1. The preset supplies every base token.
 * 2. A non-null `buttonColor` replaces `--btn-bg` **only** (plus its hover
 *    companion) and recomputes `--btn-text` from the WCAG relative luminance
 *    of the chosen color — a yellow button gets near-black text, not white.
 * 3. A present `font` contributes `--font-family` with the system fallback
 *    stack; otherwise the variable is simply absent and the stylesheet default
 *    (`var(--font-family-base)`) wins.
 *
 * No DOM access, no side effects — trivial to unit-test and reason about.
 */
export function resolveTheme(state: ThemeState): Record<string, string> {
  const preset = PRESETS[state.presetId] ?? PRESETS[DEFAULT_PRESET];
  const tokens: Record<string, string> = { ...preset.tokens };

  // Buttons: override wins, else the preset accent.
  const buttonHex = state.buttonColor ?? preset.tokens['color-accent'];
  const buttonRgb = hexToRgb(buttonHex);
  const hoverRgb = mixRgb(
    buttonRgb,
    preset.tokens['color-scheme'] === 'dark' ? [255, 255, 255] : [0, 0, 0],
    0.14,
  );

  tokens['btn-bg'] = buttonHex;
  tokens['btn-bg-hover'] = rgbCss(hoverRgb);
  tokens['btn-text'] = CONTRAST_TEXT_COLORS[pickContrastText(buttonRgb)];

  if (state.font) {
    tokens['font-family'] = `"UserFont", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  }

  return tokens;
}
