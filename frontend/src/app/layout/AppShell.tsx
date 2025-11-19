// src/app/layout/AppShell.tsx
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(circle at top left, #e5edff 0, #f5f7fb 40%, #f9fafb 100%)',
        color: 'var(--fc-text-main)',
        fontFamily: 'var(--fc-font-sans)',
      }}
    >
      <AppHeader />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'stretch',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: '220px',
            padding: '1.5rem 1.25rem',
            borderRight: '1px solid var(--fc-border-subtle)',
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'var(--fc-text-muted)',
              marginBottom: '0.8rem',
            }}
          >
            Navigation
          </div>

          <nav
            style={{
              display: 'grid',
              gap: '0.25rem',
              fontSize: '0.86rem',
            }}
          >
            {/* Overview → Dashboard */}
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                padding: '0.35rem 0.6rem',
                borderRadius: '0.5rem',
                backgroundColor: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                color: isActive ? 'var(--fc-text-main)' : 'var(--fc-text-subtle)',
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none',
              })}
            >
              Overview
            </NavLink>

            {/* Placeholders for future modules */}
            <div
              style={{
                padding: '0.32rem 0.6rem',
                borderRadius: '0.5rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              Sentinel (logs &amp; security)
            </div>
            <div
              style={{
                padding: '0.32rem 0.6rem',
                borderRadius: '0.5rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              Atlas (SLOs &amp; metrics)
            </div>
            <div
              style={{
                padding: '0.32rem 0.6rem',
                borderRadius: '0.5rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              Costs (cloud spend)
            </div>
            <div
              style={{
                padding: '0.32rem 0.6rem',
                borderRadius: '0.5rem',
                color: 'var(--fc-text-subtle)',
              }}
            >
              Settings
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: '1.75rem 1.75rem 2.25rem',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
