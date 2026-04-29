import { ProductForm } from '@/features/seller/product-form';

export const metadata = { title: 'New product' };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">List a new product</h1>
        <p className="mt-1 text-sm text-ink-500">
          Add product details and images. Images are uploaded directly to S3 (or the upload backend
          you have configured).
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
