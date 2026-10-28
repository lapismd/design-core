# Inline reference provenance

Adapted from jj-store at `f58b9363` (Apache-2.0):
`web/src/lib/ui/community-chat-composer/composer-chip-widgets.ts`,
`composer-reference-decorations.ts` and `composer-entity-links.ts` establish
selection-sensitive CodeMirror widget ranges and owned mount cleanup.
`web/src/lib/ui/community-markdown-content/syntax-entity.ts` establishes
registered-reference handling around Mira's safe Markdown boundary.

This family uses the existing Design Core ReferenceChip and public Mira,
CodeMirror and Svelte APIs. Application parsers, routes, IDs, entity lookup,
metadata, permissions, recipient policy and navigation remain injected.
The post-sanitization component renderer receives string source keys only;
functions, icons and policy remain in its host configuration closure.

The reviewed author-chip update adapts jj-store's `CommunityChip.svelte`,
`CommunityComposerRemovableChip.svelte`, `CommunityComposerChipDismiss.svelte`,
`composer-chip-remove.ts` and `CommunityMemberHoverCard.svelte` at the same
revision. Filled inline geometry and exact removal are shared; profile lookup
and card contents remain host supplied.
