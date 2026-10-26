import { useState, type ChangeEvent } from 'react';

import { MAX_FONT_BYTES } from '../../themes/fontLoader';
import { FontLoadError } from '../../themes/fontLoader';
import { useTheme } from '../../hooks/useTheme';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * Custom font upload (PRD §5.5): type/extension checks → read as ArrayBuffer
 * for the live face + data URL for storage → FontFace → document.fonts.
 * Validation and live loading live in the theme context; this component only
 * surfaces errors inline and keeps the previous font on failure.
 */
export default function FontUploader() {
  const { state, applyFontFile, clearFont, applyingFont } = useTheme();
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    setError(null);
    try {
      await applyFontFile(file);
    } catch (err) {
      setError(
        err instanceof FontLoadError || err instanceof Error
          ? err.message
          : 'That file could not be loaded as a font. Try a different file.',
      );
    }
  }

  return (
    <div className="font-uploader">
      {state.font ? (
        <div className="font-uploader__applied">
          <div className="font-uploader__chip">
            <span className="font-uploader__badge">Applied</span>
            <span className="font-uploader__name">{state.font.fileName}</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearFont}>
            Remove font
          </button>
        </div>
      ) : (
        <div className="font-uploader__row">
          <label className={`btn btn--secondary btn--sm font-uploader__upload ${applyingFont ? 'btn--disabled' : ''}`}>
            {applyingFont ? 'Loading…' : 'Upload font file'}
            <input type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleChange} disabled={applyingFont} />
          </label>
          <span className="muted">TTF, OTF, WOFF, WOFF2 · up to {formatBytes(MAX_FONT_BYTES)}</span>
        </div>
      )}

      {error ? <p className="field-error" role="alert">{error}</p> : null}

      <p className="font-uploader__preview">
        The quick brown fox jumps over the lazy dog — 0123456789
      </p>
    </div>
  );
}
