/**
 * Map Chrome MCP state-*.png captures onto matrix entry ids, then ready for
 * reference:ingest:delta.
 *
 *   pnpm --dir packages/tasks reference:stage-all -- --dir=$TMPDIR/tasks-live-chrome
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadCaptureMatrix } from "./capture-matrix.js";
import { fileExists } from "./runtime.js";

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((v) => v.startsWith(prefix))?.slice(prefix.length);
}

/** Unique nav fingerprint → preferred page id for that state (desktop). */
const STATE_TO_PAGES: Record<string, { state: string; pages: string[] }> = {
  "desktop|inbox|inbox": {
    state: "state-desktop-inbox.png",
    pages: ["page-desktop-inbox", "page-desktop-shell"],
  },
  "desktop|today|today": {
    state: "state-desktop-today.png",
    pages: ["page-desktop-today", "page-desktop-shell-today"],
  },
  "desktop|tasks|tasks": {
    state: "state-desktop-tasks.png",
    pages: ["page-desktop-tasks", "page-desktop-shell-tasks"],
  },
  "desktop|updates|updates": {
    state: "state-desktop-updates.png",
    pages: [
      "page-desktop-updates",
      "page-desktop-updates-loading",
      "page-desktop-updates-error",
      "page-desktop-shell-updates",
    ],
  },
  "desktop|lists|lists": {
    state: "state-desktop-lists.png",
    pages: ["page-desktop-lists", "page-desktop-shell-lists"],
  },
  "desktop|list-detail|list-detail": {
    state: "state-desktop-list-detail.png",
    pages: [
      "page-desktop-list-detail",
      "page-desktop-shell-list-reference",
    ],
  },
  "desktop|list-detail|list-shared": {
    state: "state-desktop-list-shared.png",
    pages: ["page-desktop-shell-list-shared"],
  },
  "desktop|task-detail|list-detail>open-first-task": {
    state: "state-desktop-task-detail.png",
    pages: [
      "page-desktop-list-detail-open",
      "page-desktop-task-detail",
      "page-desktop-task-detail-open",
    ],
  },
  "desktop|task-detail|inbox>open-first-task": {
    state: "state-desktop-inbox-detail.png",
    pages: ["page-desktop-inbox-detail", "page-desktop-shell-detail"],
  },
  "desktop|task-detail|today>open-first-task": {
    state: "state-desktop-today-detail.png",
    pages: ["page-desktop-today-detail"],
  },
  "mobile|inbox|inbox": {
    state: "state-mobile-inbox.png",
    pages: ["page-mobile-shell", "page-mobile-inbox"],
  },
  "mobile|task-detail|inbox>open-first-task": {
    state: "state-mobile-task-detail.png",
    pages: ["page-mobile-task-detail"],
  },
  "tablet-landscape|inbox|inbox": {
    state: "state-tablet-landscape-inbox.png",
    pages: ["page-tablet-landscape-inbox"],
  },
  "tablet-portrait|inbox|inbox": {
    state: "state-tablet-portrait-inbox.png",
    pages: ["page-tablet-portrait-inbox"],
  },
};

/** Component nav fingerprint → page id to crop from (after pages staged). */
const COMPONENT_FROM_PAGE: Record<string, string> = {
  "desktop|inbox|inbox": "page-desktop-inbox",
  "desktop|today|today": "page-desktop-today",
  "desktop|tasks|tasks": "page-desktop-tasks",
  "desktop|updates|updates": "page-desktop-updates",
  "desktop|lists|lists": "page-desktop-lists",
  "desktop|list-detail|list-detail": "page-desktop-list-detail",
  "desktop|list-detail|list-shared": "page-desktop-shell-list-shared",
  "desktop|list-detail|list-detail>select-first-task": "page-desktop-list-detail",
  "desktop|list-detail|list-detail>focus-composer": "page-desktop-list-detail",
  "desktop|task-detail|list-detail>open-first-task":
    "page-desktop-task-detail-open",
  "desktop|task-detail|inbox>open-first-task": "page-desktop-inbox-detail",
  "mobile|inbox|inbox": "page-mobile-inbox",
  "mobile|task-detail|inbox>open-first-task": "page-mobile-task-detail",
};

