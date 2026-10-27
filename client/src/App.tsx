import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import UserDetailsPage from './pages/UserDetailsPage';
import UserEditorPage from './pages/UserEditorPage';
import UsersPage from './pages/UsersPage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/new" element={<UserEditorPage />} />
              <Route path="users/:id/edit" element={<UserEditorPage />} />
              <Route path="users/:id" element={<UserDetailsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
