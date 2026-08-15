# Design Core specification migration

Historical, non-normative migration record. Current governance requirements
live in [`spec/src/spec-governance.md`](../src/spec-governance.md).

## Purpose

This tracker records the one-time migration from implicit source and Storybook contracts to canonical Markdown under `spec/src`. Canonical requirements live in the book; this file is progress evidence only.

## Source snapshot

- Snapshot date: 2026-08-12.
- Root package: `@lapismd/design-core@0.1.0`.
- Public sources inventoried: `package.json#exports`, package barrels, the
  component inventory, `pnpm ui components --json`, and the current Storybook
  static index.
- Current Storybook static inventory: 143 Autodocs families and 551 story entries.
- Guidance, overview, composition, and Welcome pages are documentation surfaces, not new runtime component APIs.
- Existing behavior is the baseline contract; no runtime component behavior changed in this slice.

## Chapter coverage

| Chapter                            | Requirements | Status           |
| ---------------------------------- | -----------: | ---------------- |
| Introduction                       |            1 | Baseline drafted |
| Architecture                       |            4 | Baseline drafted |
| Package exports                    |            8 | Baseline drafted |
| Styling and themes                 |            5 | Baseline drafted |
| Tooling                            |            4 | Baseline drafted |
| Shadcn / Actions and content       |            8 | Baseline drafted |
| Shadcn / Data and feedback         |            8 | Baseline drafted |
| Shadcn / Disclosure and navigation |            6 | Baseline drafted |
| Shadcn / Forms                     |           11 | Baseline drafted |
| Shadcn / Layout                    |            7 | Baseline drafted |
| Shadcn / Overlays                  |           10 | Baseline drafted |
| Forms / Core and orchestrators     |            5 | Baseline drafted |
| Forms / Inputs                     |           15 | Baseline drafted |
| Forms / Layout                     |           11 | Baseline drafted |
| Forms / Editors                    |            4 | Baseline drafted |
| Forms / Review                     |            4 | Baseline drafted |
| Forms / Examples                   |            2 | Baseline drafted |
| Filter                             |            5 | Baseline drafted |
| AI                                 |           23 | Baseline drafted |
| Shell                              |            3 | Baseline drafted |
| Workspace / Framework              |            7 | Baseline drafted |
| Workspace / Components             |           25 | Baseline drafted |
| Workspace / Panels                 |            2 | Baseline drafted |
| Workspace / Plugins                |            3 | Baseline drafted |
| Storybook catalog                  |            8 | Baseline drafted |
| Specification governance           |            9 | Baseline drafted |
| Verification                       |     198 rows | Baseline drafted |

## Staged checklist

- [x] Inventory current exported and catalogued public surfaces.
- [x] Create the mdBook source, summary, concise requirements, coverage tables, and one-to-one verification matrix.
- [x] Add stable validators and tests for the canonical structure and public-surface mappings.
- [x] Add fail-closed local and CI `spec:first` classification.
- [x] Add pinned QMD lexical and opt-in semantic discovery with actionable fallbacks.
- [x] Update agent, CLI, testing, VCS, and README guidance.
- [x] Add metadata-only Storybook mirrors in summary order.
- [x] Add canonical specification chapters to Docs MCP and llms discovery.
- [x] Replace story-only Show Code output with explicit consumer source and enforce it through specification validation.
- [x] Standardize authored Svelte examples on a tokenizing grammar and reject known plain-text Storybook language aliases.
- [x] Complete non-visual repository validation and record evidence.

## Evidence and known gaps

The source and existing Storybook catalog provide implementation evidence for the initial public contracts. On 2026-08-12, `pnpm spec:validate`, `pnpm spec:test`, `pnpm spec:build`, an explicit committed-range `spec:first`, `pnpm check`, `pnpm check:no-tailwind`, `pnpm fmt:check`, five focused Storybook files (23 interactions), and `pnpm build-storybook` passed. Live Storybook acceptance confirmed that Structured Form Show Code renders the public package import and typed path configuration without story-only state or renderer imports.

The syntax-highlighting slice passed `pnpm spec:check`, `pnpm fmt:check`, `pnpm check`, `pnpm check:docs-mcp`, `pnpm check:no-tailwind`, all 191 Storybook files (551 tests), and `pnpm build-storybook`. Live DOM acceptance confirmed that Structured Form's Svelte usage block now renders 18 syntax tokens through the bundled `tsx` grammar, and a sampled shadcn Button usage block renders 40 tokens.

The migration does not claim that every existing family has exhaustive unit, interaction, keyboard, compact-width, or accessibility coverage; later component changes must strengthen evidence where their owning requirement exposes a gap.

Visual Delta is out of scope. No visual comparison, capture, or baseline update is authorized for this migration.
