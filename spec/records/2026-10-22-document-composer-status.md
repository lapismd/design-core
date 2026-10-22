# Document composer attached-status frame

DC-CHAT-002 owns the user-reported All Messages regression. A bottom warning
banner remained curved/overlapping while Document CSS made the input body
transparent, borderless and separated by a gap. The footer therefore appeared
as an unrelated tinted block beneath the draft.

MarkdownComposer now records whether status is attached and leaves the existing
Composer border, opaque background, radius and padding in place while feedback
is present. Its document-only frame removal and inter-part gap apply only without
status. Focus preserves the resting frame. Document avatar, editor presentation,
docked actions and draft stay controlled; clearing status restores the prose
surface without replacing the editor. Both top and bottom attachment use the
same rule; existing Composer/StatusBanner tokens remain authoritative.

Exact reproduction:

```sh
pnpm exec vitest run --project storybook \
  src/shared/chat/markdown-composer/MarkdownComposer.status.stories.svelte
```

Before: two failed (zero-width input border). After: two passed. Expanded source
coverage adds explicit dark warning/error and top-status cases; each compares
Document/Classic frame colors/borders, checks body/banner overlap and confirms
that clearing feedback restores the borderless Document draft.

Focused qualification selects MarkdownComposer main, drawer and status story
files plus Transcript.status-prose and Transcript.composer-layout: 29 passed
across five files, zero interaction/accessibility/runtime failures. Root
`svelte-check --tsconfig tsconfig.json --fail-on-warnings` reports zero errors
and warnings; `pnpm spec:validate` and `pnpm check:no-tailwind` pass. Colocated
MDX renders the new variants and supplies highlighted public-import examples.
The original-base spec-first gate and changed-file formatter pass.

A prepared public archive from `scripts/pack-local.mjs` refreshes only the
isolated Agent UI review workspace through its existing ignored pnpm hook.
Registry manifests/lockfiles remain portable and unchanged. Consumer acceptance
is recorded separately in Agent UI's request review record. Broad qualification,
publication, downstream service/app adoption and visual baselines remain deferred
under the user's focused-review instruction.

Prepared archive:
`lapismd-design-core-0.6.0-agent-requests-status-review.tgz`, SHA-256
`fc39a4692378eee58376482e20e0ccd5d687441a5878ca63888cad0755bf5b1f`.
The package compiler prepared three stylesheets and audited 267, with zero
remaining utility references. No registry publication was performed.
