/**
 * Returns a domain string from a URL.
 * e.g. "https://www.example.com/path" → "example.com"
 */
export function getDomain(url?: string): string {
  if (!url) return '';
  try {
    const hostname = new URL(url).hostname;
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  } catch {
    return '';
  }
}

/**
 * Returns a relative time string from a Unix timestamp (seconds).
 * e.g. 3600 seconds ago → "1 hour ago"
 */
export function getRelativeTime(unixSeconds: number): string {
  const now = Date.now();
  const diffMs = now - unixSeconds * 1000;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffMonth / 12)}y ago`;
}

/**
 * Formats a number with K suffix for thousands.
 * e.g. 1234 → "1.2k"
 */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
