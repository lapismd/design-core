/**
 * Re-exports — Visual Delta Vite middleware now lives in the addon package.
 * @deprecated Import from `storybook-addon-visual-delta/node` instead.
 */
export {
  attachSidecars,
  countVisualStories,
  grepFromStoryIds,
  parseListReporterProgress,
  stripAnsi,
  visualDeltaMiddlewarePlugin,
  type VisualRunResponse,
  type VisualRunResultItem,
  type VisualRunStreamEvent,
} from "../../storybook-addon-visual-delta/src/node/middleware.ts";
