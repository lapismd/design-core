# Declarative quantity and native file inputs

Source: JJ Store `3998e2b0`, StoreModelFilePicker (Apache-2.0).
The existing QuantityInput is already JJ Store-derived and is reused.
Requirements: DC-FORM-048, DC-FORM-049, DC-WS-082, DC-ARCH-002,
DC-PKG-003. No application or filesystem authority moves into Design Core.

Before: QuantityInput included its own row label, Settings had no quantity or
native path metadata, and the model file picker lived only in JJ Store.
The new control-only layout avoids duplicate labels. Additive quantity/filePicker
metadata keeps numeric/string persisted types and existing source ownership.
Invalid drafts stay visible and unsaved; units never edit canonical values.
Native selection is injected and never imports a file.

Verification (Node 26.9.0, pnpm 10.32.1):

- `pnpm test:storybook src/shared/forms/file-path-input/FilePathInput.stories.svelte src/shared/forms/quantity-input/QuantityInput.stories.svelte src/shared/workspace/settings/WorkspaceSettingsInputs.stories.svelte`: initially 9 passed, 1 failed because the test typed while Select's closing transition still blocked pointer events; wait for actual pointer readiness, without forcing interactions.
- Same command with `WorkspaceSettings.stories.svelte` and `WorkspaceSettingsFeedback.stories.svelte`: 24 passed, including axe. `.local/settings-inputs-story-final.log`.
- `pnpm test:unit src/shared/forms/quantity-input/quantity.spec.ts src/shared/workspace/settings/settings-controller.spec.ts`: 17 passed. `.local/settings-inputs-unit.log`.
- Initial formatting found inline consumer source closing the module script; moved it into the required example-sources file.
- Initial spec checks found missing public mappings, acceptance structure and spec-first chapters; registered the new family and updated its owning chapters rather than suppressing diagnostics.
- `pnpm spec:check`: all 3 lanes pass after those repairs. `.local/settings-inputs-spec-final.log`.
- `pnpm check`: source and all three strict consumer type lanes pass with zero errors or warnings. `.local/settings-inputs-check-final.log`.
- `pnpm check:no-tailwind`: native CSS audit passes.
- `pnpm package:local`: prepared public modules, declarations and browser CSS; zero remaining utility references. `.local/settings-inputs-pack.log`.

The standing request for minimal verification limits this slice to the affected
Forms/Settings families, source types, canonical checks and the Desktop consumer.
Full repository, static catalog and visual baseline suites are not claimed.
Stories remain visual-pending; no baselines are updated. Native chooser behavior
and OS permissions belong to the Desktop host and its own evidence.
