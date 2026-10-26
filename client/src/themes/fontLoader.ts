/**
 * Custom font lifecycle, per the PRD:
 * read as ArrayBuffer for the live face and as a data URL for storage →
 * `new FontFace('UserFont', arrayBuffer)` → `await face.load()` →
 * only on success add to `document.fonts` (removing the previous face first).
 * Failures surface as typed errors — state is never persisted for a font
 * that did not load.
 */

export const CUSTOM_FONT_FAMILY = 'UserFont';

export const ACCEPTED_FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'] as const;

/** 1.5 MB raw; base64 inflates ~33% and localStorage is ~5 MB per origin. */
export const MAX_FONT_BYTES = 1_500_000;

const ACCEPTED_MIME_TYPES = new Set([
  'font/ttf',
  'font/otf',
  'font/woff',
  'font/woff2',
  'application/x-font-ttf',
  'application/x-font-otf',
  'application/x-font-woff',
  'application/font-woff',
  'application/font-woff2',
  'application/octet-stream', // some OSes register fonts this way
  '', // extension remains the primary check when MIME is empty
]);

/** Why a font file was rejected or failed to load. */
export type FontErrorKind = 'unsupported' | 'too-large' | 'corrupt';

export class FontLoadError extends Error {
  readonly kind: FontErrorKind;

  constructor(kind: FontErrorKind, message: string) {
    super(message);
    this.name = 'FontLoadError';
    this.kind = kind;
  }
}

/** Extension + MIME checks before reading anything. */
export function validateFontFile(file: File): void {
  const lower = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_FONT_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!hasValidExtension || !ACCEPTED_MIME_TYPES.has(file.type)) {
    throw new FontLoadError(
      'unsupported',
      `Choose a ${ACCEPTED_FONT_EXTENSIONS.join(', ')} file.`,
    );
  }
  if (file.size > MAX_FONT_BYTES) {
    throw new FontLoadError('too-large', `Font files are limited to ${MAX_FONT_BYTES / 1_000_000} MB.`);
  }
}

let activeFace: FontFace | null = null;
let activeKey: string | null = null;

/**
 * Registers the font data as the active `UserFont` face. Replaces (never
 * stacks) the previous face so `document.fonts` does not accumulate.
 * @param key identity of the source (name + size) used to skip duplicate work
 */
export async function loadFont(data: ArrayBuffer, key: string): Promise<void> {
  if (activeFace && activeKey === key) return;

  const face = new FontFace(CUSTOM_FONT_FAMILY, data);
  try {
    await face.load();
  } catch {
    // The face failed its own load — surface a typed error and keep the
    // previously registered font intact (never persist a broken font).
    throw new FontLoadError('corrupt', 'That file could not be loaded as a font.');
  }

  if (activeFace && activeFace !== face) {
    document.fonts.delete(activeFace);
  }
  document.fonts.add(face);

  activeFace = face;
  activeKey = key;
}

export function removeRegisteredFont(): void {
  if (activeFace) {
    document.fonts.delete(activeFace);
    activeFace = null;
    activeKey = null;
  }
}

/** Reads a File into an ArrayBuffer for the live `FontFace` registration. */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

/** Data URL → ArrayBuffer (startup rehydration from storage). */
export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.replace(/^data:[^,]*,/, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Reads a File into a data URL string for persistence (rejects on read error). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

export function fontKey(fileName: string, byteLength: number): string {
  return `${fileName}:${byteLength}`;
}
