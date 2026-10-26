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
  'color-danger': string;
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

export const PRESET_IDS: readonly ThemePreset[] = ['blue', 'violet', 'darcula', 'forest'];

/**
 * The four PRD presets. `bg | surface | text | accent` are the PRD's exact
 * values; the remaining tokens are sensible per-palette companions (muted,
 * border, danger, sidebar, shadows) so every CSS var has a preset value.
 * These hex literals are the only ones outside `index.html`'s first-paint
 * mirror, which is documented in the README.
 */
export const PRESETS: Record<ThemePreset, ThemePresetDefinition> = {
  blue: {
    id: 'blue',
    label: 'Blue',
    description: 'Crisp default cobalt',
    tokens: {
      'color-bg': '#F4F7FB',
      'color-sidebar': '#EBF1F8',
      'color-surface': '#FFFFFF',
      'color-surface-alt': '#F7FAFD',
      'color-text': '#0F1B2D',
      'color-text-muted': '#5B6B7C',
      'color-border': '#DCE5EF',
      'color-accent': '#2563EB',
      'color-accent-hover': '#1D4ED8',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-danger': '#E11D48',
      'shadow-card': '0 1px 2px rgba(15, 27, 45, 0.06), 0 4px 14px rgba(15, 27, 45, 0.06)',
      'shadow-overlay': '0 12px 40px rgba(15, 27, 45, 0.2)',
      'color-scheme': 'light',
    },
  },
  violet: {
    id: 'violet',
    label: 'Violet',
    description: 'Pale lavender & violet',
    tokens: {
      'color-bg': '#F6F3FF',
      'color-sidebar': '#EFEAFA',
      'color-surface': '#FFFFFF',
      'color-surface-alt': '#FAF8FE',
      'color-text': '#1E1633',
      'color-text-muted': '#655B7A',
      'color-border': '#E4DFF3',
      'color-accent': '#7C3AED',
      'color-accent-hover': '#6B21D1',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-danger': '#E11D48',
      'shadow-card': '0 1px 2px rgba(30, 22, 51, 0.06), 0 4px 14px rgba(30, 22, 51, 0.06)',
      'shadow-overlay': '0 12px 40px rgba(30, 22, 51, 0.2)',
      'color-scheme': 'light',
    },
  },
  darcula: {
    id: 'darcula',
    label: 'Darcula',
    description: 'JetBrains dark IDE',
    tokens: {
      'color-bg': '#2B2B2B',
      'color-sidebar': '#262626',
      'color-surface': '#3C3F41',
      'color-surface-alt': '#333638',
      'color-text': '#A9B7C6',
      'color-text-muted': '#7E8792',
      'color-border': '#4E5054',
      'color-accent': '#4B6EAF',
      'color-accent-hover': '#5A7EBE',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-danger': '#FF6B68',
      'shadow-card': '0 1px 2px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.25)',
      'shadow-overlay': '0 12px 40px rgba(0, 0, 0, 0.5)',
      'color-scheme': 'dark',
    },
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    description: 'Grayscale paper & pine',
    tokens: {
      'color-bg': '#F3F8F4',
      'color-sidebar': '#E9F3EC',
      'color-surface': '#FFFFFF',
      'color-surface-alt': '#F8FBF8',
      'color-text': '#12261A',
      'color-text-muted': '#5C7264',
      'color-border': '#DCE9DF',
      'color-accent': '#15803D',
      'color-accent-hover': '#146633',
      'color-on-accent': 'rgb(255, 255, 255)',
      'color-danger': '#E11D48',
      'shadow-card': '0 1px 2px rgba(18, 38, 26, 0.06), 0 4px 14px rgba(18, 38, 26, 0.06)',
      'shadow-overlay': '0 12px 40px rgba(18, 38, 26, 0.2)',
      'color-scheme': 'light',
    },
  },
};

export const DEFAULT_PRESET: ThemePreset = 'blue';

/** Quick-pick page for the button-color override (UI offer, not styling). */
export const BUTTON_COLOR_SUGGESTIONS: readonly string[] = [
  '#F59E0B',
  '#10B981',
  '#2563EB',
  '#7C3AED',
  '#EC4899',
  '#0D9488',
  '#EF4444',
];
