/**
 * Copy a staged Chrome MCP PNG to many matrix entry ids so ingest can land
 * pages and crop components from a shared page source.
 *
 *   pnpm --dir packages/tasks reference:stage-map -- \
 *     --dir=$TMPDIR/tasks-live-chrome \
 *     --from=state-desktop-inbox.png \
 *     --pages=page-desktop-inbox,page-desktop-shell \
 *     --components=comp-nav-activate,comp-shell-wide \
 *     --from-page=page-desktop-inbox
 *
 * Pages are copied as <id>.png. Components are recorded in a sidecar map for
 * ingest (or you pass --from-page when ingesting those ids).
 */
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileExists } from "./runtime.js";

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((v) => v.startsWith(prefix))?.slice(prefix.length);
}

function parseList(name: string): string[] {
  return (parseArg(name) ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  const stagingDir =
    parseArg("dir") ?? path.join(os.tmpdir(), "tasks-live-chrome");
  const from = parseArg("from");
  if (!from) throw new Error("Missing --from=<file.png>");
  const source = path.isAbsolute(from) ? from : path.join(stagingDir, from);
  if (!(await fileExists(source))) throw new Error(`Missing source ${source}`);

  await mkdir(stagingDir, { recursive: true });
  const pages = parseList("pages");
  for (const id of pages) {
    const dest = path.join(stagingDir, `${id}.png`);
    await copyFile(source, dest);
    process.stdout.write(`staged page ${id}\n`);
  }

  const components = parseList("components");
  const fromPage = parseArg("from-page") ?? pages[0];
  if (components.length && fromPage) {
    const mapPath = path.join(stagingDir, "component-from-page.json");
    let map: Record<string, string> = {};
    try {
      map = JSON.parse(
        await (await import("node:fs/promises")).readFile(mapPath, "utf8"),
      ) as Record<string, string>;
    } catch {
      map = {};
    }
    for (const id of components) map[id] = fromPage;
    await writeFile(mapPath, `${JSON.stringify(map, null, 2)}\n`);
    process.stdout.write(
      `mapped ${components.length} component(s) → ${fromPage}\n`,
    );
  }
}

void main();
