import { Decoration, WidgetType } from "@codemirror/view";
import { markdownLanguage } from "@codemirror/lang-markdown";
import type { CustomEmoji } from "../../shadcn/emoji-picker/index.js";
class EmojiWidget extends WidgetType {
  constructor(readonly emoji: CustomEmoji) {
    super();
  }
  eq(other: EmojiWidget) {
    return (
      other.emoji.shortcode === this.emoji.shortcode &&
      other.emoji.url === this.emoji.url
    );
  }
  toDOM() {
    const image = document.createElement("img");
    image.src = this.emoji.url;
    image.alt = `:${this.emoji.shortcode}:`;
    image.title = this.emoji.label ?? image.alt;
    image.style.cssText =
      "width:1.25em;height:1.25em;object-fit:contain;vertical-align:text-bottom";
    return image;
  }
}
export function emojiDecorations(
  text: string,
  values: readonly CustomEmoji[] = [],
) {
  const ignored: { from: number; to: number }[] = [];
  markdownLanguage.parser.parse(text).iterate({
    enter(node) {
      if (["InlineCode", "FencedCode", "CodeBlock"].includes(node.name)) {
        ignored.push({ from: node.from, to: node.to });
        return false;
      }
    },
  });
  const registry = new Map(values.map((emoji) => [emoji.shortcode, emoji]));
  return [...text.matchAll(/:([A-Za-z0-9_+-]+):/g)].flatMap((match) => {
    const emoji = registry.get(match[1]!);
    const from = match.index;
    const to = from + match[0].length;
    return emoji && !ignored.some((range) => from < range.to && to > range.from)
      ? [Decoration.replace({ widget: new EmojiWidget(emoji) }).range(from, to)]
      : [];
  });
}
