'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAppSelector } from '@/store';

/**
 * Buyer-profile extension fields.
 *
 * The backend persists the core auth fields plus a couple of business
 * details captured at signup (`companyName`, `gstNumber`) on the user.
 * Everything else is kept in localStorage until a dedicated buyer-profile
 * API exists, so the UI still feels real.
 *
 * On hydration we merge the auth-user values into the localStorage copy so
 * details captured during registration (or any other signup-time flow)
 * show up prefilled on the profile page. Locally-saved values win — once
 * the user types and saves, that becomes the source of truth.
 *
 * Swap the storage layer for HTTP calls when the API is available; the rest
 * of the dashboard / profile UI consumes this hook unchanged.
 */
export interface BuyerProfileExtension {
  /** Address */
  city: string;
  state: string;
  houseNo: string;
  street: string;
  area: string;
  pincode: string;
  /** Contact */
  alternativeMobile: string;
  secondaryEmail: string;
  /** Business */
  companyName: string;
  companyWebsite: string;
  gstNumber: string;
  businessType: string;
}

const STORAGE_KEY = 'indiamart-clone:buyer-profile';

const EMPTY: BuyerProfileExtension = {
  city: '',
  state: '',
  houseNo: '',
  street: '',
  area: '',
  pincode: '',
  alternativeMobile: '',
  secondaryEmail: '',
  companyName: '',
  companyWebsite: '',
  gstNumber: '',
  businessType: '',
};

function readStorage(): BuyerProfileExtension {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<BuyerProfileExtension>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function writeStorage(value: BuyerProfileExtension): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage may be disabled (private mode); silently degrade.
  }
}

export function useBuyerProfile() {
  // Initialise empty so the SSR render matches the first client render. We
  // hydrate from localStorage in an effect right after mount.
  const [profile, setProfile] = useState<BuyerProfileExtension>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  // Pull the registered business details from the auth user so the form
  // prefills any data captured during signup or the seller upgrade flow
  // before the user has saved anything locally.
  const authCompanyName = useAppSelector((s) => s.auth.user?.companyName ?? null);
  const authGstNumber = useAppSelector((s) => s.auth.user?.gstNumber ?? null);

  useEffect(() => {
    const stored = readStorage();
    setProfile({
      ...stored,
      // Prefer locally-saved values when present; otherwise fall back to
      // the values captured at registration so the Business Details tile
      // doesn't look empty on first visit.
      companyName: stored.companyName.trim()
        ? stored.companyName
        : (authCompanyName ?? ''),
      gstNumber: stored.gstNumber.trim()
        ? stored.gstNumber
        : (authGstNumber ?? ''),
    });
    setHydrated(true);
  }, [authCompanyName, authGstNumber]);

  const update = useCallback((patch: Partial<BuyerProfileExtension>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStorage(EMPTY);
    setProfile(EMPTY);
  }, []);

  return { profile, update, clear, hydrated };
}
