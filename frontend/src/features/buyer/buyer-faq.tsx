'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------------ */
/*                                FAQ data                                  */
/* ------------------------------------------------------------------------ */

type FaqCategory =
  | 'Buying'
  | 'Suppliers'
  | 'Account'
  | 'Payments'
  | 'Shipping'
  | 'Trust & Safety';

interface FaqItem {
  category: FaqCategory;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  // Buying ---------------------------------------------------------------
  {
    category: 'Buying',
    question: 'How do I post a requirement (RFQ)?',
    answer:
      'Click the orange "Post RFQ" button at the top of your dashboard or open Buyers Tool Kit → Post Your Requirement. Fill in the product name, quantity, and any specifications. Verified suppliers usually respond within 24 hours.',
  },
  {
    category: 'Buying',
    question: 'What is a BuyLead?',
    answer:
      'A BuyLead is a confirmed buying intent shared by a buyer. Sellers can review BuyLeads and respond directly with quotes, sparing buyers the work of pinging sellers individually.',
  },
  {
    category: 'Buying',
    question: 'How do I compare quotes from different suppliers?',
    answer:
      'When suppliers reply to your requirement, every quote shows up in Messages with the price, MOQ, and delivery time. You can star quotes you like and message the supplier directly from the same screen.',
  },
  {
    category: 'Buying',
    question: 'Can I edit or close a requirement after posting it?',
    answer:
      'Yes. Go to My Requirements, open the requirement, and use the "Close" action to stop receiving new quotes. Closed requirements remain visible for your records.',
  },

  // Suppliers ------------------------------------------------------------
  {
    category: 'Suppliers',
    question: 'How do I find verified suppliers?',
    answer:
      'Look for the green "Verified" badge on supplier profiles. Verified suppliers have completed business-document checks. You can also filter the search results by Verified Only.',
  },
  {
    category: 'Suppliers',
    question: 'How can I check a supplier\u2019s ratings?',
    answer:
      'Open any supplier profile. Their average rating, number of fulfilled orders, response time, and recent reviews are summarised at the top of the page.',
  },
  {
    category: 'Suppliers',
    question: 'How do I message a supplier directly?',
    answer:
      'On a product or supplier page, click "Send Inquiry". The supplier receives the message instantly and your conversation lives under Messages → Inquiries.',
  },

  // Account --------------------------------------------------------------
  {
    category: 'Account',
    question: 'How do I update my profile information?',
    answer:
      'Open the sidebar and click My Profile. Each tile (Primary Details, Address Details, Business Details) expands into an editable form. Changes save instantly.',
  },
  {
    category: 'Account',
    question: 'I forgot my password. What now?',
    answer:
      'On the login page, click "Forgot password" and follow the email link. If you do not receive the email within five minutes, check your spam folder or raise a support ticket.',
  },
  {
    category: 'Account',
    question: 'How do I delete my account?',
    answer:
      'Account deletion is permanent. Open My Profile → Account Settings → Delete Account, and confirm via the email we send you. Your inquiries and requirements will be anonymised after 30 days.',
  },

  // Payments -------------------------------------------------------------
  {
    category: 'Payments',
    question: 'How does Payment Protection work?',
    answer:
      'When you pay through Payment Protection, the funds are held in escrow until you confirm receipt of goods. If the order does not match the agreed terms, you can raise a dispute within 7 days for a full refund.',
  },
  {
    category: 'Payments',
    question: 'Which payment methods are accepted?',
    answer:
      'UPI, NEFT/RTGS bank transfer, all major credit and debit cards, and corporate net-banking. International buyers can pay via wire transfer.',
  },
  {
    category: 'Payments',
    question: 'Will I get a GST invoice?',
    answer:
      'Yes. Suppliers issue a GST-compliant invoice for every order. Make sure your business details (including GSTIN) are filled under My Profile → Business Details so the invoice is raised correctly.',
  },

