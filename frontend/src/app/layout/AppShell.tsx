import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-8 pt-4 md:px-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm shadow-sm md:flex">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Navigation
          </div>

          <nav className="space-y-1 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                [
                  'flex items-center rounded-xl px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                ].join(' ')
              }
            >
              Overview
            </NavLink>

            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Modules
            </div>

            {/* ⭐ Projects module link */}
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                [
                  'mt-1 flex items-center rounded-xl px-3 py-2 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                ].join(' ')
              }
            >
              Projects
            </NavLink>

            {/* 🔐 Sentinel module link (Alpha) */}
            <NavLink
              to="/sentinel"
              className={({ isActive }) =>
                [
                  'mt-1 flex items-center rounded-xl px-3 py-2 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                ].join(' ')
              }
            >
              <span className="text-xs font-medium">Sentinel (logs &amp; security)</span>
              <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky-300">
                Alpha
              </span>
            </NavLink>

            <button
              type="button"
              className="mt-1 flex w-full cursor-not-allowed items-center rounded-xl px-3 py-2 text-left text-slate-500/60 ring-1 ring-slate-800/60"
            >
              <span className="text-xs font-medium text-slate-400">Atlas (SLOs &amp; metrics)</span>
              <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
                Coming soon
              </span>
            </button>

            <button
              type="button"
              className="mt-1 flex w-full cursor-not-allowed items-center rounded-xl px-3 py-2 text-left text-slate-500/60 ring-1 ring-slate-800/60"
            >
              <span className="text-xs font-medium text-slate-400">Costs (cloud spend)</span>
              <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
                Coming soon
              </span>
            </button>

            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Account
            </div>

            <NavLink
              to="/workspace"
              className={({ isActive }) =>
                [
                  'mt-1 flex items-center rounded-xl px-3 py-2 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                ].join(' ')
              }
            >
              Workspaces
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                [
                  'flex items-center rounded-xl px-3 py-2 text-left text-xs transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                ].join(' ')
              }
            >
              Profile
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
