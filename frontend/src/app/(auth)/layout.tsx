import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-ink-50">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink-900">
          indiamart-<span className="text-brand-600">clone</span>
        </Link>
        <Link href="/" className="text-xs text-ink-500 hover:text-ink-800">
          ← Back to site
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-ink-200 bg-white p-8 shadow-[var(--shadow-card)]">
          {children}
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} indiamart-clone. Built for learning.
      </footer>
    </div>
  );
}
