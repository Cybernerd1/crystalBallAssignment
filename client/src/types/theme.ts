export type ThemePreset = 'blue' | 'violet' | 'darcula' | 'forest';

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
 * - `presetId` supplies the base palette (colors, surfaces, shadows).
 * - `buttonColor` (nullable) recolors primary buttons only (`--btn-bg`/`--btn-text`).
 * - `font` (nullable) overrides the typeface across the whole app.
 */
export interface ThemeState {
  presetId: ThemePreset;
  buttonColor: string | null;
  font: ThemeFont | null;
}

export type ThemeNotice = { type: 'error' | 'warning' | 'success'; message: string } | null;
