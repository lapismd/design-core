const pnpmOnlyNpmConfig = new Set([
  "npm_config_verify_deps_before_run",
  "npm_config_npm_globalconfig",
  "npm_config_overrides",
  "npm_config_link_workspace_packages",
  "npm_config__jsr_registry",
]);

export function npmCommandEnv(extra = {}) {
  const env = { ...process.env, ...extra };
  for (const key of Object.keys(env)) {
    if (pnpmOnlyNpmConfig.has(key.toLowerCase())) delete env[key];
  }
  return env;
}
