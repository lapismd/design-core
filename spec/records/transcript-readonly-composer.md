# Readable read-only Markdown composer

2026-10-18; enclosing Jujutsu change opnomypv; DC-CHAT-002/009.

Notes' real question-request flow exposed two axe4.14 failures after workspace
clearance was corrected: avatar fallback contrast4.11 and read-only draft4.29.
Generic Composer's whole-surface opacity0.6 faded MarkdownComposer's read-only
Mira value and supplied avatar. The compound MarkdownComposer now retains its
readable surface at full opacity; its existing disabled buttons and submission,
formatting and editing guards remain unchanged. This is source-owned compound
styling, with no Notes dependency selectors or package patches.

The initial compound selector did not override Composer's higher specificity:
the first wider run passed35/36 with Disabled still failing. The public semantic
token `--ui-ai-chat-composer-disabled-opacity` now retains the generic default
0.6 and lets MarkdownComposer select1 at its root. No specificity escalation or
assertion weakening is used. AI, Chat and styling contracts retain disabled
behavior; only the readable surface opacity changes.

Exact before: `pnpm exec vitest run --project storybook src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte -t Disabled`
fails1 case (opacity0.6 versus1); `/tmp/transcript-readonly-before.log`.
Notes' failed source-consumer run retains both real contrast findings in
`.local/ai-transcript-adoption-all-layouts.log` (40/41 cases pass at first width).

Validation:

- Exact Disabled regression passes1/1; `/tmp/transcript-readonly-exact-after.log`.
- Complete Transcript/MarkdownComposer family passes36/36 interaction/axe cases;
  `/tmp/transcript-readonly-stories-final.log`.
- Generic Composer family passes11/11 cases, retaining its unchanged default;
  `/tmp/transcript-readonly-generic.log`.
- `pnpm check:types` passes source and three public-consumer profiles with zero
  errors/warnings; `/tmp/transcript-readonly-types-final.log`.
- `pnpm spec:first` initially rejected the missing AI owning chapter; adding its
  semantic token contract resolves it. Final gate passes4 protected files/3
  chapters; spec validates8 validators/31 chapters/299 requirements and native
  CSS audit passes. `/tmp/transcript-readonly-{first,spec,css}-final.log`.
- Changed-file formatting passes. Public package preparation follows this source
  commit; Notes E-AI-041 owns refreshed public-archive acceptance and native UI.

Complete directly affected families are selected for this UI slice; repository
aggregate, unrelated browser/provider and release lanes remain deferred under
standing visible-delivery scope. No visual baselines or publication;
original native capture/provider/restart gates remain unchanged.
