// src/features/auth/pages/LoginPage.tsx

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginResponse } from '@shared/api/client';
import { apiPost, ApiError, setAccessToken } from '@shared/api/client';
import { GoogleLoginButton } from '@features/auth/components/GoogleLoginButton';

function LoginPage() {
  const navigate = useNavigate();

  // Default to your seeded dev user
  const [email, setEmail] = useState('founder@forgecloud.dev');
  const [password, setPassword] = useState('ForgeCloud#123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiPost<LoginResponse>('/auth/login', {
        email,
        password,
      });

      setAccessToken(res.accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiError = err instanceof ApiError ? err : undefined;

      if (apiError?.isNetworkError) {
        setError('Cannot reach ForgeCloud API. Is the backend running on port 4000?');
      } else if (apiError?.status === 401) {
        setError('Invalid email or password.');
      } else if (apiError?.message) {
        setError(apiError.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        maxWidth: '1120px',
        margin: '0 auto',
        gap: '2.5rem',
      }}
    >
      {/* Left side – brand / pitch */}
      <div
        style={{
          flex: 1.1,
          borderRadius: 'var(--fc-radius-xl)',
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 40%, #e0f7fa 100%)',
          padding: '2.2rem 2.4rem',
          boxShadow: 'var(--fc-shadow-soft)',
          border: '1px solid var(--fc-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(15,23,42,0.04)',
              marginBottom: '1.25rem',
              fontSize: '0.75rem',
              color: '#0f172a',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#22c55e',
              }}
            />
            Live observability & security workspace
          </div>

          <h1
            style={{
              fontSize: '2rem',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              color: '#0f172a',
            }}
          >
            Welcome to <span style={{ color: 'var(--fc-primary)' }}>ForgeCloud</span>
          </h1>
          <p
            style={{
              marginBottom: '1.75rem',
              color: 'var(--fc-text-subtle)',
              fontSize: '0.95rem',
              maxWidth: '28rem',
            }}
          >
            Centralize your logs, metrics, and security signals. Detect incidents faster. Ship with
            confidence.
          </p>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: '0.65rem',
              fontSize: '0.85rem',
              color: '#0f172a',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--fc-primary-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                ✓
              </span>
              Unified view across services and environments
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--fc-primary-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                ✓
              </span>
              Security insights, SLOs, and cost monitoring in one place
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--fc-primary-soft)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                ✓
              </span>
              Built for DevOps, SecOps, and engineering leaders
            </li>
          </ul>
        </div>

        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.8rem',
            color: 'var(--fc-text-muted)',
          }}
        >
          Day 6 • Core bootstrapping · Authentication & Frontend Shell
        </p>
      </div>

      {/* Right side – login card */}
      <div
        style={{
          flex: 0.9,
          alignSelf: 'center',
          backgroundColor: 'var(--fc-surface)',
          borderRadius: 'var(--fc-radius-xl)',
          boxShadow: 'var(--fc-shadow-strong)',
          border: '1px solid var(--fc-border-subtle)',
          padding: '2.2rem 2.4rem',
          maxWidth: '420px',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: '1.4rem',
            marginBottom: '0.25rem',
            color: 'var(--fc-text-main)',
          }}
        >
          Sign in
        </h2>
        <p
          style={{
            marginBottom: '1.6rem',
            color: 'var(--fc-text-subtle)',
            fontSize: '0.9rem',
          }}
        >
          Use your ForgeCloud account to access your workspaces.
        </p>

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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.9rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.3rem',
                fontSize: '0.85rem',
                color: 'var(--fc-text-main)',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: '0.3rem',
                fontSize: '0.85rem',
                color: 'var(--fc-text-main)',
              }}
            >
              Password
            </label>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 2.7rem 0.55rem 0.8rem',
                  borderRadius: '0.6rem',
                  border: '1px solid var(--fc-border-strong)',
                  backgroundColor: 'var(--fc-surface-soft)',
                  color: 'var(--fc-text-main)',
                  fontSize: '0.9rem',
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.45rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.75rem',
                  color: 'var(--fc-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.25rem',
              width: '100%',
              padding: '0.7rem 0.9rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              backgroundColor: loading ? 'rgba(37,99,235,0.6)' : 'var(--fc-primary)',
              color: '#ffffff',
              cursor: loading ? 'default' : 'pointer',
              transition: 'background-color 120ms ease-out, transform 80ms ease-out',
              boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div
          style={{
            margin: '1.6rem 0 1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--fc-text-muted)',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
          <span>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#e5e7eb' }} />
        </div>

        <GoogleLoginButton />
      </div>
    </div>
  );
}

export default LoginPage;
