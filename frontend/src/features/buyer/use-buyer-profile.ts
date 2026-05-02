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

/**
 * Storage key prefix. The actual key is suffixed with the authenticated
 * user's id so each account on a shared browser keeps its own profile
 * data — without this, logging out and signing in as a different user
 * would surface the previous account's locally-saved profile details.
 */
const STORAGE_KEY_PREFIX = 'indiamart-clone:buyer-profile';

function storageKeyFor(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

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

function readStorage(key: string | null): BuyerProfileExtension {
  if (typeof window === 'undefined' || !key) return EMPTY;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<BuyerProfileExtension>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

function writeStorage(key: string | null, value: BuyerProfileExtension): void {
  if (typeof window === 'undefined' || !key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
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
  // before the user has saved anything locally. Also pull the user id so
  // we can scope the localStorage key per account.
  const userId = useAppSelector((s) => s.auth.user?.id ?? null);
  const authCompanyName = useAppSelector((s) => s.auth.user?.companyName ?? null);
  const authGstNumber = useAppSelector((s) => s.auth.user?.gstNumber ?? null);

  const storageKey = storageKeyFor(userId);

  useEffect(() => {
    // No authenticated user — show an empty profile and skip any storage
    // reads. This also covers the brief window during logout before the
    // page redirects to the login screen, so we never leak the previous
    // user's cached data.
    if (!storageKey) {
      setProfile(EMPTY);
      setHydrated(true);
      return;
    }

    const stored = readStorage(storageKey);
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
  }, [storageKey, authCompanyName, authGstNumber]);

  const update = useCallback(
    (patch: Partial<BuyerProfileExtension>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        writeStorage(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    writeStorage(storageKey, EMPTY);
    setProfile(EMPTY);
  }, [storageKey]);

  return { profile, update, clear, hydrated };
}
