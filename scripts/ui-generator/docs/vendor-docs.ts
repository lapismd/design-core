import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";

export const VENDOR_DOCS_RELATIVE = "vendor/shadcn-svelte-docs";
export const DEFAULT_DOCS_VENDOR_REF = "shadcn-svelte@1.4.2";
export const UPSTREAM_REPO = "https://github.com/huntabyte/shadcn-svelte";

export type DocsVendorPin = {
  repo: string;
  ref: string;
  commit: string;
  fetchedAt: string;
  paths: string[];
};

export function vendorDocsRoot(packageRoot: string): string {
  return path.join(packageRoot, VENDOR_DOCS_RELATIVE);
}

export function readDocsVendorPin(packageRoot: string): DocsVendorPin {
  const pinPath = path.join(vendorDocsRoot(packageRoot), "PIN.json");
  if (!existsSync(pinPath)) {
    throw new GeneratorError(
      `Missing docs vendor pin at ${pinPath}`,
      EXIT.intake,
      "Run: pnpm ui docs:vendor",
    );
  }
  return JSON.parse(readFileSync(pinPath, "utf8")) as DocsVendorPin;
}

function runGit(args: string[], cwd: string): string {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new GeneratorError(
      `git ${args.join(" ")} failed`,
      EXIT.intake,
      result.stderr || result.stdout || `exit ${result.status}`,
    );
  }
  return (result.stdout || "").trim();
}

function runRsync(args: string[]): void {
  const result = spawnSync("rsync", args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new GeneratorError(
      `rsync failed`,
      EXIT.intake,
      result.stderr || result.stdout || `exit ${result.status}`,
    );
  }
}

/**
 * Resolve a tag or commitish to a commit SHA via GitHub (git ls-remote).
 */
export function resolveUpstreamCommit(ref: string): string {
  if (/^[0-9a-f]{40}$/i.test(ref)) return ref.toLowerCase();
  const out = runGit(["ls-remote", UPSTREAM_REPO, ref], process.cwd());
  const line =
    out
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.endsWith(`\trefs/tags/${ref}`)) ??
    out
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0);
  if (!line) {
    throw new GeneratorError(
      `Could not resolve upstream ref ${ref}`,
      EXIT.intake,
      UPSTREAM_REPO,
    );
  }
  const sha = line.split(/\s+/)[0]!;
  // Annotated tags: peel with ^{} if present in ls-remote output
  const peeled = out
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.endsWith(`\trefs/tags/${ref}^{}`));
  if (peeled) return peeled.split(/\s+/)[0]!.toLowerCase();
  return sha.toLowerCase();
}

/**
 * Sparse-checkout upstream docs content, top-level examples, and blocks into vendor/.
 */
export function refreshDocsVendor(args: {
  packageRoot: string;
  ref?: string;
}): DocsVendorPin {
  const ref = args.ref?.trim() || DEFAULT_DOCS_VENDOR_REF;
  log.step(`Resolving upstream docs pin ${ref}`);
  const commit = resolveUpstreamCommit(ref);
  log.info(`commit ${commit}`);

  const vendorRoot = vendorDocsRoot(args.packageRoot);
  const tmp = mkdtempSync(path.join(tmpdir(), "ui-docs-vendor-"));
  try {
    const repoDir = path.join(tmp, "repo");
    runGit(
      [
        "clone",
        "--filter=blob:none",
        "--sparse",
        "--depth",
        "1",
        UPSTREAM_REPO,
        repoDir,
      ],
      tmp,
    );
    runGit(["fetch", "--depth", "1", "origin", commit], repoDir);
    runGit(["checkout", commit], repoDir);
    runGit(
      [
        "sparse-checkout",
        "set",
        "docs/content/components",
        "docs/src/lib/registry/examples",
        "docs/src/lib/registry/blocks",
        "docs/static/img",
      ],
      repoDir,
    );

    mkdirSync(path.join(vendorRoot, "content", "components"), {
      recursive: true,
    });
    mkdirSync(path.join(vendorRoot, "examples"), { recursive: true });
    mkdirSync(path.join(vendorRoot, "blocks"), { recursive: true });
    mkdirSync(path.join(vendorRoot, "static", "img"), { recursive: true });

    runRsync([
      "-a",
      "--delete",
      path.join(repoDir, "docs/content/components/"),
      path.join(vendorRoot, "content/components/"),
    ]);
    // Top-level examples only — exclude nested create/ and other dirs.
    runRsync([
      "-a",
      "--delete",
      "--include=*.svelte",
      "--exclude=*",
      path.join(repoDir, "docs/src/lib/registry/examples/"),
      path.join(vendorRoot, "examples/"),
    ]);
    // Full blocks tree (nested dirs like sidebar-07/).
    runRsync([
      "-a",
      "--delete",
      path.join(repoDir, "docs/src/lib/registry/blocks/"),
      path.join(vendorRoot, "blocks/"),
    ]);
    // Docs images referenced as `/img/...` in component markdown.
    runRsync([
      "-a",
      "--delete",
      path.join(repoDir, "docs/static/img/"),
      path.join(vendorRoot, "static/img/"),
    ]);

    const pin: DocsVendorPin = {
      repo: UPSTREAM_REPO,
      ref,
      commit,
      fetchedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      paths: [
        "docs/content/components",
        "docs/src/lib/registry/examples (top-level *.svelte only)",
        "docs/src/lib/registry/blocks",
        "docs/static/img",
      ],
    };
    writeFileSync(
      path.join(vendorRoot, "PIN.json"),
      `${JSON.stringify(pin, null, 2)}\n`,
    );
    log.ok(`Vendored docs sources → ${VENDOR_DOCS_RELATIVE} @ ${commit.slice(0, 7)}`);
    return pin;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
