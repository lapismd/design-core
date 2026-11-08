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
