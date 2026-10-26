import type { ThemeFont, ThemePreset, ThemeState } from '../types/theme';
import { isValidHex } from './color';
import { DEFAULT_PRESET, PRESET_IDS } from './presets';

/** The single versioned localStorage key for the whole theme. */
export const THEME_STORAGE_KEY = 'app.theme.v1';

const MAX_FILENAME_LENGTH = 200;

function isPresetId(value: unknown): value is ThemePreset {
  return PRESET_IDS.includes(value as ThemePreset);
}

function parseFont(candidate: unknown): ThemeFont | null {
  if (!candidate || typeof candidate !== 'object') return null;
  const font = candidate as Partial<ThemeFont>;
  if (typeof font.fileName !== 'string' || font.fileName.length === 0 || font.fileName.length > MAX_FILENAME_LENGTH) {
    return null;
  }
  if (typeof font.dataUrl !== 'string' || !font.dataUrl.startsWith('data:')) return null;
  return { fileName: font.fileName, dataUrl: font.dataUrl };
}

/**
 * Reads the saved theme from localStorage — the ONLY file in the app that
 * touches localStorage. Returns null when nothing (or something malformed) is
 * stored; the caller then falls back to the defaults (Blue, system font).
 */
export function loadThemeState(): ThemeState | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const candidate = parsed as Partial<ThemeState> & { preset?: unknown };
    // Accept the PRD's `presetId`; ignore any foreign shapes.
    if (!isPresetId(candidate.presetId)) return null;

    return {
      presetId: candidate.presetId,
      buttonColor: isValidHex(candidate.buttonColor) ? candidate.buttonColor : null,
      font: parseFont(candidate.font),
    };
  } catch {
    // Corrupt JSON or unavailable storage — fall back to defaults.
    return null;
  }
}

export type PersistResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' | 'failed' };

/**
 * Persists the theme (including the base64 font). Callers must not assume
 * success: fonts can exceed the storage quota and private-mode browsers can
 * block localStorage entirely.
 */
export function saveThemeState(state: ThemeState): PersistResult {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException || typeof DOMException !== 'undefined') {
      const quotaHit = err instanceof DOMException
        && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      const blocked = err instanceof DOMException
        && (err.name === 'SecurityError' || err.name === 'NotAllowedError');
      if (quotaHit) return { ok: false, reason: 'quota' };
      if (blocked) return { ok: false, reason: 'unavailable' };
    }
    return { ok: false, reason: 'failed' };
  }
}

export const defaultThemeState = (): ThemeState => ({
  presetId: DEFAULT_PRESET,
  buttonColor: null,
  font: null,
});
