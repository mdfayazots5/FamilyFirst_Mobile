const IMAGE_EXTENSION = /\.(jpg|jpeg|png|heic|heif)$/i;

/**
 * True when a document URL points at an image. Checks the URL *path* only, so presigned S3 URLs
 * (`.../file.jpg?X-Amz-Signature=...`) and plain object URLs are both classified correctly.
 */
export function isImageFileUrl(fileUrl: string): boolean {
  try {
    return IMAGE_EXTENSION.test(new URL(fileUrl, window.location.origin).pathname);
  } catch {
    return IMAGE_EXTENSION.test(fileUrl.split(/[?#]/)[0] ?? '');
  }
}
