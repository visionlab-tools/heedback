import env from '#start/env'

/**
 * Resolves a storage key (e.g. "uploads/abc.png") to a full public URL.
 * Returns null if the key is null/undefined.
 * Keeps the URL-building logic in one place so endpoint changes don't break stored data.
 */
export function resolveStorageUrl(key: string | null | undefined): string | null {
  if (!key) return null
  const endpoint = env.get('S3_ENDPOINT', '')
  const bucket = env.get('S3_BUCKET', '')
  return `${endpoint}/${bucket}/${key}`
}
