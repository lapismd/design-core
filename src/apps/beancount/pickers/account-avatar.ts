const FALLBACK_COLORS = [
  "#E11D48",
  "#EA580C",
  "#CA8A04",
  "#0284C7",
  "#7C3AED",
  "#0F766E",
] as const;

export function accountAvatarInitial(account: string): string {
  const leaf = account.split(":").filter(Boolean).at(-1)?.trim() ?? "";
  return (leaf.charAt(0) || "?").toUpperCase();
}

export function accountAvatarFallbackColor(account: string): string {
  const initial = accountAvatarInitial(account);
  const colorIndex = initial.charCodeAt(0) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[colorIndex] ?? FALLBACK_COLORS[0];
}
