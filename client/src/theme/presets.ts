import type { ThemePreset, ThemeState } from '../types/theme';

/**
 * Values written to CSS custom properties on <html> when a preset is applied.
 * Keys deliberately mirror the CSS variable names minus the `--` prefix.
 */
export interface ThemeTokens {
  'color-bg': string;
  'color-sidebar': string;
  'color-surface': string;
  'color-surface-alt': string;
  'color-text': string;
  'color-text-muted': string;
  'color-border': string;
  'color-accent': string;
  'color-accent-hover': string;
  'color-on-accent': string;
  'shadow-card': string;
  'shadow-overlay': string;
  'color-scheme': 'light' | 'dark';
}

export interface ThemePresetDefinition {
  id: ThemePreset;
  label: string;
  description: string;
  tokens: ThemeTokens;
}

export const PRESET_IDS: readonly ThemePreset[] = ['light', 'blue', 'violet', 'dark'];

export const PRESETS: Record<ThemePreset, ThemePresetDefinition> = {
  light: {
    id: 'light',
    label: 'Light',
    description: 'Warm ivory & vermilion',
    tokens: {
      'color-bg': '#f6f5f0',
      'color-sidebar': '#efeee6',
      'color-surface': '#ffffff',
      'color-surface-alt': '#faf9f5',
      'color-text': '#222320',
      'color-text-muted': '#686963',
      'color-border': '#e6e4dc',
      'color-accent': '#f04c35',
      'color-accent-hover': '#d63d27',
      'color-on-accent': '#ffffff',
      'shadow-card': '0 1px 2px rgba(24, 24, 20, 0.05), 0 4px 14px rgba(24, 24, 20, 0.05)',
      'shadow-overlay': '0 12px 40px rgba(24, 24, 20, 0.18)',
      'color-scheme': 'light',
    },
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    description: 'Pale blue & cobalt',
    tokens: {
      'color-bg': '#eef3fb',
      'color-sidebar': '#e6edf8',
      'color-surface': '#ffffff',
      'color-surface-alt': '#f5f8fd',
      'color-text': '#1b2534',
      'color-text-muted': '#5b6577',
      'color-border': '#dbe3f0',
      'color-accent': '#2563eb',
      'color-accent-hover': '#1d4ed8',
      'color-on-accent': '#ffffff',
      'shadow-card': '0 1px 2px rgba(15, 32, 68, 0.06), 0 4px 14px rgba(15, 32, 68, 0.06)',
      'shadow-overlay': '0 12px 40px rgba(15, 32, 68, 0.2)',
      'color-scheme': 'light',
    },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    description: 'Pale lavender & violet',
    tokens: {
      'color-bg': '#f5f2fb',
      'color-sidebar': '#efeaf7',
      'color-surface': '#ffffff',
      'color-surface-alt': '#faf8fd',
      'color-text': '#251f33',
      'color-text-muted': '#655e78',
      'color-border': '#e6dff2',
      'color-accent': '#7c3aed',
      'color-accent-hover': '#6b21d1',
      'color-on-accent': '#ffffff',
      'shadow-card': '0 1px 2px rgba(45, 25, 80, 0.06), 0 4px 14px rgba(45, 25, 80, 0.06)',
      'shadow-overlay': '0 12px 40px rgba(45, 25, 80, 0.2)',
      'color-scheme': 'light',
    },
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    description: 'Graphite & coral',
    tokens: {
      'color-bg': '#141519',
      'color-sidebar': '#191b20',
      'color-surface': '#1e2126',
      'color-surface-alt': '#24282e',
      'color-text': '#e9e7e2',
      'color-text-muted': '#9b9aa3',
      'color-border': '#2c3036',
      'color-accent': '#f2603e',
      'color-accent-hover': '#ff7a55',
      'color-on-accent': '#ffffff',
      'shadow-card': '0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.25)',
      'shadow-overlay': '0 12px 40px rgba(0, 0, 0, 0.5)',
      'color-scheme': 'dark',
    },
  },
};

/**
 * The rule that keeps a custom accent (e.g. orange) intact when the user
 * switches presets: the override wins, otherwise the preset's own accent.
 * `effectiveAccent = accentOverride ?? preset.accent`
 */
export function effectiveAccent(state: ThemeState): string {
  return state.accentOverride ?? PRESETS[state.preset].tokens['color-accent'];
}
