import { expect, it } from "vitest";
import { localAnchor } from "./reader-source.js";
import { commentAnchor } from "./anchors.js";
import { middleDecorations } from "./middle-fold.js";

it("keeps repeated fenced bodies distinct while projecting exact source comments", () => {
  const original = {
    id: "message",
    revision: "v1",
    label: "Message",
    kind: "markdown" as const,
    text: "Before\n\n```ts\nconst café = 1;\n```\n\n```ts\nconst café = 1;\n```",
  };
  const first = original.text.indexOf("const");
  const second = original.text.lastIndexOf("const");
  const text = "const café = 1;";
  const display = { ...original, id: "fence", kind: "code" as const, text };
  const anchor = commentAnchor(original, { from: second + 6, to: second + 10 });
  expect(anchor.quote).toBe("café");
  expect(
    localAnchor(display, anchor, {
      block: original,
      from: first,
      to: first + text.length,
    }),
  ).toBeUndefined();
  expect(
    localAnchor(display, anchor, {
      block: original,
      from: second,
      to: second + text.length,
    }),
  ).toEqual({ from: 6, to: 10 });
});
it("keeps a comment in a fenced middle visible using the existing fold policy", () => {
  const text = Array.from({ length: 60 }, (_, index) => `line ${index}`).join(
    "\n",
  );
  const original = {
    id: "message",
    revision: "v1",
    label: "Message",
    kind: "markdown" as const,
    text: `Before\n\n\`\`\`text\n${text}\n\`\`\``,
  };
  const display = { ...original, id: "fence", kind: "code" as const, text };
  const from = original.text.indexOf("line 0");
  const source = { block: original, from, to: from + text.length };
  const state = { disclosures: {}, threads: [], active: undefined };
  expect(middleDecorations(display, state, source).size).toBe(1);
  const at = original.text.indexOf("line 30");
  const active = {
    anchor: commentAnchor(original, { from: at, to: at + 7 }),
    label: "Message",
    threadId: "t",
    commentId: "c",
    location: "inline" as const,
  };
  expect(middleDecorations(display, { ...state, active }, source).size).toBe(0);
});
