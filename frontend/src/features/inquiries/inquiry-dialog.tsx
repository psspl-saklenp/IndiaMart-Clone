'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { createInquiry } from '@/features/inquiries/api';

interface Props {
  productId: string;
  productName: string;
  productUnit: string;
  sellerId: string;
  sellerName: string;
}

export function InquiryDialog({
  productId,
  productName,
  productUnit,
  sellerId,
  sellerName,
}: Props) {
  const router = useRouter();
  const { user, isAuthenticated, status } = useAuth();
  const [open, setOpen] = useState(false);

  const [subject, setSubject] = useState(`Quote for ${productName}`);
  const [message, setMessage] = useState(
    `Hi ${sellerName}, please share your best price and lead time for ${productName}. Thank you.`,
  );
  const [quantity, setQuantity] = useState('1');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isOwnProduct = isAuthenticated && user?.id === sellerId;
  const role = user?.role;

  // Reset reactively if the user logs in/out while the dialog is mounted.
  useEffect(() => {
    if (!isAuthenticated && open) setOpen(false);
  }, [isAuthenticated, open]);

  const mut = useMutation({
    mutationFn: createInquiry,
    onSuccess: (created) => {
      setOpen(false);
      router.push(`/me/inquiries/${created.id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Inquiry failed');
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    mut.mutate({
      sellerId,
      productId,
      subject: subject.trim(),
      message: message.trim(),
      quantity: Number(quantity) || undefined,
      unit: productUnit,
      ...(expectedPrice ? { expectedPrice: Number(expectedPrice) } : {}),
    });
  }

  // ---- Trigger button states ----
  if (status === 'idle' || status === 'loading') {
    return (
      <button
        type="button"
        disabled
        className="mt-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white opacity-60"
      >
        Loading…
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/product/${productId}`)}`}
        className="mt-4 block w-full rounded-md bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
      >
        Log in to send inquiry
      </Link>
    );
  }

  if (isOwnProduct) {
    return (
      <button
        type="button"
        disabled
        className="mt-4 w-full rounded-md bg-ink-200 px-4 py-2 text-sm font-medium text-ink-500"
        title="You can't send an inquiry on your own product"
      >
        Your product
      </button>
    );
  }

  if (role === 'admin') {
    return (
      <p className="mt-4 rounded-md border border-ink-200 bg-ink-50 px-3 py-2 text-xs text-ink-500">
        Admins can&apos;t place inquiries. Use a buyer account.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Send inquiry
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-500">Inquiry to</p>
                <h2 id="inquiry-title" className="text-lg font-semibold text-ink-900">
                  {sellerName}
                </h2>
                <p className="mt-1 text-xs text-ink-500">For: {productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-m-2 rounded p-2 text-ink-500 hover:bg-ink-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <Input
                name="subject"
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                minLength={3}
                maxLength={220}
              />
              <Textarea
                name="message"
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="quantity"
                  label={`Quantity (${productUnit})`}
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Input
                  name="expectedPrice"
                  label="Expected price ₹ (optional)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={mut.isPending}>
                  Send inquiry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
