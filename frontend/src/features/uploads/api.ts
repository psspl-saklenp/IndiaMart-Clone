import { api } from '@/lib/axios';
import type {
  PresignUploadPayload,
  PresignUploadResponse,
} from '@/types/catalog';

export async function presignUpload(
  payload: PresignUploadPayload,
): Promise<PresignUploadResponse> {
  const { data } = await api.post<PresignUploadResponse>('/uploads/presign', payload);
  return data;
}

/**
 * Uploads a File directly to S3 using a presigned PUT URL.
 * Returns the final public URL on success.
 */
export async function uploadFileToS3(
  presigned: PresignUploadResponse,
  file: File,
): Promise<string> {
  const res = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': presigned.contentType },
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: HTTP ${res.status}`);
  }
  return presigned.publicUrl;
}
