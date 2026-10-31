export const ROW_HEIGHT = 28;
export const LETTER_HEIGHT = 22;
export const HEADER_HEIGHT = 28;
export const CELL_PADDING = 16;
export const SORT_HIT = 30;

export function columnLetter(index: number): string {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    value -= 1;
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26);
  }
  return label;
}

export function parseAddress(
  input: string,
): { row?: number | undefined; col?: number | undefined } | null {
  const value = input.trim().replaceAll("$", "").toUpperCase();
  const match = /^([A-Z]+)?([1-9]\d*)?$/.exec(value);
  if (!match || !value) return null;
  let col: number | undefined;
  if (match[1]) {
    col = 0;
    for (const char of match[1]) col = col * 26 + char.charCodeAt(0) - 64;
    col -= 1;
  }
  const row = match[2] ? Number(match[2]) - 1 : undefined;
  if (row != null && !Number.isSafeInteger(row)) return null;
  return { row, col };
}

export function clampWidth(width: number): number {
  return Number.isFinite(width)
    ? Math.max(48, Math.min(960, Math.round(width)))
    : 120;
}

export function wrapLines(
  text: string,
  width: number,
  measure: (value: string) => number,
): string[] {
  if (!text || width <= 0) return [text];
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const trial = line ? line + " " + word : word;
      if (measure(trial) <= width) {
        line = trial;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      for (const char of word) {
        if (line && measure(line + char) > width) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}
