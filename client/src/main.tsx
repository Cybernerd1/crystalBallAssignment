import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { applyTheme } from './theme/applyTheme';
import { loadThemeState } from './theme/persistence';
import { registerCustomFont } from './theme/font';
import './styles/tokens.css';
import './styles/global.css';

// Restore any saved theme before the first paint so there is no flash of the
// default palette. Font registration is best-effort; ThemeContext handles
// failure notices while the default stack stays in charge of rendering.
const savedTheme = loadThemeState();
if (savedTheme) {
  if (savedTheme.customFontDataUrl) {
    registerCustomFont(savedTheme.customFontDataUrl).catch(() => {
      // Handled again (with a visible notice) inside ThemeContext.
    });
  }
  applyTheme(savedTheme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
