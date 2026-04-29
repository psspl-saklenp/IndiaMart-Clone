'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/types/api';

interface ProtectedProps {
  children: React.ReactNode;
  /** If set, the user's role must be in this list. Otherwise we redirect home. */
  allow?: Role[];
  /** Where to send unauthenticated users. Defaults to /login. */
  redirectTo?: string;
}

export function Protected({ children, allow, redirectTo = '/login' }: ProtectedProps) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(redirectTo);
    } else if (status === 'authenticated' && allow && user && !allow.includes(user.role)) {
      router.replace('/');
    }
  }, [status, user, allow, router, redirectTo]);

  if (status === 'loading' || status === 'idle') {
    return <FullPageSpinner label="Checking your session…" />;
  }

  if (status !== 'authenticated' || !user) {
    return null;
  }

  if (allow && !allow.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-500">
      <div className="flex items-center gap-3">
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        {label}
      </div>
    </div>
  );
}
