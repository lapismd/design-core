import type { AiChatMessage, AiReviewChangeSummary } from "./types.js";

export const sampleAiMessages: AiChatMessage[] = [
  {
    id: "a1",
    role: "assistant",
    text: "I can help refine your CV. Ask for edits to the summary, experience, or skills.",
  },
  {
    id: "u1",
    role: "user",
    text: "Tighten the summary to two sentences.",
  },
  {
    id: "a2",
    role: "assistant",
    text: "Here’s a shorter summary. Review the proposed change before keeping it.",
  },
];

export const sampleReviewChanges: AiReviewChangeSummary[] = [
  {
    id: "r1",
    label: "Summary",
    detail: "Shortened to two sentences",
  },
];
