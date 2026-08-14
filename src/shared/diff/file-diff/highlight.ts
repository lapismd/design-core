import { tokenize, type SyntaxToken } from "../../shadcn/code-block/index.js";

export interface HighlightPart {
  key: string;
  text: string;
  type: string | null;
}

export function highlightText(
  text: string,
  language: string | null,
): HighlightPart[] {
  if (!language || text.length === 0) {
    return [{ key: "plain", text: text || " ", type: null }];
  }
  const tokens = tokenize(text, language)[0] ?? [];
  return partsFromTokens(text, tokens);
}

function partsFromTokens(
  lineText: string,
  tokens: SyntaxToken[],
): HighlightPart[] {
  if (tokens.length === 0) {
    return [{ key: "plain", text: lineText || " ", type: null }];
  }
  const parts: HighlightPart[] = [];
  let cursor = 0;
  for (const [index, token] of tokens.entries()) {
    if (token.start > cursor) {
      parts.push({
        key: `t-${cursor}`,
        text: lineText.slice(cursor, token.start),
        type: null,
      });
    }
    const end = Math.min(token.end, lineText.length);
    parts.push({
      key: `tok-${index}-${token.type}`,
      text: lineText.slice(token.start, end),
      type: token.type,
    });
    cursor = end;
  }
  if (cursor < lineText.length) {
    parts.push({
      key: `tail-${cursor}`,
      text: lineText.slice(cursor),
      type: null,
    });
  }
  return parts.length > 0 ? parts : [{ key: "plain", text: " ", type: null }];
}
