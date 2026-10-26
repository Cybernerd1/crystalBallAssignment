import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { applyTheme } from '../theme/applyTheme';
import { loadThemeState, persistThemeState } from '../theme/persistence';
import { registerCustomFont, removeRegisteredCustomFont } from '../theme/font';
import { effectiveAccent } from '../theme/presets';
import type { ThemeNotice, ThemePreset, ThemeState } from '../types/theme';

const DEFAULT_STATE: ThemeState = {
  preset: 'light',
  accentOverride: null,
  customFontDataUrl: null,
  customFontName: null,
};

export interface ThemeContextValue {
  state: ThemeState;
  /** The accent actually in use: `accentOverride ?? preset.accent`. */
  accent: string;
  setPreset(preset: ThemePreset): void;
  setAccentOverride(color: string | null): void;
  /** Rejects if the font data cannot be loaded as a font. */
  setCustomFont(dataUrl: string, fileName: string): Promise<void>;
  clearCustomFont(): void;
  notice: ThemeNotice;
  dismissNotice(): void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(() => loadThemeState() ?? DEFAULT_STATE);
  const [notice, setNotice] = useState<ThemeNotice>(null);

  // Keep the registered FontFace in sync with the stored custom font. This
  // covers both startup rehydration and later uploads/removals.
  const activeDataUrl = state.customFontDataUrl;
  useEffect(() => {
    let cancelled = false;
    if (!activeDataUrl) {
      removeRegisteredCustomFont();
      return;
    }
    registerCustomFont(activeDataUrl).catch((err) => {
      console.error('[theme] Custom font failed to load:', err);
      if (cancelled) return;
      removeRegisteredCustomFont();
      setNotice({
        type: 'error',
        message: 'The custom font could not be loaded — falling back to the default font.',
      });
      // Drop the broken font from the persisted state too.
      setState((prev) => ({ ...prev, customFontDataUrl: null, customFontName: null }));
    });
    return () => {
      cancelled = true;
    };
  }, [activeDataUrl]);

  // Central application + persistence. Runs on mount as well, which restores
  // the saved look immediately after startup.
  useEffect(() => {
    applyTheme(state);
    const result = persistThemeState(state);
    if (!result.ok) {
      setNotice({
        type: 'warning',
        message:
          result.reason === 'quota'
            ? 'Theme applied for this session only — the browser storage quota was exceeded, so it could not be saved for the next visit.'
            : 'Theme applied for this session only — browser storage is unavailable.',
      });
    }
  }, [state]);

  const setPreset = useCallback((preset: ThemePreset) => {
    setState((prev) => ({ ...prev, preset }));
  }, []);

  const setAccentOverride = useCallback((color: string | null) => {
    setState((prev) => ({ ...prev, accentOverride: color }));
  }, []);

  const setCustomFont = useCallback(async (dataUrl: string, fileName: string) => {
    // Register first: if the data is not a usable font this throws and the
    // state (and storage) are left untouched.
    await registerCustomFont(dataUrl);
    setNotice(null);
    setState((prev) => ({ ...prev, customFontDataUrl: dataUrl, customFontName: fileName }));
  }, []);

  const clearCustomFont = useCallback(() => {
    setNotice(null);
    setState((prev) => ({ ...prev, customFontDataUrl: null, customFontName: null }));
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      state,
      accent: effectiveAccent(state),
      setPreset,
      setAccentOverride,
      setCustomFont,
      clearCustomFont,
      notice,
      dismissNotice,
    }),
    [state, notice, setPreset, setAccentOverride, setCustomFont, clearCustomFont, dismissNotice],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
