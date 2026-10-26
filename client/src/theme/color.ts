/** Small color helpers; only 3/6-digit hex values are supported. */

export function isValidHex(value: unknown): value is string {
  return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

function expandHex(hex: string): string {
  if (hex.length === 4) {
    return hex.replace(/^#(.)(.)(.)$/i, '#$1$1$2$2$3$3');
  }
  return hex;
}

function channel(hex: string, start: number): number {
  return Number.parseInt(hex.slice(start, start + 2), 16);
}

function toHexByte(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

/**
 * Mixes `amount` (0–1) of `blend` into `base`. Used to derive hover shades
 * and readable text colors for user-chosen accents.
 */
export function mixHex(base: string, blend: string, amount: number): string {
  const a = expandHex(base.toLowerCase());
  const b = expandHex(blend.toLowerCase());

  const rgb = [
    channel(a, 1) + (channel(b, 1) - channel(a, 1)) * amount,
    channel(a, 3) + (channel(b, 3) - channel(a, 3)) * amount,
    channel(a, 5) + (channel(b, 5) - channel(a, 5)) * amount,
  ].map(toHexByte);

  return `#${rgb.join('')}`;
}

/** Relative luminance (WCAG) to decide readable text color on an accent. */
function relativeLuminance(hex: string): number {
  const expanded = expandHex(hex.toLowerCase());
  const linear = [1, 3, 5].map((offset) => {
    const raw = channel(expanded, offset) / 255;
    return raw <= 0.03928 ? raw / 12.92 : ((raw + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/** Picks white or near-black text depending on the accent's brightness. */
export function pickOnAccent(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? '#1b1b18' : '#ffffff';
}
