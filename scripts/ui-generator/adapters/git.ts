import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { EXIT, GeneratorError } from "../errors.js";
import type { UiGeneratorConfig } from "../config.js";

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function assertCleanGit(packageRoot: string): {
  head: string;
} {
  if (!existsSync(path.join(packageRoot, ".git"))) {
    throw new GeneratorError(
      "Git repository required for transactional ui:add",
      EXIT.preflight,
    );
  }

  try {
    git(["rev-parse", "--git-dir"], packageRoot);
  } catch {
    throw new GeneratorError("Not a git repository", EXIT.preflight);
  }

  const status = git(["status", "--porcelain"], packageRoot);
  if (status) {
    throw new GeneratorError(
      "Working tree must be clean before running the generator",
      EXIT.preflight,
      status,
    );
  }

  for (const name of ["MERGE_HEAD", "REBASE_HEAD", "CHERRY_PICK_HEAD"]) {
    if (existsSync(path.join(packageRoot, ".git", name))) {
      throw new GeneratorError(
        `Refuse to run during in-progress git operation (${name})`,
        EXIT.preflight,
      );
    }
  }

  const head = git(["rev-parse", "HEAD"], packageRoot);
  return { head };
}

export function assertHeadUnchanged(packageRoot: string, expectedHead: string) {
  const head = git(["rev-parse", "HEAD"], packageRoot);
  if (head !== expectedHead) {
    throw new GeneratorError(
      "Repository HEAD changed before patch apply",
      EXIT.patchApply,
      `expected ${expectedHead}, got ${head}`,
    );
  }
  const status = git(["status", "--porcelain"], packageRoot);
  if (status) {
    throw new GeneratorError(
      "Working tree became dirty before patch apply",
      EXIT.patchApply,
      status,
    );
  }
}

export type WorktreeHandle = {
  path: string;
  runId: string;
  dispose: (keep?: boolean) => void;
};

export function createDetachedWorktree(
  config: UiGeneratorConfig,
  runId: string,
): WorktreeHandle {
  const worktreesRoot = path.join(config.packageRoot, config.worktreesRoot);
  mkdirSync(worktreesRoot, { recursive: true });
  const worktreePath = path.join(worktreesRoot, runId);
  if (existsSync(worktreePath)) {
    rmSync(worktreePath, { recursive: true, force: true });
  }

  try {
    git(
      ["worktree", "add", "--detach", worktreePath, "HEAD"],
      config.packageRoot,
    );
  } catch (error) {
    throw new GeneratorError(
      "Failed to create detached git worktree",
      EXIT.preflight,
      error instanceof Error ? error.message : String(error),
    );
  }

  return {
    path: worktreePath,
    runId,
    dispose(keep = false) {
      if (keep) return;
      try {
        git(["worktree", "remove", "--force", worktreePath], config.packageRoot);
      } catch {
        rmSync(worktreePath, { recursive: true, force: true });
        try {
          git(["worktree", "prune"], config.packageRoot);
        } catch {
          /* ignore */
        }
      }
    },
  };
}

export function createBinaryPatch(
  worktreePath: string,
  patchPath: string,
): string {
  // Prefer staged+unstaged vs HEAD so newly added files (after git add -A) are included.
  const diff = execFileSync(
    "git",
    ["diff", "--binary", "--no-ext-diff", "--cached", "HEAD"],
    {
      cwd: worktreePath,
      encoding: "buffer",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  writeFileSync(patchPath, diff);
  return patchPath;
}

export function validatePatchPaths(
  patchContent: string,
  allowlist: string[],
): string[] {
  const paths = new Set<string>();
  for (const line of patchContent.split("\n")) {
    const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
    if (!match) continue;
    paths.add(match[2]!);
  }

  const violations: string[] = [];
  for (const filePath of paths) {
    const ok = allowlist.some(
      (prefix) =>
        filePath === prefix ||
        filePath.startsWith(prefix) ||
        prefix.endsWith(filePath),
    );
    if (!ok) violations.push(filePath);
  }
  if (violations.length) {
    throw new GeneratorError(
      "Patch contains paths outside the allowlist",
      EXIT.patchApply,
      violations.join("\n"),
    );
  }
  return [...paths];
}

export function applyBinaryPatch(
  packageRoot: string,
  patchPath: string,
  allowlist: string[],
) {
  const content = readFileSync(patchPath, "utf8");
  if (!content.trim()) {
    throw new GeneratorError("Generated patch is empty", EXIT.patchApply);
  }
  validatePatchPaths(content, allowlist);
  try {
    execFileSync(
      "git",
      ["apply", "--binary", "--whitespace=nowarn", patchPath],
      { cwd: packageRoot, stdio: "inherit" },
    );
  } catch (error) {
    throw new GeneratorError(
      "Failed to apply binary patch to the real worktree",
      EXIT.patchApply,
      error instanceof Error ? error.message : String(error),
    );
  }
}
