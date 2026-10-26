import { useState, type ChangeEvent } from 'react';

import { ACCEPTED_FONT_EXTENSIONS, MAX_FONT_BYTES, isAcceptedFontFile, readFileAsDataUrl } from '../../theme/font';
import { useTheme } from '../../hooks/useTheme';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * Custom font upload:
 * file -> size/type checks -> data URL -> FontFace -> document.fonts -> CSS var.
 * Persisting happens in ThemeContext; quota failures surface as a notice.
 */
export default function FontUploader() {
  const { state, setCustomFont, clearCustomFont } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const accepted = ACCEPTED_FONT_EXTENSIONS.join(',');

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    setError(null);

    if (!isAcceptedFontFile(file)) {
      setError(`Choose a ${ACCEPTED_FONT_EXTENSIONS.join(', ')} file.`);
      return;
    }
    if (file.size > MAX_FONT_BYTES) {
      setError(`Font files are limited to ${formatBytes(MAX_FONT_BYTES)} to stay within browser storage.`);
      return;
    }

    setWorking(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      // Throws if the file is not a usable font — caught below.
      await setCustomFont(dataUrl, file.name);
    } catch {
      setError('That file could not be loaded as a font. Try a different file.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="font-uploader">
      {state.customFontName ? (
        <div className="font-uploader__applied">
          <div className="font-uploader__chip">
            <span className="font-uploader__badge">Applied</span>
            <span className="font-uploader__name">{state.customFontName}</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearCustomFont}>
            Remove font
          </button>
        </div>
      ) : (
        <div className="font-uploader__row">
          <label className={`btn btn--secondary btn--sm font-uploader__upload ${working ? 'btn--disabled' : ''}`}>
            {working ? 'Loading…' : 'Upload font file'}
            <input type="file" accept={accepted} onChange={handleChange} disabled={working} />
          </label>
          <span className="muted">TTF, OTF, WOFF, WOFF2 · up to {formatBytes(MAX_FONT_BYTES)}</span>
        </div>
      )}

      {error ? <p className="field-error">{error}</p> : null}

      <p className="font-uploader__preview">
        The quick brown fox jumps over the lazy dog — 0123456789
      </p>
    </div>
  );
}
