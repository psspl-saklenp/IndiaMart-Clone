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

/**
 * Buyer-only signup form.
 *
 * Sellers go through the dedicated 3-step modal opened from the "Sell with
 * us" button in the header (or the "Sell on..." links in the footers). The
 * role toggle that used to live here was removed so the public /register
 * page captures only buyer accounts.
 */
export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  // When users click "Sell" without an account they're redirected here with
  // ?next=sell so we can explain why they need a buyer account first.
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
    return () => {
      reset();
    };
  }, [reset]);

  const passwordIssue = useMemo(() => validatePassword(password), [password]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setClientError(null);

    if (passwordIssue) {
      setClientError(passwordIssue);
      return;
    }
    if (password !== confirm) {
      setClientError('Passwords do not match');
      return;
    }

    const payload: RegisterPayload = {
      email,
      password,
      name,
      role: 'buyer',
      ...(phone ? { phone } : {}),
      ...(companyName ? { companyName } : {}),
    };

    const result = await register(payload);
    if (registerThunk.fulfilled.match(result)) {
      router.replace('/');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your buyer account</h1>
        <p className="text-sm text-ink-500">
          Discover suppliers and request quotes. Want to sell instead?{' '}
          <button
            type="button"
            onClick={() => dispatch(openSellerSignup())}
            className="font-medium text-brand-600 hover:underline"
          >
            Register as a seller
          </button>
          .
        </p>
      </div>

      {cameFromSell && (
        <div
          role="note"
          className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-800"
        >
          Create your buyer account first — once you’re signed in you can become a seller in
          one click from the <span className="font-medium">Sell with us</span> button.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          name="name"
          label="Full name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={120}
        />

        <Input
          name="companyName"
          label="Company name (optional)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          maxLength={180}
        />

        <Input
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          name="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
        />

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
          hint="Min 8 chars; must contain a letter and a number."
        />

        <Input
          name="confirm"
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {(clientError || error) && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {clientError ?? error}
          </div>
        )}

        <Button type="submit" loading={isLoading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-ink-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
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
