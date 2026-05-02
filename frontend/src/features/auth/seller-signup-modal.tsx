'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listCategoryTree } from '@/features/categories/api';
import { useAuth } from '@/hooks/use-auth';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError, upgradeToSellerThunk } from '@/store/slices/auth.slice';
import { closeSellerSignup } from '@/store/slices/ui.slice';
import type { Category, StockStatus } from '@/types/catalog';
import type { SellerSignupProduct, UpgradeToSellerPayload } from '@/types/auth';

const STEP_LABELS = ['Business & verification', 'Catalog'] as const;

const STOCK_OPTIONS: { value: StockStatus; label: string }[] = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'made_to_order', label: 'Made to order' },
];

interface ProductDraft {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  unit: string;
  minOrderQty: string;
  stockStatus: StockStatus;
}

interface FormState {
  // Step 1 — business & verification
  city: string;
  pincode: string;
  panNumber: string;
  gstNumber: string;
  // Step 2 — catalog (single fully-detailed product)
  product: ProductDraft;
}

const INITIAL_PRODUCT: ProductDraft = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  unit: 'piece',
  minOrderQty: '1',
  stockStatus: 'in_stock',
};

const INITIAL_STATE: FormState = {
  city: '',
  pincode: '',
  panNumber: '',
  gstNumber: '',
  product: { ...INITIAL_PRODUCT },
};

/**
 * Two-step seller upgrade wizard rendered as a modal.
 *
 * The modal assumes the user is already authenticated as a buyer — new
 * visitors are funnelled through the public buyer signup first (see
 * `useSellAction`). Existing sellers/admins skip the modal entirely.
 *
 * Step 1 collects only the four business/verification fields the user
 * asked for (`city`, `pincode`, `panNumber`, `gstNumber`); step 2 collects
 * one fully-detailed product (name, description, price, MOQ, unit, stock
 * status, optional specs) so the seller's first listing is publish-ready.
 */
