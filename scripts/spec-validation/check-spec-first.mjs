#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIRECTORY, "../..");
const CANONICAL_SPEC_PATTERN = /^spec\/src\/(?!SUMMARY\.md$).+\.md$/;

const IGNORED_PATTERNS = [
  /(^|\/)node_modules\//,
  /(^|\/)(?:dist|build|\.svelte-kit|\.turbo)\//,
  /(^|\/)(?:coverage|test-results|playwright-report|storybook-static(?:-check)?)\//,
  /^spec\/book\//,
  /\.(?:spec|test)\.[cm]?[jt]sx?$/,
  /\.stories\.(?:svelte|[cm]?[jt]sx?)$/,
  /\.example-sources\.[cm]?[jt]sx?$/,
  /\.mdx$/,
  /^README\.md$/,
  /^SPEC_MIGRATION\.md$/,
  /^COMPONENT_AUDIT\.md$/,
];

const SHADCN_CHAPTERS = new Map([
  ["accordion", "spec/src/shadcn/disclosure-and-navigation.md"],
  ["alert", "spec/src/shadcn/data-and-feedback.md"],
  ["alert-dialog", "spec/src/shadcn/overlays.md"],
  ["badge", "spec/src/shadcn/data-and-feedback.md"],
  ["breadcrumb", "spec/src/shadcn/disclosure-and-navigation.md"],
  ["button", "spec/src/shadcn/actions-and-content.md"],
  ["button-group", "spec/src/shadcn/actions-and-content.md"],
  ["card", "spec/src/shadcn/layout.md"],
  ["checkbox", "spec/src/shadcn/forms.md"],
  ["code", "spec/src/shadcn/actions-and-content.md"],
  ["code-block", "spec/src/shadcn/actions-and-content.md"],
  ["collapsible", "spec/src/shadcn/disclosure-and-navigation.md"],
  ["column-canvas", "spec/src/shadcn/layout.md"],
  ["command", "spec/src/shadcn/forms.md"],
  ["context-menu", "spec/src/shadcn/overlays.md"],
  ["dialog", "spec/src/shadcn/overlays.md"],
  ["drawer", "spec/src/shadcn/overlays.md"],
  ["dropdown-menu", "spec/src/shadcn/overlays.md"],
  ["empty", "spec/src/shadcn/data-and-feedback.md"],
  ["field", "spec/src/shadcn/forms.md"],
  ["hover-card", "spec/src/shadcn/overlays.md"],
  ["input", "spec/src/shadcn/forms.md"],
  ["input-group", "spec/src/shadcn/forms.md"],
  ["label", "spec/src/shadcn/forms.md"],
  ["pagination", "spec/src/shadcn/disclosure-and-navigation.md"],
  ["popover", "spec/src/shadcn/overlays.md"],
  ["progress", "spec/src/shadcn/data-and-feedback.md"],
  ["resizable", "spec/src/shadcn/layout.md"],
  ["scroll-area", "spec/src/shadcn/layout.md"],
  ["select", "spec/src/shadcn/forms.md"],
  ["separator", "spec/src/shadcn/layout.md"],
  ["sheet", "spec/src/shadcn/overlays.md"],
  ["sidebar", "spec/src/shadcn/layout.md"],
  ["skeleton", "spec/src/shadcn/data-and-feedback.md"],
  ["slider", "spec/src/shadcn/forms.md"],
  ["spinner", "spec/src/shadcn/data-and-feedback.md"],
  ["swipe-item", "spec/src/shadcn/actions-and-content.md"],
  ["switch", "spec/src/shadcn/forms.md"],
  ["table", "spec/src/shadcn/data-and-feedback.md"],
  ["tabs", "spec/src/shadcn/disclosure-and-navigation.md"],
  ["textarea", "spec/src/shadcn/forms.md"],
  ["toggle", "spec/src/shadcn/actions-and-content.md"],
  ["toggle-group", "spec/src/shadcn/actions-and-content.md"],
  ["tooltip", "spec/src/shadcn/overlays.md"],
]);

