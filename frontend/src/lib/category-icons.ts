/**
 * Maps known top-level category slugs to a representative emoji icon.
 * Falls back to a generic store icon for unknown slugs.
 *
 * Kept simple and dependency-free so it can be used from server components.
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
  'apparel-fashion': '👕',
  'electronics-electrical': '🔌',
  'industrial-supplies': '🛠️',
  'building-construction': '🏗️',
  agriculture: '🌾',
  'food-beverages': '🍵',
  // helpful aliases for partial matches in the fallback below
  apparel: '👕',
  fashion: '👗',
  electronics: '🔌',
  electrical: '💡',
  industrial: '🛠️',
  building: '🏗️',
  construction: '🏗️',
  food: '🍴',
  beverage: '☕',
};

const FALLBACK_ICON = '🏬';

export function getCategoryIcon(slug: string | null | undefined): string {
  if (!slug) return FALLBACK_ICON;
  const direct = CATEGORY_ICON_MAP[slug];
  if (direct) return direct;
  // Try matching against alias keys for non-seeded categories.
  const lower = slug.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_ICON_MAP)) {
    if (lower.includes(key)) return value;
  }
  return FALLBACK_ICON;
}
