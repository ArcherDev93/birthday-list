/**
 * Utility functions for handling gradient text with emoji preservation
 */

/**
 * Applies gradient text classes while preserving emoji colors
 * @param baseClasses - Base CSS classes to apply
 * @param gradientFrom - Starting color of gradient (default: purple-600)
 * @param gradientTo - Ending color of gradient (default: pink-600)
 * @returns CSS class string with gradient text that preserves emojis
 */
export function getGradientTextClasses(baseClasses: string = "", gradientFrom: string = "purple-600", gradientTo: string = "pink-600"): string {
  return `${baseClasses} bg-gradient-to-r from-${gradientFrom} to-${gradientTo} bg-clip-text text-transparent emoji-preserve-parent`.trim();
}

/**
 * CSS class for elements that should preserve emoji colors within gradient text
 */
export const EMOJI_PRESERVE_CLASS = "emoji-preserve";

/**
 * Regex pattern for matching emojis (including compound emojis and skin tones)
 */
export const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)/gu;

/**
 * Splits text to separate emojis from regular text for individual styling
 * @param text - Text to process
 * @returns Array of text parts and emojis
 */
export function splitTextAndEmojis(text: string): Array<{ content: string; isEmoji: boolean }> {
  const parts = text.split(EMOJI_REGEX);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      content: part,
      isEmoji: EMOJI_REGEX.test(part),
    }));
}
