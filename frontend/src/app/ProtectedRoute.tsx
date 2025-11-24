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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Loading workspace…
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm text-rose-700 shadow-sm">
          <div className="mb-1 text-base font-semibold text-rose-800">
            Could not load your ForgeCloud session
          </div>
          <div className="mb-4 text-xs text-rose-700/80">
            {error || 'An unexpected error occurred while loading your session.'}
          </div>
          <a
            href="/login"
            className="inline-flex items-center rounded-full border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  // status === 'authenticated'
  return <>{children}</>;
}

export default ProtectedRoute;
