# Composer suggestions and standalone feedback UI review

Status: unqualified UI review. The user explicitly paused automated checks,
tests, types, audits, specification gates and visual baselines. No commit or
live/native adoption is claimed.

## Before

Notes Storybook `Desktop/AI/Chat layout review/Conversation` shows overlapping
`/help` label and description. Manual DOM measurements show the label shrinking
to 0px wide while its unwrapped description is 461.75px wide inside a 432px row.
The shared suggestion layout used flex with an unbounded completion detail.

The host places TranscriptFooter in a 32px status bar. Its attached error banner
adds height inside that fixed region, pushing send controls outside the body.
The user requested rounded feedback in the fixed keyboard-hint section instead.

## Changes

- DC-CHAT-013 now keeps command/mention labels above wrapping descriptions in
  a bounded grid, with optional avatar/icon spanning both rows. Keyboard,
  async-search, insertion and ownership contracts remain unchanged. The source
  suggestion fixture includes the actual long `/help` description and a narrow
  passive story.
- DC-CHAT-009 gains opt-in `TranscriptFooter.showStatus=false` for hosts that
  render feedback separately. Existing defaults retain attached status.
- Shared ComposerStatusBanner supports `position="standalone"` with all
  corners rounded and no negative overlap margins. A passive source story
  composes it beside the fixed hint above compact controls.

## Review preparation

Scoped `pnpm exec prettier --write` completed for the changed source, stories,
contracts and review records (`.local/suggestions-status-format.log`).
Source-owned `packLocal(process.cwd(), { outputDirectory:
Notes/.local/archives/packed, suffix: "-composer-status" })` prepared public
exports from source revision `35d9d63826bdca5e2a7824073d8a1d4092e21d53`.
Archive SHA256:
`93458017bccd026db47f62dbc615b7fba61d97e2e2d1bf9eed98a33a7db0ee54`.
Packaging reports three styles compiled, 252 audited as part of packaging and
zero remaining utilities (`.local/suggestions-status-pack.log`). This is package
preparation, not test qualification. Consumer refresh and manual observations
follow. Original qualification gates and status remain unchanged.

## Manual Notes observations

Notes stops/restarts only owned Storybook 7491 and installs 14 verified archives
across 14 import routes while preserving tracked dependency files. Current
Storybook PID is 77568. No native review app or other listener is restarted.

The `/help` row now uses grid: a 380px-wide label on its own 19.59px-high row,
followed by a 380px-wide description wrapping across 33.59px. Neither overlaps.
The popup remains bounded, with normal whitespace on both spans. Screenshot:
`Notes/.local/command-description-wrapping.png`.

The consumer's first failure fixture entered its normal queued publication path,
which reports a toast and clears composer status. The fixture now invokes the
existing controller submit path directly, rejecting once before dispatch to
review the retained controller-error presentation. This does not change live
publication or retry policy. The banner has an 8px radius on all corners, zero
margins and a 40px height; it is outside the 32px actions footer. Document and
Classic retain the authored draft and visible send controls. Explicit retry
produces the fake runtime response and clears current composer feedback. The
example is reset to its original failure for review. Screenshots:
`Notes/.local/fixed-sending-error.png` and
`Notes/.local/fixed-sending-error-classic.png`.

These are manual UI observations only. Automated checks, source-story runs,
visual baselines, live integration and verified-slice commits remain deferred
at the user's request. DC-CHAT-013/009 qualification statuses are unchanged.
