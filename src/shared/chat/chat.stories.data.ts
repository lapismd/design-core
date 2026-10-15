import type { CustomEmoji, EmojiOption } from "../shadcn/emoji-picker/index.js";
export const customEmojis: CustomEmoji[] = [
  {
    id: "lapis",
    shortcode: "lapis",
    label: "Lapis gem",
    url:
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#6366f1" d="M16 2 30 12 23 29H9L2 12Z"/><path fill="#a5b4fc" d="m16 2 6 10H10Z"/></svg>',
      ),
  },
];
export const reactionChoices: EmojiOption[] = [
  { emoji: "👍", name: "thumbs up" },
  { emoji: "🔥", name: "fire" },
];
