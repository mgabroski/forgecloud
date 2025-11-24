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
          <span className="inline-flex items-center rounded-full border border-amber-400 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            Owner
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center rounded-full border border-blue-400 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            Admin
          </span>
        );
      case 'MEMBER':
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
            Member
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Organization settings
            </h1>
            <p className="mt-1 text-sm text-slate-600">Admin center for your active workspace.</p>
          </div>

          <Link
            to="/workspace"
            className="text-xs font-medium text-sky-600 hover:text-sky-500 hover:underline"
          >
            ← Back to workspaces
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            Loading organization…
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && organization && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr,1.4fr]">
            {/* Organization info card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">General</h2>
              <p className="mt-1 text-xs text-slate-600">Core details for this organization.</p>

              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-slate-500">Name</dt>
                  <dd className="mt-1 font-medium text-slate-900">{organization.name}</dd>
                </div>

                {organization.slug && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500">Slug</dt>
                    <dd className="mt-1 font-mono text-xs text-slate-700">{organization.slug}</dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs font-medium text-slate-500">Plan</dt>
                  <dd className="mt-1 text-slate-900">ForgeCloud Free (placeholder)</dd>
                </div>

                <div>
                  <dt className="text-xs font-medium text-slate-500">Created at</dt>
                  <dd className="mt-1 text-slate-900">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Members card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Members</h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Users who can access this workspace. Actions are placeholders for now.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-slate-500">
                    {members.length} member{members.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm opacity-60"
                  >
                    Invite member (coming soon)
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60">
                {members.length === 0 && (
                  <div className="px-3 py-4 text-sm text-slate-500">
                    No members found for this organization.
                  </div>
                )}

                {members.length > 0 && (
                  <ul className="divide-y divide-slate-200 bg-white">
                    {members.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between px-3 py-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {(m.fullName || m.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {m.fullName || m.email}
                            </div>
                            <div className="text-xs text-slate-500">{m.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {renderRoleBadge(m.role)}
                          <span className="text-[11px] text-slate-500">
                            Joined {new Date(m.joinedAt).toLocaleDateString()}
                          </span>
                          {/* Future: change role / remove buttons (disabled / TODO) */}
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
