import { mkdirSync, writeFileSync, utimesSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  decideStorybookStaticBuild,
  storySourcesNewerThanIndex,
} from "./storybook-static-build.js";

function writeIndex(
  root: string,
  entries: Record<string, { id: string; importPath: string; type?: string }>,
  options?: { complete?: boolean },
) {
  const dir = path.join(root, "storybook-static");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "index.json"),
    JSON.stringify({ entries }),
    "utf8",
  );
  if (options?.complete !== false) {
    writeFileSync(path.join(dir, "iframe.html"), "<html></html>\n", "utf8");
  }
}

describe("decideStorybookStaticBuild", () => {
  it("reuses an existing fresh index", () => {
    const root = mkdtempSync(path.join(tmpdir(), "vd-static-"));
    const storyPath = path.join(root, "src", "Button.stories.svelte");
    mkdirSync(path.dirname(storyPath), { recursive: true });
    writeFileSync(storyPath, "<Story />\n", "utf8");
    writeIndex(root, {
      "shadcn-button--default": {
        id: "shadcn-button--default",
        type: "story",
        importPath: "./src/Button.stories.svelte",
      },
    });
    // Index newer than source
    const now = Date.now() / 1000;
    utimesSync(storyPath, now - 100, now - 100);
    utimesSync(path.join(root, "storybook-static", "index.json"), now, now);
    utimesSync(path.join(root, "storybook-static", "iframe.html"), now, now);

    const decision = decideStorybookStaticBuild({
      packageRoot: root,
      skipBuild: true,
      storyIdPrefix: "shadcn-button",
    });
    expect(decision).toMatchObject({
      shouldBuild: false,
      reason: "reuse",
    });
    expect(decision.message).toMatch(/Using existing/);
  });

  it("fails closed when skip-build and index is missing", () => {
    const root = mkdtempSync(path.join(tmpdir(), "vd-static-"));
    const decision = decideStorybookStaticBuild({
      packageRoot: root,
      skipBuild: true,
      storyIdPrefix: "shadcn-button",
    });
    expect(decision).toMatchObject({
      shouldBuild: false,
      reason: "skip-build-missing",
    });
  });

  it("rebuilds when index exists but iframe.html is missing", () => {
    const root = mkdtempSync(path.join(tmpdir(), "vd-static-"));
    writeIndex(root, {}, { complete: false });
    const decision = decideStorybookStaticBuild({
      packageRoot: root,
      skipBuild: false,
      storyIdPrefix: "shadcn-button",
    });
    expect(decision).toMatchObject({
      shouldBuild: true,
      reason: "incomplete-static",
    });
  });

  it("builds when index is missing and skip-build is off", () => {
    const root = mkdtempSync(path.join(tmpdir(), "vd-static-"));
    const decision = decideStorybookStaticBuild({
      packageRoot: root,
      skipBuild: false,
      storyIdPrefix: "x",
    });
    expect(decision).toMatchObject({
      shouldBuild: true,
      reason: "missing-index",
    });
  });

  it("force-rebuilds for unskip even when index exists", () => {
    const root = mkdtempSync(path.join(tmpdir(), "vd-static-"));
    writeIndex(root, {});
    const decision = decideStorybookStaticBuild({
      packageRoot: root,
      skipBuild: true,
      forceRebuild: true,
      forceReason: "unskip",
      storyIdPrefix: "shadcn-button",
    });
    expect(decision).toMatchObject({
      shouldBuild: true,
      reason: "unskip",
    });
  });

  it("rebuilds when targeted story source is newer than the index", () => {
    const root = mkdtempSync(path.join(tmpdir(), "vd-static-"));
    const storyPath = path.join(root, "src", "Button.stories.svelte");
    mkdirSync(path.dirname(storyPath), { recursive: true });
    writeFileSync(storyPath, "<Story />\n", "utf8");
    writeIndex(root, {
      "shadcn-button--default": {
        id: "shadcn-button--default",
        type: "story",
        importPath: "./src/Button.stories.svelte",
      },
    });
    const now = Date.now() / 1000;
    utimesSync(
      path.join(root, "storybook-static", "index.json"),
      now - 100,
      now - 100,
    );
    utimesSync(
      path.join(root, "storybook-static", "iframe.html"),
      now - 100,
      now - 100,
    );
    utimesSync(storyPath, now, now);

    expect(storySourcesNewerThanIndex(root, "shadcn-button--default")).toBe(
      true,
    );
    const decision = decideStorybookStaticBuild({
      packageRoot: root,
      skipBuild: true,
      storyIdPrefix: "shadcn-button",
    });
    expect(decision).toMatchObject({
      shouldBuild: true,
      reason: "stale-source",
    });
  });
});
