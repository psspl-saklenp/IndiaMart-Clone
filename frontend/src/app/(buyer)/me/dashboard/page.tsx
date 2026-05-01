import { BuyerDashboard } from '@/features/buyer/buyer-dashboard';
import { listCategoryTree } from '@/features/categories/api';
import type { Category } from '@/types/catalog';

export const metadata = { title: 'My dashboard' };

export default async function BuyerDashboardPage() {
  // Categories drive the "Categories You May Like" tile strip. The API is
  // public, so we can fetch on the server for first-paint. Falls back to an
  // empty list if the backend is unreachable so the rest of the dashboard
  // still renders.
  let categories: Category[] = [];
  try {
    categories = await listCategoryTree();
  } catch {
    categories = [];
  }

  return <BuyerDashboard categories={categories} />;
}
