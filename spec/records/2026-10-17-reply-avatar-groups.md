# Compact reply avatar groups and transcript disclosure rows

Work performed in the main Design Core workspace on 17 October 2026. The existing
desktop-review intake document and its independent commit were preserved. No
consumer migration, publication or screenshot-baseline update is included.

## Final contract

DC-SHA-056 documents the existing AvatarGroup sizes: `xs` 20px, `sm` 24px,
`md` 32px, `lg` 48px, `xl` 80px, `2xl` 128px and `3xl` 160px. Overflow indicators
follow the selected size. Hover and focus raise participants above their neighbours,
matching Community's current `CommunityMemberAvatarGroup.svelte` at
`a5f64a4c7dea2f29b4058aa7666a98c4c0dee656` (Apache-2.0).

DC-CHAT-015 composes AvatarGroup at `xs` beside the reply button in both views.
Participant tooltips and focus remain available; the separate reply count owns
navigation and keyboard activation, with no nested buttons. Underlines apply
only to the count label. Host images, emoji, initials, shapes, background and
order are retained. The former private avatar-loop styling is removed.

The Avatar catalog adds **Participant group sizes** and **Compact reply
indicator**, with copyable public imports. The full Transcript story checks the
shared composition and compact tool summary. Strict source and packed consumers
exercise compact member/overflow sizing beside a labelled reply control.

DC-CHAT-006's tool, nested-file and reasoning disclosures use 24px minimum rows,
13px type and 4px activity gaps. A 32px hidden raw-output button and inline
baseline boxes previously made some rows taller; top-level activities also had
8px gaps while nested rows used 4px. The raw action now uses the existing 24px
Button size in a flex wrapper. Activity and nested disclosure spacing use the
same token; messages retain their prose/turn spacing. Hosts can override
`--ui-transcript-tool-row-height`, `--ui-transcript-tool-font-size` and
`--ui-transcript-tool-row-gap`. The jj-store reference was inspected at
`e0346da6`; the smaller defaults follow the subsequent visual-review request.

## Focused before and after

All commands use pnpm 10.32.1.

- Initial baseline: `pnpm test:storybook src/shared/shadcn/avatar/Avatar.stories.svelte src/shared/chat/transcript/Transcript.stories.svelte src/shared/chat/thread-panel/ThreadPanel.stories.svelte`
  passed 31 tests across three files. The same command after adding the two
  Avatar stories passed 33 tests.
- The first `reply participants use compact` browser regression failed 1/1
  because reply metadata did not use AvatarGroup. Four focused browser tests
  then passed on a fresh 9309 server, covering sizes, identities, keyboard
  activation, both themes, narrow layout, reduced motion and forced colours.
- Review regressions `overlapping participants` and `reply link decoration`
  failed 2/2 before the CSS repair, then passed 2/2. The subsequent requirement
  for a separate participant group failed 1/1 before changing the composition.
- `pnpm test:shadcn:pointer tests/shadcn/transcript-density.spec.ts` failed 1/1
  before the density repair (14px instead of 13px). Iteration found one extra
  pixel in the raw action's inline wrapper, which was fixed with flex layout.
  The test measures gaps between complete file sections so retained comments
  are never mistaken for whitespace; it then passed 1/1 in both views.

The final focused command uses the live 9210 server and selects all new review
regressions plus two earlier readiness failures: 7/7 passed, including both
previously failing readiness cases with unchanged assertions. Logs are under `/tmp/dc-reply-avatars-*`, `/tmp/dc-reply-hover-*`,
`/tmp/dc-separate-reply-group-before.log`, `/tmp/dc-tool-density-*` and
`/tmp/dc-transcript-review-focused.log`.

## Wider qualification

Initial governance diagnostics were 3 → 0 after correcting acceptance structure
and adding mapped tooling coverage. All three `pnpm spec:check` lanes passed.
The initial aggregate passed four type configurations, 821 unit tests, 3 Turbo
and 16 release helpers, 828 Storybook cases, static build, native-CSS audit,
visual metadata (zero contract errors), 16 Workspace, 11 Shell and 3 AI browser
cases. Its Shadcn browser lane recorded 142 passes, one platform skip and two
readiness failures: Workspace's bottom control timed out before story readiness,
and the rendered-comment case read a null body during readiness. No assertions
were loosened. A fresh-server rerun passed rendered comments but repeated the
Workspace readiness timeout. Both remain explicit until final qualification.

The review server on 9210 had been an ad hoc Python static server. Restarting it
still left failed asset/preload requests in the existing browser. It was replaced
with `STORYBOOK_PORT=9210 pnpm storybook:ui` from main, and the live Avatar gallery
and complete recorded Transcript were confirmed in the browser. New review tabs
were retained because the original tab remained on a connection-error page.

The final aggregate rerun passed; its complete result is recorded below. `pnpm packages:pack` passes clean source
consumer typing and cold development/production runtime acceptance in both
themes without Tailwind tooling, including the new member-renderer composition.
The existing user-approved low KaTeX advisory exception remains unchanged. Changed stories
remain `visual-pending`; screenshot baselines are unchanged.

## Optional shared author cards

Following visual review, AvatarGroup accepts an optional typed
`avatar(person, size)` snippet. It owns the member's accessible trigger without
an extra group button/tooltip. Default groups retain name tooltips. The new
**Author card participants** story toggles shared AuthorCard composition on/off.
Transcript reuses AuthorCard instead of its former private profile popover and
passes the same optional host descriptions, details and actions into reply-group
members. `authorPopover.interaction` defaults to `popover`; the full conversation
selects `hover`. Omitting the option retains ordinary avatar presentation.

All 21 full-conversation avatar faces are covered, including comments, queue and
composer snippets. The focused AuthorCard regression failed 1/1 with 21 faces
outside AuthorCard, then passed alongside the existing click-popover/action/focus
regression (2/2). Compact trigger tokens stay on the trigger face, retaining the
48px identity avatar inside the card. No app profile models or navigation are
introduced. Four affected Storybook files pass 36 tests, including the optional
member renderer and default behavior. Source/packed fixtures also exercise that
public snippet contract.

Type-check iteration corrected one invalid Storybook query option, two missing
fixture-import diagnostics and two untyped story-snippet parameters. All four final type configurations pass with zero errors and warnings; all three
specification lanes pass. The final aggregate is recorded below.

## Final qualification — 18 October 2026

The final source, including the separately requested Workspace toggle defaults,
passes `pnpm checks` using Storybook 9210 and its 9211 visual server. The result
is 821 unit tests, 3 Turbo helpers, 16 release helpers, four type configurations
with zero errors/warnings, specification and formatting/native-CSS lanes, static
Storybook build, 829 Storybook interaction/accessibility cases, 16 Workspace,
11 Shell and 3 AI browser cases, and 149 Shadcn browser passes with one existing
platform skip. There are zero functional, interaction or accessibility failures.
Both earlier readiness regressions pass with unchanged assertions in this run.
The preceding aggregate was stopped for the new toggle request after its 829
Storybook cases passed; it is not confused with the completed final run.

`pnpm packages:pack` passes again for the complete source, including clean
consumer typing and cold development/production acceptance in both themes.
The fixture covers the optional AvatarGroup AuthorCard renderer and the public
Workspace toggle imports without Tailwind tooling. The existing approved KaTeX
exception is unchanged. Final logs: `/tmp/dc-workspace-toggle-final-checks.log`
and `/tmp/dc-workspace-toggle-pack.log`. DC-CHAT-015 is implemented; unrelated
verification statuses and screenshot baselines are unchanged.
