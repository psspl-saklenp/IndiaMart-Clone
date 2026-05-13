import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #176a6d 100%)' }}
      >
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-base font-extrabold text-white ring-2 ring-white/20">
              iC
            </span>
            <span className="text-xl font-bold tracking-tight">
              indiamart-<span className="text-yellow-300">clone</span>
            </span>
          </Link>

          <div className="mt-16">
            <h1 className="text-4xl font-bold leading-tight">
              India's B2B marketplace,{' '}
              <span className="text-yellow-300">reimagined.</span>
            </h1>
            <p className="mt-4 text-lg text-white/70 leading-relaxed">
              Connect with verified suppliers, discover products, and grow your business with confidence.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-12 space-y-4">
            {[
              { icon: '✅', title: 'Verified suppliers', desc: 'Every supplier is vetted and verified' },
              { icon: '💬', title: 'Direct inquiries', desc: 'Connect directly with manufacturers' },
              { icon: '🔒', title: 'Secure platform', desc: 'Your data is always protected' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  {f.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
          {[
            { value: '10K+', label: 'Suppliers' },
            { value: '50K+', label: 'Products' },
            { value: '1M+', label: 'Buyers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-yellow-300">{stat.value}</p>
              <p className="text-xs text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col bg-ink-50">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-6 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-sm font-extrabold text-white">
              iC
            </span>
            <span className="text-base font-bold tracking-tight text-ink-900">
              indiamart-<span className="text-brand-600">clone</span>
            </span>
          </Link>
          <Link href="/" className="text-xs font-medium text-ink-500 hover:text-ink-800 transition-colors">
            ← Back to site
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 lg:py-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-[var(--shadow-pop)]">
              {children}
            </div>

            {/* Back link for desktop */}
            <div className="mt-4 text-center lg:block hidden">
              <Link href="/" className="text-xs text-ink-500 hover:text-ink-800 transition-colors">
                ← Back to site
              </Link>
            </div>
          </div>
        </main>

        <footer className="px-6 py-4 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} indiamart-clone. Built for learning.
        </footer>
      </div>
    </div>
  );
}
