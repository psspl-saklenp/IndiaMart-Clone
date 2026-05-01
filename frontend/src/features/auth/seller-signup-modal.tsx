'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { listCategoryTree } from '@/features/categories/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearError, registerSellerThunk } from '@/store/slices/auth.slice';
import { closeSellerSignup } from '@/store/slices/ui.slice';
import type { Category } from '@/types/catalog';
import type { RegisterSellerPayload, SellerSignupProduct } from '@/types/auth';

const STEP_LABELS = [
  'Basic account setup',
  'Business & verification details',
  'Catalog / product information',
] as const;

const MIN_PRODUCTS = 3;

interface FormState {
  // Step 1
  phone: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  city: string;
  pincode: string;
  // Step 2
  gstNumber: string;
  panNumber: string;
  // Step 3
  categoryId: string;
  productNames: string[];
}

const INITIAL_STATE: FormState = {
  phone: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  city: '',
  pincode: '',
  gstNumber: '',
  panNumber: '',
  categoryId: '',
  productNames: ['', '', ''],
};

/**
 * Three-step seller registration wizard rendered as a modal. The modal is
 * mounted globally (see `Providers`) and opened by dispatching
 * `openSellerSignup` from anywhere (navbar, footers, etc.).
 */
export function SellerSignupModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const open = useAppSelector((s) => s.ui.isSellerSignupOpen);
  const authStatus = useAppSelector((s) => s.auth.status);
  const authError = useAppSelector((s) => s.auth.error);
  const isSubmitting = authStatus === 'loading';

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [stepError, setStepError] = useState<string | null>(null);

  // Reset wizard state every time the modal opens. This guarantees a clean
  // slate even if a previous attempt errored mid-flow.
  useEffect(() => {
    if (open) {
      setStep(0);
      setForm(INITIAL_STATE);
      setStepError(null);
      dispatch(clearError());
    }
  }, [open, dispatch]);

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

  const filledProductCount = form.productNames.filter((n) => n.trim().length >= 3).length;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateProduct(index: number, value: string) {
    setForm((prev) => {
      const next = [...prev.productNames];
      next[index] = value;
      return { ...prev, productNames: next };
    });
  }

  function addProduct() {
    setForm((prev) => ({ ...prev, productNames: [...prev.productNames, ''] }));
  }

  function removeProduct(index: number) {
    setForm((prev) => {
      if (prev.productNames.length <= MIN_PRODUCTS) return prev;
      const next = prev.productNames.filter((_, i) => i !== index);
      return { ...prev, productNames: next };
    });
  }

  function handleClose() {
    if (isSubmitting) return;
    dispatch(closeSellerSignup());
  }

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 7) {
        return 'Please enter a valid mobile number';
      }
      if (form.name.trim().length < 2) return 'Please enter your full name';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email';
      if (form.password.length < 8) return 'Password must be at least 8 characters';
      if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
        return 'Password must contain at least one letter and one number';
      }
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
      if (form.companyName.trim().length < 2) return 'Please enter your company name';
      if (form.pincode && !/^\d{4,8}$/.test(form.pincode)) {
        return 'Pin-code must be 4-8 digits';
      }
      return null;
    }

    if (currentStep === 1) {
      if (form.gstNumber && form.gstNumber.trim().length < 5) {
        return 'GST number looks too short';
      }
      if (form.panNumber && !/^[A-Z0-9]{8,16}$/i.test(form.panNumber.trim())) {
        return 'PAN number looks invalid';
      }
      return null;
    }

    if (currentStep === 2) {
      if (filledProductCount < MIN_PRODUCTS) {
        return `Please add at least ${MIN_PRODUCTS} product names (3+ chars each)`;
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
    const err = validateStep(2);
    if (err) {
      setStepError(err);
      return;
    }

    const products: SellerSignupProduct[] = form.productNames
      .map((n) => n.trim())
      .filter((n) => n.length >= 3)
      .map((n) => ({
        name: n,
        ...(form.categoryId ? { categoryId: form.categoryId } : {}),
      }));

    const payload: RegisterSellerPayload = {
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
      phone: form.phone.trim(),
      companyName: form.companyName.trim(),
      ...(form.city.trim() ? { city: form.city.trim() } : {}),
      ...(form.pincode.trim() ? { pincode: form.pincode.trim() } : {}),
      ...(form.gstNumber.trim() ? { gstNumber: form.gstNumber.trim() } : {}),
      ...(form.panNumber.trim() ? { panNumber: form.panNumber.trim().toUpperCase() } : {}),
      products,
    };

    const result = await dispatch(registerSellerThunk(payload));
    if (registerSellerThunk.fulfilled.match(result)) {
      dispatch(closeSellerSignup());
      router.replace('/seller/dashboard');
    }
  }

  const stepProgress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Become a seller"
      subtitle="Tell us about your business in three quick steps. You can polish details later."
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
              name="phone"
              label="Mobile number"
              type="tel"
              autoComplete="tel"
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+91 98765 43210"
              maxLength={20}
            />
            <Input
              name="name"
              label="Your full name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              minLength={2}
              maxLength={120}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
              className="sm:col-span-2"
            />
            <Input
              name="password"
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              minLength={8}
              maxLength={128}
              hint="Min 8 chars; must contain a letter and a number."
            />
            <Input
              name="confirmPassword"
              label="Confirm password"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
            />
            <Input
              name="companyName"
              label="Company name"
              required
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              maxLength={180}
              className="sm:col-span-2"
            />
            <Input
              name="city"
              label="City"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              maxLength={120}
            />
            <Input
              name="pincode"
              label="Pin-code"
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              inputMode="numeric"
              maxLength={12}
              hint="4-8 digit postal code"
            />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="gstNumber"
              label="GST Number"
              value={form.gstNumber}
              onChange={(e) => update('gstNumber', e.target.value.toUpperCase())}
              maxLength={32}
              placeholder="27ABCDE1234F1Z5"
              hint="Optional. You can add this later from your seller profile."
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
            <p className="text-xs text-ink-500 sm:col-span-2">
              These details help buyers trust your listings. They are never displayed
              publicly without your consent.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Select
              name="categoryId"
              label="Default product category"
              hint="Applied to every product below. You can change individual categories later."
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              placeholder="Choose a category (optional — defaults to General)"
              options={flatCategories.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs font-medium text-ink-700">
                  Product names ({filledProductCount}/{form.productNames.length})
                </label>
                <span className="text-[11px] text-ink-500">
                  Minimum {MIN_PRODUCTS} products required
                </span>
              </div>
              <div className="space-y-2">
                {form.productNames.map((value, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      name={`product-${idx}`}
                      value={value}
                      onChange={(e) => updateProduct(idx, e.target.value)}
                      placeholder={`Product ${idx + 1}`}
                      minLength={3}
                      maxLength={220}
                      className="flex-1"
                    />
                    {form.productNames.length > MIN_PRODUCTS && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProduct(idx)}
                        aria-label={`Remove product ${idx + 1}`}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={addProduct}
                className="mt-3"
              >
                + Add another product
              </Button>
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
