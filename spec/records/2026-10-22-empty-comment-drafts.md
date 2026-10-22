# Comment quote surfaces and empty draft removal

Expanded transcript comment contexts no longer add a purple prose/captured-code
highlight or a white Markdown preview surface. The source component uses Mira's
public `--mira-preview-background` variable to let the existing context background
show through; original transcript selection highlighting remains unchanged.

CommentComposer now handles plain Backspace in capture phase when its editor was
already exactly empty. It requests onRemove, falling back to onDismiss, through
the existing host callback. Transcript dismissal removes that draft and restores
source focus. Deleting the final character keeps the inline editor open. Modifier
keys, held-key repeats, handled events, IME composition and disabled, pending or
read-only editors cannot request removal. Other comments and captured text remain.

The exact baseline ran the new scenarios against the original component/CSS at
e80b252d: 3 failed (Markdown quote fill, captured-code tint, and an empty inline
editor remaining after Backspace). The repaired two-family lane passes 15/15,
including the standalone keyboard/IME/blocked-state boundary. The initial harness
was corrected to target the inline editor: the pending summary intentionally
excludes empty drafts and cannot prove that editor's lifetime.

```sh
pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.comment-lifetime.stories.svelte -t 'Queued.*QuoteInherits|EmptyBackspace'
pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.comment-lifetime.stories.svelte src/shared/chat/comment-composer/CommentComposer.stories.svelte
pnpm exec vitest run --project unit src/shared/chat/transcript/controller.spec.ts src/shared/chat/transcript/comment-edit.spec.ts src/shared/chat/transcript/custom-interaction.spec.ts
```

The three directly related controller/anchor units pass 28/28. Focused source
interaction/accessibility, public types, native CSS, canonical checks and a
prepared public archive qualify the source slice before Agent UI acceptance.
Publication, broad qualification, application adoption and visual baselines stay
deferred until review. Changed stories remain visual-pending.

Final source qualification: 71/71 interaction/accessibility scenarios across nine
comment/transcript families pass (composer, base transcript, comment lifetime,
read-only, composer layout, actions, status prose, tools and task lists). Root,
shell, filter and strict public-source consumer types have zero errors/warnings.
Canonical validation, mdbook, spec-first from e80b252d and native CSS audit pass.
The prepared source-inclusive archive audits 267 styles with zero utility
references. Archive: `lapismd-design-core-0.6.0-agent-requests-empty-comments-review.tgz`.
SHA-256: `5e49e62953d1aacfb026b7fc35e4166dd5a92e495451d95dc6b3703cd3b7e740`.
Source packaging ran after all source browser tests completed; it did not
invalidate a concurrent browser test server.
