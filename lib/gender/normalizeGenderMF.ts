export type GenderMF = 'M' | 'F';

/**
 * Canonicalize any incoming gender value to the DB format: "M" | "F".
 * Returns null when the value is missing/unknown (so we don't guess).
 *
 * NOTE: This is for persistence & calculations only. UI labels come from i18n.
 */
export function normalizeGenderMF(input: unknown): GenderMF | null {
  if (input == null) return null;
  if (typeof input !== 'string') return null;

  const raw = input.trim();
  if (!raw) return null;

  // Canonical values
  if (raw === 'M' || raw === 'F') return raw;

  // Backward compatibility / tolerated inputs from older clients or DB records
  const lower = raw.toLowerCase();
  if (lower === 'male' || lower === 'man' || lower === 'mężczyzna' || lower === 'mezczyzna') return 'M';
  if (lower === 'female' || lower === 'woman' || lower === 'kobieta') return 'F';

  return null;
}


