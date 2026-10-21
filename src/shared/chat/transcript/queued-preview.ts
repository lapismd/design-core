/** Display-only preview: the immutable submission remains untouched. */
export function queuedPreview(text: string) {
  const preview = text.slice(0, 600).split("\n").slice(0, 8).join("\n");
  return { text: preview, truncated: preview.length < text.length };
}
