import ThemeCustomizer from '../components/theme/ThemeCustomizer';
import Icon from '../components/ui/Icon';
import { useAppShell } from '../context/AppShellContext';
import { commandShortcutLabel } from '../utils/platform';

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: [commandShortcutLabel()], description: 'Open the command palette' },
  { keys: ['↑', '↓'], description: 'Move through palette results' },
  { keys: ['↵'], description: 'Open the highlighted result' },
  { keys: ['Esc'], description: 'Close the palette, drawer or dialog' },
  { keys: ['Tab'], description: 'Move focus through controls' },
];

export default function SettingsPage() {
  const { openAppearance } = useAppShell();

  return (
    <div className="page page--settings">
      <header className="page-head">
        <div className="page-head__copy">
          <p className="eyebrow">Settings</p>
          <h1 className="page-title">Preferences</h1>
          <p className="page-subtitle">
            Appearance, keyboard shortcuts and the details behind this workspace.
          </p>
        </div>
        <div className="page-head__actions">
          <button type="button" className="btn btn--secondary" onClick={openAppearance}>
            <Icon name="palette" size={15} />
            Open appearance panel
          </button>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <p className="settings-nav__label">On this page</p>
          <a href="#appearance" className="settings-nav__link">
            Appearance
          </a>
          <a href="#shortcuts" className="settings-nav__link">
            Keyboard shortcuts
          </a>
          <a href="#workspace" className="settings-nav__link">
            Workspace
          </a>
        </nav>

        <div className="settings-main">
          <section className="settings-section" id="appearance" aria-labelledby="appearance-title">
            <header className="settings-section__head">
              <div>
                <h2 className="settings-section__title" id="appearance-title">
                  Appearance
                </h2>
                <p className="settings-section__description">
                  Choose a preset, set the action accent and upload a typeface. Changes apply to
                  this workspace immediately.
                </p>
              </div>
            </header>
            <div className="settings-card settings-card--flush">
              <ThemeCustomizer variant="page" />
            </div>
          </section>

          <section className="settings-section" id="shortcuts" aria-labelledby="shortcuts-title">
            <header className="settings-section__head">
              <div>
                <h2 className="settings-section__title" id="shortcuts-title">
                  Keyboard shortcuts
                </h2>
                <p className="settings-section__description">
                  Every primary action is reachable without a pointer.
                </p>
              </div>
            </header>
            <div className="settings-card">
              <ul className="shortcut-list">
                {SHORTCUTS.map((shortcut) => (
                  <li key={shortcut.description} className="shortcut-list__row">
                    <span className="shortcut-list__description">{shortcut.description}</span>
                    <span className="shortcut-list__keys">
                      {shortcut.keys.map((key) => (
                        <kbd key={key} className="kbd">
                          {key}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="settings-section" id="workspace" aria-labelledby="workspace-title">
            <header className="settings-section__head">
              <div>
                <h2 className="settings-section__title" id="workspace-title">
                  Workspace
                </h2>
                <p className="settings-section__description">
                  Where this build keeps its data and preferences.
                </p>
              </div>
            </header>
            <div className="settings-card">
              <dl className="meta-list">
                <div className="meta-list__row">
                  <dt>Account</dt>
                  <dd>
                    Alex Doe
                    <span className="meta-list__note">Demo workspace · no authentication</span>
                  </dd>
                </div>
                <div className="meta-list__row">
                  <dt>Data source</dt>
                  <dd>
                    <span className="meta-list__inline">
                      <Icon name="database" size={14} />
                      Forma API
                    </span>
                    <span className="meta-list__note">
                      Users and counts are read from and written to MongoDB.
                    </span>
                  </dd>
                </div>
                <div className="meta-list__row">
                  <dt>Theme storage</dt>
                  <dd>
                    <code className="code">app.theme.v1</code>
                    <span className="meta-list__note">
                      Preset, action accent and uploaded font are saved in this browser only.
                    </span>
                  </dd>
                </div>
                <div className="meta-list__row">
                  <dt>Build</dt>
                  <dd>
                    <code className="code">React 19 · Vite · Express · MongoDB</code>
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
