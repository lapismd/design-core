export function shortenCopyableValue(
  value: string,
  leadingCharacters = 8,
  trailingCharacters = 4,
): string {
  const leading = Math.max(1, Math.floor(leadingCharacters));
  const trailing = Math.max(0, Math.floor(trailingCharacters));
  if (value.length <= leading + trailing + 1) return value;
  return `${value.slice(0, leading)}…${trailing ? value.slice(-trailing) : ""}`;
}
