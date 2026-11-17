import { lstatSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const releaseVersionPages = [
  "spec/src/architecture.md",
  "spec/src/packages.md",
];
const version = "[0-9]+\\.[0-9]+\\.[0-9]+(?:-[0-9A-Za-z.-]+)?";
const marker = new RegExp(
  "^Source package version: `(" +
    version +
    ")` \\(`@lapismd/design-core`\\)\\.$",
  "gm",
);

function ownedFile(root, file) {
  const parts = file.split("/");
  for (let i = 1; i <= parts.length; i++) {
    const target = path.join(root, ...parts.slice(0, i));
    const stat = lstatSync(target);
    if (
      stat.isSymbolicLink() ||
      (i < parts.length ? !stat.isDirectory() : !stat.isFile())
    )
      throw Error(
        `Release version input must be an owned regular file: ${file}`,
      );
  }
  return path.join(root, file);
}

/** Refresh only declared source-version facts after the real Changesets mutation. */
export function syncReleaseSpecVersion({
  root = process.cwd(),
  write = false,
} = {}) {
  const manifest = JSON.parse(
    readFileSync(ownedFile(root, "package.json"), "utf8"),
  );
  if (
    manifest.name !== "@lapismd/design-core" ||
    !new RegExp("^" + version + "$").test(manifest.version ?? "")
  )
    throw Error(
      "Release version requires the exact Design Core package identity and semver",
    );
  const line = `Source package version: \`${manifest.version}\` (\`@lapismd/design-core\`).`;
  // Validate the complete output set before writing any page.
  const outputs = releaseVersionPages.map((file) => {
    const target = ownedFile(root, file);
    const before = readFileSync(target, "utf8");
    if ([...before.matchAll(marker)].length !== 1)
      throw Error(
        `Expected exactly one source package version marker: ${file}`,
      );
    return { file, target, before, after: before.replace(marker, line) };
  });
  const changed = outputs.filter(({ before, after }) => before !== after);
  if (!write && changed.length)
    throw Error(
      "Stale canonical source package version: " +
        changed.map(({ file }) => file).join(", "),
    );
  if (write)
    for (const { target, after } of changed) writeFileSync(target, after);
  return {
    version: manifest.version,
    changed: changed.map(({ file }) => file),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !["--check", "--write"].includes(args[0]))
    throw Error("Use --check or --write");
  const result = syncReleaseSpecVersion({ write: args[0] === "--write" });
  console.log(
    `Canonical source version ${result.version}: ${result.changed.length} page(s) refreshed.`,
  );
}
