import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '@shared/api/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Minimal route guard:
 * - If there's no access token, send the user to /login
 * - Otherwise render the protected content
 *
 * Actual token validity is enforced by the backend via /auth/me.
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
