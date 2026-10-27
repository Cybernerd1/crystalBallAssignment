import { useState, type ChangeEvent, type DragEvent } from 'react';

import {
  ACCEPTED_FONT_EXTENSIONS,
  FontLoadError,
  MAX_FONT_BYTES,
} from '../../themes/fontLoader';
import { useTheme } from '../../hooks/useTheme';
import Icon from '../ui/Icon';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/**
 * Custom font upload: drag/drop or browse → type/extension checks → read as
 * ArrayBuffer for the live face + data URL for storage → FontFace → live
 * load. A bad file never enters state or storage.
 */
export default function FontUploader() {
  const { state, applyFontFile, clearFont, applyingFont } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
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

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    await handleFile(file);
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    await handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="font-uploader">
      {state.font ? (
        <div className="font-uploader__applied">
          <div className="font-uploader__chip">
            <span className="font-uploader__badge">
              <Icon name="check" size={11} strokeWidth={2.4} />
              Applied
            </span>
            <span className="font-uploader__name">{state.font.fileName}</span>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              clearFont();
              setError(null);
            }}
          >
            Remove
          </button>
        </div>
      ) : null}

      <label
        className={`font-dropzone ${dragging ? 'font-dropzone--dragging' : ''} ${
          applyingFont ? 'font-dropzone--busy' : ''
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!applyingFont) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={ACCEPTED_FONT_EXTENSIONS.join(',')}
          onChange={handleChange}
          disabled={applyingFont}
        />
        <span className="font-dropzone__icon" aria-hidden="true">
          <Icon name="upload" size={17} />
        </span>
        <span className="font-dropzone__copy">
          <span className="font-dropzone__title">
            {applyingFont
              ? 'Loading font…'
              : state.font
                ? 'Replace custom font'
                : 'Drop a font here, or browse'}
          </span>
          <span className="font-dropzone__hint">
            {ACCEPTED_FONT_EXTENSIONS.join(' · ')} — up to {formatBytes(MAX_FONT_BYTES)}
          </span>
        </span>
      </label>

      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="font-preview">
        <span className="font-preview__sample" aria-hidden="true">
          Aa
        </span>
        <span className="font-preview__text">
          The quick brown fox jumps over the lazy dog — 0123456789
        </span>
      </div>
      <p className="theme-hint">
        Uploaded fonts apply across the whole interface and are saved in this browser.
      </p>
    </div>
  );
}
