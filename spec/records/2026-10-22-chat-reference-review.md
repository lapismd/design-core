# Portable chat references and actions: focused review

The enclosing Jujutsu change implements DC-CHAT-016 and extends DC-CHAT-006.
The user authorized Design Core fixes and requested section-by-section screen
review with targeted tests. Aggregate qualification waits for final review.

## Implementation and ownership

InlineReference composes ReferenceChip across CodeMirror, Markdown and captured
transcript readers. Hosts supply identities, registered destinations, exact
UTF-16 token matches, cancellable search, activation, serialization and optional
profile content. Default serialization is Markdown. No renderer dispatches an
agent or owns application routing, credentials or repository state.

Person/agent references adapt jj-store's filled inline author geometry and
separate composer remove button. Removal preserves exact source ranges and
normal editor history; read-only readers expose no removal. Profile previews
compose HoverCard and host content, preserving ordinary link semantics.
ReferenceChip retains its existing default reference appearance.

Markdown reference processing is fragment-local. Quote/table previews must not
reuse offsets from the whole composer. Registered colon tokens survive remark
Directive parsing; unknown directives, ordinary links, code and images retain
their original treatment. AST data contains string keys, not host functions.

Transcript hover controls compose MessageActions with host primary/overflow and
reaction actions. Comment is icon-only; unavailable bars are omitted. Invisible
bars cannot intercept tool controls. Optional tooltip suppression removes content.
Inline comments receive the same reference and suggestion configuration.

## Regression history

- The original transcript action target failed 2 cases before implementation
  (visible Comment text and an unavailable toolbar); both passed after the fix.
- The author-chip target failed 2 cases before removal/profile support. Initial
  after-runs caught duplicate fixture selectors; these were narrowed to the
  intended reference without reducing assertions.
- A real relative-link fixture exposed 1 contrast failure: Mira link styling
  overrode mention color/weight. ReferenceChip now owns those styles at its
  boundary. The exact RemovableAuthorChips target passed after the fix.
- The profile story then caught HoverCard's button role on a native anchor;
  ReferenceChip preserves native anchor semantics. All 5 InlineReference stories
  passed afterward.
- Visual inspection caught quote/table source-offset corruption and unrendered
  legacy tokens. Fragment ownership and directive preservation are covered by
  source units and the paired reference story.

## Focused commands

- `pnpm exec vitest run --project unit src/shared/chat/inline-reference/reference-ranges.spec.ts src/shared/chat/markdown-composer/composer-suggestions.spec.ts src/shared/chat/transcript/custom-interaction.spec.ts`: 14 passed.
- `pnpm exec svelte-check --tsconfig tsconfig.json --fail-on-warnings`: zero errors/warnings before the final CSS/native-anchor correction; final rerun recorded below.
- `pnpm spec:validate`: 8 validators, 31 chapters, 305 requirements.
- Storybook target: Transcript.actions, InlineReference, Transcript.readonly,
  MessageActions, CommentComposer and ReferenceChip colocated story files.
  Final counts are recorded below.

Prepared review output uses `scripts/pack-local.mjs`, absolute outputDirectory,
retainSource and a unique archive suffix. It compiles rune modules/styles and
keeps public imports intact. Ordinary registry publication is not performed.
Consumer acceptance and the exact archive digest are recorded in agent-ui's
matching review record. No downstream app or service was changed.

## Review gate

Changed stories remain visual-pending. No screenshot baseline was changed.
Full checks, all package consumers, publication and downstream adoption remain
pending. Focused evidence does not claim complete release qualification.

Final source reruns: the six listed Storybook files passed 32/32 interaction and
accessibility cases; strict Svelte checking reported zero errors and warnings.
The final V10 prepared package audited 263 styles with zero remaining utility references.
Archive SHA256: `c4b752713ed4cc1df2f2a9d4f8c2047b2c31aa4003c34fc3ffe7512d394d9c28`.

## Final stock Mira review

Removed Chat overrides of Mira content typography, editor insets, caret and
preview paragraph/list/quote/table/image spacing. The only content layout
adjustment sets the editor/preview note column to full width. Shell sizing,
avatar placement and custom reference/suggestion component styling remain
Chat-owned. Mira source commit a32942bb exposes lineNumbers on its root; the
composer forwards false to omit the actual extension. Source validation uses an
ignored local Mira archive hook with --lockfile=false; normal manifests and
registry lockfiles retain released ranges. The same archive is documented in
agent-ui's consumer record. No dependency files are patched.

The exact paired/removable target passed 2 cases, 3 intentionally unselected.
Its new chip-underline assertion first reported 1 failure; the shared chip now
owns a sufficiently specific text-decoration rule and the exact target passes.
The six directly affected source story families then passed 32/32 interactions
and accessibility cases. Emoji remains inline, removal stays within the chip,
and author text baselines are asserted within 0.5px of surrounding text.
HoverCard teardown uses the source-faithful forced-mounted hidden pattern after
an earlier derived_inert runtime failure during composer chip removal.

A spec validation run caught 1 atomic-acceptance formatting violation; the extra
sentence was moved to the existing normative prose and the exact command passed.
Spec-first passed 45 protected files across 5 canonical chapters. The native Mira
checkbox indentation issue reproduces in the plain comparator and is explicitly
deferred by the user. Full qualification and visual baselines remain pending.

The final inset follow-up preserves the user-requested compact shell spacing:
0.25rem Document inset and 0.5rem Classic inset, configured on Mira's public layout
variables. It does not change lists, quotes or other content styles. A focused
consumer run caught 1 Classic failure where an unbounded ScrollArea viewport
painted table controls over the preview; the composer now bounds that viewport
and clips its own scroll container. The final InlineReference and MarkdownComposer
source targets passed 17 cases with zero failures. Consumer reruns follow below.

Final strict Svelte checking reported zero errors/warnings. Specification
validation passed 8 validators / 31 chapters / 305 requirements after the
atomic-prose repair. Package preparation audited 263 styles with zero utility
references. This is focused review evidence; aggregate qualification is pending.

The final Document inset retains 4px for Mira’s native outdented task control.
RemovableAuthorChips now exercises Document mode and asserts checkbox bounds,
chip baseline alignment and exact removal; both exact cases pass. The consumer
Classic overflow regression reran cold and passed without pointer interception.
