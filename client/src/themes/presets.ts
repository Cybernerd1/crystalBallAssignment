import type { ThemePreset } from '../types/theme';

/**
 * Values written to CSS custom properties on <html> when a preset resolves.
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
  'color-success': string;
  'color-success-soft': string;
  'color-warning': string;
  'color-warning-soft': string;
  'color-danger': string;
  'color-danger-soft': string;
  'color-on-danger': string;
  'color-overlay': string;
  'shadow-card': string;
  'shadow-overlay': string;
  'color-scheme': 'light' | 'dark';
}

export interface ThemePresetDefinition {
  id: ThemePreset;
  label: string;
  description: string;
  /** Short hint shown next to the preset name in dense UI. */
  mood: string;
  tokens: ThemeTokens;
}

export const PRESET_IDS: readonly ThemePreset[] = ['light', 'blue', 'violet', 'dark'];

/**
 * The four product presets. Light is the warm-neutral, vermilion default; the
 * other three are coordinated variations rather than isolated accent swaps.
 *
 * These hex literals are the only ones outside the documented first-paint
 * mirror in index.html and the stylesheet fallback in tokens.css.
 */
export const PRESETS: Record<ThemePreset, ThemePresetDefinition> = {
  light: {
    id: 'light',
    label: 'Light',
    description: 'Warm paper & vermilion',
    mood: 'Editorial',
    tokens: {
      'color-bg': '#F7F6F2',
      'color-sidebar': '#F2F0EA',
      'color-surface': '#FFFFFF',
      'color-surface-alt': '#FAF9F6',
      'color-text': '#1B1B19',
      'color-text-muted': '#6B6A64',
      'color-border': '#E5E3DC',
      'color-accent': '#E64B35',
      'color-accent-hover': '#C93C29',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-success': '#3F7A52',
      'color-success-soft': 'rgba(63, 122, 82, 0.12)',
      'color-warning': '#916417',
      'color-warning-soft': 'rgba(145, 100, 23, 0.12)',
      'color-danger': '#B4432F',
      'color-danger-soft': 'rgba(180, 67, 47, 0.1)',
      'color-on-danger': 'rgb(255, 255, 255)',
      'color-overlay': 'rgba(27, 27, 25, 0.4)',
      'shadow-card': '0 1px 2px rgba(27, 27, 25, 0.03)',
      'shadow-overlay':
        '0 18px 48px rgba(27, 27, 25, 0.16), 0 2px 6px rgba(27, 27, 25, 0.06)',
      'color-scheme': 'light',
    },
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    description: 'Graphite & cobalt',
    mood: 'Technical',
    tokens: {
      'color-bg': '#F4F5F7',
      'color-sidebar': '#EDEFF2',
      'color-surface': '#FFFFFF',
      'color-surface-alt': '#F8F9FA',
      'color-text': '#191C21',
      'color-text-muted': '#646973',
      'color-border': '#E0E3E8',
      'color-accent': '#2F62D8',
      'color-accent-hover': '#244FB4',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-success': '#347456',
      'color-success-soft': 'rgba(52, 116, 86, 0.12)',
      'color-warning': '#8C641C',
      'color-warning-soft': 'rgba(140, 100, 28, 0.12)',
      'color-danger': '#B4432F',
      'color-danger-soft': 'rgba(180, 67, 47, 0.1)',
      'color-on-danger': 'rgb(255, 255, 255)',
      'color-overlay': 'rgba(25, 28, 33, 0.4)',
      'shadow-card': '0 1px 2px rgba(25, 28, 33, 0.03)',
      'shadow-overlay':
        '0 18px 48px rgba(25, 28, 33, 0.16), 0 2px 6px rgba(25, 28, 33, 0.06)',
      'color-scheme': 'light',
    },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    description: 'Ink & iris',
    mood: 'Studio',
    tokens: {
      'color-bg': '#F6F3F8',
      'color-sidebar': '#EFEAF4',
      'color-surface': '#FFFFFF',
      'color-surface-alt': '#FAF8FC',
      'color-text': '#201A2B',
      'color-text-muted': '#676070',
      'color-border': '#E3DEE9',
      'color-accent': '#6D4AC8',
      'color-accent-hover': '#5838A8',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-success': '#3F7A52',
      'color-success-soft': 'rgba(63, 122, 82, 0.12)',
      'color-warning': '#8C641C',
      'color-warning-soft': 'rgba(140, 100, 28, 0.12)',
      'color-danger': '#B4432F',
      'color-danger-soft': 'rgba(180, 67, 47, 0.1)',
      'color-on-danger': 'rgb(255, 255, 255)',
      'color-overlay': 'rgba(32, 26, 43, 0.4)',
      'shadow-card': '0 1px 2px rgba(32, 26, 43, 0.03)',
      'shadow-overlay':
        '0 18px 48px rgba(32, 26, 43, 0.16), 0 2px 6px rgba(32, 26, 43, 0.06)',
      'color-scheme': 'light',
    },
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    description: 'Warm charcoal',
    mood: 'Night',
    tokens: {
      'color-bg': '#171614',
      'color-sidebar': '#1C1A17',
      'color-surface': '#211F1B',
      'color-surface-alt': '#27241F',
      'color-text': '#F2EFE9',
      'color-text-muted': '#A49E94',
      'color-border': '#36322B',
      'color-accent': '#FF6B52',
      'color-accent-hover': '#FF826C',
      'color-on-accent': 'rgb(24, 24, 23)',
      'color-success': '#7FBF94',
      'color-success-soft': 'rgba(127, 191, 148, 0.14)',
      'color-warning': '#D8A657',
      'color-warning-soft': 'rgba(216, 166, 87, 0.14)',
      'color-danger': '#F08A78',
      'color-danger-soft': 'rgba(240, 138, 120, 0.12)',
      'color-on-danger': 'rgb(24, 24, 23)',
      'color-overlay': 'rgba(0, 0, 0, 0.58)',
      'shadow-card': '0 1px 2px rgba(0, 0, 0, 0.18)',
      'shadow-overlay':
        '0 18px 48px rgba(0, 0, 0, 0.46), 0 2px 6px rgba(0, 0, 0, 0.24)',
      'color-scheme': 'dark',
    },
  },
};

export const DEFAULT_PRESET: ThemePreset = 'light';

/** Quick-pick swatches for the action-accent override (UI offer, not styling). */
export const BUTTON_COLOR_SUGGESTIONS: readonly string[] = [
  '#E64B35',
  '#2F62D8',
  '#6D4AC8',
  '#2F7D5B',
  '#C58A1A',
  '#C2455A',
  '#0E7C86',
];
