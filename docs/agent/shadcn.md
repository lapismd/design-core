---
id: shadcn
title: Shadcn workflow
summary: Inspect, add, and document UI-owned shadcn-svelte families via ui:add.
sources:
  - AGENTS.md
  - README.md
  - COMPONENT_AUDIT.md
  - src/shared/ShadcnOverview.mdx
  - src/shared/ShadcnGuidance.mdx
---

# Shadcn workflow

UI-owned shadcn-svelte source lives under `src/shared/shadcn/<family>/` with
colocated stories, tokens, provenance, and docs artifacts.

## Rules

- Use `pnpm ui:add <component>` (or `pnpm ui add <component>`) to add or convert
  supported families. **Do not** run the upstream `shadcn-svelte` CLI against the
  shared UI package tree.
- Treat unsupported conversion or parity failure as a failed addition — do not
  bypass by copying files by hand.
- Keep `data-ui-component`, `data-ui-part`, `data-slot`, token metadata, and
  `*.provenance.json` intact.
- Classify new visual form-adjacent exports in `COMPONENT_AUDIT.md` first when
  the boundary is unclear.
- Import from `@stevejuma/ui/shadcn/<family>` only.

## Workflow

1. **Inspect** — `pnpm ui:inspect <name>` (support tier + candidates; no writes).
2. **Add / convert** — `pnpm ui:add <name> [--overwrite] [--dry-run]`.
   Batches: `pnpm ui:add:batch a|b|c|d` for allowlisted complexity groups.
3. **Docs sync** — `pnpm ui:docs --component <name>` (or `--batch …`) reads the
   pinned tree under `vendor/shadcn-svelte-docs/` (`<ComponentPreview name>` →
   `examples/<name>.svelte`) and emits `<family>.docs.md` + MDX/example sources.
   Refresh the pin with `pnpm ui docs:vendor --ref shadcn-svelte@1.4.2`.
4. **Stories** — colocated `*.stories.svelte` under `Shadcn/<Family>/…` with
   real interactive play coverage where the control is interactive.
5. **Verify** — see `pnpm ui guide testing`.
6. **Lookup usage** — `pnpm ui components <name>` or `pnpm ui components shadcn/<name>`
   (or `--json`) composes local docs/examples. Use `--layer` to filter; forms/AI/
   workspace use the same command with `forms/…`, `ai/…`, `workspace/…` keys.

`ui:add` runs in a detached git worktree: shadcn intake → Tailwind expand →
scoped CSS + tokens + provenance → reference/candidate parity → optional visual
baselines for the component being added (only after parity passes).

## Catalog

- Overview: Storybook `Shadcn/Overview`
- Workflow guidance: Storybook `Shadcn/Guidance`
- Living docs: autodocs + colocated MDX / `*.docs.md` per family
- Offline list/show: `pnpm ui components` / `pnpm ui components shadcn/<name>`
  (all layers: forms, AI, workspace-shell, apps, workspace)

## Doctor

`pnpm ui:doctor` checks the generator environment before a conversion.
