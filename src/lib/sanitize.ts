/**
 * Basic input sanitization for user-submitted strings.
 * Strips HTML tags and trims whitespace to prevent stored XSS.
 */

const htmlTagPattern = /<[^>]*>/g;

/** Strip HTML tags and trim the string. */
export function sanitizeString(value: string): string {
  return value.replace(htmlTagPattern, "").trim();
}

/** Sanitize all string values in an object (shallow, one level). */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitizeString(value);
    }
  }

  return result;
}
