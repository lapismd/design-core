import type { SyntaxToken } from "./tokenizer.js";

export function hasHighlightAPI(): boolean {
  return (
    typeof CSS !== "undefined" &&
    "highlights" in CSS &&
    typeof Highlight !== "undefined"
  );
}

/** Safari supports Highlight objects but mishandles ::highlight() in code blocks. */
export function isSafari(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  return ua.includes("AppleWebKit") && !ua.includes("Chrome");
}

export type SpanPart =
  | { kind: "text"; text: string }
  | { kind: "token"; text: string; type: string; key: string };

export function buildSpanParts(
  lineText: string,
  tokens: SyntaxToken[],
): SpanPart[] {
  if (tokens.length === 0) {
    return [{ kind: "text", text: lineText || "\u200b" }];
  }

  const parts: SpanPart[] = [];
  let cursor = 0;

  for (const token of tokens) {
    if (token.start > cursor) {
      parts.push({ kind: "text", text: lineText.slice(cursor, token.start) });
    }
    const end = Math.min(token.end, lineText.length);
    parts.push({
      kind: "token",
      text: lineText.slice(token.start, end),
      type: token.type,
      key: `${token.start}-${token.type}`,
    });
    cursor = end;
  }

  if (cursor < lineText.length) {
    parts.push({ kind: "text", text: lineText.slice(cursor) });
  }

  return parts.length > 0 ? parts : [{ kind: "text", text: "\u200b" }];
}

export function splitCodeLines(code: string): string[] {
  const lines = code.split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

export const LINE_CHUNK_SIZE = 20;
export const LINE_CHUNK_THRESHOLD = 100;

export function chunkLineIndices(
  lineCount: number,
  chunkSize = LINE_CHUNK_SIZE,
): Array<{ start: number; end: number }> {
  if (lineCount < LINE_CHUNK_THRESHOLD) {
    return [{ start: 0, end: lineCount }];
  }
  const size = Math.max(1, Math.floor(chunkSize));
  const chunks: Array<{ start: number; end: number }> = [];
  for (let start = 0; start < lineCount; start += size) {
    chunks.push({ start, end: Math.min(start + size, lineCount) });
  }
  return chunks;
}

export function styleRecordToCss(
  style: Record<string, string> | undefined,
): string | undefined {
  if (!style) {
    return undefined;
  }
  return Object.entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}
