// frontend/src/features/profile/pages/ProfilePage.tsx
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPatch, ApiError } from '@shared/api/client';
import { useSession } from '@features/session/SessionProvider';
import type { AuthUser, OrganizationSummary } from '@features/session/types';

interface SessionPayload {
  user: AuthUser;
  organizations: OrganizationSummary[];
  activeOrganizationId: string | null;
}

interface UpdateMeEnvelope {
  success: boolean;
  data: SessionPayload | null;
  error: unknown | null;
}

function getInitials(nameOrEmail: string | undefined): string {
  if (!nameOrEmail) return 'FC';

  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return nameOrEmail.slice(0, 2).toUpperCase();
}

function ProfilePage() {
  const { user, refresh } = useSession();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!user) {
    // Should not happen because this page is behind ProtectedRoute,
    // but we guard anyway.
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">No user is loaded. Please sign in again.</p>
        <Link
          to="/login"
          className="mt-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    try {
      const res = await apiPatch<UpdateMeEnvelope>('/auth/me', {
        fullName: fullName.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });

      if (!res.success || !res.data) {
        throw new ApiError('Failed to update profile.', { body: res });
      }

      // Refresh global session snapshot so header & other views update
      await refresh();
      setSaved(true);
    } catch (err: unknown) {
      const apiError = err instanceof ApiError ? err : undefined;

      if (apiError?.isNetworkError) {
        setError('Cannot reach ForgeCloud API. Please check your backend.');
      } else if (apiError?.message) {
        setError(apiError.message);
      } else {
        setError('Something went wrong while updating your profile.');
      }
    } finally {
      setLoading(false);
    }
  }

  const initials = getInitials(user.fullName || user.email);
  const providerLabel =
    user.authProvider === 'google'
      ? 'Google (SSO)'
      : user.authProvider === 'local' || !user.authProvider
        ? 'Email & password'
        : user.authProvider;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your personal identity in ForgeCloud. These details will show up across your
            workspaces.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Signed in as
          </span>
          <span className="max-w-[12rem] truncate text-[11px] font-medium text-slate-900">
            {user.email}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {saved && !error && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Profile updated successfully.
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr,1.3fr]">
        {/* Identity card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Your details</h2>
          <p className="mt-1 text-xs text-slate-500">Your name, email, and sign-in method.</p>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 text-2xl font-semibold text-white shadow-lg ring-2 ring-slate-100">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Avatar is rendered from the URL below.
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 space-y-4 text-sm">
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-slate-700">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name as it will appear in the app"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label htmlFor="avatarUrl" className="block text-xs font-medium text-slate-700">
                  Avatar URL
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://… (optional)"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  If provided, this image will be shown as your avatar in the header.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                >
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
                <span className="text-[11px] text-slate-500">
                  Changes will apply across all your organizations.
                </span>
              </div>
            </form>
          </div>
        </section>

        {/* Account metadata / provider */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Account metadata</h2>
            <p className="mt-1 text-xs text-slate-500">Technical details about how you sign in.</p>

            <dl className="mt-4 grid gap-3 text-sm text-slate-900">
              <div>
                <dt className="text-xs font-medium text-slate-500">Email</dt>
                <dd className="mt-1 truncate">{user.email}</dd>
              </div>

              <div>
                <dt className="text-xs font-medium text-slate-500">Provider</dt>
                <dd className="mt-1">{providerLabel}</dd>
              </div>

              {user.id && (
                <div>
                  <dt className="text-xs font-medium text-slate-500">User ID</dt>
                  <dd className="mt-1 break-all text-xs font-mono text-slate-600">{user.id}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Workspaces link */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Workspaces</h2>
                <p className="mt-1 text-xs text-slate-500">
                  You can belong to multiple organizations inside ForgeCloud.
                </p>
              </div>
              <Link
                to="/workspace"
                className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-50 shadow-sm hover:bg-black"
              >
                View my workspaces →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