const FORM_CHAPTERS = new Map([
  ["core", "spec/src/forms/core-and-orchestrators.md"],
  ["structured-form", "spec/src/forms/core-and-orchestrators.md"],
  ["yaml-backed-form", "spec/src/forms/core-and-orchestrators.md"],
  ["json-backed-form", "spec/src/forms/core-and-orchestrators.md"],
  ["patchable-form", "spec/src/forms/core-and-orchestrators.md"],
  ["autocomplete-input", "spec/src/forms/inputs.md"],
  ["chip-autocomplete", "spec/src/forms/inputs.md"],
  ["color-picker", "spec/src/forms/inputs.md"],
  ["cycle-picker", "spec/src/forms/inputs.md"],
  ["date-picker", "spec/src/forms/inputs.md"],
  ["filter-command-picker", "spec/src/forms/inputs.md"],
  ["inline-option-picker", "spec/src/forms/inputs.md"],
  ["list-editor", "spec/src/forms/inputs.md"],
  ["reference-picker", "spec/src/forms/inputs.md"],
  ["secret-field", "spec/src/forms/inputs.md"],
  ["segmented-control", "spec/src/forms/inputs.md"],
  ["task-due-calendar", "spec/src/forms/inputs.md"],
  ["time-picker", "spec/src/forms/inputs.md"],
  ["search-filter-in-form", "spec/src/forms/inputs.md"],
  ["add-section-chooser", "spec/src/forms/layout.md"],
  ["collapsible-item-list", "spec/src/forms/layout.md"],
  ["entry-actions", "spec/src/forms/layout.md"],
  ["form-add-button", "spec/src/forms/layout.md"],
  ["form-control-row", "spec/src/forms/layout.md"],
  ["form-field", "spec/src/forms/layout.md"],
  ["form-placeholder", "spec/src/forms/layout.md"],
  ["form-section-header", "spec/src/forms/layout.md"],
  ["form-sheet", "spec/src/forms/layout.md"],
  ["form-toolbar", "spec/src/forms/layout.md"],
  ["sortable-array-item", "spec/src/forms/layout.md"],
  ["code-editor", "spec/src/forms/editors.md"],
  ["code-highlighter", "spec/src/forms/editors.md"],
  ["yaml-editor", "spec/src/forms/editors.md"],
  ["form-review", "spec/src/forms/review.md"],
  ["field-review-actions", "spec/src/forms/review.md"],
  ["unified-review-diff", "spec/src/forms/review.md"],
  ["complete-cv-form", "spec/src/forms/examples.md"],
]);

