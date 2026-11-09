# Independent Kanban embeds

## Release workspace inventory

Fetched `main@release-https` at `7208808e556ac6c5a4330f3e77d862c1a9343fa6`.
All 28 registered workspaces were inspected from the current JJ store; 15 roots
were available and their working-copy status was read. Unavailable legacy roots
retain their empty stored checkpoints; their filesystem state is not asserted.
No unrelated workspace was changed, rebased or removed.

| Workspace                        | State                              | Disposition                                                                                              |
| -------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `activity-regression`            | Clean                              | Excluded diagnostic rollback of Activity only; preserved.                                                |
| `bases-embeds`                   | Current patch                      | Included: repeated Board/Activity accessibility source and acceptance fix.                               |
| `catalog-package`                | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `column-fit-contents-20261025`   | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `composer-lifetime`              | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `composer-package-20261025`      | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `default`                        | Clean                              | Equivalent: existing Kanban fixes already squash-merged in #63/#65/#67; clean older checkpoint retained. |
| `dependency-automation-20261101` | Clean                              | Equivalent automation already merged in main PR #56; clean checkpoint preserved.                         |
| `design-core-sv-bump`            | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `desktop-composer`               | Unavailable root; empty checkpoint | Included source ancestor; checkpoint preserved.                                                          |
| `docker-validation`              | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `json-highlighting-20261030`     | Clean                              | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `kanban-alignment`               | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `linux-release-ro-20261031`      | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `linux-ro-20261031`              | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `mira-012`                       | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `notebook-release`               | Clean                              | Equivalent qualified Notebook fixes in main; clean historical checkpoint preserved.                      |
| `notebook-status`                | Clean                              | Equivalent qualified Notebook fixes in main; clean historical checkpoint preserved.                      |
| `notebook-tables`                | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `picker-contrast-20261026`       | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `plugin-file-icons`              | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `pwa-cloudflare-20261101`        | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `release-metadata-20261030`      | Clean                              | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `release-verify-20261030`        | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `reply-baseline-20261030`        | Clean                              | Included source ancestor; checkpoint preserved.                                                          |
| `required-release-20261031`      | Unavailable root; empty checkpoint | Included source ancestor; checkpoint preserved.                                                          |
| `swipe-lifetime-20261025`        | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |
| `swipe-package-20261025`         | Unavailable root; empty checkpoint | Independent/superseded history excluded as in prior release inventory; preserved.                        |

## Regression and qualification

Repeated Board and Activity instances using identical columns exposed duplicate
DOM IDs and document landmarks. The exact `MultipleInstances` story initially
failed once (35 unique IDs for 42 IDs); after scoping IDs, axe exposed duplicate
column-header banner landmarks in that same case. The final exact run passes
with zero interaction or accessibility failures.

- Before: `pnpm exec vitest run --project storybook src/shared/workspace/kanban/KanbanBoard.stories.svelte -t Multiple`,
  receipt `design-core-validation-079559d5-8ca1-4558-b5b9-dabf3a815fff`.
- After: the identical command passes; receipt
  `design-core-validation-b76d6b3d-b2fc-4c00-a8c3-240cbb13e5a9`.
- The real-pointer test's old global-ID selectors then failed one test
  (two attempts before the obsolete run was stopped). Its drag/drop, ghost paint,
  final placement and announcement assertions remain intact; it now selects
  labelled column groups. The exact pointer file passes in
  `design-core-validation-d89bcfdf-0f3d-49f4-87b2-f49db8e90e12`.

Full remote Docker qualification on omarchy uses 4 CPUs and 12 GiB, with
expensive lanes serial. Receipt
`design-core-validation-bbd8e08b-c50e-4d14-9c2f-a611a743cfb8` covers:

- all 22 Kanban stories;
- `pnpm checks`: governance, formatting, all type consumers, 1,128 unit tests,
  release/tooling tests, cold static Storybook, 1,057 Storybook interaction/axe
  cases, 17 workspace, 17 shell, 3 AI and 196 Shadcn pointer/browser passes;
- one existing Chromium skip for a WebKit-only overlay case, also passing in WebKit;
- `pnpm package:local`: prepared declarations and CSS, 277 audited stylesheets
  with zero remaining utility references.

The tested source snapshot is `1e9f28253ef7cf712478388d4c8e7fb289fa4870`. The prepared temporary
consumer archive is `lapismd-design-core-0.12.2-built.tgz`, SHA-256
`03ce34d416e5ae8989fc1a07b7248cc1f376960fb52cf9f17bb08c991c058186`.
This is candidate validation, not a registry release. Bases consumer evidence
remains separate. Visual baselines are unchanged and the new story is visual-pending.

Both repositories use published spec-validator 0.2.0; QMD search and doctor pass
(the existing wrapper-script alias warning is retained). The open Dependabot
query returned no pull requests; no empty consolidation PR was created.
