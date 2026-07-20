---
name: guide
command: ui guide
summary: Print curated agent/human conventions for the UI package.
---

## Usage

```text
pnpm ui guide
pnpm ui guide <topic>
pnpm ui guide <topic> --json
pnpm ui:guide <topic>
```

## Topics

- `layers` — package layers and dependency rules
- `shadcn` — add/convert shadcn via `ui:add`
- `forms` — structured forms vs shadcn controls
- `testing` — stories, checks, visual baselines
- `llms-extraction` — deferred LLM catalog extraction notes

## Options

- `--json` — print a JSON envelope for agents (`{ ok, command, data }`)
- `--color <when>` — `always` | `never` | `auto` (default `auto`)
- `-h` / `--help` — show this help

## Examples

```sh
pnpm ui guide
pnpm ui guide shadcn
pnpm ui guide testing --json
pnpm ui guide layers --color never
```
