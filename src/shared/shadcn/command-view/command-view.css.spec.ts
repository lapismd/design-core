import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./command-view.css", import.meta.url), "utf8");

describe("command view item icon alignment", () => {
  it("keeps the item icon on the label row", () => {
    expect(css).toMatch(
      /\[data-ui-part="item"\] \{[\s\S]*?grid-template-areas:[\s\S]*?"icon label shortcut"[\s\S]*?"\. description shortcut";/,
    );
    expect(css).toMatch(
      /\[data-ui-part="item-icon"\] \{[\s\S]*?align-self:\s*center;[\s\S]*?width:\s*var\(--ui-command-view-icon-size\);[\s\S]*?height:\s*var\(--ui-command-view-icon-size\);/,
    );
  });
});
