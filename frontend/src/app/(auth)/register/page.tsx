import type { Metadata } from 'next';
import { Suspense } from 'react';

import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Sign up as a buyer or seller on indiamart-clone.',
};

export default function RegisterPage() {
  // Suspense boundary required because RegisterForm uses useSearchParams
  // which Next.js 15 forces to opt into client-side rendering.
  return (
    <Suspense fallback={<div className="text-sm text-ink-500">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
