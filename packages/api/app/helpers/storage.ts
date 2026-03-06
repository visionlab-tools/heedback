import env from '#start/env'

/**
 * Resolves a storage key (e.g. "uploads/abc.png") to a full public URL.
 * Uses S3_PUBLIC_URL when set (prod with CDN/proxy), falls back to S3_ENDPOINT/bucket (dev).
 */
export function resolveStorageUrl(key: string | null | undefined): string | null {
  if (!key) return null
  const publicUrl = env.get('S3_PUBLIC_URL', '')
  if (publicUrl) return `${publicUrl}/${key}`
  const endpoint = env.get('S3_ENDPOINT', '')
  const bucket = env.get('S3_BUCKET', '')
  return `${endpoint}/${bucket}/${key}`
}
