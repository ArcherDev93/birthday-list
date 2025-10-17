/**
 * Converts a string to a URL-friendly slug
 * Example: "Brains - Las Palmas" -> "brains-las-palmas"
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

/**
 * Validates if a slug is valid (no special characters, lowercase, hyphens only)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && !slug.startsWith("-") && !slug.endsWith("-");
}

/**
 * Generates a unique slug by appending a number if needed
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = createSlug(baseSlug);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${createSlug(baseSlug)}-${counter}`;
    counter++;
  }

  return slug;
}
