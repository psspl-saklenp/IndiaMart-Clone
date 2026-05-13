'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
  hideCloseButton?: boolean;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  widthClassName = 'max-w-2xl',
  hideCloseButton = false,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    }
    document.addEventListener('keydown', handleKey);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/60 px-4 py-8 backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative my-auto w-full overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.45)] focus:outline-none animate-fade-in',
          widthClassName,
        )}
      >
        {(title || !hideCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-6 py-4">
            <div className="min-w-0 space-y-0.5">
              {title && (
                <h2 className="truncate text-lg font-bold text-ink-900">{title}</h2>
              )}
              {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex size-8 items-center justify-center rounded-xl text-ink-400 transition-all duration-150 hover:bg-ink-100 hover:text-ink-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </header>
        )}

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="border-t border-ink-100 bg-gradient-to-r from-ink-50 to-white px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
