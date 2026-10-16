# Autocomplete opening selection verification

Date: 2026-10-16. Requirements: DC-FORM-007 and DC-FORM-008. Revision: enclosing
Jujutsu change `vuurmpkw`. Source base: `63d3033e`, Design Core 0.5.0.

The jj-store PR #10 hosted run 38923026289, job 117054034068, failed
`CreateDraftSwitchesModesAndEntersRunnerChips`: typing `linux` into Runner labels
produced `inux`. Its other 1,021 Storybook cases passed. A scheduled select-all
from autocomplete focus could select the first newly typed character; the next
character replaced it. This belongs to the shared component, not the consumer
story's deadline or typing assertions.

Opening selection now captures an interaction generation. Keyboard and input
events invalidate that generation before its deferred selection runs. Untouched
existing values retain select-all and alternative suggestions. Props, exports,
controlled value ownership, styling and consumer callbacks remain unchanged.

## Before and after

Commands below run in the Design Core repository. Logs are retained in the
consumer's ignored `.local/main-qualification-2026-10-16/` directory.

- `pnpm exec vitest run --project storybook
src/shared/forms/autocomplete-input/AutocompleteInput.stories.svelte
--reporter=default`: the initial new typing regression failed with `inux`;
  the five original cases passed (`design-core-autocomplete-before-98.log`).
- The same command after adding the keyboard-caret scenario failed both new
  regressions while the five original cases passed. A deferred selection
  replaced an existing value after Home moved its caret
  (`design-core-autocomplete-before-caret-98.log`).
- `pnpm exec vitest run --project storybook
src/shared/forms/autocomplete-input/AutocompleteInput.stories.svelte
src/shared/forms/autocomplete-input/AutocompleteInput.variations.stories.svelte
src/shared/forms/chip-autocomplete/ChipAutocomplete.stories.svelte
--reporter=default`: all 11 cases passed after the source fix
  (`design-core-autocomplete-after-98.log`).
- The first `pnpm checks` correctly failed a new story callback returning a
  string instead of void. Its callback was corrected without changing the
  regression assertions (`design-core-checks-98.log`).
- The complete replacement `pnpm checks` exited zero
  (`design-core-checks-fixed-98.log`): formatting, types and source-consumer
  checks, specification checks, no-Tailwind audit, 746 units, 3 tooling and 16
  release tests, 762 Storybook cases, static build and metadata audit, 15
  Workspace, 11 Shell, 3 AI-chat and 89 shadcn browser cases. One existing
  platform-specific browser skip remains declared.

The regressions hold opening animation frames until after the user's first
input or caret movement, then release the original callbacks. Each fixture
restores the browser frame APIs in `finally`. No production clock, assertion,
retry, timeout or accessibility rule was weakened. Existing unsuppressed
ResizeObserver and toolchain notices remain in the full log.

## Packed consumer acceptance

`pnpm package:local` passed and prepared
`.local/packages/lapismd-design-core-0.5.0-built.tgz`, SHA-256
`bde5301be4c9e8939310ac97c394a4e6819737a4c59d1a48775468ee248d1f02`
(`design-core-pack-98.log`). A disposable copy of jj-store head `08dccc761720`
uses that archive as a temporary file dependency. The active checkout's
manifest, lockfile and installed dependency remain unchanged. This is package
qualification, not a shipped checkout dependency.

In that copy:

- `pnpm web:check` and `pnpm catalog:check` passed with zero errors/warnings;
  catalog ownership covered 466 modules.
- `pnpm web:test` passed all 180 cases. `pnpm catalog:test`, with the existing
  `JJ_STORE_WORKING_OBSERVATION_CAPTURE` fixture, passed all 1,193 cases.
- `CI=true JJ_STORE_CI_REPORTS=1 pnpm exec vitest run --config
catalog/vitest.config.ts --project storybook
catalog/components/store-workflows/StoreWorkflows.stories.svelte
catalog/components/store-workflows/WorkflowEditor.stories.svelte
catalog/components/store-workflows/WorkflowYaml.stories.svelte
--reporter=default --reporter=junit
  --outputFile=/Users/stevejuma/code/lapismd/jj-store/.local/main-qualification-2026-10-16/packed-consumer-workflows-98.xml`
  passed all 10 unchanged interaction/accessibility cases, including the hosted
  failing story (`packed-consumer-workflows-98.log`).

Qualification used macOS ARM64, Node 24.10.0, pnpm 10.32.1 and Vitest 4.1.11.
The final `pnpm spec:check` passed validation, mdBook and spec-first after this
record and verification entry were added (`design-core-final-docs-98.log`).
Screenshot comparison, baseline approval, public package publication and fresh
registry-resolved jj-store/hosted acceptance remain separate. The patch
Changeset prepares the release; publication still requires user authorization.
