import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** "New Security Service!" → "new-security-service" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Empty is fine (field optional); otherwise must be http(s). */
export function httpUrlValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Cross-field validator for a bilingual pair (e.g. titleAr / titleEn): at least ONE of the
 * two must be filled, not necessarily both — the site already falls back to whichever
 * language has content, so admins can write in just one language if that's all they have.
 * Attach to the FormGroup (not a single control); sets `{ bothEmpty: true }` on the group.
 */
export function atLeastOneOf(fieldA: string, fieldB: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const a = String(group.get(fieldA)?.value ?? '').trim();
    const b = String(group.get(fieldB)?.value ?? '').trim();
    return a || b ? null : { bothEmpty: true };
  };
}

/** "2026-09-13T20:57:12" → "2026-09-13" (value for <input type="date">). */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Today as yyyy-mm-dd in the user's local time. */
export function todayInput(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** yyyy-mm-dd picked by the admin → ISO for the API ("today" keeps the real time so ordering stays natural). */
export function dateInputToIso(date: string): string {
  return date === todayInput() ? new Date().toISOString() : `${date}T00:00:00Z`;
}

/** Textarea → array (one entry per non-empty line). */
export function linesToList(text: string): string[] {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

/**
 * Machine-translated text isn't guaranteed to be the same length as the original — it can
 * come back longer and blow past a field's backend max-length (e.g. [MaxLength(300)] on
 * TitleAr) even though what the admin actually typed was well within the limit. Cut it down
 * defensively, at a word boundary where possible, so saving never fails on a translated field.
 */
export function truncateForBackend(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}
