import { redirect } from 'next/navigation';

export const metadata = { title: 'My profile' };

/**
 * The seller profile lives on the shared `/me/profile` page so a seller's
 * business details (company name, GST, etc.) appear in the same UI as a
 * buyer's. Any visit to `/seller/profile` — bookmarks, deep links, the old
 * dropdown entry — redirects there. The legacy seller-only editor
 * (`ProfileEditor`) is still available for the public-supplier page
 * branding fields elsewhere.
 */
export default function SellerProfilePage() {
  redirect('/me/profile');
}
