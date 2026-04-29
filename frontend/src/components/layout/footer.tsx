import Link from 'next/link';

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
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-base font-bold tracking-tight text-ink-900">
              indiamart-<span className="text-brand-600">clone</span>
            </Link>
            <p className="mt-2 text-xs text-ink-500">
              India&apos;s B2B marketplace, reimagined. Built as a Phase-by-Phase learning project.
            </p>
          </div>

          <FooterColumn
            title="Buyer help"
            links={[
              { label: 'Browse products', href: '/' },
              { label: 'Compare quotes', href: '/' },
              { label: 'How to buy', href: '/' },
            ]}
          />

          <FooterColumn
            title="For suppliers"
            links={[
              { label: 'Sell on indiamart-clone', href: '/register?role=seller' },
              { label: 'Seller dashboard', href: '/seller/products' },
              { label: 'Pricing', href: '/' },
            ]}
          />

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
              { label: 'About', href: '/' },
              { label: 'Careers', href: '/' },
              { label: 'Contact', href: '/' },
              { label: 'Privacy', href: '/' },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-4 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {CURRENT_YEAR} indiamart-clone. Educational replica; not affiliated with IndiaMART.</p>
          <p>Made for the AI Acceleration Month vibe-coding activity.</p>
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
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-700">{title}</h3>
      <ul className="mt-3 space-y-1.5 text-sm">
        {links.map((l) => (
          <li key={`${title}-${l.label}`}>
            <Link href={l.href} className="text-ink-500 hover:text-ink-900">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
