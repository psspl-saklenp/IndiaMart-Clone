import { api } from '@/lib/axios';
import type {
  PresignUploadPayload,
  PresignUploadResponse,
} from '@/types/catalog';

export interface UploadStatus {
  storage: 's3' | 'local';
  maxBytes: number;
  acceptedMimeTypes: string[];
}

export interface UploadResult {
  url: string;
  s3Key: string;
  contentType: string;
  storage: 's3' | 'local';
  sizeBytes?: number;
}

/** Tells which storage backend the server uses. Cached in queries. */
export async function getUploadStatus(): Promise<UploadStatus> {
  const { data } = await api.get<UploadStatus>('/uploads/status');
  return data;
}

export async function presignUpload(
  payload: PresignUploadPayload,
): Promise<PresignUploadResponse> {
  const { data } = await api.post<PresignUploadResponse>('/uploads/presign', payload);
  return data;
}

/** Uploads a File directly to S3 using a presigned PUT URL. */
async function putToS3(presigned: PresignUploadResponse, file: File): Promise<UploadResult> {
  const res = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': presigned.contentType },
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: HTTP ${res.status}`);
  }
  return {
    url: presigned.publicUrl,
    s3Key: presigned.s3Key,
    contentType: presigned.contentType,
    storage: 's3',
  };
}

/** Uploads a File via multipart POST to the local backend store. */
async function postLocal(
  file: File,
  purpose: PresignUploadPayload['purpose'] = 'product-image',
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  if (purpose) form.append('purpose', purpose);

  const { data } = await api.post<UploadResult>('/uploads/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * One-shot file upload that picks the right backend automatically:
 *   1. Calls GET /uploads/status to find out the configured storage.
 *   2. If 's3', uses the presign + PUT-to-S3 path.
 *   3. Otherwise (or on S3 failure), POSTs the file directly to the backend.
 *
 * Returns the final public URL plus a key that can be persisted with the product image.
 */
export async function uploadFile(
  file: File,
  purpose: PresignUploadPayload['purpose'] = 'product-image',
): Promise<UploadResult> {
  let status: UploadStatus | null = null;
  try {
    status = await getUploadStatus();
  } catch {
    // Status endpoint failure shouldn't block uploads; fall through to local.
  }

  if (status?.storage === 's3') {
    try {
      const presigned = await presignUpload({
        fileName: file.name,
        contentType: file.type as PresignUploadPayload['contentType'],
        purpose,
      });
      return await putToS3(presigned, file);
    } catch (err) {
      // If S3 path fails (misconfig, network, CORS), fall through to local.
      // eslint-disable-next-line no-console
      console.warn('S3 upload failed, falling back to local upload:', err);
    }
  }

  return postLocal(file, purpose);
}
