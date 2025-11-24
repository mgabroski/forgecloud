// frontend/src/features/projects/ProjectsPage.tsx
import { useEffect, useState, type FormEvent } from 'react';
import { apiGet, apiPost, ApiError } from '@shared/api/client';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ProjectVisibility = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string; // mapped from project_key
  description: string | null;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  createdByUserId: string;
  lastUpdatedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

type VisibilityOption = ProjectVisibility;

const VISIBILITY_OPTIONS: VisibilityOption[] = ['PRIVATE', 'INTERNAL', 'PUBLIC'];

interface GetProjectsResponse {
  data: {
    projects: Project[];
  };
}

interface CreateProjectResponse {
  data: Project;
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<VisibilityOption>('PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiGet<GetProjectsResponse>('/projects');
        if (!isMounted) return;
        setProjects(res.data.projects);
      } catch (err: unknown) {
        if (!isMounted) return;

        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load projects.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedKey = key.trim();

    if (!trimmedName || !trimmedKey) {
      setFormError('Name and key are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost<CreateProjectResponse>('/projects', {
        name: trimmedName,
        key: trimmedKey,
        description: description.trim() || undefined,
        visibility,
      });

      const created = res.data;
      setProjects((prev) => [created, ...prev]);
      setName('');
      setKey('');
      setDescription('');
      setVisibility('PRIVATE');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
      } else {
        setFormError('Failed to create project.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Projects</h1>
          <p className="text-sm text-slate-400">Projects for your active organization.</p>
        </div>
        <div className="text-sm text-slate-400">
          Projects: <span className="font-medium text-slate-50">{projects.length}</span>
        </div>
      </header>

      {/* Create project */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-slate-50">Create new project</h2>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-200" htmlFor="project-name">
              Name
            </label>
            <input
              id="project-name"
              type="text"
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Core Platform"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-200" htmlFor="project-key">
              Key
            </label>
            <input
              id="project-key"
              type="text"
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm uppercase tracking-wide text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="CORE"
            />
            <p className="text-[11px] text-slate-500">
              Short code used in URLs and references. Must be unique within the organization.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-200" htmlFor="project-description">
              Description (optional)
            </label>
            <textarea
              id="project-description"
              className="min-h-[60px] rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the project."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-200" htmlFor="project-visibility">
              Visibility
            </label>
            <select
              id="project-visibility"
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as VisibilityOption)}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {formError && (
            <p className="text-sm text-rose-400" role="alert">
              {formError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </section>

      {/* Projects list */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-slate-50">Existing projects</h2>

        {isLoading ? (
          <p className="text-sm text-slate-400">Loading projects…</p>
        ) : error ? (
          <p className="text-sm text-rose-400">{error}</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-400">No projects yet. Create your first one above.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono rounded-md bg-slate-800 px-1.5 py-0.5 text-slate-200">
                      {project.key}
                    </span>
                    <span className="text-sm font-medium text-slate-50">{project.name}</span>
                  </div>
                  {project.description && (
                    <p className="mt-0.5 text-xs text-slate-400">{project.description}</p>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {project.visibility} · {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
