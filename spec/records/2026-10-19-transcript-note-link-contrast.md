# Transcript note-link contrast

2026-10-19; enclosing Jujutsu change ksutztxy; DC-CHAT-006 and DC-CSS-004.

Notes' new file-link host adapter exposed the existing reader link colour on
dark backgrounds. Primary is a fill token and produced only 2.29/2.42:1 contrast
on Notes' prompt/body surfaces. Transcript now uses the foreground token with
the existing underline and focus outline. Routing, source offsets, public types,
commenting and capture identity are unchanged. Notes owns the matching styling
of its custom mention widgets.

The exact new source regression fails 1/1 before the CSS change:
`pnpm test:storybook src/shared/chat/transcript/Transcript.links.stories.svelte`.
It observes primary RGB 96/38/242 instead of the supplied foreground RGB
243/243/243. Log: `.local/note-links-before.log`.

Focused source/consumer results and the prepared public archive are recorded
after completion below. Wider aggregate/provider/release/visual checks remain
deferred under the user's standing focus on the functional plugin UI. No visual
baselines or public API change.

After: the same link story plus the four existing read-only/Classic cases pass
5/5 in a fresh browser process. `pnpm spec:check` passes validation, mdBook and
spec-first. Prettier passes the changed source, story and contracts. Logs:
`.local/note-links-after.log`, `note-links-spec.log`, `note-links-format-after.log`.

`packLocal` prepared the public package with declarations and ordinary CSS:
3 sheets compiled, 253 audited, zero utility references. Archive:
`lapismd-design-core-0.5.1-note-links.tgz`; source snapshot
`86f940d14c8c75760a0837676eaa70001f6b7245`; SHA256
`e3067ee6feb6e4f7be7fa72bb9c592e6d0cd906f2522fbbbc55e2950321c15f8`.
The final source change includes later evidence-only edits. Consumer acceptance
belongs to Notes E-AI-060. No aggregate, visual-baseline or release claim.
