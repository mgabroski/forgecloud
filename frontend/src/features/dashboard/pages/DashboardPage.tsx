import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from '@shared/api/client';
import { ApiError, apiGet, clearAccessToken, getAccessToken } from '@shared/api/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (!getAccessToken()) {
        navigate('/login');
        return;
      }

      try {
        const me = await apiGet<AuthUser>('/auth/me');
        setUser(me);

        try {
          const orgs = await apiGet<Organization[]>('/organizations');
          setOrganizations(orgs);
        } catch (orgErr: unknown) {
          console.warn('Failed to load organizations', orgErr);
        }
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          clearAccessToken();
          navigate('/login');
        } else if (err instanceof Error) {
          setError(err.message || 'Error loading dashboard');
        } else {
          setError('Error loading dashboard');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  function handleLogout() {
    clearAccessToken();
    navigate('/login');
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '1.5rem',
          fontFamily: 'var(--fc-font-sans)',
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1.5rem',
          fontFamily: 'var(--fc-font-sans)',
        }}
      >
        <p style={{ color: 'var(--fc-danger)' }}>{error}</p>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '0.75rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '9999px',
            border: '1px solid var(--fc-border-strong)',
            backgroundColor: 'var(--fc-surface)',
            cursor: 'pointer',
          }}
        >
          Back to login
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '1.75rem 1.5rem 2rem',
        fontFamily: 'var(--fc-font-sans)',
        maxWidth: '1120px',
        margin: '0 auto',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.6rem',
              marginBottom: '0.25rem',
              color: 'var(--fc-text-main)',
            }}
          >
            ForgeCloud overview
          </h1>
          <p
            style={{
              color: 'var(--fc-text-subtle)',
              fontSize: '0.9rem',
            }}
          >
            Signed in as <strong>{user.email}</strong>
            {user.fullName ? ` (${user.fullName})` : ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            border: '1px solid var(--fc-border-strong)',
            backgroundColor: 'var(--fc-surface)',
            color: 'var(--fc-text-main)',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Log out
        </button>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '1.2rem 1.3rem',
            borderRadius: 'var(--fc-radius-lg)',
            backgroundColor: 'var(--fc-surface)',
            border: '1px solid var(--fc-border-subtle)',
            boxShadow: 'var(--fc-shadow-soft)',
          }}
        >
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.75rem',
              color: 'var(--fc-text-main)',
            }}
          >
            User info
          </h2>
          <pre
            style={{
              backgroundColor: 'var(--fc-surface-soft)',
              borderRadius: '0.75rem',
              padding: '0.8rem',
              fontSize: '0.8rem',
              overflowX: 'auto',
              border: '1px solid var(--fc-border-subtle)',
            }}
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div
          style={{
            padding: '1.2rem 1.3rem',
            borderRadius: 'var(--fc-radius-lg)',
            backgroundColor: 'var(--fc-surface)',
            border: '1px solid var(--fc-border-subtle)',
            boxShadow: 'var(--fc-shadow-soft)',
          }}
        >
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.75rem',
              color: 'var(--fc-text-main)',
            }}
          >
            Organizations (raw)
          </h2>
          {organizations.length === 0 ? (
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              No organizations or endpoint not implemented yet.
            </p>
          ) : (
            <pre
              style={{
                backgroundColor: 'var(--fc-surface-soft)',
                borderRadius: '0.75rem',
                padding: '0.8rem',
                fontSize: '0.8rem',
                overflowX: 'auto',
                border: '1px solid var(--fc-border-subtle)',
              }}
            >
              {JSON.stringify(organizations, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
