# Structured filters progress and resume record

## Authorization and workspace

The user approved a specification-first, UI-first implementation on 2026-10-31.
Full checks, repository-wide tests, static Storybook, package/release qualification
and isolated packed consumers are deferred until explicit UI approval. This is
an explicit task-specific exception to the normal AGENTS full-check-before-commit
rule. No push, publication, plugin changes or visual baselines are authorized.

Workspace: /Users/stevejuma/code/lapismd/design-core-structured-filters.
Parents: current main 8e9b3f29 plus Canvas Table 50c94a6b. Original Canvas Table
workspace and review port 9829 remain untouched. New ignored base port: 10029;
focused Shadcn review port: 10329.

## State

| Stage           | Status                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| Specified       | Complete; DC-SHA-069–074 and full public contract in shadcn/structured-filters.md |
| Implemented     | Pending                                                                           |
| Focused-tested  | Pending                                                                           |
| UI-approved     | Pending user review                                                               |
| Fully-qualified | Deferred until UI approval                                                        |

## Tooling evidence

- pnpm install --frozen-lockfile: passed using Node 24.10.0.
- pnpm view @lapismd/spec-validator version --json: 0.2.0, already covered by ^0.2.0.
- pnpm exec spec-validator doctor --json: exits 0; QMD native/index checks pass under Node 24; inherited script-alias warning remains.
- Semantic search command: pnpm spec:search --semantic "standalone structured filter builder table column inference"; passed with matching canonical chapters; no fallback required.
- Existing default Node 26 QMD ABI mismatch is avoided through a command-local Node 24 PATH; use the reported rg fallback if native search fails.

## Resume instructions and verification

Read AGENTS.md and canonical shadcn/structured-filters.md before continuing.
Commit the validated complete specification before changing runtime. Implement
standalone model/editor first, then typed table inference/matching and popover,
then stories and focused regressions. Keep every new JS/TS/Svelte file <=300
physical lines. Record every exact failing command/count and exact passing rerun.

Before UI approval run only focused new-family units, relevant stories and browser
files, strict source-consumer types, formatter and spec:first/spec:check. Start
a fresh review Storybook on 10329. Present standalone and integrated stories and
wait for UI approval. Do not automatically continue to full qualification.

After approval run the full matrix in the canonical chapter, including pnpm
checks and isolated packed public exports. Keep all changed stories visual-pending
and never update screenshots/baselines. Mark fully qualified only after those
lanes pass. Commit verified slices locally with Jujutsu.

## Specification slice checks

- pnpm spec:first: passed (78 protected files, 21 chapters).
- pnpm spec:check: initial 8 diagnostics (6 verification rows outside the table and 2 trailing prose blocks in acceptance sections); corrected table placement and added section headings; first rerun retained 6 unmapped rows; corrected zero-padded row lookup and used the supported In progress status; final exact rerun passed with 0 diagnostics, all 3 specification lanes.
- Focused Prettier command covers all changed canonical chapters, mirror, mapping and preview order; full product runs deferred by user instruction.
