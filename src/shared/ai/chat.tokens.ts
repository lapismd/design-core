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
  shadowMedium: "--ui-ai-chat-shadow-medium",
  shadowLarge: "--ui-ai-chat-shadow-large",
  dockBackground: "--ui-ai-chat-dock-background",
  triggerWidth: "--ui-ai-chat-trigger-width",
  reasoningAccent: "--ui-ai-chat-reasoning-accent",
  reactionBackground: "--ui-ai-chat-reaction-background",
  reactionSelectedBackground: "--ui-ai-chat-reaction-selected-background",
  reactionSelectedBorder: "--ui-ai-chat-reaction-selected-border",
  unreadColor: "--ui-ai-chat-unread-color",
} as const;

export type ChatToken = (typeof chatTokenNames)[keyof typeof chatTokenNames];
