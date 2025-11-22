import { useSession } from './SessionProvider';

export function WorkspaceSection() {
  const { status, user, organizations, activeOrgId } = useSession();

  if (status !== 'authenticated' || !user) {
    return null;
  }

  const activeOrg = (activeOrgId && organizations.find((org) => org.id === activeOrgId)) ?? null;

  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Workspace</h2>
      <p className="mt-1 text-sm text-slate-500">
        You are a member of the following organizations. The active workspace is highlighted.
      </p>

      <div className="mt-4 space-y-3">
        <div className="text-sm">
          <span className="font-medium text-slate-700">Active organization: </span>
          {activeOrg ? (
            <span className="font-semibold text-slate-900">
              {activeOrg.name}
              <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {activeOrg.role.toLowerCase()}
              </span>
            </span>
          ) : (
            <span className="text-slate-500">No active organization selected</span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            All organizations
          </h3>
          {organizations.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              You are not a member of any organization yet.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/60">
              {organizations.map((org) => {
                const isActive = org.id === activeOrgId;

                return (
                  <li
                    key={org.id}
                    className={`flex items-center justify-between px-3 py-2 text-sm ${
                      isActive ? 'bg-white' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{org.name}</span>
                      {org.slug ? (
                        <span className="text-xs text-slate-500">slug: {org.slug}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
                        {org.role.toLowerCase()}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
