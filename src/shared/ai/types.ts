export type AiChatVisibility = "expanded" | "collapsed" | "hidden";
export type AiChatPlacement = "floating" | "right";

export type AiChatMessageRole = "user" | "assistant" | "system";

export type AiChatMessage = {
  id: string;
  role: AiChatMessageRole;
  text: string;
};

export type AiReviewChangeSummary = {
  id: string;
  label: string;
  detail?: string;
};
