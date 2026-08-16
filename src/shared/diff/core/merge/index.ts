export type {
  LineDiffAlgorithm,
  MergeAction,
  MergeBlock,
  MergeBlockKind,
  MergeLine,
  MergeLinePart,
  MergeMode,
  MergeModel,
  MergeOptions,
  MergeSide,
} from "./types.js";
export { applyMergeAction, serializeMergeCenter } from "./actions.js";
export { assembleOneWayMerge } from "./one-way.js";
export { assembleThreeWayMerge } from "./three-way.js";
export { diffSequences, type DiffOp } from "./diff.js";
export { splitLines } from "./lines.js";
export { DEFAULT_OPTIONS } from "./options.js";
export {
  createMergeRenderModel,
  deleteMergedRenderComponentFromCenter,
  mergeRenderComponentIntoCenter,
  navigationIndexForLine,
  pendingMergeNavigationTargets,
  type MergeNavigationTarget,
  type MergeRenderModel,
  type RenderAction,
  type RenderActionKind,
  type RenderComponent,
  type RenderConnection,
  type RenderVisualKind,
} from "./render-model.js";
