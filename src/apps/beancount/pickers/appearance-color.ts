const TINT_PERCENTAGE = 0.1;
const FOREGROUND_PERCENTAGE = 0.55;

export const MINIMUM_APPEARANCE_CONTRAST = 4.5;

type RgbColor = readonly [red: number, green: number, blue: number];

export function isAppearanceColor(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value);
}

export function normalizeAppearanceColor(value: string): string | null {
  return isAppearanceColor(value) ? value.toUpperCase() : null;
}

/**
 * Returns the colour used for an icon on a tinted account-appearance avatar.
 * Keeping this darker than the selected colour gives the icon enough contrast
 * against its own light tint in the default theme.
 */
export function appearanceIconForeground(value: string): string | null {
  const color = colorFromHex(value);
  if (!color) return null;
  return colorToHex(mixWithBlack(color, FOREGROUND_PERCENTAGE));
}

/**
 * Returns the light tint behind an account-appearance icon in the default
 * theme. It mirrors the 10% `color-mix` used by IconColorPicker.
 */
export function appearanceIconTint(value: string): string | null {
  const color = colorFromHex(value);
  if (!color) return null;
  return colorToHex(mixWithWhite(color, TINT_PERCENTAGE));
}

export function appearanceIconContrast(value: string): number | null {
  const foreground = appearanceIconForeground(value);
  const background = appearanceIconTint(value);
  if (!foreground || !background) return null;

  return contrastRatio(colorFromHex(foreground)!, colorFromHex(background)!);
}

export function needsAppearanceContrastCorrection(value: string): boolean {
  const contrast = appearanceIconContrast(value);
  return contrast == null || contrast < MINIMUM_APPEARANCE_CONTRAST;
}

/**
 * Darkens a custom colour just enough for its generated icon colour to meet
 * WCAG AA contrast against the picker’s tinted avatar background.
 */
export function autoCorrectAppearanceColor(value: string): string | null {
  const color = colorFromHex(value);
  if (!color) return null;

  let corrected: RgbColor = color;
  while (
    needsAppearanceContrastCorrection(colorToHex(corrected)) &&
    corrected.some((channel) => channel > 0)
  ) {
    corrected = darkenColor(corrected);
  }

  return colorToHex(corrected);
}

function colorFromHex(value: string): RgbColor | null {
  const normalized = normalizeAppearanceColor(value);
  if (!normalized) return null;

  return [
    Number.parseInt(normalized.slice(1, 3), 16),
    Number.parseInt(normalized.slice(3, 5), 16),
    Number.parseInt(normalized.slice(5, 7), 16),
  ];
}

function colorToHex([red, green, blue]: RgbColor): string {
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
}

function mixWithBlack(
  [red, green, blue]: RgbColor,
  percentage: number,
): RgbColor {
  return [red * percentage, green * percentage, blue * percentage];
}

function mixWithWhite(
  [red, green, blue]: RgbColor,
  percentage: number,
): RgbColor {
  return [
    red * percentage + 255 * (1 - percentage),
    green * percentage + 255 * (1 - percentage),
    blue * percentage + 255 * (1 - percentage),
  ];
}

function darkenColor([red, green, blue]: RgbColor): RgbColor {
  return [
    Math.max(0, red - 10),
    Math.max(0, green - 10),
    Math.max(0, blue - 10),
  ];
}

function contrastRatio(foreground: RgbColor, background: RgbColor): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const [lighter, darker] = [
    Math.max(foregroundLuminance, backgroundLuminance),
    Math.min(foregroundLuminance, backgroundLuminance),
  ];
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance([red, green, blue]: RgbColor): number {
  const linear = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
