'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { registerThunk } from '@/store/slices/auth.slice';
import type { RegisterPayload, RegisterRole } from '@/types/auth';

const ROLE_LABEL: Record<RegisterRole, string> = {
  buyer: 'I want to buy',
  seller: 'I want to sell',
};

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get('role') as RegisterRole | null) ?? 'buyer';

  const { register, error, isLoading, isAuthenticated, reset } = useAuth();

  const [role, setRole] = useState<RegisterRole>(
    initialRole === 'seller' ? 'seller' : 'buyer',
  );
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
    return () => reset();
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
      role,
      ...(phone ? { phone } : {}),
      ...(role === 'seller' && companyName ? { companyName } : {}),
      ...(role === 'buyer' && companyName ? { companyName } : {}),
    };

    const result = await register(payload);
    if (registerThunk.fulfilled.match(result)) {
      router.replace('/');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Create your account</h1>
        <p className="text-sm text-ink-500">Join the marketplace as a buyer or seller.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-md border border-ink-200 bg-ink-50 p-1">
        {(Object.keys(ROLE_LABEL) as RegisterRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              role === r
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-ink-600 hover:text-ink-800'
            }`}
            aria-pressed={role === r}
          >
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>

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
          label={role === 'seller' ? 'Company name' : 'Company name (optional)'}
          required={role === 'seller'}
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
