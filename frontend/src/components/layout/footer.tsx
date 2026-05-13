import Link from 'next/link';

import { SellerSignupTrigger } from '@/features/auth/seller-signup-trigger';
import { listCategoryTree } from '@/features/categories/api';

const CURRENT_YEAR = new Date().getFullYear();

export async function Footer() {
  let topCategories: { name: string; slug: string }[] = [];
  try {
    const tree = await listCategoryTree();
    topCategories = tree.slice(0, 6).map((c) => ({ name: c.name, slug: c.slug }));
  } catch {
    // Backend down at render time; silently degrade.
  }

  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700">
        <div className="mx-auto max-w-[96rem] px-4 py-10">
          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="text-xl font-bold text-white">Ready to grow your business?</h3>
              <p className="mt-1 text-sm text-brand-100">
                Join thousands of verified suppliers on India's B2B marketplace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SellerSignupTrigger className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-md hover:bg-brand-50 transition-all duration-150 hover:shadow-lg">
                🏪 Start selling
              </SellerSignupTrigger>
              <Link
                href="/requirements/new"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-150"
              >
                📋 Post a requirement
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-[96rem] px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-sm font-extrabold text-white shadow-sm">
                iC
              </span>
              <span className="text-base font-bold tracking-tight text-ink-900">
                indiamart-<span className="text-brand-600">clone</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              India&apos;s B2B marketplace, reimagined. Connecting buyers with verified suppliers across all industries.
            </p>
            {/* Social links */}
            <div className="mt-4 flex gap-2">
              {['𝕏', 'in', 'f', 'yt'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex size-8 items-center justify-center rounded-lg border border-ink-200 text-xs font-bold text-ink-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all duration-150"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title="For buyers"
            links={[
              { label: 'Browse products', href: '/' },
              { label: 'Post a requirement', href: '/requirements/new' },
              { label: 'Compare quotes', href: '/' },
              { label: 'How to buy', href: '/' },
              { label: 'Buyer protection', href: '/' },
            ]}
          />

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink-700">
              For suppliers
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <SellerSignupTrigger className="text-ink-500 hover:text-brand-700 transition-colors">
                  Sell on indiamart-clone
                </SellerSignupTrigger>
              </li>
              <li>
                <Link href="/seller/products" className="text-ink-500 hover:text-brand-700 transition-colors">
                  Seller dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="text-ink-500 hover:text-brand-700 transition-colors">
                  Pricing plans
                </Link>
              </li>
              <li>
                <Link href="/" className="text-ink-500 hover:text-brand-700 transition-colors">
                  Seller resources
                </Link>
              </li>
            </ul>
          </div>

          <FooterColumn
            title="Top categories"
            links={topCategories.map((c) => ({
              label: c.name,
              href: `/category/${c.slug}`,
            }))}
          />

          <FooterColumn
            title="Company"
            links={[
              { label: 'About us', href: '/' },
              { label: 'Careers', href: '/' },
              { label: 'Press', href: '/' },
              { label: 'Contact', href: '/' },
              { label: 'Privacy policy', href: '/' },
              { label: 'Terms of service', href: '/' },
            ]}
          />
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-ink-100 pt-8">
          {[
            { icon: '🔒', label: 'Secure payments' },
            { icon: '✅', label: 'Verified suppliers' },
            { icon: '🚀', label: 'Fast delivery' },
            { icon: '🛡️', label: 'Buyer protection' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-xs text-ink-500">
              <span className="text-base">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-[96rem] flex-col items-start gap-2 px-4 py-4 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} indiamart-clone. Educational replica; not affiliated with IndiaMART.</p>
          <p className="text-ink-400">Built for the AI Acceleration Month vibe-coding activity.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink-700">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link href={l.href} className="text-ink-500 hover:text-brand-700 transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
