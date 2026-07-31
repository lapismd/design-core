import { createRequire } from "node:module";
import path from "node:path";

/**
 * Load the sibling Visual Delta addon from package source (not via the
 * node_modules package name alone). Storybook's manager builder is a one-shot
 * esbuild bundle and its watchers ignore node_modules / do not follow
 * symlinks — resolving manager + preview to absolute sibling `src` paths
 * keeps them outside those ignores.
 *
 * Same pattern as Storybook's addon-kit `local-preset`, but pointing at
 * `src/` instead of a built `dist/`.
 *
 * Manager/preview must be listed here: registering this file path (not the
 * package name) skips Storybook 10's auto-load of `./manager` + `./preview`.
 * The packaged preset intentionally omits those hooks so bare
 * `addons: ["storybook-addon-visual-delta"]` does not double-register them.
 *
 * Preset hooks are re-exported via a relative sibling path so Storybook's
 * Node loader can transpile TypeScript (package `exports` + `.js` specifiers
 * fail under native ESM).
 */
const require = createRequire(import.meta.url);
const visualDeltaPackageRoot = path.dirname(
  require.resolve("storybook-addon-visual-delta/package.json"),
);

const addonSrc = (entry: string) =>
  path.join(visualDeltaPackageRoot, "src", entry);

export function previewAnnotations(entry: string[] = []) {
  return [...entry, addonSrc("preview.ts")];
}

export function managerEntries(entry: string[] = []) {
  return [...entry, addonSrc("manager.tsx")];
}

export {
  managerHead,
  staticDirs,
  viteFinal,
  webpack,
} from "../../storybook-addon-visual-delta/src/preset.ts";
