/**
 * Best-effort machine translation for admin content that's only been typed in one language.
 *
 * Uses MyMemory's free public API (no key required — https://mymemory.translated.net).
 * This is a convenience, not a certified translation: quality varies, long text may be
 * truncated by the service's per-request limit, and the free tier is rate-limited.
 * On ANY failure (network, quota, bad response, or a result that clearly isn't actually
 * translated) we fall back to the original text so saving never breaks and — just as
 * important — we never show the admin garbled pseudo-Arabic that isn't real Arabic at all.
 */

const ENDPOINT = 'https://api.mymemory.translated.net/get';

const ARABIC_CHARS = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_LETTERS = /[A-Za-z]/g;

/**
 * MyMemory sometimes returns 200 OK with something that plainly isn't a translation at
 * all — the input echoed back with odd casing, a truncated fragment, or otherwise a
 * result in the wrong script entirely. If the source text has real letters in it, a
 * genuine Arabic translation must contain Arabic script, and a genuine English one must
 * contain Latin letters with none left in Arabic — anything else is a failed translation.
 */
function looksLikeRealTranslation(source: string, translated: string, to: 'en' | 'ar'): boolean {
  const sourceHasLetters = ARABIC_CHARS.test(source) || LATIN_LETTERS.test(source);
  ARABIC_CHARS.lastIndex = 0; LATIN_LETTERS.lastIndex = 0; // reset global-regex state after .test()
  if (!sourceHasLetters) return true; // numbers/symbols only — nothing to validate

  const arabicCount = (translated.match(ARABIC_CHARS) || []).length;
  const latinCount = (translated.match(LATIN_LETTERS) || []).length;

  if (to === 'ar') return arabicCount > 0;
  return latinCount > 0 && arabicCount === 0;
}

async function translateText(text: string, from: 'en' | 'ar', to: 'en' | 'ar'): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';
  try {
    const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    if (!res.ok) return trimmed;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    // MyMemory returns an error string as 200 OK sometimes (e.g. quota messages) — a very
    // short "translation" of long input, or text containing "MYMEMORY WARNING", is treated as a miss.
    if (typeof translated !== 'string' || !translated.trim() || /MYMEMORY WARNING/i.test(translated)) {
      return trimmed;
    }
    const clean = translated.trim();
    return looksLikeRealTranslation(trimmed, clean, to) ? clean : trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Given one bilingual field pair as the admin left it:
 * - both filled → returned untouched (never overwrite what the admin actually wrote)
 * - both empty → returned untouched
 * - only one filled → the other is machine-translated from it
 */
export async function translatePair(ar: string, en: string): Promise<{ ar: string; en: string }> {
  const a = ar.trim(), e = en.trim();
  if (a && e) return { ar: a, en: e };
  if (!a && !e) return { ar: '', en: '' };
  if (a && !e) return { ar: a, en: await translateText(a, 'ar', 'en') };
  return { ar: await translateText(e, 'en', 'ar'), en: e };
}

/**
 * Translates several field pairs in parallel (one field is much faster than the sum of many
 * sequential round-trips). `pairs` maps a label to [arValue, enValue]; the result maps the
 * same labels to the resolved { ar, en }.
 */
export async function translatePairs<K extends string>(
  pairs: Record<K, [string, string]>
): Promise<Record<K, { ar: string; en: string }>> {
  const keys = Object.keys(pairs) as K[];
  const resolved = await Promise.all(keys.map(k => translatePair(pairs[k][0], pairs[k][1])));
  return Object.fromEntries(keys.map((k, i) => [k, resolved[i]])) as Record<K, { ar: string; en: string }>;
}
