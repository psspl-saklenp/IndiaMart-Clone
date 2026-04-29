import { BackendStatus } from '@/components/system/backend-status';
import { Navbar } from '@/components/layout/navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col items-start justify-center gap-8 px-6 py-12">
        <header className="space-y-3">
          <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Phase 2 · Authentication ready
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            indiamart-clone
          </h1>
          <p className="max-w-2xl text-lg text-ink-600">
            JWT auth (access + refresh), role-based access for buyers / sellers / admin,
            password hashing, and the user model are live. Click <em>Sign up</em> top-right to
            try the registration flow.
          </p>
        </header>

        <BackendStatus />

        <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <PhaseCard phase="1" title="Bootstrap" status="done" />
          <PhaseCard phase="2" title="Authentication" status="done" />
          <PhaseCard phase="3" title="Catalog & uploads" status="next" />
          <PhaseCard phase="4" title="Public UI clone" status="planned" />
          <PhaseCard phase="5" title="Search" status="planned" />
          <PhaseCard phase="6" title="Inquiry system" status="planned" />
          <PhaseCard phase="7" title="Seller dashboard" status="planned" />
          <PhaseCard phase="8" title="Admin panel" status="planned" />
          <PhaseCard phase="9" title="Hardening" status="planned" />
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
    </>
  );
}

function PhaseCard({
  phase,
  title,
  status,
}: {
  phase: string;
  title: string;
  status: 'done' | 'next' | 'planned';
}) {
  const tone =
    status === 'done'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
      : status === 'next'
        ? 'border-brand-300 bg-brand-50 text-brand-800'
        : 'border-ink-200 bg-white text-ink-700';
  const statusLabel = status === 'done' ? 'Done' : status === 'next' ? 'Up next' : 'Planned';
  return (
    <div className={`rounded-lg border p-4 shadow-[var(--shadow-card)] ${tone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Phase {phase}</p>
      <p className="mt-1 text-lg font-semibold">{title}</p>
      <p className="mt-2 text-xs uppercase opacity-60">{statusLabel}</p>
    </div>
  );
}
