import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Class-name helper. Use everywhere we need to conditionally apply Tailwind
 * classes; merges duplicates correctly (e.g. `p-2 p-4` -> `p-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
