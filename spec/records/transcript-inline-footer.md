# Same-row transcript footer review correction

2026-10-18. Enclosing Jujutsu change uypptpkl; DC-CHAT-002/009.

The Notes consumer and copied Design Core reference both expanded their footer
onto a second row. The exact new `InlineFooterFormatting` story failed before
repair: 48px collapsed versus 92px expanded. The first test-name filter matched
no tests; it was corrected to the generated CSF export name. Logs:
`/tmp/transcript-footer-source-before.log` and `-after.log`.

Adapted jj-store `CommunityComposerToolbar.svelte` and `ChatMessageFooter.svelte`
at faeab664: selected formatting trigger, close control, separator and formatting
buttons, preserving the public Mira selection/action APIs. Unlike the old
forced full-width footer rule, the user's requested rightward expansion stays
on one row. Narrow surfaces scroll the actions locally; host controls and send
remain on that row. No consumer CSS hides a shared-package defect. Notes also
owns a separate legacy scope-picker margin correction.

Validation:

- `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte -t InlineFooterFormatting`: exact regression passes after repair, including final cold test process (`/tmp/transcript-footer-source-exact-final.log`).
- `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte`: 36/36 interaction/accessibility stories pass (`/tmp/transcript-footer-source-stories.log`).
- Initial `pnpm check:types` found three test-only unsupported `exact` query options; anchored accessible-name patterns replace them. Source and all three public consumer profiles pass with zero errors/warnings in `/tmp/transcript-footer-source-types-after.log`.
- `pnpm spec:first`: five protected files/two canonical chapters pass.
- `pnpm spec:validate`: eight validators/31 chapters/299 requirements pass.
- `pnpm check:no-tailwind`: native CSS boundary passes.
- Affected-file `pnpm exec prettier --write` and final `--check` cover source, story and new evidence.
- `pnpm package:local`: public prepared archive succeeds; browser CSS audits 252 files with zero utility references. Archive SHA256 `249221c52a5156c16134f6f645587013a4cbacb4f71513cb254847258eea3015` (`/tmp/transcript-footer-source-pack.log`).

Notes' exact document/reference regressions both fail against the old archive
(48px to 92px); Notes E-AI-040 owns refreshed-package and viewport acceptance.
Visual review and broad catalog/native/provider/release checks remain deferred
at the user's request. No visual baselines are changed. DC-CHAT-009 remains
Partial; this is a layout correction, not completion of its wider gates.
