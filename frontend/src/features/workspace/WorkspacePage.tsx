import { useMemo } from 'react';
import { useSession } from '@features/session/SessionProvider';

export function WorkspacePage() {
  const { status, user, organizations, activeOrgId, error } = useSession();

  const isLoading = status === 'idle' || status === 'loading';

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-zinc-500">Loading workspace…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-zinc-900">My workspace</h1>
        <p className="mt-2 text-sm text-red-500">Failed to load workspace information.</p>
        {typeof error === 'string' && <p className="mt-1 text-xs text-zinc-500">{error}</p>}
      </div>
    );
  }

  if (status === 'unauthenticated' || !user) {
    // Inside AppShell this should normally not happen,
    // but we keep a defensive state.
    return (
      <div className="p-6">
        <p className="text-sm text-zinc-500">No active session. Please sign in again.</p>
      </div>
    );
  }

  const orgCount = organizations.length;

  const activeOrg = useMemo(
    () => organizations.find((org) => org.id === activeOrgId) ?? organizations[0] ?? null,
    [organizations, activeOrgId],
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">My workspace</h1>
        <p className="mt-1 text-sm text-zinc-500">
          View your current workspace and the organizations you belong to.
        </p>
      </header>

      {/* No organizations (future-proof) */}
      {orgCount === 0 && (
        <section className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6">
          <p className="text-sm text-zinc-600">You&apos;re not a member of any workspace yet.</p>
          <p className="mt-1 text-xs text-zinc-500">
            In the future, you&apos;ll be able to create or join a workspace from here.
          </p>
        </section>
      )}

      {/* Active workspace card */}
      {orgCount > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900">Active workspace</h2>

          {activeOrg ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-zinc-900">{activeOrg.name}</p>
                  {(activeOrg as any).slug && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      {(activeOrg as any).slug}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  Plan:{' '}
                  <span className="font-medium">{(activeOrg as any).plan ?? 'Unspecified'}</span>
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Your role:{' '}
                  <span className="font-medium uppercase tracking-wide">
                    {(activeOrg as any).role ?? 'MEMBER'}
                  </span>{' '}
                  · signed in as <span className="font-medium">{user.email}</span>
                </p>
              </div>

              <div className="mt-2 sm:mt-0 text-xs text-zinc-400">
                Switching workspaces is done from the header workspace dropdown.
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              You have organizations, but none is marked as active. Choose one from the workspace
              dropdown in the header.
            </p>
          )}
        </section>
      )}

      {/* All workspaces list */}
      {orgCount > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-900">All workspaces</h2>
            <p className="text-xs text-zinc-500">
              You belong to {orgCount} workspace{orgCount === 1 ? '' : 's'}.
            </p>
          </div>

          <div className="space-y-2">
            {organizations.map((org) => {
              const isActive = org.id === activeOrgId;
              const role = (org as any).role ?? 'MEMBER';

              return (
                <div
                  key={org.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900">{org.name}</span>
                      {(org as any).slug && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          {(org as any).slug}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Role: <span className="font-semibold uppercase tracking-wide">{role}</span>
                    </p>
                  </div>

                  {isActive && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