/** Prefer richer state files for select/composer when present. */
const COMPONENT_STATE_OVERRIDE: Record<
  string,
  { state?: string; pageId: string }
> = {
  "desktop|list-detail|list-detail>select-first-task": {
    state: "state-desktop-list-select.png",
    pageId: "page-desktop-list-select-staging",
  },
  // Composers: Superlist list view has no bottom composer — use Inbox New task.
  "desktop|list-detail|list-detail>focus-composer": {
    pageId: "page-desktop-inbox",
  },
};

function fingerprint(entry: {
  viewport: string;
  page: string;
  nav: string[];
}): string {
  return `${entry.viewport}|${entry.page}|${entry.nav.join(">")}`;
}

async function main(): Promise<void> {
  const stagingDir =
    parseArg("dir") ?? path.join(os.tmpdir(), "tasks-live-chrome");
  await mkdir(stagingDir, { recursive: true });
  const matrix = await loadCaptureMatrix();

  const componentMap: Record<string, string> = {};
  let stagedPages = 0;

  for (const [key, mapping] of Object.entries(STATE_TO_PAGES)) {
    const source = path.join(stagingDir, mapping.state);
    if (!(await fileExists(source))) {
      process.stderr.write(`missing state ${mapping.state}\n`);
      continue;
    }
    for (const id of mapping.pages) {
      await copyFile(source, path.join(stagingDir, `${id}.png`));
      stagedPages += 1;
      process.stdout.write(`page ${id} ← ${mapping.state}\n`);
    }
  }

  // Stage override "virtual" pages for select so components can crop
  for (const [, override] of Object.entries(COMPONENT_STATE_OVERRIDE)) {
    if (!override.state) continue;
    const source = path.join(stagingDir, override.state);
    if (!(await fileExists(source))) continue;
    await copyFile(source, path.join(stagingDir, `${override.pageId}.png`));
    process.stdout.write(
      `staging page ${override.pageId} ← ${override.state}\n`,
    );
  }

  for (const entry of matrix.entries) {
    if (entry.kind !== "component") continue;
    const fp = fingerprint(entry);
    const override = COMPONENT_STATE_OVERRIDE[fp];
    if (override) {
      if (
        !override.state ||
        (await fileExists(path.join(stagingDir, override.state))) ||
        (await fileExists(path.join(stagingDir, `${override.pageId}.png`)))
      ) {
        componentMap[entry.id] = override.pageId;
        continue;
      }
    }
    const fromPage = COMPONENT_FROM_PAGE[fp];
    if (fromPage) {
      componentMap[entry.id] = fromPage;
    } else {
      process.stderr.write(`no component mapping for ${entry.id} (${fp})\n`);
    }
  }

  // List view has no bottom composer — always crop composer refs from Inbox.
  for (const id of Object.keys(componentMap)) {
    if (id.startsWith("comp-composer-")) {
      componentMap[id] = "page-desktop-inbox";
    }
  }

  const mapPath = path.join(stagingDir, "component-from-page.json");
  await writeFile(mapPath, `${JSON.stringify(componentMap, null, 2)}\n`);
  process.stdout.write(
    `staged ${stagedPages} page copies; mapped ${Object.keys(componentMap).length} components → ${mapPath}\n`,
  );

  // Sanity: every matrix entry is covered
  const missingPages: string[] = [];
  for (const entry of matrix.entries) {
    if (entry.kind !== "page") continue;
    if (!(await fileExists(path.join(stagingDir, `${entry.id}.png`)))) {
      missingPages.push(entry.id);
    }
  }
  if (missingPages.length) {
    process.stderr.write(`missing page staging: ${missingPages.join(", ")}\n`);
  }
  const missingComps = matrix.entries
    .filter((e) => e.kind === "component" && !componentMap[e.id])
    .map((e) => e.id);
  if (missingComps.length) {
    process.stderr.write(
      `missing component map: ${missingComps.join(", ")}\n`,
    );
  }
}

void main();
