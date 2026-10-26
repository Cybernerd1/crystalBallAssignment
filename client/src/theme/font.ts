/**
 * Custom font lifecycle: data URL -> FontFace -> document.fonts -> CSS var.
 * The ThemeContext owns the logic; this module only handles registration.
 */

export const CUSTOM_FONT_FAMILY = 'Forma Custom Font';
export const CUSTOM_FONT_FAMILY_CSS = `"${CUSTOM_FONT_FAMILY}"`;

export const ACCEPTED_FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];
/** Conservative cap so the base64 copy stays within localStorage's ~5 MB quota. */
export const MAX_FONT_BYTES = 2_000_000;

let activeFace: FontFace | null = null;
let lastDataUrl: string | null = null;

export function isAcceptedFontFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_FONT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Loads the font file (as a data URL) into the document's font set. */
export async function registerCustomFont(dataUrl: string): Promise<void> {
  if (activeFace && lastDataUrl === dataUrl) {
    return; // already registered — nothing to do
  }

  if (activeFace) {
    document.fonts.delete(activeFace);
    activeFace = null;
  }

  const face = new FontFace(CUSTOM_FONT_FAMILY, `url(${dataUrl})`);
  await face.load();
  document.fonts.add(face);

  activeFace = face;
  lastDataUrl = dataUrl;
}

export function removeRegisteredCustomFont(): void {
  if (activeFace) {
    document.fonts.delete(activeFace);
    activeFace = null;
  }
  lastDataUrl = null;
}

/** Reads a File into a data URL string (rejects if the read fails). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}
