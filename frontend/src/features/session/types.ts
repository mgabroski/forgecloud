import type { AuthUser as ApiAuthUser } from '@shared/api/client';

export type AuthUser = ApiAuthUser;

export interface OrganizationSummary {
  id: string;
  name: string;
  slug?: string;
}

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface SessionState {
  status: SessionStatus;
  user: AuthUser | null;
  organizations: OrganizationSummary[];
  activeOrgId: string | null;
  error: string | null;
}

export interface SessionContextValue extends SessionState {
  setActiveOrgId: (orgId: string | null) => void;
  refresh: () => Promise<void>;
  logout: () => void;
}
