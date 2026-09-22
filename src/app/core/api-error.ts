import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns whatever the .NET API returned into one short, human-readable message.
 * Handles: network failure, { message }, ASP.NET validation { errors: { Field: [..] } }.
 * `t` is the translation function so known cases come out in the current language.
 */
export function extractApiError(err: unknown, t: (key: string) => string): string {
  if (!(err instanceof HttpErrorResponse)) return t('admin.errGeneric');

  if (err.status === 0) return t('admin.errNetwork');
  if (err.status === 401) return t('admin.sessionExpired');
  if (err.status === 403) return t('admin.errForbidden');
  if (err.status === 404) return t('admin.errNotFound');

  const body = err.error;

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message) {
      // Slug collisions are the most common admin mistake — show them translated.
      if (/slug/i.test(body.message)) return t('admin.errSlug');
      return body.message;
    }
    if (body.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors as Record<string, string[]>)
        .flat()
        .filter(Boolean)
        .slice(0, 3);
      if (messages.length) return messages.join(' • ');
    }
  }

  return t('admin.errGeneric');
}
