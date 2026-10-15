# Chat

Chat is the host-neutral presentation family. Existing stable AI chat primitives
remain implemented in their current owners and are re-exported through `/chat`,
including ToolCallDetail, RichToolCallDetail and their normalized presentation types
(DC-AI-025).

## Public surface coverage

| Surface          | Public boundary             | Requirement |
| ---------------- | --------------------------- | ----------- |
| Markdown Content | `@lapismd/design-core/chat` | DC-CHAT-001 |

## DC-CHAT-001 — Markdown Content

**Requirement.** MarkdownContent MUST compose Mira's public embedded preview with safe HTML and host-owned link, asset and extension hooks.

### Acceptance details

- The Chat entry point MUST re-export stable chat primitives without breaking existing AI imports.
- Markdown MUST retain transparent parent-composed backgrounds, left-aligned compact/full-width presentation with small token-driven padding, streaming updates, public preview hooks and late stylesheet loading without copying Mira internals.
- Published Mira 0.0.5 MUST be qualified before the new preview is added; domain-specific references and authorization remain consumer extensions.
