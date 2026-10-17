import { it, expect } from "vitest";
import { renderSpoilerNodes, type SpoilerNode } from "./spoiler-extension.js";
it("replaces only complete text spoilers and retains code and Unicode", () => {
  const tree: SpoilerNode = {
    type: "root",
    children: [
      { type: "text", value: "A ||👩🏽‍💻 exact text|| and ||unclosed" },
      {
        type: "element",
        tagName: "code",
        children: [{ type: "text", value: "||literal||" }],
      },
    ],
  };
  renderSpoilerNodes(tree);
  expect(tree.children?.[1]?.tagName).toBe("sharedspoiler");
  expect(tree.children?.[1]?.children?.[0]?.value).toBe("👩🏽‍💻 exact text");
  expect(tree.children?.at(-1)?.children?.[0]?.value).toBe("||literal||");
  expect(tree.children?.[2]?.value).toBe(" and ||unclosed");
});
