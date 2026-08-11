export type ColorPickerFormat = "hex" | "hex-without-hash";

/** Convert supported text colors to the six-digit value required by `input[type=color]`. */
export function colorValueForPicker(input: string): string | null {
  const trimmed = input.trim();
  const fullHex = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  if (fullHex) return `#${fullHex[1].toLowerCase()}`;

  const shortHex = /^#?([0-9a-f]{3})$/i.exec(trimmed);
  if (shortHex) {
    return `#${shortHex[1]
      .split("")
      .map((part) => part + part)
      .join("")
      .toLowerCase()}`;
  }

  const rgb = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i.exec(
    trimmed,
  );
  if (!rgb) return null;
  const channels = rgb.slice(1, 4).map(Number);
  if (channels.some((channel) => channel < 0 || channel > 255)) return null;
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Serialize a native color input value for the consumer's source format. */
export function formatPickerColor(
  value: string,
  format: ColorPickerFormat = "hex",
): string {
  const normalized = colorValueForPicker(value) ?? "#000000";
  return format === "hex-without-hash" ? normalized.slice(1) : normalized;
}
