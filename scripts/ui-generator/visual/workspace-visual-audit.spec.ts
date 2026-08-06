import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  auditWorkspaceVisualCoverage,
  type StorybookIndex,
} from "./workspace-visual-audit.js";

const temporaryRoots: string[] = [];

async function temporarySnapshotRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "workspace-visual-audit-"));
  temporaryRoots.push(root);
  return root;
}

function indexWith(tags: string[]): StorybookIndex {
  return {
    entries: {
      "workspace-components-tabs--default": {
        id: "workspace-components-tabs--default",
        type: "story",
        importPath: "./src/shared/workspace/tabs/WorkspaceTabs.stories.svelte",
        tags,
      },
    },
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("Workspace visual coverage audit", () => {
  it("reports pending stories without treating approved creation as complete", async () => {
    const snapshotRoot = await temporarySnapshotRoot();
    const result = auditWorkspaceVisualCoverage({
      index: indexWith(["visual-pending"]),
      snapshotRoot,
    });

    expect(result.errors).toEqual([]);
    expect(result.summary).toMatchObject({
      stories: 1,
      pending: 1,
      baselines: 0,
      pendingWithoutBaseline: 1,
    });
  });

  it("requires baselines for approved stories and the final gate", async () => {
    const snapshotRoot = await temporarySnapshotRoot();
    const approved = auditWorkspaceVisualCoverage({
      index: indexWith(["visual-approved"]),
      snapshotRoot,
    });
    const finalGate = auditWorkspaceVisualCoverage({
      index: indexWith(["visual-pending"]),
      snapshotRoot,
      requireBaselines: true,
    });

    expect(approved.errors[0]).toContain("is missing");
    expect(finalGate.errors[0]).toContain("is missing");
  });

  it("recognizes primary and mode captures while rejecting orphans", async () => {
    const snapshotRoot = await temporarySnapshotRoot();
    const directory = path.join(snapshotRoot, "workspace/tabs");
    await mkdir(directory, { recursive: true });
    await Promise.all([
      writeFile(path.join(directory, "default-chromium.png"), "primary"),
      writeFile(path.join(directory, "default--dark-chromium.png"), "dark"),
      writeFile(path.join(directory, "orphan-chromium.png"), "orphan"),
    ]);

    const result = auditWorkspaceVisualCoverage({
      index: indexWith(["visual-pending"]),
      snapshotRoot,
    });

    expect(result.summary.baselines).toBe(1);
    expect(result.orphanBaselines).toEqual([
      "workspace/tabs/orphan-chromium.png",
    ]);
  });
});
