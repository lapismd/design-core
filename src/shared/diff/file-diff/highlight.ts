import { tokenize, type SyntaxToken } from "../../shadcn/code-block/index.js";

export interface HighlightPart {
  key: string;
  text: string;
  type: string | null;
}

const C_LIKE_LANGUAGES = new Set(["c", "cpp", "rust"]);

export function highlightText(
  text: string,
  language: string | null,
): HighlightPart[] {
  if (!language || text.length === 0) {
    return [{ key: "plain", text: text || " ", type: null }];
  }
  const tokens = tokenize(text, language)[0] ?? [];
  if (tokens.length === 0 && C_LIKE_LANGUAGES.has(language)) {
    return partsFromTokens(text, tokenizeCLike(text, language));
  }
  return partsFromTokens(text, tokens);
}

const C_KEYWORDS = new Set([
  "auto",
  "break",
  "case",
  "char",
  "const",
  "continue",
  "default",
  "define",
  "do",
  "double",
  "else",
  "endif",
  "enum",
  "extern",
  "float",
  "for",
  "goto",
  "if",
  "ifdef",
  "ifndef",
  "include",
  "inline",
  "int",
  "long",
  "pragma",
  "register",
  "restrict",
  "return",
  "short",
  "signed",
  "sizeof",
  "static",
  "struct",
  "switch",
  "typedef",
  "union",
  "unsigned",
  "void",
  "volatile",
  "while",
]);

const RUST_KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "const",
  "continue",
  "crate",
  "dyn",
  "else",
  "enum",
  "extern",
  "false",
  "fn",
  "for",
  "if",
  "impl",
  "in",
  "let",
  "loop",
  "match",
  "mod",
  "move",
  "mut",
  "pub",
  "ref",
  "return",
  "self",
  "Self",
  "static",
  "struct",
  "super",
  "trait",
  "true",
  "type",
  "unsafe",
  "use",
  "where",
  "while",
]);

const C_LIKE_PATTERN =
  /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(#\s*[A-Za-z_]\w*)|(\b[A-Za-z_]\w*\b)|(\b\d+(?:\.\d+)?\b)|([{}()[\];,.<>+\-*/%=&|!?:]+)/g;

function tokenizeCLike(text: string, language: string): SyntaxToken[] {
  const keywords = language === "rust" ? RUST_KEYWORDS : C_KEYWORDS;
  const tokens: SyntaxToken[] = [];
  const pattern = new RegExp(C_LIKE_PATTERN.source, "g");
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    const value = match[0];
    const start = match.index;
    const end = start + value.length;
    if (match[1]) {
      tokens.push({ type: "string", start, end });
    } else if (match[2]) {
      tokens.push({ type: "comment", start, end });
    } else if (match[3]) {
      tokens.push({ type: "keyword", start, end });
    } else if (match[4]) {
      tokens.push({
        type: keywords.has(value) ? "keyword" : "variable",
        start,
        end,
      });
    } else if (match[5]) {
      tokens.push({ type: "number", start, end });
    } else {
      tokens.push({
        type: /^[{}()[\];,.]$/.test(value) ? "punctuation" : "operator",
        start,
        end,
      });
    }
  }
  return tokens;
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
