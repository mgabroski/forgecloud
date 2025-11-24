// frontend/src/app/layout/AppHeader.tsx
import { useNavigate } from 'react-router-dom';
import { useSession } from '@features/session/SessionProvider';

function getInitials(nameOrEmail: string | undefined): string {
  if (!nameOrEmail) return 'FC';

  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return nameOrEmail.slice(0, 2).toUpperCase();
}

export function AppHeader() {
  const { user, organizations, activeOrgId, setActiveOrgId, logout } = useSession();
  const navigate = useNavigate();

  const activeOrg = organizations.find((org) => org.id === activeOrgId) ?? organizations[0];

  const displayName = user?.fullName || user?.email || 'Loading user…';
  const initials = getInitials(user?.fullName || user?.email);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleOpenProfile = () => {
    navigate('/profile');
  };

  const handleOpenWorkspace = () => {
    navigate('/workspace');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        {/* Left: brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-slate-100 shadow-sm ring-1 ring-slate-700">
            FC
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-50">ForgeCloud</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              Multi-tenant observability &amp; security
              <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300">
                Alpha
              </span>
            </span>
          </div>
        </div>

        {/* Right: workspace + user */}
        <div className="flex items-center gap-6">
          {/* Workspace selector */}
          <div className="hidden flex-col gap-1 text-xs text-slate-300 sm:flex">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Workspace
            </span>
            {organizations.length > 0 ? (
              <>
                <select
                  value={activeOrg?.id ?? ''}
                  onChange={(e) => setActiveOrgId(e.target.value || null)}
                  className="min-w-[11rem] rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 shadow-sm outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/60"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleOpenWorkspace}
                  className="self-start text-[10px] font-medium text-slate-500 hover:text-sky-400"
                >
                  Manage workspaces →
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-500">No organizations</span>
            )}
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-800 sm:block" />

          {/* User chip + logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenProfile}
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-left text-xs text-slate-200 shadow-sm hover:border-sky-500/70 hover:bg-slate-900"
            >
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 text-[11px] font-semibold text-white shadow">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="max-w-[11rem] truncate text-[11px] font-medium text-slate-50">
                  {displayName}
                </span>
                <span className="max-w-[11rem] truncate text-[10px] text-slate-500">
                  {user?.email}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-sm hover:border-rose-500/70 hover:bg-rose-500/10 hover:text-rose-100"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
