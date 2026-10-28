import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { npmCommandEnv } from "./npm-command-env.mjs";

test("npm commands drop pnpm-only config inherited from the parent", () => {
  const poisoned = {
    npm_config_verify_deps_before_run: "false",
    npm_config_npm_globalconfig: "/tmp/pnpm-npmrc",
    npm_config_overrides: "{}",
    npm_config_link_workspace_packages: "true",
    npm_config__jsr_registry: "https://npm.jsr.io",
    NPM_CONFIG_REGISTRY: "https://registry.npmjs.org",
  };
  const env = npmCommandEnv(poisoned);
  assert.equal(env.NPM_CONFIG_REGISTRY, poisoned.NPM_CONFIG_REGISTRY);
  for (const key of Object.keys(poisoned)) {
    if (key === "NPM_CONFIG_REGISTRY") continue;
    assert.equal(env[key], undefined);
  }
  const result = spawnSync("npm", ["--version"], {
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr ?? "", /Unknown env config/);
});
