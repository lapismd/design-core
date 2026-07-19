export type MarkdownFormatKind = "bold" | "italic" | "link";

export type MarkdownEdit = {
  text: string;
  selectionStart: number;
  selectionEnd: number;
};

export function createMarkdownEdit(
  kind: MarkdownFormatKind,
  selectedText: string,
  linkUrl = "url",
): MarkdownEdit {
  if (kind === "bold") return wrapText("**", "**", selectedText);
  if (kind === "italic") return wrapText("*", "*", selectedText);

  const url = linkUrl.trim() || "url";
  const text = `[${selectedText}](${url})`;
  const textEnd = selectedText.length > 0 ? text.length : 1;
  return {
    text,
    selectionStart: selectedText.length > 0 ? text.length : 1,
    selectionEnd: textEnd,
  };
}

function wrapText(
  prefix: string,
  suffix: string,
  selectedText: string,
): MarkdownEdit {
  const text = `${prefix}${selectedText}${suffix}`;
  const caret = selectedText.length > 0 ? text.length : prefix.length;
  return {
    text,
    selectionStart: caret,
    selectionEnd: caret,
  };
}
