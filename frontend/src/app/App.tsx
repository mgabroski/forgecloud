import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@features/auth/pages/LoginPage';
import DashboardPage from '@features/dashboard/pages/DashboardPage';
import { getAccessToken } from '@shared/api/client';
import ProtectedRoute from '@app/ProtectedRoute';

function App() {
  const isAuthenticated = !!getAccessToken();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback: unknown routes → root redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
