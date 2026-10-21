# Fixed Classic composer and host-owned hint

2026-10-19; enclosing Jujutsu change umvvsmqt; DC-CHAT-002/006.

The Notes chat layout review exposed the keyboard hint and Classic composer
inside the history scroll area. MarkdownComposer now accepts `showHint=false`
for a host-owned fixed hint row. Transcript accepts the opt-in
`classicComposerPlacement=fixed`; its existing retained composer becomes sticky
above the footer in the applied Classic view. Document placement stays inline.
No editor is remounted, so draft/selection, IME switching, pending comments,
queue state and footer formatting remain attached to the original instance.
Both public additions preserve existing defaults.

`Transcript.composer-layout.stories.svelte` adds a passive long-history example
using the real Transcript and MarkdownComposer with a separate fixed hint row.
The Notes consumer opts in only through its catalog frame. Ordinary application
adoption remains pending UI confirmation.

The user explicitly paused automated checks. Tests, type profiles, spec checks,
audits and baseline lanes have not run for this slice. Source-owned package
preparation and manual consumer Storybook review are delivery steps, not test
qualification. Leave this source change uncommitted until checks resume.

Preview preparation: `packLocal` from `scripts/pack-local.mjs` with suffix
`-fixed-composer`. The final archive includes a viewport-height flow so short
histories place the retained composer at the bottom too. The initial archive
was superseded before installation. Prepared CSS reports 3 compiled stylesheets,
252 audited and zero remaining utilities. These are packaging checks only.
Final archive SHA256:
`952b01eca94d1a9c61bad5c92fc8b114ab14ba2e4d9681bf523b0a1e5ba7b0e7`.
