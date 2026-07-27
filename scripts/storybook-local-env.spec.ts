import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  loadStorybookLocalEnv,
  parseStorybookLocalEnv,
  STORYBOOK_LOCAL_ENV_FILE,
} from "./storybook-local-env.mjs";

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function temporaryRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "storybook-local-env-"));
  temporaryRoots.push(root);
  return root;
}

describe("storybook local environment", () => {
  it("parses comments, exports, and quoted values", () => {
    expect(
      parseStorybookLocalEnv(`
        # checkout ports
        STORYBOOK_PORT=9309
        export STORYBOOK_EXTRA_PORTS="9310 9399"
        LABEL='secondary workspace'
      `),
    ).toEqual({
      STORYBOOK_PORT: "9309",
      STORYBOOK_EXTRA_PORTS: "9310 9399",
      LABEL: "secondary workspace",
    });
  });

  it("loads an ignored checkout file without replacing shell overrides", () => {
    const root = temporaryRoot();
    writeFileSync(
      path.join(root, STORYBOOK_LOCAL_ENV_FILE),
      "STORYBOOK_PORT=9309\nVISUAL_SERVER_PORT=9310\n",
    );
    const env: Record<string, string> = { STORYBOOK_PORT: "9409" };

    expect(loadStorybookLocalEnv({ root, env })).toEqual([
      "VISUAL_SERVER_PORT",
    ]);
    expect(env).toEqual({
      STORYBOOK_PORT: "9409",
      VISUAL_SERVER_PORT: "9310",
    });
  });

  it("is a no-op when the checkout file is absent", () => {
    const env: Record<string, string> = {};
    expect(loadStorybookLocalEnv({ root: temporaryRoot(), env })).toEqual([]);
    expect(env).toEqual({});
  });

  it("keeps wrapped host commands on the main 9009 lane by default", () => {
    const env = { ...process.env };
    delete env.STORYBOOK_PORT;
    const result = spawnSync(
      process.execPath,
      [
        path.resolve("scripts/with-storybook-env.mjs"),
        process.execPath,
        "-e",
        "process.stdout.write(process.env.STORYBOOK_PORT ?? '')",
      ],
      {
        cwd: temporaryRoot(),
        env,
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("9009");
  });
});
