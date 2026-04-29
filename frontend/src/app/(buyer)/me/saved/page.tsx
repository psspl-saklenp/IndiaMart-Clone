import { SavedList } from '@/features/saved/saved-list';

export const metadata = { title: 'Saved products' };

export default function SavedProductsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Saved products</h1>
        <p className="mt-1 text-sm text-ink-500">
          Products you tapped the heart on. Tap again to remove.
        </p>
      </div>
      <SavedList />
    </div>
  );
}
