import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@features/session/SessionProvider';
import { apiGet } from '@shared/api/client';
import type { OrganizationRole } from '@features/session/types';

type OrganizationDetails = {
  id: string;
  name: string;
  slug?: string | null;
  createdAt: string;
};

type OrganizationMember = {
  id: string;
  fullName: string | null;
  email: string;
  role: OrganizationRole;
  joinedAt: string;
};

type ApiSuccess<T> = {
  success: boolean;
  data: T;
  error: unknown | null;
};

type OrganizationMembersPayload = {
  members: OrganizationMember[];
};

export const OrganizationSettingsPage = () => {
  const { activeOrgId } = useSession();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrgId) {
      // If no active organization, send user back to workspace
      navigate('/workspace');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        const orgRes = await apiGet<ApiSuccess<OrganizationDetails>>(
          `/organizations/${activeOrgId}`,
        );
        const membersRes = await apiGet<ApiSuccess<OrganizationMembersPayload>>(
          `/organizations/${activeOrgId}/members`,
        );

        if (cancelled) return;

        setOrganization(orgRes.data);
        setMembers(membersRes.data.members);
      } catch {
        if (cancelled) return;
        setError('Failed to load organization settings.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [activeOrgId, navigate]);

  const renderRoleBadge = (role: OrganizationRole) => {
    switch (role) {
      case 'OWNER':
        return (
          <span className="inline-flex items-center rounded-full border border-amber-400 px-2 py-0.5 text-xs font-medium text-amber-700">
            Owner
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center rounded-full border border-blue-400 px-2 py-0.5 text-xs font-medium text-blue-700">
            Admin
          </span>
        );
      case 'MEMBER':
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-medium text-zinc-700">
            Member
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Organization Settings</h1>
            <p className="mt-1 text-sm text-slate-400">
              View your current workspace and see who has access.
            </p>
          </div>

          <Link
            to="/workspace"
            className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline"
          >
            ← Back to workspace
          </Link>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-slate-400">
            Loading organization…
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && organization && (
          <div className="space-y-6">
            {/* Organization info */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-200">Workspace</h2>
              <p className="mt-1 text-xs text-slate-400">
                Basic information about your active organization.
              </p>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Name</dt>
                  <dd className="mt-1 font-medium text-slate-50">{organization.name}</dd>
                </div>

                {organization.slug && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Slug</dt>
                    <dd className="mt-1 font-mono text-xs text-slate-200">{organization.slug}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Created</dt>
                  <dd className="mt-1 text-slate-200">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Members */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">Members</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Users who can access this workspace.
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {members.length} member{members.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
                {members.length === 0 && (
                  <div className="px-3 py-4 text-sm text-slate-400">
                    No members found for this organization.
                  </div>
                )}

                {members.length > 0 && (
                  <ul className="divide-y divide-slate-800">
                    {members.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="font-medium text-slate-50">{m.fullName || m.email}</div>
                          <div className="text-xs text-slate-400">{m.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {renderRoleBadge(m.role)}
                          <span className="text-[11px] text-slate-500">
                            Joined {new Date(m.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
