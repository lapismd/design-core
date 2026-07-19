import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execa } from "execa";
import type { UiGeneratorConfig } from "../config.js";
import { EXIT, GeneratorError } from "../errors.js";
import { log } from "../logger.js";

export type IntakeResult = {
  intakeDir: string;
  componentDir: string;
  files: Array<{ path: string; sha256: string; content: string }>;
  cliVersion: string;
};

function hashContent(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

function walkFiles(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = path.join(root, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

export async function prepareIntakeProject(
  config: UiGeneratorConfig,
  worktreePath: string,
  runId: string,
): Promise<string> {
  const fixture = path.join(config.packageRoot, config.shadcn.intakeFixture);
  const intakeDir = path.join(
    worktreePath,
    ".ui-generator",
    "run",
    runId,
    "intake",
  );
  if (existsSync(intakeDir)) rmSync(intakeDir, { recursive: true, force: true });
  mkdirSync(path.dirname(intakeDir), { recursive: true });
  cpSync(fixture, intakeDir, { recursive: true });

  // Bridge package theme into intake CSS for faithful Tailwind expansion.
  const themeCss = readFileSync(
    path.join(config.packageRoot, "src/theme.css"),
    "utf8",
  );
  const appCss = `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn-svelte/tailwind.css";

${themeCss}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
  writeFileSync(path.join(intakeDir, "src/app.css"), appCss);

  // Symlink root node_modules so intake can resolve pinned deps without a separate install.
  const nm = path.join(intakeDir, "node_modules");
  if (!existsSync(nm)) {
    const { symlinkSync } = await import("node:fs");
    symlinkSync(
      path.join(config.packageRoot, "node_modules"),
      nm,
      "junction",
    );
  }

  return intakeDir;
}

export async function fetchShadcnComponent(
  config: UiGeneratorConfig,
  intakeDir: string,
  component: string,
): Promise<IntakeResult> {
  log.step(`Fetching shadcn-svelte "${component}" into intake`);

  let cliVersion = "unknown";
  try {
    const versionResult = await execa(
      "pnpm",
      ["exec", "shadcn-svelte", "--version"],
      { cwd: config.packageRoot, reject: false },
    );
    cliVersion = (versionResult.stdout || versionResult.stderr || "unknown")
      .trim()
      .split("\n")[0]!;
  } catch {
    /* keep unknown */
  }

  const result = await execa(
    "pnpm",
    [
      "exec",
      "shadcn-svelte",
      "add",
      component,
      "--cwd",
      intakeDir,
      "--yes",
      "--overwrite",
    ],
    {
      cwd: config.packageRoot,
      reject: false,
      env: { ...process.env, CI: "1" },
    },
  );

  if (result.exitCode !== 0) {
    throw new GeneratorError(
      `shadcn-svelte add ${component} failed`,
      EXIT.intake,
      result.stderr || result.stdout,
    );
  }

  const componentDir = path.join(intakeDir, "src/lib/components/ui", component);
  if (!existsSync(componentDir)) {
    // Some registries nest differently; search under ui/
    const uiRoot = path.join(intakeDir, "src/lib/components/ui");
    if (!existsSync(uiRoot)) {
      throw new GeneratorError(
        `Intake did not produce component directory for ${component}`,
        EXIT.intake,
        result.stdout,
      );
    }
  }

  const resolvedDir = existsSync(componentDir)
    ? componentDir
    : path.join(intakeDir, "src/lib/components/ui");

  const files = walkFiles(resolvedDir)
    .filter((file) => file.startsWith(path.join(intakeDir, "src")))
    .filter((file) => {
      if (existsSync(componentDir)) return file.startsWith(componentDir);
      return path.basename(path.dirname(file)) === component ||
        path.basename(file).toLowerCase().includes(component);
    })
    .map((file) => {
      const content = readFileSync(file);
      return {
        path: path.relative(intakeDir, file),
        sha256: hashContent(content),
        content: content.toString("utf8"),
      };
    });

  if (!files.length) {
    // Fallback: take all files under ui/<component> if present, else all ui files matching name
    const uiRoot = path.join(intakeDir, "src/lib/components/ui");
    const candidates = walkFiles(uiRoot).filter((f) =>
      f.includes(`${path.sep}${component}${path.sep}`) ||
      path.basename(f).startsWith(component),
    );
    for (const file of candidates) {
      const content = readFileSync(file);
      files.push({
        path: path.relative(intakeDir, file),
        sha256: hashContent(content),
        content: content.toString("utf8"),
      });
    }
  }

  if (!files.length) {
    throw new GeneratorError(
      `No source files found after adding ${component}`,
      EXIT.intake,
      `Looked under ${resolvedDir}`,
    );
  }

  // Path safety: ensure all files stay under intakeDir
  for (const file of files) {
    const full = path.resolve(intakeDir, file.path);
    if (!full.startsWith(path.resolve(intakeDir))) {
      throw new GeneratorError(
        "Intake path traversal detected",
        EXIT.intake,
        full,
      );
    }
  }

  log.ok(`Fetched ${files.length} source file(s) for ${component}`);
  return {
    intakeDir,
    componentDir: existsSync(componentDir) ? componentDir : path.dirname(
      path.join(intakeDir, files[0]!.path),
    ),
    files,
    cliVersion,
  };
}
