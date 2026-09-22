import { API_BASE } from './api.config';

/** Origin the backend serves uploaded files from, e.g. "https://kernelpanic-portfolio.runasp.net". */
const UPLOADS_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

/**
 * Card grids show many images at once, so they use the small thumbnail MediaController
 * generates alongside every upload (same filename with "-thumb" before the extension)
 * instead of the full-size version — which is what the detail view/gallery still use via
 * the plain URL. Only applies to images we actually generated a thumbnail for (our own
 * /uploads/ files); an externally pasted link is returned unchanged since there's no
 * thumbnail to derive. Extension-agnostic (.jpg for images uploaded before the backend
 * switched to WebP, .webp for everything uploaded after) so both keep working.
 */
export function thumbUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (!url.startsWith(`${UPLOADS_ORIGIN}/uploads/`)) return url;
  const match = url.match(/^(.*)\.(jpg|jpeg|webp)$/i);
  if (!match || url.includes('-thumb.')) return url;
  return `${match[1]}-thumb.${match[2]}`;
}
