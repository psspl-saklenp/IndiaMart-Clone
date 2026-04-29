import type { Metadata } from 'next';

import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Sign up as a buyer or seller on indiamart-clone.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
