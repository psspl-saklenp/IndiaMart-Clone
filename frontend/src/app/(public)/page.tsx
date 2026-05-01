import { redirect } from 'next/navigation';

/**
 * Root entry point.
 *
 * The buyer dashboard is treated as the primary landing experience for this
 * project: visiting `/` always forwards to `/me/dashboard`. Logged-out users
 * are then bounced to `/login` by the `Protected` guard inside the buyer
 * layout; after a successful login they are redirected back to `/`, which
 * lands them on the dashboard.
 *
 * The previous marketing homepage is no longer rendered. Re-introduce it at
 * a dedicated path (e.g. `/welcome`) if you need it again.
 */
export default function HomePage() {
  redirect('/me/dashboard');
}
