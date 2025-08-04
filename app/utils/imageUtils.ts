/**
 * Add cache busting parameter to image URL
 * This ensures the image is reloaded when it's updated
 */
export function addCacheBusting(url: string): string {
  if (!url) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  return `${url}${separator}t=${timestamp}`;
}

/**
 * Check if URL is a local file URI
 */
export function isLocalFile(uri: string): boolean {
  return uri.startsWith('file://');
}

/**
 * Check if URL is a remote URL
 */
export function isRemoteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Get image source with cache busting for remote URLs
 */
export function getImageSource(url?: string) {
  if (!url) return undefined;
  
  if (isRemoteUrl(url)) {
    return { uri: addCacheBusting(url) };
  }
  
  return { uri: url };
} 