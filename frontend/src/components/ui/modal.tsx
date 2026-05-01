'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Header title shown at the top-left of the modal. */
  title?: ReactNode;
  /** Optional helper text rendered below the title. */
  subtitle?: ReactNode;
  /** Additional sticky footer content (e.g. step navigation buttons). */
  footer?: ReactNode;
  /** Tailwind width class applied to the dialog. Defaults to a medium-large modal. */
  widthClassName?: string;
  /** When true, hides the default close button (e.g. for blocking flows). */
  hideCloseButton?: boolean;
  children: ReactNode;
}

/**
 * Lightweight modal primitive.
 *
 * Avoids the bundle cost of a full headless-ui dialog while still covering the
 * essentials: scroll lock on the body, click-outside-to-close, ESC-to-close,
 * and an explicit close button. Mounted unconditionally so consumers can keep
 * internal state across open/close cycles by toggling `open`.
 */
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

  // `onClose` is typically defined inline by the consumer, so its identity
  // changes on every render. Stash it in a ref so the setup effect below
  // can stay keyed only on `open` and not re-run (and steal focus) every
  // time the consumer re-renders while the user is typing.
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

    // Move initial focus to the dialog so screen readers announce it.
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/50 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        // Click on the backdrop (not bubbling from inside the dialog) closes the modal.
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative my-auto w-full overflow-hidden rounded-xl border border-ink-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)] focus:outline-none',
          widthClassName,
        )}
      >
        {(title || !hideCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-4">
            <div className="min-w-0 space-y-1">
              {title && (
                <h2 className="truncate text-lg font-semibold text-ink-900">{title}</h2>
              )}
              {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
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
          <footer className="border-t border-ink-100 bg-ink-50 px-6 py-3">{footer}</footer>
        )}
      </div>
    </div>
  );
}
