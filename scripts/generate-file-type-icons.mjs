import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAllIcons } from "material-file-icons";

// Only artwork and matching data are extracted. The upstream runtime stays dev-only.
const root = fileURLToPath(new URL("../", import.meta.url));
const family = path.join(root, "src/shared/shadcn/file-type-icon");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const catalog = readJson(path.join(family, "file-type-icon.catalog.json"));
const upstream = getAllIcons();
const upstreamByName = new Map(upstream.map((icon) => [icon.name, icon]));
const selected = new Set(Object.values(catalog.categories).flat());
const sorted = (entries) =>
  Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => a.localeCompare(b, "en")),
  );
for (const name of selected)
  if (!upstreamByName.has(name))
    throw new Error(`Unknown selected artwork: ${name}`);

const artwork = Object.fromEntries(
  [...selected].sort().map((name) => [name, upstreamByName.get(name).svg]),
);
const filenames = {};
const extensions = {};
for (const icon of upstream) {
  const target = selected.has(icon.name)
    ? icon.name
    : (catalog.groupedIcons[icon.name] ??
      (icon.files?.length ? "settings" : "document"));
  if (!selected.has(target))
    throw new Error(`Missing grouped artwork: ${target}`);
  for (const filename of icon.files ?? [])
    filenames[filename.toLowerCase()] ??= target;
  for (const extension of icon.extensions ?? [])
    extensions[extension.toLowerCase()] ??= target;
}
for (const [target, entries] of Object.entries(catalog.extensionGroups)) {
  if (!selected.has(target))
    throw new Error(`Missing extension artwork: ${target}`);
  for (const extension of entries) extensions[extension] = target;
}
for (const [filename, target] of Object.entries(catalog.filenames)) {
  if (!selected.has(target))
    throw new Error(`Missing filename artwork: ${target}`);
  filenames[filename] = target;
}
const version = readJson(
  path.join(root, "node_modules/material-file-icons/package.json"),
).version;
if (version !== catalog.sourceVersion)
  throw new Error(
    `Expected material-file-icons ${catalog.sourceVersion}, got ${version}`,
  );
const outputs = {
  "file-type-artwork.generated.json": sorted(artwork),
  "file-type-matchers.generated.json": {
    filenames: sorted(filenames),
    extensions: sorted(extensions),
  },
};
const check = process.argv.includes("--check");
for (const [name, data] of Object.entries(outputs)) {
  const output = JSON.stringify(data, null, 2) + "\n";
  const file = path.join(family, name);
  if (check) {
    if (readFileSync(file, "utf8") !== output)
      throw new Error(`Stale icon assets: run pnpm icons:generate (${name})`);
  } else writeFileSync(file, output);
}
console.log(
  JSON.stringify({
    mode: check ? "verified" : "generated",
    sourceVersion: version,
    icons: selected.size,
    filenames: Object.keys(filenames).length,
    extensions: Object.keys(extensions).length,
    artworkSha256: createHash("sha256")
      .update(JSON.stringify(outputs["file-type-artwork.generated.json"]))
      .digest("hex"),
  }),
);
