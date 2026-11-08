# Activity sticky column borders

DC-WS-087 requires each Activity lane heading to retain a themed top border
while stuck inside its owned Shadcn Scroll Area viewport. The heading overlaps
the day grid's outer border at rest, preserving one separator.

## Regression

Exact target:
`pnpm test:storybook src/shared/workspace/kanban/KanbanBoard.stories.svelte -t Activity`.

- Before: one failure, 19 cases filtered out, because the heading's computed
  top-border width was `0px` instead of `1px`; remote Docker receipt
  `lapis-kanban-design-5610cf9a-6493-4d4c-a90f-ebea6192ab6d`.
- After: one passing case, 19 filtered out; receipt
  `lapis-kanban-design-1729427a-2b56-4de2-bc6d-8642f4e0103f`, source
  `1d524b8a383db741a3b826eacc8da90ccf8d4370`.
- The story checks solid 1px themed paint, a single resting edge, the complete
  top border remaining inside the viewport when stuck, and release at the day
  boundary.

The first full-check invocation stopped on one specification atomicity error
(two sentences in an acceptance bullet), receipt
`lapis-kanban-design-31f51adc-a4ae-47b2-a286-2552fc5d3eaa`; the requirement is
now one sentence and all three specification lanes pass. This was a governance
failure, separate from the repaired browser regression.

## Complete source qualification

`pnpm checks` and `pnpm package:local` pass on remote Docker `omarchy`, with
four CPUs and 12 GiB, receipt
`lapis-kanban-design-4a59e11f-8437-4c89-bc11-034a0bf8a6c0`, tested source
`f105d9e649302fd83ca717b1e7bccba2959b4ba3`.

- 1,128 unit cases and 1,055 Storybook interaction/accessibility cases pass,
  including all 20 Kanban stories.
- Workspace pointer cases (17), shell pointer cases (17), AI browser cases (3)
  and Shadcn pointer cases (196) pass; the one existing Shadcn skip is unchanged.
- Formatting, zero-error/zero-warning type checks, canonical governance,
  static Storybook and visual metadata auditing pass.
- The prepared consumer archive compiles three CSS sources, audits 277
  stylesheets and retains zero unprepared utility references; SHA-256:
  `0766a5db3922a9aaa2af4d8722d61baa8ad017830c317a075d049f4be9f84c0c`.

The release remote was fetched and all 27 registered workspaces inventoried;
14 available roots were inspected without status errors and the other 13
legacy roots retain unknown filesystem state. Only this patch has a nonempty
stored head. Historical/superseded work retains the previous release inventory's
disposition; no workspace is removed or overwritten. Details remain in
`.local/kanban-release/sticky-border-workspace-audit.json`. The pre-push
Dependabot query returned zero open pull requests.

Bases consumer qualification and publication are separate gates. No visual
baselines changed; the Activity story remains `visual-pending`.
