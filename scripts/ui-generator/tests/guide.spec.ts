import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getGuideIndex,
  getGuideTopic,
  listGuideTopics,
  runGuide,
} from "../pipeline/guide.js";
import { createColors } from "../cli/color.js";
import { renderGuideIndex, renderGuideTopic } from "../cli/render.js";
import { jsonOk, jsonErr } from "../cli/json.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("ui guide", () => {
  it("lists curated topics in reading order", () => {
    const topics = listGuideTopics(packageRoot);
    const ids = topics.map((t) => t.id);
    expect(ids.slice(0, 5)).toEqual([
      "layers",
      "shadcn",
      "forms",
      "shell",
      "testing",
    ]);
    expect(ids).toContain("llms-extraction");
  });

  it("returns an index with reading order", () => {
    const index = getGuideIndex(packageRoot);
    expect(index.topics.length).toBeGreaterThanOrEqual(4);
    expect(index.readingOrder[0]).toMatch(/layers/);
    const text = renderGuideIndex(index, createColors(false));
    expect(text).toContain("@lapismd/design-core agent guide");
    expect(text).toContain("pnpm ui guide");
  });

  it("loads shadcn topic body and sources", () => {
    const topic = getGuideTopic(packageRoot, "shadcn");
    expect(topic.title).toMatch(/Shadcn/i);
    expect(topic.body).toMatch(/ui:add/);
    expect(topic.sources).toContain("AGENTS.md");
    const text = renderGuideTopic(topic, createColors(false));
    expect(text).toContain(topic.summary);
  });

  it("loads the shell composition contract", () => {
    const topic = getGuideTopic(packageRoot, "shell");
    expect(topic.title).toMatch(/App shell/i);
    expect(topic.body).toMatch(/Toggle placement/);
    expect(topic.body).toMatch(/Sidebar\.Header/);
    expect(topic.body).toMatch(/collapsed/);
    expect(topic.sources).toContain("src/shared/shell/Guidance.mdx");
  });

  it("runGuide switches between index and topic", () => {
    expect(runGuide(packageRoot).kind).toBe("index");
    const topic = runGuide(packageRoot, "testing");
    expect(topic.kind).toBe("topic");
    if (topic.kind === "topic") {
      expect(topic.topic.body).toMatch(/test:visual/);
    }
  });

  it("rejects unknown topics", () => {
    expect(() => getGuideTopic(packageRoot, "nope")).toThrow(
      /Unknown guide topic/,
    );
  });

  it("builds json envelopes", () => {
    expect(jsonOk("guide", { id: "forms" })).toEqual({
      ok: true,
      command: "guide",
      data: { id: "forms" },
    });
    expect(jsonErr("exit_2", "boom").ok).toBe(false);
  });
});
