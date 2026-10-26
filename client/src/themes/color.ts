/**
 * RGB color helpers used by `resolveTheme`. Only 3/6-digit hex values are
 * accepted (that is all the `<input type="color">` produces). Converting to
 * `[r, g, b]` tuples first keeps mixing and luminance math clean.
 */

export type Rgb = [number, number, number];

export function isValidHex(value: unknown): value is string {
  return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function hexToRgb(hex: string): Rgb {
  const full = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/i, '#$1$1$2$2$3$3') : hex;
  return [
    Number.parseInt(full.slice(1, 3), 16),
    Number.parseInt(full.slice(3, 5), 16),
    Number.parseInt(full.slice(5, 7), 16),
  ];
}

/** Mixes `amount` (0–1) of `blend` into `base` (channel-wise linear mix). */
export function mixRgb(base: Rgb, blend: Rgb, amount: number): Rgb {
  return [
    base[0] + (blend[0] - base[0]) * amount,
    base[1] + (blend[1] - base[1]) * amount,
    base[2] + (blend[2] - base[2]) * amount,
  ].map(Math.round) as Rgb;
}

export function rgbCss(rgb: Rgb): string {
  return `rgb(${rgb.join(', ')})`;
}

/** WCAG relative luminance of an sRGB color. */
export function relativeLuminance(rgb: Rgb): number {
  const linear = rgb.map((channel) => {
    const raw = channel / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/** Picks readable text: white on genuinely dark colors, near-black otherwise.
 *  0.179 is the luminance where white and black text have equal contrast; it
 *  guarantees the maximum-contrast choice (e.g. a yellow button gets black
 *  text, a cobalt one gets white). */
export function pickContrastText(rgb: Rgb): 'dark' | 'light' {
  return relativeLuminance(rgb) > 0.179 ? 'dark' : 'light';
}

export const CONTRAST_TEXT_COLORS = {
  dark: 'rgb(24, 24, 23)',
  light: 'rgb(255, 255, 255)',
} as const;
