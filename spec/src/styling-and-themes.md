# Styling and themes

Design Core styling is native CSS driven by semantic tokens. Themes and consumers may customize documented tokens without depending on private DOM selectors. Diff surfaces read `--ui-diff-*` defaults from `src/shared/diff/diff.tokens.css`.

File Listing exposes `--ui-diff-file-listing-row-gap` (default `2px`) for
separation between eager and virtualized rows.

Settings headings default to bold 700 in both workspace tokens and the Lapis
theme while retaining the shared sans family (DC-WS-069). Hosts supply full
window-control clearance through `--ui-workspace-window-controls-overlay-inline-start`
for maximized groups (DC-WS-070); ordinary chrome retains its ribbon-adjusted inset.

Panel Toggle exposes compact button/icon geometry and reversible motion through
`--ui-panel-toggle-*` tokens imported by the shared stylesheet. Its icon inherits
currentColor, reduced-motion preferences and Button focus semantics.

## Public surface coverage

| Surface               | Public boundary | Requirement |
| --------------------- | --------------- | ----------- |
| Native CSS            | Styling         | DC-CSS-001  |
| Design tokens         | Styling         | DC-CSS-002  |
| Theme surfaces        | Theme           | DC-CSS-003  |
| Accessibility styling | Styling         | DC-CSS-004  |
| No utility leakage    | Styling         | DC-CSS-005  |
| Visually hidden text  | Styling         | DC-CSS-006  |
| Lapis workspace sans  | Theme           | DC-CSS-007  |
| Prepared browser CSS  | npm artifact    | DC-CSS-008  |

## DC-CSS-001 — Native CSS

**Requirement.** The Native CSS family MUST use authored CSS and shared tokens as the production styling contract.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Workspace view tokens MUST expose resolved primary and secondary backgrounds so movable views can preserve contrast without placement selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-002 — Design tokens

**Requirement.** The Design tokens family MUST provide semantic custom properties for color, spacing, typography, radius, focus, and component-specific extension points.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.
- `src/styles.css` MUST import each shadcn family's `*.tokens.css`, including project-authored families such as `command-view`.
- `src/styles.css` MUST import the shared workspace desktop drag-region stylesheet so `data-desktop-drag-region` maps to native `app-region` surfaces.

## DC-CSS-003 — Theme surfaces

**Requirement.** The Theme surfaces family MUST apply supported visual themes through documented attributes and shared style entry points.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.
- Compiled palette anchors `--color-white` and `--color-black` MUST be defined on `:root`, not only inside `@theme inline`.

## DC-CSS-004 — Accessibility styling

**Requirement.** The Accessibility styling family MUST retain visible focus, forced-colors, reduced-motion, disabled, invalid, and high-contrast behavior where relevant.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Styling validation must distinguish source ownership from Storybook-only presentation.

## DC-CSS-005 — No utility leakage

**Requirement.** The No utility leakage family MUST keep Tailwind utility syntax out of owned production Svelte, TypeScript, and CSS sources.

### Acceptance details

- Consumers may override documented semantic tokens without depending on private selectors.
- Source and conversion gates MUST inspect standalone stylesheets and Svelte style blocks, including nested compound selectors, before artifacts can be emitted.
- Conversion MUST replace every owned utility and marker in a selector together; unknown relationships MUST fail rather than leave unreachable rules.
- Grouped card, tab and toggle states, field/label disabled states, and section dividers MUST work through semantic attributes without utility marker classes.

## DC-CSS-006 — Visually hidden text

**Requirement.** The public runtime stylesheet MUST hide production `sr-only` content without requiring a consumer Tailwind source scan.

### Acceptance details

- Accessible names must remain available to assistive technology.
- Linked application builds must not display icon-button labels or hidden dialog headings.

## DC-CSS-007 — Lapis workspace sans

**Requirement.** The Lapis theme MUST bind `--ui-workspace-font-sans` through the brand `--font-sans` stack so AppShell, Settings, explorer, and other workspace chrome share the same sans family as forms.

### Acceptance details

- The token MUST start with `var(--font-sans)` and MAY keep system and emoji fallbacks after that family.
- Theme contract tests MUST reject a system-ui-only `--ui-workspace-font-sans` stack.

## DC-CSS-008 — Prepared browser CSS

**Requirement.** Published style entry points and component styles MUST work
without consumer Tailwind compilation or source scanning.

### Acceptance details

- Package preparation MUST resolve compiler directives and stylesheet dependencies, retain required theme defaults and keyframes, and package referenced font assets.
- Prepared CSS MUST contain no Tailwind directives, package stylesheet imports, or generated utility selectors; semantic selectors, native accessibility helpers, private generated variables, and standard CSS at-rules remain supported.
- Cold development and production consumers MUST verify fonts, component geometry, focus, and light/dark presentation using only the Svelte Vite plugin.
- Internal authoring and conversion tools MAY use Tailwind, but preparation MUST NOT scan consumer files or include Storybook utility classes in runtime output.

## Styling implementation guide

Layer-specific contracts remain in
[`Forms and shared UI`](forms/guidance.md),
[`Shadcn guidance`](../../docs/agent/shadcn.md), and the Storybook Guidance
pages.

### Principles

1. **Theme first** — global look comes from `src/theme.css`: `--background`,
   `--primary`, `--border`, `--radius`, and related semantic values.
2. **Public tokens next** — layers expose overrideable `--ui-*` custom
   properties. Hosts restyle by setting variables, not by merging utility
   classes.
3. **Colocated CSS paints** — component layout and chrome live in sibling CSS,
   reading tokens through `var(--…)`.
4. **Semantic hosts** — mark roots with `data-ui-component`, `data-ui-part`,
   and shadcn `data-slot` or axis attributes. Prefer semantic class names over
   utility strings.
