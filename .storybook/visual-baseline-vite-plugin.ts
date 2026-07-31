/**
 * Re-exports — baseline Vite inject now lives in the addon package.
 * @deprecated Import from `storybook-addon-visual-delta/node` instead.
 */
export {
  findStoryOpenTagEnd,
  injectVisualBaselineVisualDeltas,
  sanitizeStoryName,
  visualBaselineVisualDeltaPlugin,
} from "../../storybook-addon-visual-delta/src/node/baseline-vite-plugin.ts";
