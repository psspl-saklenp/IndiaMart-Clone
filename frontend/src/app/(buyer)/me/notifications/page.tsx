import { NotificationsList } from '@/features/notifications/components/notifications-list';

export const metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Notifications</h1>
        <p className="mt-1 text-sm text-ink-500">
          Stay on top of inquiries, messages, requirement matches, and reviews.
        </p>
      </div>
      <NotificationsList />
    </div>
  );
}
