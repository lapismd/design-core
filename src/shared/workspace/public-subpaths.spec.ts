import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(workspaceRoot, "../../..");

describe("Workspace package subpaths", () => {
  it("publishes every top-level component family with a barrel", async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(repoRoot, "package.json"), "utf8"),
    ) as { exports: Record<string, string> };
    const directories = (
      await readdir(workspaceRoot, { withFileTypes: true })
    ).filter((entry) => entry.isDirectory());

    const missing: string[] = [];
    for (const directory of directories) {
      const indexPath = path.join(workspaceRoot, directory.name, "index.ts");
      const hasIndex = await readFile(indexPath, "utf8")
        .then(() => true)
        .catch(() => false);
      if (!hasIndex) continue;

      const subpath = `./workspace/${directory.name}`;
      const expected = `./src/shared/workspace/${directory.name}/index.ts`;
      if (packageJson.exports[subpath] !== expected) {
        missing.push(`${subpath} -> ${expected}`);
      }
    }

    expect(missing).toEqual([]);
  });

  it("publishes optional plugins from their documented subpaths", async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(repoRoot, "package.json"), "utf8"),
    ) as { exports: Record<string, string> };

    expect(packageJson.exports).toMatchObject({
      "./workspace/plugins/fmode":
        "./src/shared/workspace/plugins/f-mode/index.ts",
      "./workspace/plugins/notifications":
        "./src/shared/workspace/plugins/notifications/index.ts",
    });
  });
});
