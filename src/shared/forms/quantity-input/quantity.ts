/** Presentation units relative to the field's canonical storage unit. */
export interface QuantityUnit {
  id: string;
  label: string;
  numerator: number;
  denominator?: number;
}
export const millisecondsUnits: readonly QuantityUnit[] = [
  { id: "ms", label: "ms", numerator: 1 },
  { id: "sec", label: "sec", numerator: 1000 },
  { id: "min", label: "min", numerator: 60000 },
];
export const secondsUnits: readonly QuantityUnit[] = [
  { id: "sec", label: "sec", numerator: 1 },
  { id: "ms", label: "ms", numerator: 1, denominator: 1000 },
  { id: "min", label: "min", numerator: 60 },
];
export const bytesUnits: readonly QuantityUnit[] = [
  { id: "bytes", label: "bytes", numerator: 1 },
  { id: "KiB", label: "KiB", numerator: 1024 },
  { id: "MiB", label: "MiB", numerator: 1048576 },
  { id: "GiB", label: "GiB", numerator: 1073741824 },
];
export const countUnits = (label: string): readonly QuantityUnit[] => [
  { id: label, label, numerator: 1 },
];

export function validQuantityUnit(unit: QuantityUnit): boolean {
  return (
    !!unit.id &&
    !!unit.label &&
    Number.isSafeInteger(unit.numerator) &&
    unit.numerator > 0 &&
    Number.isSafeInteger(unit.denominator ?? 1) &&
    (unit.denominator ?? 1) > 0
  );
}
function decimal(value: string): [bigint, bigint] | undefined {
  const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(
    value.trim(),
  );
  if (!match || !(match[2] || match[3]) || value.length > 128) return;
  const exponent = Number(match[4] ?? 0) - (match[3]?.length ?? 0);
  if (Math.abs(exponent) > 100) return;
  const n = BigInt(`${match[1]}${match[2] || "0"}${match[3] || ""}`);
  return exponent >= 0
    ? [n * 10n ** BigInt(exponent), 1n]
    : [n, 10n ** BigInt(-exponent)];
}

function quotient(
  n: bigint,
  d: bigint,
  digits = 40,
): { text: string; approximate: boolean } {
  const sign = n < 0n ? "-" : "";
  n = n < 0n ? -n : n;
  const whole = n / d;
  let remainder = n % d,
    fraction = "";
  while (remainder && fraction.length < digits) {
    remainder *= 10n;
    fraction += String(remainder / d);
    remainder %= d;
  }
  // Repeating fractions are display-only; switching units never emits a value.
  const approximate = remainder !== 0n;
  return {
    text: `${sign}${whole}${fraction ? `.${fraction}` : ""}`,
    approximate,
  };
}

export function displayNumericValue(value: string, unit: QuantityUnit) {
  const parts = validQuantityUnit(unit) ? decimal(value) : undefined;
  return parts
    ? quotient(
        parts[0] * BigInt(unit.denominator ?? 1),
        parts[1] * BigInt(unit.numerator),
      )
    : { text: value, approximate: false };
}

export function canonicalNumericValue(
  value: string,
  unit: QuantityUnit,
): string {
  if (!value.trim()) return "";
  if (!validQuantityUnit(unit)) return "NaN";
  const parts = decimal(value);
  if (!parts) return "NaN";
  const numerator = parts[0] * BigInt(unit.numerator);
  const denominator = parts[1] * BigInt(unit.denominator ?? 1);
  // Invalid fractional drafts must also fail existing Number-based save validation,
  // including after a category change. The input retains the user's raw text.
  return numerator % denominator === 0n
    ? String(numerator / denominator)
    : "NaN";
}

export function quantityError(
  value: string,
  min: number,
  max: number,
  unit: string,
): string {
  if (!value.trim()) return "Enter a value.";
  const n = Number(value);
  const parts = decimal(value);
  if (!parts || parts[0] % parts[1] !== 0n || !Number.isSafeInteger(n))
    return `Enter a whole number of ${unit}.`;
  if (n < min || n > max)
    return `Use ${min.toLocaleString("en-GB")}–${max.toLocaleString("en-GB")} ${unit}.`;
  return "";
}

/** Bound the primitive's discrete-step allocation while retaining every exact typed draft. */
export function quantitySliderSteps(
  min: number,
  max: number,
  current?: number,
): number[] {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min)
    return [];
  const count = Math.min(1000, max - min);
  const values = Array.from({ length: count + 1 }, (_, index) =>
    Math.round(min + (max - min) * (count ? index / count : 0)),
  );
  if (
    current !== undefined &&
    Number.isSafeInteger(current) &&
    current >= min &&
    current <= max
  )
    values.push(current);
  return [...new Set(values)].sort((left, right) => left - right);
}
