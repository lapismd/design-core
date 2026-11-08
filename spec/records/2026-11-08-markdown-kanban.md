# Configurable Markdown Kanban and Activity

The shared family supplies summaries, an ordered two-column metadata grid,
generic stamp badges, body/tag/metadata/badge snippets, Activity, configurable
anchoring and reversible column-colour previews. Detail titles use wrapping
contenteditable text with guarded persistence. Consumers can retain details
through stage changes using `closeOnMove={false}`.

## Verification

Validation runs on remote Docker context `omarchy`, with four CPUs and 12 GiB
per run. The local review catalog remains separate. No visual baselines changed;
all changed visual stories remain `visual-pending`.

- Focused family: 20 Kanban stories passed, including persistent stage details,
  retryable title saving, stamp geometry, preview rollback and optional anchoring.
- Source and public consumer type checks: zero errors and zero warnings.
- Canonical `node scripts/pack-local.mjs`: compiled three CSS sources, audited
  277 stylesheets and retained zero unprepared imports.
- Candidate archive SHA-256:
  `eee51eee8c1633d4a187f951f4c161868fce4993bae46694765e13e3f4278ce9`.
- Focused/pack receipt:
  `lapis-kanban-design-1f5b687e-86ad-4377-82a5-a521beee90a3`.
- Full `pnpm checks`, source
  `4d1b841471f183c4f676c02452570108f0b07a43`, receipt
  `lapis-kanban-design-27cee2c2-135b-42e1-bd70-ef7c9a882e56`: passed.
  Unit tests (1,128), Storybook interactions/accessibility (1,055), workspace
  pointer tests (17), shell pointer tests (17), AI browser tests (3) and
  Shadcn pointer tests (196 passed, one existing skip) passed. Formatting,
  governance, the static catalog build and visual metadata audit also passed.

Bases consumer acceptance uses the verified archive as a temporary validation
input. Publishable dependency manifests and lockfiles remain registry-based;
publication and the subsequent consumer version upgrade are separate gates.

## Activity header alignment

Activity now follows the reference's centered date label on the section border
and uppercase lane/date/count headings with a solid backdrop. Lane headings
stick to the owned Shadcn viewport while the day scrolls, then release at the
day boundary. Labels and lane counts still derive from consumer columns.
The scrolling fixture includes several cards in one day to exercise both states.

Exact regression command:
`pnpm test:storybook src/shared/workspace/kanban/KanbanBoard.stories.svelte -t Activity`.
The original header produced one failure (`static` rather than `sticky`),
receipt `lapis-kanban-design-674b3978-7711-4516-add2-e85977e58a15`;
the repaired story passes, receipt
`lapis-kanban-design-cc729371-808f-4cd7-bc33-53cbcd3eeee7`.
The final prepared archive passes a fresh production consumer, including CSS,
themes, patched runtime, types and a zero-finding production audit, receipt
`lapis-kanban-design-0a952166-d034-444b-bfb5-bc85c2153ccf`.
That run caught one specification atomicity error, now corrected without
changing product code; local `pnpm spec:check` passes including spec-first.
Fresh combined `pnpm checks` passed on remote Docker, receipt
`lapis-kanban-design-83b9226d-2cf0-478b-9552-e087eda6d0d7`, source
`013409b4466d1b02eb2c7b1a4ea62e6f4cef4a44`: 1,128 unit, 1,055 Storybook
(including all 20 Kanban stories), 17 workspace pointer, 17 shell pointer,
three AI browser and 196 Shadcn pointer tests passed, with the one existing
Shadcn skip unchanged. Formatting, types, governance, static Storybook and the
visual metadata audit passed; no baselines changed.
