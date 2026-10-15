export const emojiPickerTokenNames = [
  "--ui-emoji-picker-width",
  "--ui-emoji-picker-restricted-width",
  "--ui-emoji-picker-height",
  "--ui-emoji-picker-emoji-size",
  "--ui-emoji-picker-font-size",
  "--ui-emoji-picker-hover",
] as const;
export type EmojiPickerToken = (typeof emojiPickerTokenNames)[number];
