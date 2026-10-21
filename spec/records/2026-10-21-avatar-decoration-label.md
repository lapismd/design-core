# Decorative avatar image semantics

Desktop M10 qualification found that the initials-only AvatarPicker in Failed
Participant Save fails axe 4.14 label-content-name-mismatch. The decorative
avatar omitted its image role, so visible initials could be classified as
button text despite the host-provided label. Retain role=img together with
aria-hidden=true for the decorative visual. Named avatar labels and all
identity, upload and persistence behavior remain unchanged.

DC-SHA-056 explicitly owns the decorative image semantics; DC-FORM-047 is its
direct picker consumer. Both remain Implemented; this is accessibility
qualification, not a new feature or milestone completion.

- Desktop before: exact two participant cases have one pass (contrast repaired)
  and one label mismatch, in `.local/m10-qualification-avatar-consumer.log`.
- First source name filter selected no tests; corrected to `-t Initials`. The
  source catalog's axe version passes the visual example, so the regression
  explicitly checks image semantics and decorative hiding.
- `pnpm exec vitest run --project storybook src/shared/forms/avatar-picker/AvatarPicker.stories.svelte -t Initials`: the new semantic assertion fails
  before the fix (one failed, one passed, six skipped).
- `pnpm exec vitest run --project storybook src/shared/shadcn/avatar/Avatar.stories.svelte src/shared/forms/avatar-picker/AvatarPicker.stories.svelte`:
  all 16 cases pass after the fix. Logs `avatar-label-semantic-before.log` and
  `avatar-label-after.log` are retained under `.local`.
- First `pnpm checks` stops at spec-first because the picker story also maps to
  Forms / Inputs. Added its explicit unchanged-contract confirmation; quality
  and unit lanes were interrupted and are not counted as passes.
- Second `pnpm checks` passes: 859 unit tests, 888 Storybook interaction/accessibility
  cases, 16 workspace, 11 shell, three AI browser and 151 shadcn browser cases
  (one existing platform skip). Governance, type/consumer checks, formatting,
  native CSS audit, release/tool tests and static catalog build/audit also pass.
  Log `.local/avatar-label-checks-2.log`. Required because Avatar has multiple
  consumers. The previously incomplete broad source lanes are now qualified on
  this source state; their earlier failures remain recorded.

Consumer archive intake remains separate. No baselines, thresholds or
assertions were relaxed; no package was published. Visual approval remains
separate. Final record formatting and `pnpm spec:check` validate this ledger.
