import type { ThemePreset, ThemeState } from '../types/theme';
import { isValidHex } from './color';
import { PRESET_IDS } from './presets';

const STORAGE_KEY = 'forma.theme.v1';

function isPresetId(value: unknown): value is ThemePreset {
  return PRESET_IDS.includes(value as ThemePreset);
}

/**
 * Reads the saved theme from localStorage. Returns null when nothing (or
 * something malformed) is stored — callers then fall back to defaults.
 */
export function loadThemeState(): ThemeState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const candidate = parsed as Partial<ThemeState>;
    if (!isPresetId(candidate.preset)) return null;

    return {
      preset: candidate.preset,
      accentOverride:
        isValidHex(candidate.accentOverride) ? candidate.accentOverride : null,
      customFontDataUrl:
        typeof candidate.customFontDataUrl === 'string' &&
        candidate.customFontDataUrl.startsWith('data:')
          ? candidate.customFontDataUrl
          : null,
      customFontName:
        typeof candidate.customFontName === 'string' && candidate.customFontName.length < 200
          ? candidate.customFontName
          : null,
    };
  } catch {
    // Corrupt JSON or unavailable storage — fall back to defaults.
    return null;
  }
}

export type PersistResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' | 'failed' };

/**
 * Persists the theme (including the base64 font). Callers must not assume
 * success: fonts can exceed the storage quota and private-mode browsers block
 * localStorage entirely.
 */
export function persistThemeState(state: ThemeState): PersistResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (err) {
    console.warn('[theme] Could not persist theme:', err);
    if (err instanceof DOMException || typeof DOMException !== 'undefined') {
      const quotaHit =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
      const blocked =
        err instanceof DOMException &&
        (err.name === 'SecurityError' || err.name === 'NotAllowedError');
      if (quotaHit) return { ok: false, reason: 'quota' };
      if (blocked) return { ok: false, reason: 'unavailable' };
    }
    return { ok: false, reason: 'failed' };
  }
}

export const THEME_STORAGE_KEY = STORAGE_KEY;
