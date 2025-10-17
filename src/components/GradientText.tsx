import { ReactNode, ElementType } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  as?: ElementType;
}

/**
 * GradientText component that applies gradient coloring to text while preserving emoji colors.
 *
 * Usage:
 * ```tsx
 * <GradientText>🎉 Hello World</GradientText>
 * <GradientText as="h1">🎂 Main Title</GradientText>
 * <GradientText as="h2">🎉 Subtitle</GradientText>
 * <GradientText as="p">📝 Paragraph text</GradientText>
 * <GradientText gradientFrom="blue-500" gradientTo="green-500">✨ Custom Colors</GradientText>
 * ```
 *
 * The emojis will maintain their original colors while the text gets the gradient effect.
 */

export default function GradientText({ children, className = "", gradientFrom = "purple-600", gradientTo = "pink-600", as: Component = "span" }: GradientTextProps) {
  // Function to split text and preserve emojis
  const processText = (text: string) => {
    // Regex to match emojis (including compound emojis and skin tones)
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)/gu;

    const parts = text.split(emojiRegex);

    return parts.map((part, index) => {
      if (emojiRegex.test(part)) {
        // This is an emoji - render without gradient
        return (
          <span key={index} className="text-black dark:text-white emoji-preserve">
            {part}
          </span>
        );
      } else if (part.trim()) {
        // This is regular text - apply gradient
        return (
          <span key={index} className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} bg-clip-text text-transparent`}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderContent = (node: ReactNode): ReactNode => {
    if (typeof node === "string") {
      return processText(node);
    }

    if (typeof node === "number") {
      return node;
    }

    // For other content, return as-is
    return node;
  };

  return <Component className={className}>{renderContent(children)}</Component>;
}
