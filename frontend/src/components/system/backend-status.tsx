'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/axios';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
}

/**
 * Pings the backend `/health` endpoint to verify FE↔BE wiring.
 * Used in Phase 1 only as a smoke-test surface; remove or repurpose later.
 */
export function BackendStatus() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<HealthResponse>({
    queryKey: ['backend-health'],
    queryFn: async () => {
      const res = await api.get<HealthResponse>('/health');
      return res.data;
    },
    refetchInterval: 30_000,
    retry: 1,
  });

  return (
    <div className="w-full rounded-lg border border-ink-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink-900">Backend status</h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-md border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
        >
          {isFetching ? 'Pinging…' : 'Refresh'}
        </button>
      </div>

      <div className="mt-3 text-sm">
        {isLoading && <span className="text-ink-500">Connecting to backend…</span>}

        {isError && (
          <div className="space-y-1">
            <p className="font-medium text-red-600">Backend unreachable.</p>
            <p className="text-xs text-ink-500">
              Is it running? Try <code className="rounded bg-ink-100 px-1">npm run dev:backend</code>.
            </p>
            <p className="text-xs text-ink-400">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {data && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            <Field label="Status" value={data.status} highlight={data.status === 'ok'} />
            <Field label="Service" value={data.service} />
            <Field label="Version" value={data.version} />
            <Field label="Uptime" value={`${data.uptimeSeconds}s`} />
          </dl>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-ink-400">{label}</dt>
      <dd
        className={`font-medium ${highlight ? 'text-emerald-600' : 'text-ink-700'}`}
      >
        {value}
      </dd>
    </div>
  );
}
