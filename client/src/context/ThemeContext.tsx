import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  FontLoadError,
  dataUrlToArrayBuffer,
  fontKey,
  loadFont,
  readFileAsArrayBuffer,
  readFileAsDataUrl,
  removeRegisteredFont,
  validateFontFile,
} from '../themes/fontLoader';
import { resolveTheme } from '../themes/resolveTheme';
import { PRESETS } from '../themes/presets';
import { defaultThemeState, loadThemeState, saveThemeState } from '../themes/themeStorage';
import type { ThemeNotice, ThemePreset, ThemeState } from '../types/theme';

const DEFAULT_STATE: ThemeState = defaultThemeState();

export interface ThemeContextValue {
  state: ThemeState;
  /** Button color in force: `state.buttonColor ?? preset accent`. */
  buttonColor: string;
  setPreset(presetId: ThemePreset): void;
  /** `null` restores the preset accent for buttons. */
  setButtonColor(color: string | null): void;
  /** Validates, live-loads and only then accepts a custom font. */
  applyFontFile(file: File): Promise<void>;
  clearFont(): void;
  /** Set while applying a font file (disable the picker against double work). */
  applyingFont: boolean;
  notice: ThemeNotice;
  dismissNotice(): void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Storage restore happens here; the index.html inline script already painted
  // the right colors before React mounted.
  const [state, setState] = useState<ThemeState>(() => loadThemeState() ?? DEFAULT_STATE);
  const [notice, setNotice] = useState<ThemeNotice>(null);
  const [applyingFont, setApplyingFont] = useState(false);

  // Keep the registered FontFace in sync with the stored font. Covers both
  // startup rehydration and later uploads/removals. The system font shows
  // until the face resolves — we never block rendering on font data.
  const storedFont = state.font;
  useEffect(() => {
    let cancelled = false;
    if (!storedFont) {
      removeRegisteredFont();
      return;
    }
    loadFont(
      dataUrlToArrayBuffer(storedFont.dataUrl),
      fontKey(storedFont.fileName, storedFont.dataUrl.length),
    ).catch((err) => {
      if (cancelled) return;
      removeRegisteredFont();
      setNotice({
        type: 'error',
        message:
          err instanceof FontLoadError
            ? `The saved font failed to load (${err.kind}) — falling back to the system font.`
            : 'The saved font failed to load — falling back to the system font.',
      });
      // Drop the broken font from the persisted state too.
      setState((prev) => ({ ...prev, font: null }));
    });
    return () => {
      cancelled = true;
    };
  }, [storedFont]);

  // Central application + persistence. Runs on mount as well, restoring the
  // resolved tokens (already painted by the inline script) authoritatively.
  useEffect(() => {
    const root = document.documentElement;
    const tokens = resolveTheme(state);
    for (const [name, value] of Object.entries(tokens)) {
      root.style.setProperty(`--${name}`, value);
    }
    if (!state.font) root.style.removeProperty('--font-family');
    root.setAttribute('data-theme', state.presetId);

    const result = saveThemeState(state);
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

  const setPreset = useCallback((presetId: ThemePreset) => {
    // Switching presets never clears the button override or the font.
    setState((prev) => ({ ...prev, presetId }));
  }, []);

  const setButtonColor = useCallback((buttonColor: string | null) => {
    setState((prev) => ({ ...prev, buttonColor }));
  }, []);

  const applyFontFile = useCallback(async (file: File) => {
    setApplyingFont(true);
    try {
      // Type/size checks before reading anything (typed FontLoadError).
      validateFontFile(file);
      const [buffer, dataUrl] = await Promise.all([
        readFileAsArrayBuffer(file),
        readFileAsDataUrl(file),
      ]);
      // Load first: if the data is not a usable font this throws and both the
      // state and storage are left untouched, keeping the previous font.
      await loadFont(buffer, fontKey(file.name, buffer.byteLength));
      setState((prev) => ({ ...prev, font: { fileName: file.name, dataUrl } }));
    } finally {
      setApplyingFont(false);
    }
  }, []);

  const clearFont = useCallback(() => {
    setState((prev) => ({ ...prev, font: null }));
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      state,
      buttonColor: state.buttonColor ?? PRESETS[state.presetId].tokens['color-accent'],
      setPreset,
      setButtonColor,
      applyFontFile,
      clearFont,
      applyingFont,
      notice,
      dismissNotice,
    }),
    [state, setPreset, setButtonColor, applyFontFile, clearFont, applyingFont, notice, dismissNotice],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
