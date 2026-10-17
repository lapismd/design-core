// Adapted from jj-store 2a479c74; Apache-2.0.
import { describe, test, expect } from "vitest";
import reference from "./reference/capture.stories.fixture.json";
import { deltaChatItems } from "./reference/adapter.stories.fixture.js";
import { utf8ToUtf16, byteSlice } from "./reference/offsets.stories.fixture.js";
import { capturedPatchBlocks } from "./reference/patches.stories.fixture.js";
import { commentAnchor, validAnchor } from "./anchors.js";
import { navigationTurns } from "./navigation-turns.js";
import { markdownBlocks } from "./reference/markdown-blocks.stories.fixture.js";

describe("Delta reference mapping", () => {
  test("preserves all 30 tools and assistant segments between tool groups", () => {
    const items = deltaChatItems(reference);
    expect(items.flatMap((i) => i.tools ?? [])).toHaveLength(30);
    expect(
      items.filter((i) => i.kind === "message" && i.role === "assistant"),
    ).toHaveLength(2);
    expect(items.map((i) => i.id).length).toBe(
      new Set(items.map((i) => i.id)).size,
    );
    expect(items[0].role).toBe("user");
    expect(
      items.flatMap((i) => i.tools ?? []).every((t) => t.status === "complete"),
    ).toBe(true);
    expect(JSON.stringify(reference)).not.toContain("stevejuma");
    expect(items.some((i) => i.kind === "handoff")).toBe(true);
    expect(items.find((i) => i.kind === "handoff")!.blocks[0].kind).toBe(
      "context",
    );
  });
  test("maps the full prompt/response and 30 tools into one actual conversation turn", () => {
    const turns = navigationTurns(deltaChatItems(reference));
    expect(turns).toHaveLength(1);
    expect(turns[0].toolCount).toBe(30);
    expect(turns[0].prompt).toContain("Would like to extend");
    expect(turns[0].summary).toContain("Block screen only");
    expect(turns[0].createdAt).toBeGreaterThan(0);
    expect(turns[0]).toMatchObject({ additions: 175, deletions: 31 });
    expect(turns[0].firstItemId).toBe("delta-0");
  });
  test("converts Unicode byte offsets and rejects offsets inside characters", () => {
    const text = "aé👩🏽‍💻z";
    const prefix = "aé👩🏽‍💻";
    expect(utf8ToUtf16(text, new TextEncoder().encode(prefix).length)).toBe(
      prefix.length,
    );
    expect(byteSlice("aéz", 1, 3)).toBe("é");
    expect(() => utf8ToUtf16(text, 2)).toThrow();
    expect(() => utf8ToUtf16(text, 999)).toThrow(RangeError);
  });
  test("keeps multi-file patch hunks without synthetic file coordinates", () => {
    const tool = reference.records.find(
      (r) => r.kind === "ToolUse" && r.name === "apply_patch",
    )!;
    const blocks = capturedPatchBlocks(tool.input!, tool.id, "v1");
    expect(blocks).toHaveLength(6);
    expect(blocks[0].path).toBe("Sources/BedtimeCore/Schedule.swift");
    expect(blocks[0].text).toContain("+public enum BedtimeAction");
    expect(blocks[0].text).toContain("@@");
  });
});
