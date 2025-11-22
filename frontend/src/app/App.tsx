// frontend/src/app/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@features/auth/pages/LoginPage';
import DashboardPage from '@features/dashboard/pages/DashboardPage';
import ProfilePage from '@features/profile/pages/ProfilePage';
import { getAccessToken } from '@shared/api/client';
import ProtectedRoute from '@app/ProtectedRoute';
import { AppShell } from '@app/layout/AppShell';
import { WorkspacePage } from '@features/workspace/WorkspacePage';

function App() {
  const isAuthenticated = !!getAccessToken();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <AppShell>
              <WorkspacePage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Fallback: unknown routes → root redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
