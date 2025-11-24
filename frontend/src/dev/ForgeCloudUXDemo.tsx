import React, { useState } from 'react';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface Membership {
  org: Organization;
  role: Role;
  joinedAt: string;
  isActive: boolean;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  provider: 'email' | 'google';
  createdAt: string;
  lastLoginAt: string;
}

interface ActivityItem {
  id: string;
  timestampLabel: string;
  description: string;
}

const mockOrg: Organization = {
  id: 'org_1',
  name: 'Acme Corporation',
  slug: 'acme',
  createdAt: '2025-11-13T10:00:00Z',
};

const mockMemberships: Membership[] = [
  {
    org: mockOrg,
    role: 'OWNER',
    joinedAt: '2025-11-13T10:05:00Z',
    isActive: true,
  },
  {
    org: {
      id: 'org_2',
      name: 'Beta Security',
      slug: 'beta-security',
      createdAt: '2025-11-15T09:00:00Z',
    },
    role: 'ADMIN',
    joinedAt: '2025-11-16T08:30:00Z',
    isActive: false,
  },
  {
    org: {
      id: 'org_3',
      name: 'Gamma Labs',
      slug: 'gamma-labs',
      createdAt: '2025-11-18T12:00:00Z',
    },
    role: 'MEMBER',
    joinedAt: '2025-11-18T12:30:00Z',
    isActive: false,
  },
];

const mockUser: User = {
  id: 'user_1',
  fullName: 'Mario Gabroski',
  email: 'mario@example.com',
  provider: 'email',
  createdAt: '2025-11-13T09:00:00Z',
  lastLoginAt: '2025-11-22T21:45:00Z',
};

const mockActivities: ActivityItem[] = [
  {
    id: 'act_1',
    timestampLabel: 'Yesterday',
    description: 'Project “Core API” created by Mario',
  },
  {
    id: 'act_2',
    timestampLabel: '2 days ago',
    description: 'Organization settings updated',
  },
  {
    id: 'act_3',
    timestampLabel: '3 days ago',
    description: 'Invited Jane Smith as Admin',
  },
];

function formatDate(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ---------- Shared UI Primitives ---------- */

function RoleBadge({ role }: { role: Role }) {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset';
  if (role === 'OWNER') {
    return <span className={`${base} bg-amber-50 text-amber-800 ring-amber-200`}>Owner</span>;
  }
  if (role === 'ADMIN') {
    return <span className={`${base} bg-indigo-50 text-indigo-700 ring-indigo-200`}>Admin</span>;
  }
  return <span className={`${base} bg-slate-50 text-slate-700 ring-slate-200`}>Member</span>;
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
      {label}
    </span>
  );
}

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="flex justify-center px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-6xl">
        {/* Page header */}
        <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-[1px] shadow-lg">
          <div className="flex flex-col gap-2 rounded-2xl bg-white/80 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium">
                ForgeCloud · UX Playground
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="space-y-4 sm:space-y-6">{children}</div>
      </div>
    </div>
  );
}

interface CardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

