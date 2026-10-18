import { expect, it } from "vitest";
import { commentAnchor, validAnchor } from "./anchors.js";
const block = {
  id: "body",
  revision: "v1",
  kind: "markdown" as const,
  label: "Body",
  text: "First café 👩🏽‍💻.\n\nNext paragraph.",
};
it("retains exact UTF-16 source ranges and rejects changed revisions/quotes", () => {
  const from = block.text.indexOf("👩");
  const to = from + "👩🏽‍💻".length;
  const anchor = commentAnchor(block, { from, to });
  expect(anchor.quote).toBe("👩🏽‍💻");
  expect(validAnchor(block, anchor)).toBe(true);
  expect(validAnchor({ ...block, revision: "v2" }, anchor)).toBe(false);
  expect(
    validAnchor({ ...block, text: block.text.replace("👩🏽‍💻", "🦊") }, anchor),
  ).toBe(false);
  expect(block.text.slice(anchor.from, anchor.to)).toBe(anchor.quote);
});
it("uses paragraph, code-line and whole-section anchors at a caret", () => {
  expect(commentAnchor(block, { from: 0, to: 0 }).quote).toBe("First café 👩🏽‍💻.");
  expect(
    commentAnchor(
      { ...block, kind: "code", text: "one\ntwo" },
      { from: 4, to: 4 },
    ).quote,
  ).toBe("two");
  expect(
    commentAnchor({ ...block, kind: "custom" }, { from: 3, to: 4 }).quote,
  ).toBe(block.text);
});
it("rejects invalid non-integer ranges instead of accepting ambiguous offsets", () => {
  expect(
    validAnchor(block, {
      blockId: block.id,
      revision: block.revision,
      from: 0.5,
      to: 5,
      quote: block.text.slice(0, 5),
    }),
  ).toBe(false);
});
it("retains a complete table row and exact Unicode selection as immutable context", () => {
  const table = {
    ...block,
    text: "Before\n\n| Name | Role |\n| --- | --- |\n| café 👩🏽‍💻 | Designer |\n| café 👩🏽‍💻 | Developer |",
  };
  const from = table.text.lastIndexOf("café");
  const anchor = commentAnchor(table, { from, to: from + "café 👩🏽‍💻".length });
  expect(anchor.quote).toBe("café 👩🏽‍💻");
  expect(anchor.tableContext!.markdown).toBe(
    "| Name | Role |\n| --- | --- |\n| café 👩🏽‍💻 | Developer |",
  );
  expect(
    anchor.tableContext!.markdown.slice(
      anchor.tableContext!.from,
      anchor.tableContext!.to,
    ),
  ).toBe(anchor.quote);
  expect(
    validAnchor({ ...table, revision: "v2", text: "Deleted table" }, anchor),
  ).toBe(false);
  expect(anchor.tableContext!.markdown).toContain("Developer");
});
