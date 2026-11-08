# Exact patched dependency in packed consumers

Core's previous 0.11.0 publication stopped before publishing: release run
42040664904 selected Bits UI 2.20.6 in a fresh consumer, while the authorized
patch targets registry 2.20.2. The package's compatible dependency range allowed
that resolution. A fresh `pnpm packages:pack` run on the Kanban candidate
reproduced the same installed-version assertion (one failing boundary).

The package and registry lockfile now declare Bits UI 2.20.2 exactly. The
installed workspace version and patch bytes are unchanged. Release configuration
and actual tarball intake reject wider, different or absent dependency
requirements before a consumer install. All installed-version and per-file
checksum assertions remain intact.

The new source-manifest regression failed once before the declaration repair;
the focused patch/release-script suite now passes 23 tests. The packaging-error
fixture includes the newly imported guard module and still requires its original
packaging failure to propagate. Cold `pnpm packages:pack` and full `pnpm checks` passed on remote Docker:
receipt `lapis-kanban-design-8b569d04-fd7e-4199-bc19-3011e8dc19dd`, source
`1f4831cbcaf3bb20a51ea6709a7cbf10f3ed7ff1`. The source suite passed 1,128
unit, 1,055 Storybook, 17 workspace pointer, 17 shell pointer, three AI browser
and 196 Shadcn pointer tests, with one existing Shadcn skip. Packed production
audits had zero findings. The subsequent Activity header change has its own
fresh combined qualification before merging.

The user approved merging the green prerequisite PR and completing its minor
release on 2026-11-08. No publication is permitted before the repaired source and
version candidates pass their required checks. Design Core PR #63's earlier
head 5c8cebba8e98bc348f8c13a629e662fe91a7a69e passed all nine hosted CI jobs
in run 42443885086; the repaired head requires a new green run.

## Release scope and workspaces

The release scope is PR #63 plus the exact patched-runtime repair needed to
publish it. The release remote was fetched and all 27 registered workspace
heads were inspected. Available roots remain preserved; unavailable legacy
roots retain unknown filesystem state. Historical independent work retains the
disposition from the previous Notebook release inventory. There are no additional
ready Kanban changes outside this candidate. No workspace is removed or reset.
The detailed head/status comparison is retained in
`.local/kanban-release/workspace-audit.json`.

| Workspace                      | Disposition                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| activity-regression            | Excluded diagnostic rollback of Activity only; preserved.                              |
| catalog-package                | Independent/superseded history excluded as in prior release inventory; preserved.      |
| column-fit-contents-20261025   | Independent/superseded history excluded as in prior release inventory; preserved.      |
| composer-lifetime              | Independent/superseded history excluded as in prior release inventory; preserved.      |
| composer-package-20261025      | Independent/superseded history excluded as in prior release inventory; preserved.      |
| default                        | Included: approved Kanban/Activity source and required packed-consumer release repair. |
| dependency-automation-20261101 | Equivalent automation already merged in main PR #56; clean checkpoint preserved.       |
| design-core-sv-bump            | Included source ancestor; checkpoint preserved.                                        |
| desktop-composer               | Included source ancestor; checkpoint preserved.                                        |
| docker-validation              | Independent/superseded history excluded as in prior release inventory; preserved.      |
| json-highlighting-20261030     | Independent/superseded history excluded as in prior release inventory; preserved.      |
| kanban-alignment               | Included source ancestor; checkpoint preserved.                                        |
| linux-release-ro-20261031      | Independent/superseded history excluded as in prior release inventory; preserved.      |
| linux-ro-20261031              | Independent/superseded history excluded as in prior release inventory; preserved.      |
| mira-012                       | Included source ancestor; checkpoint preserved.                                        |
| notebook-release               | Equivalent qualified Notebook fixes in main; clean historical checkpoint preserved.    |
| notebook-status                | Equivalent qualified Notebook fixes in main; clean historical checkpoint preserved.    |
| notebook-tables                | Included source ancestor; checkpoint preserved.                                        |
| picker-contrast-20261026       | Independent/superseded history excluded as in prior release inventory; preserved.      |
| plugin-file-icons              | Independent/superseded history excluded as in prior release inventory; preserved.      |
| pwa-cloudflare-20261101        | Included source ancestor; checkpoint preserved.                                        |
| release-metadata-20261030      | Independent/superseded history excluded as in prior release inventory; preserved.      |
| release-verify-20261030        | Included source ancestor; checkpoint preserved.                                        |
| reply-baseline-20261030        | Included source ancestor; checkpoint preserved.                                        |
| required-release-20261031      | Included source ancestor; checkpoint preserved.                                        |
| swipe-lifetime-20261025        | Independent/superseded history excluded as in prior release inventory; preserved.      |
| swipe-package-20261025         | Independent/superseded history excluded as in prior release inventory; preserved.      |

The 2026-11-08 pre-push Dependabot query returned zero open pull requests;
there is no dependency-consolidation PR to create. The query is repeated before
subsequent pushes. No visual baseline or audit-policy change is included.
