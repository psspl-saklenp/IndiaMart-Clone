import type { Metadata } from 'next';

import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Sign in to your indiamart-clone account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
