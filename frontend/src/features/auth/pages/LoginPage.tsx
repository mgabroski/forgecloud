import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginResponse } from '@shared/api/client';
import { apiPost, ApiError, setAccessToken } from '@shared/api/client';
import { GoogleLoginButton } from '@features/auth/components/GoogleLoginButton';
import { useSession } from '@features/session/SessionProvider';

interface LoginEnvelope {
  success: boolean;
  data: LoginResponse | null;
  error: unknown | null;
}

function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useSession();

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
      const res = await apiPost<LoginEnvelope>('/auth/login', {
        email,
        password,
      });

      if (!res.success || !res.data) {
        throw new ApiError('Login failed.', { body: res });
      }

      // Only use what we actually need: the token
      setAccessToken(res.data.accessToken);

      // Sync global session state with backend
      await refresh();

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
    <div className="flex min-h-screen items-stretch justify-center bg-[radial-gradient(circle_at_top_left,#e5edff_0,#f5f7fb_40%,#f9fafb_100%)] px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
        {/* Left side – brand / pitch */}
        <div className="flex flex-1 flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-indigo-50 to-cyan-50 p-6 shadow-sm sm:p-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-medium text-slate-900">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live observability &amp; security workspace
            </div>

            <h1 className="mb-3 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Welcome to <span className="text-indigo-600">ForgeCloud</span>
            </h1>
            <p className="mb-6 max-w-md text-sm text-slate-600">
              Centralize your logs, metrics, and security signals. Detect incidents faster. Ship
              with confidence.
            </p>

            <ul className="space-y-2 text-sm text-slate-800">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs">
                  ✓
                </span>
                Unified view across services and environments
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs">
                  ✓
                </span>
                Security insights, SLOs, and cost monitoring in one place
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs">
                  ✓
                </span>
                Built for DevOps, SecOps, and engineering leaders
              </li>
            </ul>
          </div>

          <p className="mt-6 text-[11px] text-slate-500">
            Day 6 • Core bootstrapping · Authentication &amp; Frontend Shell
          </p>
        </div>

        {/* Right side – login card */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-1 mb-5 text-sm text-slate-600">
              Use your ForgeCloud account to access your workspaces.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-700">
                  Password
                </label>

                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 pr-16 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 rounded-full px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-default disabled:bg-indigo-400"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[11px] text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
