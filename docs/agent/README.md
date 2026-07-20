# Agent documentation

Curated offline guidance for humans and coding agents working in `@stevejuma/ui`.

## CLI

```text
pnpm ui guide                 # index + reading order
pnpm ui guide <topic>         # colored markdown (TTY)
pnpm ui guide <topic> --json  # machine-readable envelope
pnpm ui:guide <topic>         # alias
pnpm ui components            # list all layers (shadcn, forms, AI, …)
pnpm ui components <layer/id> # usage + examples for one component
pnpm ui:components <name>     # alias
```

Topics live in this directory as markdown with YAML frontmatter (`id`, `title`,
`summary`, `sources`). They compose `AGENTS.md`, `README.md`, `FORMS.md`,
`COMPONENT_AUDIT.md`, and Storybook guidance MDX rather than replacing them.

Per-component docs are not topics here — use `pnpm ui components`.

## Topic list

| Topic | File | Purpose |
| --- | --- | --- |
| `layers` | `layers.md` | shadcn vs forms vs apps vs workspace |
| `shadcn` | `shadcn.md` | `ui:add` / inspect / docs sync |
| `forms` | `forms.md` | structured forms contract |
| `testing` | `testing.md` | stories, checks, visual baselines |
| `llms-extraction` | `llms-extraction.md` | deferred catalog extraction notes |

## Storybook

When the catalog is up, use Storybook MCP for interactive instructions, previews,
and story tests. In-catalog decision pages: `UI Forms/Guidance`, `Shadcn/Guidance`.