function Card({ title, description, actions, children }: CardProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm shadow-slate-100 sm:p-5">
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? <h2 className="text-sm font-semibold text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-xs text-slate-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

/* ---------- Dashboard ---------- */

function DashboardView() {
  const activeMembership = mockMemberships.find((m) => m.isActive) ?? mockMemberships[0];

  return (
    <PageShell
      title="Overview"
      subtitle={`Workspace: ${activeMembership.org.name} · ${activeMembership.org.slug}`}
    >
      {/* Top row: summary + stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Workspace summary */}
        <div className="lg:col-span-2">
          <Card
            title="Workspace summary"
            description="This is your active workspace. All projects, alerts, and incidents shown here belong to this organization."
            actions={
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Organization settings →
              </button>
            }
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {activeMembership.org.name}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {activeMembership.org.slug}
                  </span>
                  <RoleBadge role={activeMembership.role} />
                  <Chip label="Current workspace" />
                </div>
                <p className="text-xs text-slate-500">
                  Member since {formatDate(activeMembership.joinedAt)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Plan
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">ForgeCloud Free</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Created
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatDate(activeMembership.org.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card>
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Projects
              </p>
              <p className="text-2xl font-semibold text-slate-900">12</p>
              <p className="text-xs text-slate-500">Total projects in this workspace</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Alerts (24h)
              </p>
              <p className="text-2xl font-semibold text-slate-900">3</p>
              <p className="text-xs text-slate-500">Triggered in the last 24 hours</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Open incidents
              </p>
              <p className="text-2xl font-semibold text-slate-900">1</p>
              <p className="text-xs text-slate-500">Currently being investigated</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <Card
        title="Recent activity"
        description="A quick snapshot of what has happened in this workspace recently."
        actions={
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
            Mock data · For UX only
          </span>
        }
      >
        <ul className="space-y-3">
          {mockActivities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
            >
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
              <div>
                <p className="text-xs font-medium text-slate-500">{activity.timestampLabel}</p>
                <p className="text-sm text-slate-800">{activity.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </PageShell>
  );
}

/* ---------- Profile ---------- */

function ProfileView() {
  const providerLabel = mockUser.provider === 'email' ? 'Email & password' : 'Google (SSO)';

  return (
    <PageShell title="Profile" subtitle="Manage your personal identity in ForgeCloud.">
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        {/* Identity */}
        <Card title="Your details" description="Your name, email and sign-in method.">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-2xl font-semibold text-white shadow-md">
                {mockUser.fullName.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Change avatar
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600">Full name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  defaultValue={mockUser.fullName}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                  defaultValue={mockUser.email}
                  disabled
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-600">Provider</p>
                  <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {providerLabel}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Account metadata */}
        <Card title="Account metadata">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">User ID</dt>
              <dd className="mt-1 text-slate-800">{mockUser.id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Created at</dt>
              <dd className="mt-1 text-slate-800">{formatDate(mockUser.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Last login</dt>
              <dd className="mt-1 text-slate-800">{formatDate(mockUser.lastLoginAt)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Workspaces card */}
      <Card
        title="Workspaces"
        description="You can belong to multiple organizations inside ForgeCloud."
        actions={
          <button
            type="button"
            className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-50 shadow-sm hover:bg-slate-800"
          >
            View my workspaces →
          </button>
        }
      >
        <p className="text-sm text-slate-700">
          You currently belong to <span className="font-semibold">{mockMemberships.length}</span>{' '}
          workspaces.
        </p>
      </Card>
    </PageShell>
  );
}

/* ---------- Workspaces ---------- */

function WorkspacesView() {
  const active = mockMemberships.find((m) => m.isActive) ?? mockMemberships[0];

  return (
    <PageShell
      title="My workspaces"
      subtitle="Overview of all organizations where you have access."
    >
      {/* Current workspace */}
      <Card
        title="Current workspace"
        description="This is the workspace you’re actively using right now."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-50 shadow-sm hover:bg-slate-800"
            >
              Go to overview
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Organization settings →
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{active.org.name}</span>
              <Chip label="Current" />
            </div>
            <p className="mt-1 text-xs text-slate-500">Slug: {active.org.slug}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <span>Your role:</span>
              <RoleBadge role={active.role} />
            </div>
          </div>
          <div className="grid gap-2 text-xs sm:text-sm">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Member since
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatDate(active.joinedAt)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* All workspaces */}
      <Card
        title="All workspaces"
        description="List of all organizations where you have a membership."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mockMemberships.map((membership) => {
            const isActive = membership.isActive;
            return (
              <div
                key={membership.org.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{membership.org.name}</h3>
                    {isActive ? <Chip label="Current workspace" /> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Slug: {membership.org.slug}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-700">
                    <RoleBadge role={membership.role} />
                    <span className="text-[11px] text-slate-500">
                      Joined {formatDate(membership.joinedAt)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  {isActive ? (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500"
                      disabled
                    >
                      Currently active
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                      Switch to this workspace
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}

/* ---------- Org Settings ---------- */

function OrgSettingsView() {
  const active = mockMemberships.find((m) => m.isActive) ?? mockMemberships[0];
  const members = mockMemberships; // mock: memberships as members

  return (
    <PageShell title="Organization settings" subtitle={`${active.org.name} · Admin center`}>
      <div className="grid gap-4 lg:grid-cols-[1.3fr,2fr]">
        {/* General */}
        <Card title="General" description="Core details for this organization.">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Name</dt>
              <dd className="mt-1 text-slate-900">{active.org.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Slug</dt>
              <dd className="mt-1 text-slate-900">{active.org.slug}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Plan</dt>
              <dd className="mt-1 text-slate-900">ForgeCloud Free (placeholder)</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Created at</dt>
              <dd className="mt-1 text-slate-900">{formatDate(active.org.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        {/* Members */}
        <Card
          title="Members"
          description="Manage who can access this organization. Actions are placeholders for now."
          actions={
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm opacity-60"
              disabled
            >
              Invite member (coming soon)
            </button>
          }
        >
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50/60">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Member
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {members.map((member) => (
                  <tr key={member.org.id + member.role}>
                    <td className="px-4 py-2 align-top">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                          {member.org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {member.role === 'OWNER' ? 'You' : `${member.org.name} member`}
                          </span>
                          <span className="text-xs text-slate-500">
                            user+{member.role.toLowerCase()}@example.com
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top text-sm text-slate-800">
                      user+{member.role.toLowerCase()}@example.com
                    </td>
                    <td className="px-4 py-2 align-top">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="px-4 py-2 align-top text-sm text-slate-800">
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className="px-4 py-2 align-top text-right text-xs">
                      <button
                        type="button"
                        className="mr-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-400"
                        disabled
                      >
                        Change role
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-300"
                        disabled
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

/* ---------- Wrapper with Tabs ---------- */

type DemoView = 'dashboard' | 'profile' | 'workspaces' | 'org-settings';

interface DemoTabProps {
  label: string;
  value: DemoView;
  view: DemoView;
  setView: (value: DemoView) => void;
}

function DemoTab({ label, value, view, setView }: DemoTabProps) {
  const isActive = view === value;
  return (
    <button
      type="button"
      onClick={() => setView(value)}
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition ${
        isActive
          ? 'bg-slate-900 text-slate-50 shadow-sm'
          : 'bg-white/60 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-white'
      }`}
    >
      {label}
    </button>
  );
}

export function ForgeCloudUXDemo() {
  const [view, setView] = useState<DemoView>('dashboard');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top switcher bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
              FC
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900">ForgeCloud UX Demo</span>
              <span className="text-[11px] text-slate-500">
                Dashboard · Profile · Workspaces · Org Settings
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <DemoTab label="Dashboard" value="dashboard" view={view} setView={setView} />
            <DemoTab label="Profile" value="profile" view={view} setView={setView} />
            <DemoTab label="Workspaces" value="workspaces" view={view} setView={setView} />
            <DemoTab label="Org settings" value="org-settings" view={view} setView={setView} />
          </div>
        </div>
      </div>

      {/* Actual page content */}
      {view === 'dashboard' && <DashboardView />}
      {view === 'profile' && <ProfileView />}
      {view === 'workspaces' && <WorkspacesView />}
      {view === 'org-settings' && <OrgSettingsView />}
    </div>
  );
}