const WORKSPACE_FRAMEWORK = new Set([
  "app-shell",
  "core",
  "demo",
  "drag",
  "view-host",
]);
const WORKSPACE_PANELS = new Set(["explorer", "problems"]);
const WORKSPACE_PLUGINS = new Set(["plugins"]);

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function chaptersForPath(filePath) {
  const normalized = normalizePath(filePath);
  if (/^src\/spec\/.*\.mdx$/.test(normalized))
    return ["spec/src/storybook-catalog.md"];
  const shadcn = /^src\/shared\/shadcn\/([^/]+)\//.exec(normalized);
  if (shadcn)
    return SHADCN_CHAPTERS.has(shadcn[1])
      ? [SHADCN_CHAPTERS.get(shadcn[1])]
      : [];
  const form = /^src\/shared\/forms\/([^/]+)\//.exec(normalized);
  if (form)
    return FORM_CHAPTERS.has(form[1]) ? [FORM_CHAPTERS.get(form[1])] : [];
  if (/^src\/shared\/forms\/[^/]+$/.test(normalized))
    return ["spec/src/forms/core-and-orchestrators.md"];
  if (
    /^src\/(?:styles|theme|storybook)\.css$/.test(normalized) ||
    /^src\/themes\//.test(normalized)
  )
    return ["spec/src/styling-and-themes.md"];
  if (/^src\/shared\/filter\//.test(normalized)) return ["spec/src/filter.md"];
  if (/^src\/shared\/ai\//.test(normalized)) return ["spec/src/ai.md"];
  if (/^src\/shared\/diff\//.test(normalized)) return ["spec/src/diff.md"];
  if (/^src\/shared\/shell\//.test(normalized)) return ["spec/src/shell.md"];
  const workspace = /^src\/shared\/workspace\/([^/]+)(?:\/|$)/.exec(normalized);
  if (workspace) {
    if (
      WORKSPACE_FRAMEWORK.has(workspace[1]) ||
      /^src\/shared\/workspace\/[^/]+$/.test(normalized)
    )
      return ["spec/src/workspace/framework.md"];
    if (WORKSPACE_PANELS.has(workspace[1]))
      return ["spec/src/workspace/panels.md"];
    if (WORKSPACE_PLUGINS.has(workspace[1]))
      return ["spec/src/workspace/plugins.md"];
    return ["spec/src/workspace/components.md"];
  }
  if (/^\.storybook\//.test(normalized))
    return ["spec/src/storybook-catalog.md"];
  if (/^packages\/storybook-addon-docs-mcp\//.test(normalized))
    return ["spec/src/tooling.md"];
  if (
    /^scripts\/spec-validation\//.test(normalized) ||
    /^\.qmd\/index\.ya?ml$/.test(normalized) ||
    normalized === ".gitignore" ||
    normalized === "spec/book.toml" ||
    normalized === "spec/public-surfaces.json"
  )
    return ["spec/src/spec-governance.md"];
  if (/^docs\/agent\//.test(normalized) || normalized === "AGENTS.md")
    return ["spec/src/spec-governance.md", "spec/src/tooling.md"];
  if (
    /^scripts\/ui-generator\//.test(normalized) ||
    /^scripts\//.test(normalized)
  )
    return ["spec/src/tooling.md"];
  if (
    /^(?:package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$/.test(normalized)
  )
    return ["spec/src/architecture.md", "spec/src/packages.md"];
  if (
    /^(?:svelte|vite|vitest|playwright|tsconfig)(?:\.[^.]+)*\.(?:js|mjs|ts|json)$/.test(
      normalized,
    )
  )
    return ["spec/src/architecture.md", "spec/src/tooling.md"];
  return [];
}

function isProtectedPath(filePath) {
  return /^(?:src\/shared\/|src\/(?:styles|theme|storybook)\.css$|src\/themes\/|src\/spec\/|\.storybook\/|scripts\/|packages\/[^/]+\/src\/|docs\/agent\/|AGENTS\.md$|spec\/(?:book\.toml|public-surfaces\.json)$|package\.json$|pnpm-lock\.yaml$|pnpm-workspace\.yaml$|svelte\.|vite\.|vitest\.|playwright\.|tsconfig)/.test(
    filePath,
  );
}

function mergeChanges(inputChanges) {
  const changes = new Map();
  for (const input of inputChanges) {
    const change =
      typeof input === "string"
        ? { path: input, changedLines: [] }
        : { changedLines: [], ...input };
    const normalized = normalizePath(change.path);
    if (!normalized) continue;
    const current = changes.get(normalized) ?? {
      path: normalized,
      changedLines: [],
    };
    current.changedLines.push(...(change.changedLines ?? []));
    changes.set(normalized, current);
  }
  return [...changes.values()].sort((left, right) =>
    left.path.localeCompare(right.path),
  );
}

export function classifySpecFirstChanges(inputChanges) {
  const changes = mergeChanges(inputChanges);
  const specFiles = changes
    .map((change) => change.path)
    .filter((file) => CANONICAL_SPEC_PATTERN.test(file));
  const protectedFiles = [];
  const required = new Map();
  const unmappedProductionFiles = [];
  for (const change of changes) {
    if (CANONICAL_SPEC_PATTERN.test(change.path)) continue;
    const isSpecMirror = /^src\/spec\/.*\.mdx$/.test(change.path);
    if (
      !isSpecMirror &&
      IGNORED_PATTERNS.some((pattern) => pattern.test(change.path))
    )
      continue;
    const chapters = chaptersForPath(change.path);
    if (chapters.length) {
      protectedFiles.push(change.path);
      for (const chapter of chapters) {
        const owners = required.get(chapter) ?? [];
        owners.push(change.path);
        required.set(chapter, owners);
      }
    } else if (isProtectedPath(change.path)) {
      unmappedProductionFiles.push(change.path);
    }
  }
  const requiredChapters = [...required.keys()].sort();
  const missingChapters = requiredChapters.filter(
    (chapter) => !specFiles.includes(chapter),
  );
  return {
    files: changes.map((change) => change.path),
    specFiles,
    protectedFiles,
    requiredChapters,
    missingChapters,
    unmappedProductionFiles,
    requiresSpec:
      protectedFiles.length > 0 || unmappedProductionFiles.length > 0,
    ok: missingChapters.length === 0 && unmappedProductionFiles.length === 0,
  };
}

function parseDiffHeader(line) {
  const source = line.slice("diff --git ".length);
  const match =
    /^(?:"((?:[^"\\]|\\.)*)"|(\S+))\s+(?:"((?:[^"\\]|\\.)*)"|(\S+))$/.exec(
      source,
    );
  if (!match) return null;
  const decode = (quoted, plain) => {
    const value = quoted === undefined ? plain : JSON.parse(`"${quoted}"`);
    return value?.replace(/^[ab]\//, "");
  };
  try {
    const before = decode(match[1], match[2]);
    const after = decode(match[3], match[4]);
    return before && after ? [before, after] : null;
  } catch {
    return null;
  }
}

export function parseUnifiedDiff(source) {
  const changes = new Map();
  let currentPaths = [];
  let sawHeader = false;
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      const header = parseDiffHeader(line);
      if (!header) throw new Error(`unsupported unified diff header: ${line}`);
      sawHeader = true;
      currentPaths = [...new Set(header.map(normalizePath))];
      for (const currentPath of currentPaths)
        if (!changes.has(currentPath))
          changes.set(currentPath, { path: currentPath, changedLines: [] });
      continue;
    }
    if (
      !currentPaths.length ||
      line.startsWith("+++") ||
      line.startsWith("---")
    )
      continue;
    if (line.startsWith("+") || line.startsWith("-")) {
      for (const currentPath of currentPaths)
        changes.get(currentPath).changedLines.push(line.slice(1));
    }
  }
  if (source.trim() && !sawHeader)
    throw new Error(
      "non-empty change-set output contained no unified diff headers",
    );
  return [...changes.values()];
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed: ${result.stderr.trim() || result.stdout.trim() || `exit ${result.status}`}`,
    );
  return result.stdout;
}

export function parseArgs(argv) {
  const options = { files: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--base") options.base = argv[++index];
    else if (argument === "--head") options.head = argv[++index];
    else if (argument === "--file") options.files.push(argv[++index]);
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`unknown argument: ${argument}`);
  }
  if (options.head && !options.base) throw new Error("--head requires --base");
  if (options.files.some((file) => !file))
    throw new Error("--file requires a path");
  return options;
}

export function changesFromVcs({ base, head, files }, repoRoot, execute = run) {
  if (files.length) return files;
  if (base)
    return parseUnifiedDiff(
      execute(
        "git",
        ["diff", "--no-ext-diff", "--unified=0", base, head ?? "HEAD", "--"],
        repoRoot,
      ),
    );
  if (existsSync(path.join(repoRoot, ".jj")))
    return parseUnifiedDiff(
      execute(
        "jj",
        [
          "--no-pager",
          "--color=never",
          "diff",
          "--git",
          "--from",
          "@-",
          "--to",
          "@",
        ],
        repoRoot,
      ),
    );
  if (existsSync(path.join(repoRoot, ".git")))
    return parseUnifiedDiff(
      execute(
        "git",
        ["diff", "--no-ext-diff", "--unified=0", "HEAD", "--"],
        repoRoot,
      ),
    );
  throw new Error(
    "neither .jj nor .git is available; pass --base/--head or explicit --file paths",
  );
}

export function main(argv = process.argv.slice(2), log = console) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      log.log(
        "Usage: node check-spec-first.mjs [--base <rev>] [--head <rev>] [--file <path>...]",
      );
      return 0;
    }
    const result = classifySpecFirstChanges(
      changesFromVcs(options, DEFAULT_REPO_ROOT),
    );
    if (result.ok) {
      log.log(
        result.requiresSpec
          ? `Spec-first gate passed: ${result.protectedFiles.length} protected file(s), ${result.specFiles.length} canonical chapter(s).`
          : "Spec-first gate passed: no protected files changed.",
      );
      return 0;
    }
    log.error("Spec-first gate failed.");
    for (const chapter of result.missingChapters)
      log.error(`  Missing mapped chapter: ${chapter}`);
    for (const file of result.unmappedProductionFiles)
      log.error(`  Unmapped protected file: ${file}`);
    return 1;
  } catch (error) {
    log.error(
      `Spec-first gate could not determine a trustworthy change set: ${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  process.exitCode = main();
