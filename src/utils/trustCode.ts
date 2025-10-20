// Utility functions for generating and validating trust codes

/**
 * Generates a random trust code for group sharing
 * Format: 6-character alphanumeric code (uppercase)
 */
export function generateTrustCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Validates trust code format
 */
export function isValidTrustCode(code: string): boolean {
  const trustCodeRegex = /^[A-Z0-9]{6}$/;
  return trustCodeRegex.test(code);
}

/**
 * Formats trust code for display (adds dash in middle)
 */
export function formatTrustCode(code: string): string {
  if (code.length === 6) {
    return `${code.slice(0, 3)}-${code.slice(3)}`;
  }
  return code;
}

/**
 * Removes formatting from trust code
 */
export function normalizeTrustCode(code: string): string {
  return code.replace(/[-\s]/g, "").toUpperCase();
}
