'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useAppDispatch } from '@/store';
import { registerThunk } from '@/store/slices/auth.slice';
import { openSellerSignup } from '@/store/slices/ui.slice';
import type { RegisterPayload } from '@/types/auth';

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const cameFromSell = searchParams?.get('next') === 'sell';

  const { register, error, isLoading, isAuthenticated, reset } = useAuth();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => { reset(); };
  }, [reset]);

  const passwordIssue = useMemo(() => validatePassword(password), [password]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);

    if (passwordIssue) { setClientError(passwordIssue); return; }
    if (password !== confirm) { setClientError('Passwords do not match'); return; }
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) { setClientError('Phone number is required'); return; }
    if (trimmedPhone.length < 7) { setClientError('Phone number is too short'); return; }

    const payload: RegisterPayload = {
      email,
      password,
      name,
      role: 'buyer',
      phone: trimmedPhone,
      ...(companyName ? { companyName } : {}),
    };

    const result = await register(payload);
    if (registerThunk.fulfilled.match(result)) {
      router.replace('/');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 shadow-md">
          <svg viewBox="0 0 24 24" className="size-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your account</h1>
        <p className="text-sm text-ink-500">
          Discover suppliers and request quotes.{' '}
          <button
            type="button"
            onClick={() => dispatch(openSellerSignup())}
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Register as a seller →
          </button>
        </p>
      </div>

      {cameFromSell && (
        <div
          role="note"
          className="flex items-start gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"
        >
          <span className="text-base" aria-hidden>💡</span>
          <span>
            Create your buyer account first — once signed in, you can become a seller in one click from the{' '}
            <span className="font-semibold">Sell with us</span> button.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="name"
            label="Full name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            minLength={2}
            maxLength={120}
            leadingIcon={
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <circle cx="8" cy="5" r="3" />
                <path d="M2 14a6 6 0 0 1 12 0" />
              </svg>
            }
          />
          <Input
            name="companyName"
            label="Company name (optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            maxLength={180}
            leadingIcon={
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <rect x="2" y="4" width="12" height="10" rx="1" />
                <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
              </svg>
            }
          />
        </div>

        <Input
          name="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leadingIcon={
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <path d="M2 5l6 4 6-4" />
            </svg>
          }
        />

        <Input
          name="phone"
          label="Phone number"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          minLength={7}
          maxLength={20}
          leadingIcon={
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path d="M13.5 10.5l-2-2a1 1 0 0 0-1.4 0l-.6.6a8 8 0 0 1-3.1-3.1l.6-.6a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0L2.5 3a1 1 0 0 0 0 1.4 11 11 0 0 0 9.1 9.1 1 1 0 0 0 1.4 0l.5-.6a1 1 0 0 0 0-1.4z" />
            </svg>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="password"
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={128}
            hint="Min 8 chars with a letter and number."
            leadingIcon={
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <rect x="3" y="7" width="10" height="8" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            }
          />
          <Input
            name="confirm"
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            leadingIcon={
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path d="M13 6l-6 6-3-3" />
              </svg>
            }
          />
        </div>

        {(clientError || error) && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <svg viewBox="0 0 16 16" className="size-4 shrink-0 mt-0.5" fill="currentColor" aria-hidden>
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z"/>
            </svg>
            {clientError ?? error}
          </div>
        )}

        <Button type="submit" loading={isLoading} size="lg" className="w-full">
          Create free account
        </Button>

        <p className="text-center text-xs text-ink-500">
          By creating an account, you agree to our{' '}
          <Link href="#" className="font-medium text-brand-600 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="font-medium text-brand-600 hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-ink-500">Already have an account?</span>
        </div>
      </div>

      <Link href="/login">
        <Button variant="secondary" size="lg" className="w-full">
          Sign in instead
        </Button>
      </Link>
    </div>
  );
}

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (pw.length > 128) return 'Password must be at most 128 characters';
  if (!/[A-Za-z]/.test(pw)) return 'Password must contain at least one letter';
  if (!/\d/.test(pw)) return 'Password must contain at least one number';
  return null;
}
