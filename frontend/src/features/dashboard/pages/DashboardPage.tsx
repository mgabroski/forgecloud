// src/features/dashboard/pages/DashboardPage.tsx
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

  if (status === 'idle' || status === 'loading') {
    return (
      <div
        style={{
          padding: '1.5rem',
          fontFamily: 'var(--fc-font-sans)',
        }}
      >
        Loading your ForgeCloud workspace…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        style={{
          padding: '1.5rem',
          fontFamily: 'var(--fc-font-sans)',
        }}
      >
        <p style={{ color: 'var(--fc-danger)' }}>Could not load your ForgeCloud session.</p>
        <button
          type="button"
          onClick={handleGoBackToLogin}
          style={{
            marginTop: '0.75rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '9999px',
            border: '1px solid var(--fc-border-strong)',
            backgroundColor: 'var(--fc-surface)',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Back to login
        </button>
      </div>
    );
  }

  if (!user) {
    // Should not happen if status === 'authenticated',
    // but keep a guard to avoid weird crashes.
    return null;
  }

  return (
    <div
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '1.75rem 1.5rem 2rem',
        fontFamily: 'var(--fc-font-sans)',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
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
            Signed in as <strong>{user.fullName ? user.fullName : user.email}</strong>
            {user.fullName ? ` · ${user.email}` : ''}
          </p>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
          gap: '1.5rem',
        }}
      >
        {/* User card */}
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
            User
          </h2>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              rowGap: '0.45rem',
              columnGap: '0.75rem',
              fontSize: '0.9rem',
            }}
          >
            <dt style={{ color: 'var(--fc-text-subtle)' }}>Name</dt>
            <dd style={{ margin: 0, color: 'var(--fc-text-main)' }}>
              {user.fullName || 'Not set'}
            </dd>

            <dt style={{ color: 'var(--fc-text-subtle)' }}>Email</dt>
            <dd style={{ margin: 0, color: 'var(--fc-text-main)' }}>{user.email}</dd>

            <dt style={{ color: 'var(--fc-text-subtle)' }}>Auth provider</dt>
            <dd style={{ margin: 0, color: 'var(--fc-text-main)' }}>Local</dd>

            <dt style={{ color: 'var(--fc-text-subtle)' }}>Status</dt>
            <dd style={{ margin: 0, color: 'var(--fc-text-main)' }}>Active</dd>
          </dl>
        </div>

        {/* Workspace card */}
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
            Workspace
          </h2>

          {primaryOrg ? (
            <div style={{ fontSize: '0.9rem' }}>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                  color: 'var(--fc-text-main)',
                }}
              >
                {primaryOrg.name}
              </div>
              {primaryOrg.slug && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--fc-text-subtle)',
                  }}
                >
                  slug: {primaryOrg.slug}
                </div>
              )}
            </div>
          ) : (
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              No organizations yet. We’ll wire real workspace data when we build the multi-tenant
              org/project module.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
