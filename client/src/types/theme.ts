export type ThemePreset = 'light' | 'blue' | 'violet' | 'dark';

/**
 * Stored custom font: file name for display, data URL for persistence.
 * Shape mandated by the PRD: `font: { fileName, dataUrl } | null`.
 */
export interface ThemeFont {
  fileName: string;
  dataUrl: string;
}

/**
 * Single source of truth for the visual theme — three independent layers:
 * - `presetId` supplies the base palette (colors, surfaces, borders, shadows).
 * - `buttonColor` (nullable) is the action accent used by primary buttons and
 *   the active-navigation marker. `null` follows the preset accent.
 * - `font` (nullable) overrides the typeface across the whole app.
 *
 * The stored field names are kept stable (`buttonColor`) so preferences from
 * earlier versions survive the redesign.
 */
export interface ThemeState {
  presetId: ThemePreset;
  buttonColor: string | null;
  font: ThemeFont | null;
}

export type ThemeNotice = { type: 'error' | 'warning' | 'success'; message: string } | null;
