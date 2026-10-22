import { protectChatReferences } from "./reference-remark.js";
import { renderChatReferences } from "./reference-preview.js";
import { describe, it, expect } from "vitest";
import {
  chatReferenceRanges,
  serializeChatReference,
} from "./reference-ranges.js";
import type { ChatReferenceOptions } from "./inline-reference.types.js";
const alex = {
  id: "alex",
  kind: "person",
  label: "Alex [Design]",
  href: "app:person/alex",
};
const options: ChatReferenceOptions = {
  resolve: (href) => (href === alex.href ? alex : undefined),
  matches: (text) =>
    [...text.matchAll(/@alex/g)].map((match) => ({
      from: match.index!,
      to: match.index! + 5,
      reference: alex,
    })),
};
describe("portable chat references", () => {
  it("keeps exact UTF-16 offsets for links and registered host tokens", () => {
    const text = "👋 [Alex](app:person/alex) and @alex";
    expect(
      chatReferenceRanges(text, options).map((range) =>
        text.slice(range.from, range.to),
      ),
    ).toEqual(["[Alex](app:person/alex)", "@alex"]);
  });
  it("does not decorate code, images, link labels or unresolved destinations", () => {
    expect(
      chatReferenceRanges(
        "`@alex`\n\n```\n@alex\n```\n\n![avatar](app:person/alex) [@alex](https://example.com)",
        options,
      ),
    ).toEqual([]);
  });
  it("rejects malformed and overlapping host ranges", () => {
    expect(
      chatReferenceRanges("@alex", {
        ...options,
        matches: () => [
          { from: -1, to: 4, reference: alex },
          { from: 0, to: 20, reference: alex },
          { from: 0, to: 5, reference: alex },
          { from: 1, to: 5, reference: alex },
        ],
      }),
    ).toHaveLength(1);
  });
  it("serializes Markdown by default and preserves an explicit host codec", () => {
    expect(serializeChatReference(alex, options)).toBe(
      "[Alex \\[Design\\]](app:person/alex)",
    );
    expect(
      serializeChatReference(alex, {
        ...options,
        serialize: () => "host-person:alex;",
      }),
    ).toBe("host-person:alex;");
  });
});

describe("preview fragment ownership", () => {
  it("retains a registered token split by directive parsing and leaves unknown directives alone", () => {
    const directive = { type: "textDirective", name: "other" };
    const tree = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "@" },
            { type: "textDirective", name: "alex" },
            directive,
          ],
        },
      ],
    };
    const codec: ChatReferenceOptions = {
      resolve: () => undefined,
      matches: (text) =>
        text.startsWith("@:alex") ? [{ from: 0, to: 6, reference: alex }] : [],
    };
    protectChatReferences(tree, codec);
    expect(tree.children[0].children[0].type).toBe("link");
    expect(tree.children[0].children.at(-1)).toBe(directive);
  });
  it("decorates only a fragment's own text without borrowing parent document offsets", () => {
    const tree = {
      type: "element",
      tagName: "td",
      children: [{ type: "text", value: "Cell remains intact" }],
    };
    renderChatReferences(tree, options);
    expect(tree.children).toEqual([
      { type: "text", value: "Cell remains intact" },
    ]);
  });
});
