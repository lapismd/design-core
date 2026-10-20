# Live popup layout projection repair

Date: 2026-10-20. Revision: enclosing Jujutsu change.

The Desktop native regression exposed an empty first popup after opening a
second file. Its document identity and native window stayed intact, but live
JSON conversion removed its workspace record. Native close therefore could
not reach the original save guard. This is a shared framework defect; no
Desktop CSS, dependency patch or consumer fallback is used.

`AppWorkspace.changeLayout` now uses an internal live parser that retains only
existing runtime popup IDs. Cold restoration still discards canonical and
legacy popup records, even when the fallback layout contains live windows.
Unknown JSON popup IDs cannot create a host. The public barrel retains its
existing names and signatures; the live parser is internal. DC-WS-076/077
retain their historical interaction evidence and add explicit live/cold
conversion acceptance. No visual component or token changes.

The full type check also exposed two previously committed missing `description`
fields in `SearchFilterDynamicSyntaxHarness.svelte`. The fixture now supplies
the existing DC-FILTER-003 field contract in both syntax states. Production
completion behavior and its public interface are unchanged.

## Verification

- Before: `pnpm exec vitest run --project unit src/shared/workspace/core/workspace-popout.spec.ts -t 'live.*layout|live change'`
  fails all three new cases. Canonical changes drop the existing popup; legacy
  cold parsing retains a runtime popup. `/tmp/design-core-live-popup-before.log`.
- After: `pnpm exec vitest run --project unit src/shared/workspace/core/workspace-popout.spec.ts src/shared/workspace/core/workspace-json.spec.ts`
  passes 12/12. `/tmp/design-core-live-popup-after.log`.
- Affected core: `pnpm exec vitest run --project unit src/shared/workspace/core`
  passes 82/82 across 13 files. `/tmp/design-core-live-popup-core.log`.
- Initial `pnpm check:types` fails two fixture descriptions in one file; no
  workspace parser diagnostics. `/tmp/design-core-live-popup-types.log`.
- Final `pnpm check:types` passes root plus shell/filter/source consumers with
  zero errors or warnings. `/tmp/design-core-live-popup-types-final.log`.
- The first focused Storybook name filter matched zero tests (three skipped),
  so it is not a passing interaction result. The complete three-story
  presentation family then passes 3/3 with interaction/accessibility enabled:
  `pnpm exec vitest run --project storybook src/shared/filter/search-filter-bar/SearchFilterInput.presentation.stories.svelte`.
  `/tmp/design-core-live-popup-fixture-story-final.log`.
- `node --input-type=module -e 'import {packLocal} from "./scripts/pack-local.mjs"; await packLocal(process.cwd(), {outputDirectory: "/Users/stevejuma/code/lapismd/design-core/.local/packages/live-popup-projection"});'`
  prepares the complete public source/declaration/CSS archive. The final
  archive includes the repaired parser and typed fixture, with no new public
  live-parser export. `/tmp/design-core-live-popup-pack-final.log`.

The initial specification check rejected a prose confirmation placed inside
DC-FILTER-003 acceptance details (SPEC-DETAILS-FORM); moved that confirmation to
the chapter introduction without changing its normative bullets. Final
`pnpm spec:check` passes validation, mdBook and spec-first (three lanes), in
`/tmp/design-core-live-popup-spec-final.log`. Changed files pass Prettier.
Desktop must consume the verified private archive and rerun its original cold
native case separately. That original M7.3 gate remains open until actual
editor, close/save, redocking and resource cleanup pass. No publication,
signing, baseline changes or user-data migration is performed.

Per the user request to keep testing minimal, the affected headless core and
single fixture family are selected. Repository-wide catalog, pointer, visual
and distribution matrices are not claimed as executed.
