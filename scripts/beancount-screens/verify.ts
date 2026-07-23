/**
 * Verify capture-matrix entries have matching screen stories and baseline files.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matrix from "./capture-matrix.json" with { type: "json" };

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, "../..");
const snapshotRoot = path.join(packageRoot, matrix.snapshotRoot);
const screensStories = path.join(
  packageRoot,
  "src/apps/beancount/screens/Screens.stories.svelte",
);
const referenceManifestPath = path.join(
  snapshotRoot,
  "apps/beancount/screens/manifest.json",
);

type ReferenceManifest = {
  schemaVersion: number;
  entries: Array<{
    id: string;
    outputPath: string;
    sha256: string;
  }>;
};

function sha256(pathname: string): string {
  return createHash("sha256").update(readFileSync(pathname)).digest("hex");
}

function slugifyStoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function storyNamesFromScreensFile(source: string): Set<string> {
  const names = new Set<string>();
  const re = /<Story\b[^>]*\bname="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    names.add(match[1]!);
  }
  return names;
}

function main() {
  const skipBaselines = process.argv.includes("--skip-baselines");
  const errors: string[] = [];

  if (!existsSync(screensStories)) {
    errors.push(`Missing screen stories file: ${screensStories}`);
  } else {
    const source = readFileSync(screensStories, "utf8");
    const storyNames = storyNamesFromScreensFile(source);
    const slugToName = new Map(
      [...storyNames].map((n) => [slugifyStoryName(n), n] as const),
    );

    for (const entry of matrix.entries) {
      const expectedId = `apps-beancount-screens--${entry.id}`;
      if (entry.storyId !== expectedId) {
        errors.push(
          `${entry.id}: storyId must be ${expectedId}, got ${entry.storyId}`,
        );
      }
      if (!slugToName.has(entry.id)) {
        errors.push(
          `${entry.id}: no <Story name> that slugifies to "${entry.id}" (have: ${[...storyNames].join(", ") || "(none)"})`,
        );
      }
    }
  }

  if (!skipBaselines) {
    let manifest: ReferenceManifest | undefined;
    if (!existsSync(referenceManifestPath)) {
      errors.push(
        `Missing reference manifest ${referenceManifestPath} (run FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture)`,
      );
    } else {
      try {
        manifest = JSON.parse(
          readFileSync(referenceManifestPath, "utf8"),
        ) as ReferenceManifest;
        if (manifest.schemaVersion !== 1) {
          errors.push(
            `Unsupported reference manifest schema ${manifest.schemaVersion}; expected 1`,
          );
        }
      } catch (error) {
        errors.push(
          `Could not parse reference manifest ${referenceManifestPath}: ${String(error)}`,
        );
      }
    }

    for (const entry of matrix.entries) {
      const outAbs = path.join(snapshotRoot, entry.outputPath);
      if (!existsSync(outAbs)) {
        errors.push(
          `${entry.id}: missing baseline ${entry.outputPath} (run FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture)`,
        );
        continue;
      }
      const manifestEntry = manifest?.entries.find(
        (candidate) =>
          candidate.id === entry.id &&
          candidate.outputPath === entry.outputPath,
      );
      if (!manifestEntry) {
        errors.push(
          `${entry.id}: missing manifest entry for ${entry.outputPath}`,
        );
      } else if (manifestEntry.sha256 !== sha256(outAbs)) {
        errors.push(`${entry.id}: baseline digest does not match manifest`);
      }
    }
  }

  if (errors.length) {
    console.error(`beancount:screens:verify failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(
    `OK: ${matrix.entries.length} matrix entries` +
      (skipBaselines ? " (stories only)" : ", baselines + stories present"),
  );
}

main();