5. **Reuse primitives** — use `@lapismd/design-core/shadcn/<family>` for generic
   buttons, inputs, sheets, and popovers.
6. **No Tailwind in sources** — retained component sources must not contain
   utility-class strings, `cn("…")` layout merges, or `tailwind-variants`.

### Token layers

| Layer               | Prefix                         | Defaults                                          |
| ------------------- | ------------------------------ | ------------------------------------------------- |
| Theme               | `--background`, `--primary`, … | `src/theme.css`                                   |
| Shadcn family       | `--ui-<family>-*`              | `<family>.tokens.css`                             |
| Forms               | `--ui-form-*`                  | `src/shared/forms/form.tokens.css`                |
| Filter and AI       | `--ui-*` / `--ui-ai-*`         | colocated CSS and token maps                      |
| Diff                | `--ui-diff-*`                  | `src/shared/diff/diff.tokens.css`                 |
| Structural shell    | `--ui-shell-*`                 | `src/shared/shell/shell.tokens.css`               |
| Workspace framework | `--ui-workspace-*`             | `src/shared/workspace/workspace.tokens.css`       |
| Desktop drag        | `data-desktop-drag-region`     | `src/shared/workspace/workspace-desktop-drag.css` |

Set public tokens on `:root` or an appropriate shared ancestor such as
`.ui-structured-form`. Do not rebind a token on the same component host that
consumes it; that blocks ancestor overrides. Defaults belong on `:root` or the
layer ancestor, while paint rules read `var(--ui-…, fallback)`.

Shell geometry includes `--ui-shell-mobile-sidebar-width`; its
`min(22rem, 86cqw)` default follows the bounded shell container rather than the
global viewport. `--ui-shell-desktop-min-main-width` protects the center stage
before constrained desktop moves lower-priority sidebars into overlays.

Add a public token only when existing semantic tokens cannot express the
paint. Document the subset each component reads.

### Component layout

```text
src/shared/<layer>/<family>/
  Component.svelte
  Component.css
  Component.stories.svelte
  *.tokens.css / *.tokens.ts
```

- Drive variants with `data-variant`, `data-density`, and similar attributes.
- Preserve shadcn `data-ui-component` and `data-slot` attributes when composing
  families.
- Style nested primitives from the parent family CSS through semantic
  selectors.
- Form-specific chrome may use semantic elements painted with `--ui-form-*`.

Do not add per-call-site utility props such as `bodyClass="px-6 py-5"`. Prefer a
typed variant or density prop backed by native CSS. Do not copy upstream shadcn
files by hand to bypass `pnpm ui:add`.

### Stories and docs

Stories may use host Tailwind for demonstration layout; stories and
`examples/` are excluded from the source gate. Forms Docs pages include their
colocated CSS file and a token table generated by
`node scripts/generate-form-docs.mjs`. Shadcn families document
`--ui-<family>-*` customization in their docs.

### Enforcement

`pnpm check:no-tailwind` scans these retained source roots:

- `src/shared/ai`
- `src/shared/filter`
- `src/shared/forms`
- `src/shared/shadcn`
- `src/shared/shell`
- `src/shared/workspace`

The markup detector is `scripts/lib/no-tailwind-utilities.ts`; CSS selectors use
`scripts/lib/style-utilities.mjs`. `sr-only`,
`not-sr-only`, and marker `cn-*` classes are allowed.

`data-ui` pairing is covered by `src/lib/data-ui-contract.ts`, and `ui:add`
refuses leftover utilities after native-CSS conversion.

### Checklist

1. Classify the layer with `pnpm ui guide layers` and
   [`Component inventory`](component-inventory.md).
2. Prefer an existing shadcn control for generic UI.
3. Add or update colocated CSS using public tokens.
4. Stamp `data-ui-component` and `data-ui-part`.
5. Document the tokens the component reads.
6. Run `pnpm check:no-tailwind`, focused story checks, and the repository gate.

Dialog recipes consume runtime container and text tokens explicitly defined in the theme so packaged consumers retain geometry without generating Tailwind utilities.

Chat typography exposes `--ui-ai-chat-type-scale` (default 1) on a shared
ancestor. It scales chat text and text line heights without scaling geometry,
leaving browser zoom independent and retaining mobile composer minimum sizing.

Card Header/Footer and block-aligned Input Group Addon accept
`data-divided="true"` for a section divider with the corresponding inset.
Disabled label groups use `data-disabled="true"`; disabled native controls
before their label need no peer marker. Field relationships use `data-slot`.

Chat is included in the native-CSS source audit. MarkdownContent uses public
Mira embedded-preview tokens and its own typography, width and block-gap tokens.

MarkdownComposer, MessageActions and Reactions own their CSS and semantic tokens;
Mira root composition and public CodeMirror APIs supply editor presentation without
Tailwind tooling or private editor overrides.

MarkdownComposer exposes `--ui-markdown-composer-editor-padding` (0.5rem framed,
0 document) for its full-width editor inset, alongside min-height and max-height.
It composes Mira's public file-margin and line-width tokens on the CodeMirror
root, avoiding the document surface's centered readable-width default.
Document mode supports `--ui-markdown-composer-document-min-height`
(`max(16rem, 45vh)`), prose font-family/font-size/line-height tokens and
avatar-width/avatar-gap tokens. Document height grows naturally unless a host
sets max-height; its text, actions and hint share the avatar gutter.

CommentComposer owns its compact card and captured-source quote styles through
`--ui-comment-composer-*` tokens. It uses public MiraCodeEditor tokens and
CodeMirror APIs, and the shared ScrollArea for bounded source quotes.
Its source quote follows Mira's body size (default 14px) and its draft uses 1rem;
both inherit the host sans font, with separate quote/editor typography tokens.
