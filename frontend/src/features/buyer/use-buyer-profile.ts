'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Buyer-profile extension fields.
 *
 * The backend currently only persists the core auth fields (name, email,
 * phone, isVerified) on the user. Until a dedicated buyer-profile API is
 * added we store the rest in localStorage so the UI still feels real.
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

  useEffect(() => {
    setProfile(readStorage());
    setHydrated(true);
  }, []);

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
