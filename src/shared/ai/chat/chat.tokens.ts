/** CSS custom properties owned by the AI Chat family. */
export const chatTokenNames = {
  maxContentWidth: "--ui-ai-chat-max-content-width",
  compactGap: "--ui-ai-chat-compact-gap",
  balancedGap: "--ui-ai-chat-balanced-gap",
  spaciousGap: "--ui-ai-chat-spacious-gap",
  bubbleRadius: "--ui-ai-chat-bubble-radius",
  userBubble: "--ui-ai-chat-user-bubble",
  userBubbleForeground: "--ui-ai-chat-user-bubble-foreground",
  assistantBubble: "--ui-ai-chat-assistant-bubble",
  assistantBubbleForeground: "--ui-ai-chat-assistant-bubble-foreground",
  composerRadius: "--ui-ai-chat-composer-radius",
  composerBackground: "--ui-ai-chat-composer-background",
  dockBackground: "--ui-ai-chat-dock-background",
  triggerWidth: "--ui-ai-chat-trigger-width",
} as const;

export type ChatToken = (typeof chatTokenNames)[keyof typeof chatTokenNames];
