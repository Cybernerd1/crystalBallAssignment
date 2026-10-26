export type ThemePreset = 'light' | 'blue' | 'violet' | 'dark';

/**
 * Single source of truth for the visual theme:
 * - `preset` supplies the base palette (colors, surfaces, shadows).
 * - `accentOverride` recolors interactive elements independently of the preset.
 * - `customFont*` overrides typeface across the whole app.
 */
export interface ThemeState {
  preset: ThemePreset;
  accentOverride: string | null;
  customFontDataUrl: string | null;
  customFontName: string | null;
}

export type ThemeNotice = { type: 'error' | 'warning' | 'success'; message: string } | null;
