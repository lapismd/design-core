import { fileURLToPath } from "node:url";

/**
 * Load the workspace Visual Delta addon from package source (not via the
 * node_modules package name). Storybook's manager builder is a one-shot
 * esbuild bundle and its watchers ignore node_modules / do not follow
 * symlinks — resolving manager + preview to absolute `packages/.../src`
 * paths keeps them outside those ignores.
 *
 * Same pattern as Storybook's addon-kit `local-preset`, but pointing at
 * `src/` instead of a built `dist/`.
 */
const addonSrc = (entry: string) =>
  fileURLToPath(
    import.meta.resolve(
      `../packages/storybook-addon-visual-delta/src/${entry}`,
    ),
  );

export function previewAnnotations(entry: string[] = []) {
  return [...entry, addonSrc("preview.ts")];
}

export function managerEntries(entry: string[] = []) {
  return [...entry, addonSrc("manager.tsx")];
}

export {
  staticDirs,
  viteFinal,
  webpack,
} from "../packages/storybook-addon-visual-delta/src/preset.js";