  // Shipping -------------------------------------------------------------
  {
    category: 'Shipping',
    question: 'Where can I track my shipment?',
    answer:
      'Use the floating "Track Order" button on your dashboard, or open Messages → Inquiries → your order. The supplier updates the tracking link as soon as the consignment is dispatched.',
  },
  {
    category: 'Shipping',
    question: 'What does "Ship With IM" mean?',
    answer:
      'Ship With IM is our optional logistics layer that lets buyers and suppliers book courier and freight services at negotiated rates, without leaving the platform.',
  },

  // Trust & Safety -------------------------------------------------------
  {
    category: 'Trust & Safety',
    question: 'What is the TrustSEAL Buyer programme?',
    answer:
      'TrustSEAL Buyers complete a one-time identity and business-document check. The badge tells suppliers that you are a serious, verified buyer, which often results in priority responses.',
  },
  {
    category: 'Trust & Safety',
    question: 'How do I report a fraudulent supplier?',
    answer:
      'Open the supplier\u2019s profile, click the three-dot menu, and choose "Report supplier". Our trust team reviews every report within 48 hours and takes action where needed.',
  },
];

const ALL = 'All' as const;
const CATEGORIES: (typeof ALL | FaqCategory)[] = [
  ALL,
  'Buying',
  'Suppliers',
  'Account',
  'Payments',
  'Shipping',
  'Trust & Safety',
];

/* ------------------------------------------------------------------------ */
/*                              Component                                   */
/* ------------------------------------------------------------------------ */

export function BuyerFaq() {
  const [active, setActive] = useState<typeof ALL | FaqCategory>(ALL);
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((item) => {
      if (active !== ALL && item.category !== active) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
      );
    });
  }, [active, query]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="rounded-md border border-ink-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-ink-900">Frequently Asked Questions</h1>
            <p className="mt-1 text-xs text-ink-500">
              Quick answers to the things buyers ask most. Can&rsquo;t find what you&rsquo;re looking for?{' '}
              <Link
                href="/me/profile"
                className="font-medium text-[var(--color-im-teal-700)] hover:underline"
              >
                Raise a ticket
              </Link>
              .
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-2 rounded-full border border-ink-200 px-3 py-1 text-xs text-ink-500 sm:inline-flex">
            <IconBook /> {FAQS.length} articles
          </span>
        </div>

        {/* Search */}
        <div className="mt-4">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search questions, e.g. "payment protection"'
            aria-label="Search FAQs"
          />
        </div>

        {/* Category tabs */}
        <ul className="mt-4 -mb-1 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => setActive(cat)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-[var(--color-im-navy-700)] bg-[var(--color-im-navy-700)] text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-[var(--color-im-navy-300)] hover:text-[var(--color-im-navy-700)]',
                  )}
                >
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ul className="space-y-2">
          {visible.map((item, i) => (
            <FaqRow
              key={`${item.category}-${item.question}`}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                              Subcomponents                               */
/* ------------------------------------------------------------------------ */

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <article
        className={cn(
          'rounded-md border bg-white shadow-sm transition-colors',
          open ? 'border-[var(--color-im-navy-300)]' : 'border-ink-200',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-start gap-3 px-4 py-3 text-left"
        >
          <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-[var(--color-im-navy-50)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-im-navy-700)]">
            {item.category}
          </span>
          <span className="flex-1 text-sm font-medium text-ink-900">{item.question}</span>
          <IconChevron open={open} />
        </button>
        {open && (
          <div className="border-t border-ink-100 px-4 py-3 text-sm leading-relaxed text-ink-700">
            {item.answer}
          </div>
        )}
      </article>
    </li>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink-300 bg-white px-6 py-10 text-center">
      <p className="text-sm font-semibold text-ink-900">No matching answers</p>
      <p className="mt-1 text-xs text-ink-500">
        {query
          ? `Nothing matches "${query}". Try a different keyword or pick another category.`
          : 'There are no FAQs in this category yet.'}
      </p>
      <Link
        href="/me/profile"
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-im-teal-600)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-im-teal-700)]"
      >
        Raise a ticket instead
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/*                            Inline SVG icons                              */
/* ------------------------------------------------------------------------ */

function IconBook() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 0 0-4h14" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-4 shrink-0 text-ink-400 transition-transform', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
