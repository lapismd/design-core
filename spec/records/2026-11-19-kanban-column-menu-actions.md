# Kanban column menu actions — 2026-11-19

## Scope

Consumers need to add application-owned actions to the existing Kanban column
options menu without duplicating the board or depending on its private DOM.
Design Core owns the menu composition; consumers retain command authority and
data handling.

## Contract

`KanbanBoard` accepts an optional `columnMenuActions` snippet. The snippet
receives the current `KanbanColumnData` and an explicit `closeMenu` callback.
Its accessible menu items render after the built-in move and edit commands and
inherit the menu's compact alignment, including icon sizing.

The colocated `Column options menu` story supplies an icon-bearing consumer
action, verifies the selected column, invokes the close callback, and confirms
that the menu closes before continuing through the built-in edit flow.

## Verification

The exact story and repository-wide required lanes are recorded with the
implementing change. Visual review remains `visual-pending`; no baseline is
changed by this additive public extension.

## Release preflight

Remote `main` was refreshed to `a031402f` (`@lapismd/design-core` 0.13.6) and
its hosted CI was green before rebasing the candidate. No Dependabot pull
requests were open. The workspace inventory below records every registered
workspace: `merged parent` means its empty working-copy parent is already in
`main`; `unmerged parent` is an older, unrelated line that remains excluded
from this narrow release.

| Workspace                        | Working copy     | Disposition                |
| -------------------------------- | ---------------- | -------------------------- |
| `activity-regression`            | Empty            | Merged parent              |
| `bases-embeds`                   | Empty            | Merged parent              |
| `catalog-package`                | Empty            | Unmerged parent; unrelated |
| `column-fit-contents-20261025`   | Empty            | Unmerged parent; unrelated |
| `composer-lifetime`              | Empty            | Unmerged parent; unrelated |
| `composer-package-20261025`      | Empty            | Unmerged parent; unrelated |
| `default`                        | Kanban extension | Included                   |
| `dependency-automation-20261101` | Empty            | Merged parent              |
| `design-core-sv-bump`            | Empty            | Merged parent              |
| `desktop-composer`               | Empty            | Merged parent              |
| `docker-validation`              | Empty            | Unmerged parent; unrelated |
| `json-highlighting-20261030`     | Empty            | Unmerged parent; unrelated |
| `kanban-alignment`               | Empty            | Merged parent              |
| `kanban-virtualization`          | Empty            | Merged parent              |
| `linux-release-ro-20261031`      | Empty            | Unmerged parent; unrelated |
| `linux-ro-20261031`              | Empty            | Unmerged parent; unrelated |
| `maintenance-kanban`             | Empty            | Merged parent              |
| `mira-012`                       | Empty            | Merged parent              |
| `mira-activation`                | Empty            | Merged parent              |
| `mobile-pr`                      | Empty            | Merged parent              |
| `notebook-release`               | Empty            | Unmerged parent; unrelated |
| `notebook-status`                | Empty            | Unmerged parent; unrelated |
| `notebook-tables`                | Empty            | Merged parent              |
| `picker-contrast-20261026`       | Empty            | Unmerged parent; unrelated |
| `plugin-file-icons`              | Empty            | Unmerged parent; unrelated |
| `pwa-cloudflare-20261101`        | Empty            | Merged parent              |
| `release-metadata-20261030`      | Empty            | Unmerged parent; unrelated |
| `release-verify-20261030`        | Empty            | Merged parent              |
| `reply-baseline-20261030`        | Empty            | Merged parent              |
| `required-release-20261031`      | Empty            | Merged parent              |
| `swipe-lifetime-20261025`        | Empty            | Unmerged parent; unrelated |
| `swipe-package-20261025`         | Empty            | Unmerged parent; unrelated |

Required release checks passed on the rebased candidate: specification,
dependency-intake, type/consumer surfaces, no-Tailwind audit, 1,133 unit tests,
63 release tests, cold Storybook build and visual metadata audit with zero
contract errors. The full rebased Storybook interaction/accessibility suite
also passed 1,066/1,066.
