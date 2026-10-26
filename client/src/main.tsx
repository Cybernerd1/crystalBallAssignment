import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/tokens.css';
import './styles/global.css';

// Color-first-paint is handled by the inline script in index.html (reads the
// same app.theme.v1 key). The custom font rehydrates asynchronously inside
// ThemeContext — the system stack renders until the face resolves by design.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
