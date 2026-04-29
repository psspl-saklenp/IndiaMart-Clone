import { ProductEditLoader } from '@/features/seller/product-edit-loader';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Edit product</h1>
      </div>
      <ProductEditLoader id={id} />
    </div>
  );
}
