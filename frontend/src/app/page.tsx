import { BackendStatus } from '@/components/system/backend-status';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-start justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Phase 1 · Bootstrap complete
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          indiamart-clone
        </h1>
        <p className="max-w-2xl text-lg text-ink-600">
          A production-quality B2B marketplace web portal. The monorepo, Next.js 15 frontend,
          NestJS backend, PostgreSQL, and CI are wired up. Real features ship in subsequent
          phases.
        </p>
      </header>

      <BackendStatus />

      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <PhaseCard phase="2" title="Authentication" status="next" />
        <PhaseCard phase="3" title="Catalog & uploads" status="planned" />
        <PhaseCard phase="4" title="Public UI clone" status="planned" />
        <PhaseCard phase="5" title="Search" status="planned" />
        <PhaseCard phase="6" title="Inquiry system" status="planned" />
        <PhaseCard phase="7-9" title="Dashboards, admin, hardening" status="planned" />
      </section>

      <footer className="text-sm text-ink-500">
        <p>
          Backend Swagger UI runs at{' '}
          <a
            className="text-brand-600 underline"
            href="http://localhost:3001/api/docs"
            target="_blank"
            rel="noreferrer noopener"
          >
            http://localhost:3001/api/docs
          </a>{' '}
          when the backend is up.
        </p>
      </footer>
    </main>
  );
}

function PhaseCard({
  phase,
  title,
  status,
}: {
  phase: string;
  title: string;
  status: 'next' | 'planned';
}) {
  const tone =
    status === 'next'
      ? 'border-brand-300 bg-brand-50 text-brand-800'
      : 'border-ink-200 bg-white text-ink-700';
  return (
    <div className={`rounded-lg border p-4 shadow-[var(--shadow-card)] ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Phase {phase}</p>
      <p className="mt-1 text-lg font-semibold">{title}</p>
      <p className="mt-2 text-xs uppercase opacity-60">
        {status === 'next' ? 'Up next' : 'Planned'}
      </p>
    </div>
  );
}
