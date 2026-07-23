/**
 * Re-exports — baseline Vite inject now lives in the addon package.
 * @deprecated Import from `storybook-addon-visual-delta/src/node` instead.
 */
export {
  findStoryOpenTagEnd,
  injectVisualBaselineVisualDeltas,
  sanitizeStoryName,
  visualBaselineVisualDeltaPlugin,
} from "../packages/storybook-addon-visual-delta/src/node/baseline-vite-plugin.js";
