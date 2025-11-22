// frontend/src/app/layout/AppHeader.tsx
import { useNavigate } from 'react-router-dom';
import { useSession } from '@features/session/SessionProvider';

function getInitials(nameOrEmail: string | undefined): string {
  if (!nameOrEmail) return 'FC';

  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Fallback: first 2 chars of email/name
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
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.7rem 1.75rem',
        borderBottom: '1px solid var(--fc-border-subtle)',
        backgroundColor: 'var(--fc-surface)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
      }}
    >
      {/* Left: brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
        }}
      >
        <span
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--fc-text-main)',
          }}
        >
          ForgeCloud
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            borderRadius: '9999px',
            padding: '0.15rem 0.55rem',
            border: '1px solid rgba(59,130,246,0.3)',
            backgroundColor: 'rgba(59,130,246,0.06)',
            color: 'rgba(37,99,235,0.9)',
            letterSpacing: '0.16em',
          }}
        >
          Alpha
        </span>
      </div>

      {/* Right: workspace + user */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.6rem',
          fontSize: '0.8rem',
        }}
      >
        {/* Workspace selector */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <span
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--fc-text-muted)',
            }}
          >
            Workspace
          </span>
          {organizations.length > 0 ? (
            <>
              <select
                value={activeOrg?.id ?? ''}
                onChange={(e) => setActiveOrgId(e.target.value || null)}
                style={{
                  minWidth: '11rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--fc-border-subtle)',
                  backgroundColor: 'var(--fc-surface-soft)',
                  color: 'var(--fc-text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
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
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.05rem',
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: 'var(--fc-text-muted)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '0.12em',
                }}
              >
                Manage workspace
              </button>
            </>
          ) : (
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              No organizations
            </span>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: '1.9rem',
            backgroundColor: 'rgba(148,163,184,0.45)',
          }}
        />

        {/* User chip + logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <button
            type="button"
            onClick={handleOpenProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '9999px',
                background: user?.avatarUrl
                  ? 'transparent'
                  : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                boxShadow: user?.avatarUrl
                  ? '0 8px 20px rgba(15,23,42,0.25)'
                  : '0 8px 20px rgba(37,99,235,0.35)',
                overflow: 'hidden',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '9999px',
                    display: 'block',
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1.2,
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--fc-text-main)',
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--fc-text-muted)',
                }}
              >
                {user?.email}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              border: '1px solid var(--fc-border-subtle)',
              backgroundColor: '#ffffff',
              color: 'var(--fc-text-main)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
