/**
 * Demo catalog shaped like `AI/Overview` families for Column Canvas stories.
 * Not a public package export — story/docs fixture only.
 */

export type AiDemoComponent = {
  id: string;
  label: string;
  role: string;
  importPath: string;
};

export type AiDemoCategory = {
  id: string;
  label: string;
  description: string;
  components: AiDemoComponent[];
};

export const aiDemoCategories: AiDemoCategory[] = [
  {
    id: "stable-chat",
    label: "Stable Chat",
    description:
      "Prop-driven chat surfaces for production hosts. No app store, networking, or model SDK.",
    components: [
      {
        id: "layout",
        label: "Layout",
        role: "Full-page chat shell with docked composer, auto-scroll, and density.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "layout-scroll-button",
        label: "Layout Scroll Button",
        role: "Scroll-to-bottom recovery control that expands when new messages arrive.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "message-list",
        label: "Message List",
        role: "Accessible message log with density context and infinite scroll support.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "message",
        label: "Message",
        role: "Sender context wrapper for avatar, name, metadata, and alignment.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "message-bubble",
        label: "Message Bubble",
        role: "Filled or ghost content container styled from sender context.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "message-metadata",
        label: "Message Metadata",
        role: "Timestamp, footer, and delivery status row for chat messages.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "system-message",
        label: "System Message",
        role: "Centered status or date separator without sender chrome.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "composer",
        label: "Composer",
        role: "Layout shell for composer slots, drawer, input, and send actions.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "composer-input",
        label: "Composer Input",
        role: "Rich input with trigger menus, inline tokens, and history recall.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "composer-drawer",
        label: "Composer Drawer",
        role: "Collapsible attachments and context tray above the input.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "send-button",
        label: "Send Button",
        role: "Circular send/stop toggle that reads streaming state from context.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "composer-token",
        label: "Composer Token",
        role: "Serialized token chip for use outside the contentEditable input.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "tokenized-text",
        label: "Tokenized Text",
        role: "Inline token badges for mentions, tags, and commands in message text.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "tool-calls",
        label: "Tool Calls",
        role: "LLM tool and function-call activity with single or stacked summaries.",
        importPath: "@lapismd/design-core/ai/chat",
      },
      {
        id: "dictation-button",
        label: "Dictation Button",
        role: "Voice dictation toggle for the composer with listening affordances.",
        importPath: "@lapismd/design-core/ai/chat",
      },
    ],
  },
  {
    id: "experimental-chat",
    label: "Experimental",
    description:
      "Lab-derived Chat surfaces marked @experimental. Prefer stable Chat for production.",
    components: [
      {
        id: "reasoning",
        label: "Reasoning",
        role: "Compact streaming reasoning disclosure with controlled expansion.",
        importPath: "@lapismd/design-core/ai/experimental",
      },
      {
        id: "reaction-bar",
        label: "Reaction Bar",
        role: "Independently pressed reaction pills with an optional emoji picker.",
        importPath: "@lapismd/design-core/ai/experimental",
      },
      {
        id: "emoji-picker",
        label: "Emoji Picker",
        role: "Searchable emoji popover with eight-column keyboard navigation.",
        importPath: "@lapismd/design-core/ai/experimental",
      },
      {
        id: "typing-indicator",
        label: "Typing Indicator",
        role: "Reduced-motion-safe typing dots with live grammar-aware labels.",
        importPath: "@lapismd/design-core/ai/experimental",
      },
      {
        id: "unread-divider",
        label: "Unread Divider",
        role: "Semantic separator marking the first unread message.",
        importPath: "@lapismd/design-core/ai/experimental",
      },
    ],
  },
];

export function findAiDemoCategory(
  categoryId: string | undefined,
): AiDemoCategory | undefined {
  return aiDemoCategories.find((category) => category.id === categoryId);
}

export function findAiDemoComponent(
  categoryId: string | undefined,
  componentId: string | undefined,
): AiDemoComponent | undefined {
  return findAiDemoCategory(categoryId)?.components.find(
    (component) => component.id === componentId,
  );
}
