import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';

/**
 * Live preview of the real theme engine. Every value below comes from the
 * CSS variables currently applied to <html> — this is not a static mockup.
 */
export default function ThemePreview() {
  return (
    <div className="theme-preview">
      <div className="theme-preview__head">
        <span className="theme-preview__app">
          <span className="brand-mark brand-mark--sm" aria-hidden="true">
            F
          </span>
          <span>Forma</span>
        </span>
        <span className="theme-preview__live">
          <span className="theme-preview__live-dot" aria-hidden="true" />
          Live
        </span>
      </div>

      <div className="theme-preview__body">
        <div className="theme-preview__copy">
          <p className="eyebrow">Preview</p>
          <p className="theme-preview__title">Design in the details.</p>
          <p className="theme-preview__text">
            Typography, surfaces and actions update as you change the theme. This preview uses
            the same tokens as the rest of the workspace.
          </p>
          <div className="theme-preview__actions" aria-hidden="true">
            <span className="btn btn--primary">Primary action</span>
            <span className="btn btn--secondary">Secondary</span>
          </div>
          <div className="theme-preview__field" aria-hidden="true">
            <Icon name="search" size={14} />
            <span>Search the directory…</span>
          </div>
        </div>

        <div className="theme-preview__sample" aria-hidden="true">
          <div className="theme-preview__sample-row">
            <Avatar name="Mira Chen" size="sm" />
            <span className="theme-preview__sample-user">
              <span className="theme-preview__sample-name">Mira Chen</span>
              <span className="theme-preview__sample-email">mira@forma.studio</span>
            </span>
            <span className="badge badge--editor">editor</span>
            <span className="status status--active">
              <span className="status__dot" />
              active
            </span>
          </div>
          <div className="theme-preview__sample-row">
            <Avatar name="Noah Park" size="sm" />
            <span className="theme-preview__sample-user">
              <span className="theme-preview__sample-name">Noah Park</span>
              <span className="theme-preview__sample-email">noah@forma.studio</span>
            </span>
            <span className="badge badge--viewer">viewer</span>
            <span className="status status--inactive">
              <span className="status__dot" />
              inactive
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
