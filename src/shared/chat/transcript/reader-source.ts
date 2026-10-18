import { validAnchor } from "./anchors.js";
import type { TranscriptBlock, TranscriptCommentAnchor } from "./model.js";

export interface ReaderSource {
  block: TranscriptBlock;
  from: number;
  to: number;
}

export function localAnchor(
  block: TranscriptBlock,
  anchor: TranscriptCommentAnchor,
  source?: ReaderSource,
) {
  if (!validAnchor(source?.block ?? block, anchor)) return;
  const from = source?.from ?? 0;
  const to = source?.to ?? block.text.length;
  if (anchor.from < from || anchor.to > to) return;
  return { from: anchor.from - from, to: anchor.to - from };
}
