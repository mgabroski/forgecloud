import { useNavigate } from 'react-router-dom';
import { useSession } from '@features/session/SessionProvider';

function DashboardPage() {
  const navigate = useNavigate();
  const { status, user, organizations, logout } = useSession();

  const primaryOrg = organizations[0] ?? null;

  const handleGoBackToLogin = () => {
    logout();
    navigate('/login', { replace: true });
  };

  /* ─────────────────────────────
      Loading State
  ───────────────────────────── */
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="p-6 text-sm text-slate-600 font-sans">Loading your ForgeCloud workspace…</div>
    );
  }

  /* ─────────────────────────────
      Error State
  ───────────────────────────── */
  if (status === 'error') {
    return (
      <div className="p-6 font-sans space-y-3">
        <p className="text-rose-600 font-medium">Could not load your ForgeCloud session.</p>

        <button
          type="button"
          onClick={handleGoBackToLogin}
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Back to login
        </button>
      </div>
    );
  }

  if (!user) return null;

  /* ─────────────────────────────
      Main Dashboard Layout
  ───────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">ForgeCloud overview</h1>
        <p className="mt-1 text-sm text-slate-600">
          Signed in as <strong>{user.fullName ? user.fullName : user.email}</strong>
          {user.fullName ? ` · ${user.email}` : ''}
        </p>
      </header>

      {/* Two-column grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ──────────────────────────
            USER CARD
        ────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">User</h2>

          <dl className="grid grid-cols-[auto,1fr] gap-y-2 gap-x-4 text-sm">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{user.fullName || 'Not set'}</dd>

            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>

            <dt className="text-slate-500">Auth provider</dt>
            <dd className="font-medium text-slate-900">Local</dd>

            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium text-slate-900">Active</dd>
          </dl>
        </div>

        {/* ──────────────────────────
            WORKSPACE CARD
        ────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Workspace</h2>

          {primaryOrg ? (
            <div className="space-y-1 text-sm">
              <div className="text-slate-900 font-semibold">{primaryOrg.name}</div>

              {primaryOrg.slug && (
                <div className="text-slate-500 text-xs">slug: {primaryOrg.slug}</div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No organizations yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
