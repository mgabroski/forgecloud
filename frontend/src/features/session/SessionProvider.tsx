import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiGet, ApiError, getAccessToken, clearAccessToken } from '@shared/api/client';
import type { AuthUser, OrganizationSummary, SessionContextValue, SessionState } from './types';

interface AuthMePayload {
  user: AuthUser;
  organizations: OrganizationSummary[];
  activeOrganizationId: string | null;
}

interface AuthMeEnvelope {
  success: boolean;
  data: AuthMePayload | null;
  error: unknown | null;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const initialState: SessionState = {
  status: 'idle',
  user: null,
  organizations: [],
  activeOrgId: null,
  error: null,
};

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [state, setState] = useState<SessionState>(initialState);

  const loadSession = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setState((prev) => ({
        ...prev,
        status: 'unauthenticated',
        user: null,
        organizations: [],
        activeOrgId: null,
        error: null,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
    }));

    try {
      const res = await apiGet<AuthMeEnvelope>('/auth/me');

      if (!res.success || !res.data) {
        setState({
          status: 'error',
          user: null,
          organizations: [],
          activeOrgId: null,
          error: 'Failed to load session.',
        });
        return;
      }

      const { user, organizations, activeOrganizationId } = res.data;

      const effectiveActiveOrgId =
        activeOrganizationId !== null ? activeOrganizationId : (organizations[0]?.id ?? null);

      setState({
        status: 'authenticated',
        user,
        organizations,
        activeOrgId: effectiveActiveOrgId,
        error: null,
      });
    } catch (err: unknown) {
      const apiError = err instanceof ApiError ? err : undefined;

      if (apiError?.status === 401) {
        // Token invalid/expired
        clearAccessToken();
        setState({
          status: 'unauthenticated',
          user: null,
          organizations: [],
          activeOrgId: null,
          error: null,
        });
        return;
      }

      clearAccessToken();
      setState({
        status: 'error',
        user: null,
        organizations: [],
        activeOrgId: null,
        error: apiError?.message ?? 'Failed to load session.',
      });
    }
  }, []);

  useEffect(() => {
    // We intentionally call loadSession() here to bootstrap the session on mount.
    // It updates local state based on /auth/me, which is expected behavior for a provider.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSession();
  }, [loadSession]);

  const setActiveOrgId = (orgId: string | null) => {
    setState((prev) => ({
      ...prev,
      activeOrgId: orgId,
    }));
  };

  const logout = () => {
    clearAccessToken();
    setState({
      status: 'unauthenticated',
      user: null,
      organizations: [],
      activeOrgId: null,
      error: null,
    });
  };

  const refresh = async () => {
    await loadSession();
  };

  const value: SessionContextValue = {
    ...state,
    setActiveOrgId,
    logout,
    refresh,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
