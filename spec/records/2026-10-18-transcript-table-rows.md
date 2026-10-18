# Table row comments and captured context

The user requests Mira reuse, comments between rows and full row context. The
Markdown plugin delegates table authoring to Mira; its mutable Table has no
annotation slot. Mira 408809d3 now supplies an immutable TableReader using the
same TableNode parser, table primitives and safe cell preview. Design Core
composes it through built public exports; no source aliases, copied dependency
internals or consumer overrides. An ignored pnpm hook uses the verified Mira
archive without changing portable manifests/lockfiles during this migration.

Transcript comments split tables after their original source row, preserve
column widths and highlight exact UTF-16 cell selections. Queued/history/reply
context captures the original header/delimiter/row plus selection offsets; the
visible quote omits unrelated rows and the header for body comments. This
snapshot survives source unavailability. Original exact anchor quote and source
identity remain authoritative. Nested readers omit gutters/page padding and
reject edits; caret comments capture the cell or code line. Reader teardown and
resize measurement remain owned. DC-CHAT-006/007 now state these behaviors.

Before: comments render after the whole table and context contains only selected
cell text. The new source family initially passes 24/25: its old DOM-order
editor query edits the code comment after row insertion reorders the cards.
The exact rerun then rejects a duplicate global cell query (source and context
both show the selection). Scope both queries to the source table. Next run
passes interactions but exposes two landmark-unique findings: named section
containers redundantly acted as regions despite role=group. They now use div
hosts with the same explicit group semantics. No accessibility rule is waived.

Commands and logs: `pnpm exec vitest run --project storybook
src/shared/chat/transcript/Transcript.stories.svelte`; exact `-t CodeAndTable`;
`pnpm exec vitest run --project unit
src/shared/chat/transcript/anchors.spec.ts
src/shared/chat/transcript/rich-source.spec.ts` (six passes);
`pnpm check:types` (source and three public consumer profiles: no errors or
warnings). Logs `/tmp/lapis-ai-row-comments-*`. Final family/pack/consumer
results are recorded with Notes E-AI-039. Original milestone statuses remain
unchanged; native comment publication and human visual approval stay open.

Final source acceptance passes all 25 Transcript interaction/axe cases. The four
anchor/controller/comment-edit/source unit files pass 32 tests. Spec-first
passes 14 protected files/one chapter; specification validation passes eight
validators/31 chapters/299 requirements. Consumer cold acceptance uses the
prepared archive recorded in E-AI-039.
