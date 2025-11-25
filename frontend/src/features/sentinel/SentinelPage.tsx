import { useEffect, useState } from 'react';
import { apiGet } from '@shared/api/client';
import type { SentinelSource, SentinelLogEntry } from './types';

interface ApiListSourcesResponse {
  data: {
    sources: SentinelSource[];
  };
}

interface ApiListLogsResponse {
  data: {
    logs: SentinelLogEntry[];
    total: number;
    offset: number;
    limit: number;
  };
}

export function SentinelPage() {
  const [sources, setSources] = useState<SentinelSource[]>([]);
  const [logs, setLogs] = useState<SentinelLogEntry[]>([]);
  const [logsTotal, setLogsTotal] = useState<number | null>(null);

  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSources();
    void loadLogs();
  }, []);

  async function loadSources() {
    try {
      setLoadingSources(true);
      setError(null);

      const res = await apiGet<ApiListSourcesResponse>('/sentinel/sources');
      // backend envelope: { success, data: { sources }, error }
      const list = Array.isArray(res.data.sources) ? res.data.sources : [];
      setSources(list);
    } catch (err) {
      console.error('[Sentinel] Failed to load sources', err);
      setError('Failed to load Sentinel sources.');
    } finally {
      setLoadingSources(false);
    }
  }

  async function loadLogs() {
    try {
      setLoadingLogs(true);
      setError(null);

      const res = await apiGet<ApiListLogsResponse>('/sentinel/logs?offset=0&limit=50');
      const list = Array.isArray(res.data.logs) ? res.data.logs : [];

      setLogs(list);
      setLogsTotal(typeof res.data.total === 'number' ? res.data.total : list.length);
    } catch (err) {
      console.error('[Sentinel] Failed to load logs', err);
      setError('Failed to load Sentinel logs.');
    } finally {
      setLoadingLogs(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">Sentinel (Alpha)</h1>
        <p className="mt-1 text-sm text-slate-400">
          Early log &amp; source view for your active organization. Backend requests, audit events
          and demo services will appear here.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Sources card */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">Sources</h2>
            <p className="text-xs text-slate-400">
              All log sources for your active organization (internal + external).
            </p>
          </div>
        </div>

        <div className="px-4 py-3">
          {loadingSources ? (
            <p className="text-sm text-slate-400">Loading sources...</p>
          ) : sources.length === 0 ? (
            <p className="text-sm text-slate-400">
              No sources yet. Once backend / audit / demo producers emit logs, they will appear
              here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Name
                    </th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Type
                    </th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Environment
                    </th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((source) => (
                    <tr key={source.id} className="border-b border-slate-900 last:border-b-0">
                      <td className="px-3 py-2 text-slate-50">{source.name}</td>
                      <td className="px-3 py-2 text-xs uppercase text-slate-400">{source.type}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            source.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40'
                              : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700'
                          }`}
                        >
                          {source.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">
                        {source.environment ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {source.createdAt ? new Date(source.createdAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Recent logs card */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">Recent logs</h2>
            <p className="text-xs text-slate-400">
              Last 50 log entries for your active organization across all sources.
              {logsTotal !== null && (
                <span className="ml-2 text-[11px] text-slate-500">
                  Showing {logs.length} of {logsTotal} logs
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="px-4 py-3">
          {loadingLogs ? (
            <p className="text-sm text-slate-400">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-slate-400">
              No logs yet. Try making some API requests or running the demo payment producer script.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Timestamp
                    </th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Level
                    </th>
                    <th className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-900 last:border-b-0">
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            log.level === 'error'
                              ? 'bg-red-500/10 text-red-300 ring-1 ring-red-500/40'
                              : log.level === 'warn'
                                ? 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/40'
                                : 'bg-slate-800 text-slate-200 ring-1 ring-slate-700'
                          }`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-50">
                        <span className="line-clamp-2">{log.message}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
