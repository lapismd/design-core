# Command View rich-result semantics

DC-SHA-051; change vwyvwmzu. The desktop repository plugin requires rich
picker rows with independently interactive copy and profile controls. Bits UI
merged internal listbox/option roles after host attributes, producing nested
interactive violations and ignoring supplied grid roles.

List, Group and Item now honor existing role and child attributes through the
public primitive child snippet, retaining events, ref attachments, filtering
and selection. Default listbox/option behavior is unchanged. The default List
retains its registered Viewport for active descendant and keyboard scrolling.
Custom child hosts own markup. No new public prop or package version is added.

Focused validation (2026-10-18):

- `pnpm exec vitest run --project storybook
src/shared/shadcn/command-view/CommandViewRoles.stories.svelte
src/shared/shadcn/command-view/CommandView.stories.svelte`: 8 passed.
  Rich grid copy/profile actions do not select; ArrowDown/Enter and filtering
  select the intended rows. Custom child roles and ordinary hosts remain valid.
- `pnpm exec vitest run --project unit
src/shared/shadcn/command-view/command-view.css.spec.ts`: 2 passed.
- `pnpm check:types`: source and shell/filter/source consumers pass with no
  errors or warnings. Initial native role fallback inferred unknown twice;
  explicit standard defaults repaired both errors.
- `pnpm spec:first`: passed. Initial `pnpm spec:check` rejected an unmapped
  separate story title and non-atomic acceptance prose. Kept the stories in
  their existing family and moved prose before acceptance; rerun passed.
- `pnpm package:local`: passes, including declarations and browser CSS audit
  (252 files audited; no remaining utility references).

User explicitly prioritizes focused functional plugin acceptance and defers
whole-catalog, release, platform/provider and visual-baseline qualification.
No publication, baselines or unrelated service restart. Consumer integration
and exact archive SHA are recorded in desktop E-REPO-015. Broader package gates
remain deferred; this record claims focused acceptance only.
