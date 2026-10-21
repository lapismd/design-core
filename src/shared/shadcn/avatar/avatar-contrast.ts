/** Pick readable initials for the solid hex colours emitted by AvatarPicker. */
export function avatarContrast(background?: string): string | undefined {
  const match = background?.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/iu);
  if (!match) return undefined;
  const hex =
    match[1]!.length === 3
      ? [...match[1]!].map((digit) => digit + digit).join("")
      : match[1]!;
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05)
    ? "#000000"
    : "#ffffff";
}
