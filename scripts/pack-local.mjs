import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Preserve import subpaths while targeting the prepared source and declarations. */
export function preparedExports(exports) {
  const targetPath = (target) =>
    target.replace(/^\.\/src\//, "./dist/").replace(/(?<!\.d)\.ts$/, ".js");
  return Object.fromEntries(
    Object.entries(exports).map(([name, target]) => {
      if (typeof target !== "string")
        return [
          name,
          Object.fromEntries(
            Object.entries(target).map(([condition, path]) => [
              condition,
              targetPath(path),
            ]),
          ),
        ];
      const runtime = targetPath(target);
      if (/\.css$|\.d\.ts$/.test(runtime)) return [name, runtime];
      return [
        name,
        {
          types: runtime.endsWith(".svelte")
            ? runtime + ".d.ts"
            : runtime.replace(/\.js$/, ".d.ts"),
          svelte: runtime,
          import: runtime,
        },
      ];
    }),
  );
}

export async function packLocal(root) {
  mkdirSync(join(root, ".local"), { recursive: true });
  const stage = mkdtempSync(join(root, ".local", "package-stage-"));
  try {
    const raw = join(stage, "source.tgz");
    execFileSync("pnpm", ["pack", "--out", raw], { cwd: root, stdio: "pipe" });
    execFileSync("tar", ["-xzf", raw, "-C", stage]);
    const packaged = join(stage, "package");
    const manifest = JSON.parse(
      readFileSync(join(packaged, "package.json"), "utf8"),
    );
    manifest.exports = preparedExports(manifest.exports);
    writeFileSync(
      join(packaged, "package.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    execFileSync(
      join(root, "node_modules", ".bin", "svelte-package"),
      [
        "--input",
        join(packaged, "src"),
        "--output",
        join(packaged, "dist"),
        "--tsconfig",
        join(root, "tsconfig.json"),
      ],
      { cwd: packaged, stdio: "inherit" },
    );
    for (const file of readdirSync(join(packaged, "src"), {
      recursive: true,
    })) {
      if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
        // Declaration warnings cannot silently produce an incomplete archive.
        readFileSync(join(packaged, "dist", file.replace(/\.ts$/, ".d.ts")));
      }
    }
    manifest.exports = preparedExports(manifest.exports);
    manifest.files = [
      "dist",
      "README.md",
      "CHANGELOG.md",
      "LICENSE.md",
      "spec/src/styling-and-themes.md",
    ];
    // This archive is an explicit local validation input, never a publication.
    delete manifest.scripts;
    writeFileSync(
      join(packaged, "package.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    rmSync(join(packaged, "src"), { recursive: true });
    const directory = join(root, ".local", "packages");
    mkdirSync(directory, { recursive: true });
    const output = join(
      directory,
      `lapismd-design-core-${manifest.version}-built.tgz`,
    );
    execFileSync("pnpm", ["pack", "--out", output], {
      cwd: packaged,
      stdio: "pipe",
    });
    const digest = createHash("sha256")
      .update(readFileSync(output))
      .digest("hex");
    console.log(
      JSON.stringify({
        archive: output,
        sha256: digest,
        version: manifest.version,
      }),
    );
    return output;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await packLocal(resolve(import.meta.dirname, ".."));
}
