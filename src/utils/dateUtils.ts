/**
 * Safely formats a date string to local date format
 * Handles invalid dates gracefully
 */
export function formatSafeDate(dateString: string | undefined | null, fallback: string = "Fecha no disponible"): string {
  if (!dateString) {
    return fallback;
  }

  try {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return fallback;
    }

    return date.toLocaleDateString();
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return fallback;
  }
}

/**
 * Safely formats a date string to local date and time format
 */
export function formatSafeDateTime(dateString: string | undefined | null, fallback: string = "Fecha no disponible"): string {
  if (!dateString) {
    return fallback;
  }

  try {
    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", dateString);
      return fallback;
    }

    return date.toLocaleString();
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return fallback;
  }
}