export function SellerSignupModal() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.isSellerSignupOpen);
  const authStatus = useAppSelector((s) => s.auth.status);
  const authError = useAppSelector((s) => s.auth.error);
  const { user, isAuthenticated } = useAuth();
  const isSubmitting = authStatus === 'loading';

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [stepError, setStepError] = useState<string | null>(null);

  // Reset wizard state every time the modal opens. This guarantees a clean
  // slate even if a previous attempt errored mid-flow.
  useEffect(() => {
    if (open) {
      setStep(0);
      setForm({ ...INITIAL_STATE, product: { ...INITIAL_PRODUCT } });
      setStepError(null);
      dispatch(clearError());
    }
  }, [open, dispatch]);

  // Defensive guards: this modal only makes sense for an authenticated
  // buyer. If something opens it for the wrong viewer (e.g. a stale tab,
  // a deep link, or a state-restore), close it cleanly. We deliberately do
  // NOT call `router.replace` here — it used to race with the buyer-area
  // Protected redirect during the role flip, which produced a flashing
  // screen when the user upgraded. The shared `useSellAction` hook handles
  // routing for non-buyer viewers.
  useEffect(() => {
    if (!open) return;
    if (!isAuthenticated || !user || user.role !== 'buyer') {
      dispatch(closeSellerSignup());
    }
  }, [open, isAuthenticated, user, dispatch]);

  const { data: categoryTree } = useQuery<Category[]>({
    queryKey: ['categories', 'tree'],
    queryFn: listCategoryTree,
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const flatCategories = useMemo(
    () => flattenTree(categoryTree ?? []),
    [categoryTree],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateProduct<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setForm((prev) => ({ ...prev, product: { ...prev.product, [key]: value } }));
  }

  function handleClose() {
    if (isSubmitting) return;
    dispatch(closeSellerSignup());
  }

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (form.pincode && !/^\d{4,8}$/.test(form.pincode)) {
        return 'Pin-code must be 4-8 digits';
      }
      if (form.panNumber && !/^[A-Z0-9]{8,16}$/i.test(form.panNumber.trim())) {
        return 'PAN number looks invalid';
      }
      if (form.gstNumber && form.gstNumber.trim().length < 5) {
        return 'GST number looks too short';
      }
      return null;
    }

    if (currentStep === 1) {
      const p = form.product;
      if (p.name.trim().length < 3) {
        return 'Product name must be at least 3 characters';
      }
      if (p.description.trim().length < 3) {
        return 'Please add a product description';
      }
      const priceNum = Number(p.price);
      if (!p.price || Number.isNaN(priceNum) || priceNum < 0) {
        return 'Please enter a valid price (0 or more)';
      }
      const moqNum = Number(p.minOrderQty);
      if (!Number.isInteger(moqNum) || moqNum < 1) {
        return 'Minimum order quantity must be a whole number ≥ 1';
      }
      if (!p.unit.trim()) {
        return 'Please specify a unit (e.g. piece, kg, meter)';
      }
      return null;
    }

    return null;
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function handleBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const err = validateStep(1);
    if (err) {
      setStepError(err);
      return;
    }

    const p = form.product;

    const product: SellerSignupProduct = {
      name: p.name.trim(),
      description: p.description.trim(),
      price: Number(p.price),
      unit: p.unit.trim() || 'piece',
      minOrderQty: Number(p.minOrderQty),
      stockStatus: p.stockStatus,
      ...(p.categoryId ? { categoryId: p.categoryId } : {}),
    };

    const payload: UpgradeToSellerPayload = {
      ...(form.city.trim() ? { city: form.city.trim() } : {}),
      ...(form.pincode.trim() ? { pincode: form.pincode.trim() } : {}),
      ...(form.panNumber.trim() ? { panNumber: form.panNumber.trim().toUpperCase() } : {}),
      ...(form.gstNumber.trim() ? { gstNumber: form.gstNumber.trim().toUpperCase() } : {}),
      products: [product],
    };

    const result = await dispatch(upgradeToSellerThunk(payload));
    if (upgradeToSellerThunk.fulfilled.match(result)) {
      // Just close the modal — the user keeps browsing as a buyer. The
      // "Sell" button now routes them to /seller/dashboard whenever they
      // want to enter the seller area (handled by `useSellAction`).
      dispatch(closeSellerSignup());
    }
  }

  const stepProgress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Become a seller"
      subtitle="Just two quick steps — share your business details, then add your first product to seed your catalog."
      widthClassName="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-ink-500">
            Step {step + 1} of {STEP_LABELS.length}
          </span>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            {step < STEP_LABELS.length - 1 ? (
              <Button type="button" size="sm" onClick={handleNext} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                form="seller-signup-form"
                size="sm"
                loading={isSubmitting}
              >
                Register as seller
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Step indicator */}
      <div className="mb-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-ink-600">
          {STEP_LABELS.map((label, idx) => (
            <span
              key={label}
              className={
                idx === step
                  ? 'text-brand-700'
                  : idx < step
                    ? 'text-ink-700'
                    : 'text-ink-400'
              }
            >
              {idx + 1}. {label}
            </span>
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      <form id="seller-signup-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="city"
              label="City"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              maxLength={120}
              placeholder="Mumbai"
            />
            <Input
              name="pincode"
              label="Pin-code"
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              inputMode="numeric"
              maxLength={12}
              hint="4-8 digit postal code"
              placeholder="400001"
            />
            <Input
              name="panNumber"
              label="PAN Card"
              value={form.panNumber}
              onChange={(e) => update('panNumber', e.target.value.toUpperCase())}
              maxLength={16}
              placeholder="ABCDE1234F"
              hint="Optional. 10-character PAN."
            />
            <Input
              name="gstNumber"
              label="GST Number"
              value={form.gstNumber}
              onChange={(e) => update('gstNumber', e.target.value.toUpperCase())}
              maxLength={32}
              placeholder="27ABCDE1234F1Z5"
              hint="Optional. You can add this later from your seller profile."
            />
            <p className="text-xs text-ink-500 sm:col-span-2">
              All fields are optional but recommended — they help buyers trust your listings
              and unlock GST-ready quotes. They are never displayed publicly without your
              consent.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-ink-500">
              Add your first product with full details. You can add more products from the
              seller dashboard once you&apos;re registered.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  name="product-name"
                  label="Product name"
                  required
                  value={form.product.name}
                  onChange={(e) => updateProduct('name', e.target.value)}
                  minLength={3}
                  maxLength={220}
                  placeholder="Industrial Ball Bearing 6203"
                />
              </div>
              <Select
                name="product-categoryId"
                label="Category"
                value={form.product.categoryId}
                onChange={(e) => updateProduct('categoryId', e.target.value)}
                placeholder="Choose a category (optional — defaults to General)"
                options={flatCategories.map((c) => ({ value: c.id, label: c.label }))}
              />
              <Select
                name="product-stockStatus"
                label="Stock status"
                value={form.product.stockStatus}
                onChange={(e) => updateProduct('stockStatus', e.target.value as StockStatus)}
                options={STOCK_OPTIONS}
              />
              <Input
                name="product-price"
                label="Price (₹)"
                type="number"
                step="0.01"
                min={0}
                required
                value={form.product.price}
                onChange={(e) => updateProduct('price', e.target.value)}
                placeholder="250"
              />
              <Input
                name="product-unit"
                label="Unit"
                required
                value={form.product.unit}
                onChange={(e) => updateProduct('unit', e.target.value)}
                hint="e.g. piece, kg, meter, dozen"
              />
              <Input
                name="product-minOrderQty"
                label="Min. order qty"
                type="number"
                min={1}
                required
                value={form.product.minOrderQty}
                onChange={(e) => updateProduct('minOrderQty', e.target.value)}
              />
              <div className="sm:col-span-2">
                <Textarea
                  name="product-description"
                  label="Description"
                  required
                  value={form.product.description}
                  onChange={(e) => updateProduct('description', e.target.value)}
                  rows={4}
                  placeholder="Describe materials, dimensions, certifications, intended use…"
                />
              </div>
            </div>
          </div>
        )}

        {(stepError || authError) && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {stepError ?? authError}
          </div>
        )}
      </form>
    </Modal>
  );
}

interface FlatCategory {
  id: string;
  label: string;
}

/** Flattens the nested category tree into a `parent / child` label list. */
function flattenTree(tree: Category[], prefix = ''): FlatCategory[] {
  const out: FlatCategory[] = [];
  for (const cat of tree) {
    const label = prefix ? `${prefix} / ${cat.name}` : cat.name;
    out.push({ id: cat.id, label });
    if (cat.children && cat.children.length > 0) {
      out.push(...flattenTree(cat.children, label));
    }
  }
  return out;
}
