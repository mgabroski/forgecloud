// src/app/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@features/session/SessionProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Route guard based on global session state:
 * - While session is loading → show loading screen
 * - If unauthenticated → redirect to /login
 * - If error → show an inline error screen (do NOT redirect)
 * - If authenticated → render children
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, error } = useSession();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Loading workspace…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center text-sm text-slate-300">
        <div className="mb-2 text-lg font-semibold text-slate-50">
          Could not load your ForgeCloud session
        </div>
        <div className="mb-4 max-w-md text-xs text-slate-400">
          {error || 'An unexpected error occurred while loading your session.'}
        </div>
        <a
          href="/login"
          className="rounded border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          Back to login
        </a>
      </div>
    );
  }

  // status === 'authenticated'
  return <>{children}</>;
}

export default ProtectedRoute;
