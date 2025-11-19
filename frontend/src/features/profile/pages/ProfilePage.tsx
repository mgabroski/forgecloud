import type { FormEvent } from 'react';
import { useState } from 'react';
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
      <div>
        <h1
          style={{
            fontSize: '1.4rem',
            marginBottom: '0.4rem',
          }}
        >
          Profile
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--fc-text-subtle)',
          }}
        >
          No user is loaded. Please sign in again.
        </p>
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

  return (
    <div
      style={{
        maxWidth: '520px',
        width: '100%',
      }}
    >
      <h1
        style={{
          fontSize: '1.4rem',
          marginBottom: '0.2rem',
        }}
      >
        Profile
      </h1>
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--fc-text-subtle)',
          marginBottom: '1.4rem',
        }}
      >
        Manage your basic ForgeCloud profile details. These will show up across your workspaces.
      </p>

      <div
        style={{
          marginBottom: '1.5rem',
          padding: '0.9rem 1rem',
          borderRadius: '0.85rem',
          backgroundColor: 'rgba(15,23,42,0.02)',
          border: '1px solid var(--fc-border-subtle)',
          fontSize: '0.8rem',
        }}
      >
        <div
          style={{
            marginBottom: '0.25rem',
            color: 'var(--fc-text-main)',
          }}
        >
          Signed in as <strong>{user.email}</strong>
        </div>
        <div style={{ color: 'var(--fc-text-muted)' }}>
          Authentication provider: <code>{user.authProvider ?? 'local'}</code>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.8rem 0.9rem',
            borderRadius: '0.75rem',
            backgroundColor: 'var(--fc-danger-soft)',
            color: 'var(--fc-danger)',
            fontSize: '0.85rem',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </div>
      )}

      {saved && !error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.7rem 0.85rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(34,197,94,0.08)',
            color: '#16a34a',
            fontSize: '0.83rem',
            border: '1px solid rgba(22,163,74,0.3)',
          }}
        >
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label
            htmlFor="fullName"
            style={{
              display: 'block',
              marginBottom: '0.3rem',
              fontSize: '0.85rem',
              color: 'var(--fc-text-main)',
            }}
          >
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name as it will appear in the app"
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid var(--fc-border-strong)',
              backgroundColor: 'var(--fc-surface-soft)',
              color: 'var(--fc-text-main)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div>
          <label
            htmlFor="avatarUrl"
            style={{
              display: 'block',
              marginBottom: '0.3rem',
              fontSize: '0.85rem',
              color: 'var(--fc-text-main)',
            }}
          >
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Link to your profile image (optional)"
            style={{
              width: '100%',
              padding: '0.55rem 0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid var(--fc-border-strong)',
              backgroundColor: 'var(--fc-surface-soft)',
              color: 'var(--fc-text-main)',
              fontSize: '0.9rem',
            }}
          />
          <p
            style={{
              marginTop: '0.3rem',
              fontSize: '0.78rem',
              color: 'var(--fc-text-muted)',
            }}
          >
            In a later iteration we can render this as your avatar in the header.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            marginTop: '0.3rem',
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.55rem 1.3rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: loading ? 'rgba(37,99,235,0.6)' : 'var(--fc-primary)',
              color: '#ffffff',
              cursor: loading ? 'default' : 'pointer',
              boxShadow: '0 8px 20px rgba(37,99,235,0.3)',
            }}
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>

          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--fc-text-muted)',
            }}
          >
            Changes will apply across all your organizations.
          </span>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;
