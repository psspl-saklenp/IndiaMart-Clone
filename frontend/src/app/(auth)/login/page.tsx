import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in to your indiamart-clone account.',
};

export default function LoginPage() {
  // Suspense boundary required because LoginForm uses useSearchParams
  // which Next.js 15 forces to opt into client-side rendering.
  return (
    <Suspense fallback={<div className="text-sm text-ink-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
