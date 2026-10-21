# Footer landing in the default workspace

2026-10-19; enclosing Jujutsu change.

The user requested consolidation into the main source workspace and retirement
of temporary footer workspaces. The clean default checkout now contains merge
`37c1ca45`, retaining footer `0ad075a2` and transcript `87d0db7b` as ancestors.
No implementation changes were needed after the qualified merge.

DC-WS-003/019/028/029/045 and DC-CHAT-002/006 retain the approved shell geometry,
three-region status behavior, Settings affordances and transcript contracts.
Their implementation and combined 833-unit/100-story qualification are recorded
in `2026-10-19-footer-transcript-handoff.md`; original broader qualification is
in `2026-10-19-workspace-status-footer.md`.

The default workspace consumes two verified validation archives through an
ignored overlay: Mira and the qualified v0.0.7-based Visual Delta readiness fix.
`node ../lapis-desktop/scripts/local-archives.mjs
.local/archives/footer-cohort.json` verifies both public import routes and
preserves tracked dependency files. `pnpm check:types` then passes all four
source/consumer configurations with zero diagnostics. Logs are
`.local/verification/footer/main-install.log` and `main-types.log`.

The main-owned footer/transcript archive keeps SHA256
`751f2ec018ca4c71e57a28d0d11dfb3669e1688f149df7942f09aaee1be202fc`.
Needed source archives and verification logs are preserved under main `.local`.
The clean `status-footer` workspace is unregistered and its original path is
absent; ignored data remains recoverable in macOS Trash. The disposable static
server was stopped. The main Storybook supervisor serves port 9309 using the
ordinary `storybook:ui` script and a one-off port override; no tracked startup
configuration changed.

Milestone review: source landing, types and workspace retirement pass. Desktop
E-CATALOG-010 owns combined consumer/review acceptance. Existing native,
publication, capture and visual-baseline gates retain their statuses.
