export const LOCAL_UPLOAD_DIR = 'uploads';
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_MIMES = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ALLOWED_PURPOSES = ['product-image', 'avatar', 'banner'] as const;
export type UploadPurpose = (typeof ALLOWED_PURPOSES)[number];
