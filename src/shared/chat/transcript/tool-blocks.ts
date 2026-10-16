import type { TranscriptBlock, TranscriptTool } from "./model.js";

/** Raw and formatted projections share the exact caller-owned tool revision. */
export function rawToolBlock(tool: TranscriptTool): TranscriptBlock {
  return {
    id: `${tool.id}/raw`,
    revision: tool.revision,
    kind: "code",
    label: `Raw captured data for ${tool.title}`,
    path: "tool.json",
    commentable: tool.commentable,
    text: tool.raw,
  };
}
