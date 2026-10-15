# Settings header controls and file input geometry

15 October 2026. The private Sync review found two shared Settings gaps:
full-width custom fields could not place controls beside their label, and the
30px Settings file input retained a 28px native button plus 8px vertical padding
and borders. That clipped its contents.

The optional custom-adapter `headerComponent` receives the same controlled props
as the body. Desktop labels and header controls share a row; the body spans the
complete row. Narrow layouts wrap within the owning Settings container. Existing
adapters retain their layout. Settings file inputs retain horizontal padding,
use zero vertical padding, and fit their file button to the shared height.

Regression evidence:

- Running the new scenarios against parent production source produced **2 failed
  / 2 passed**: absent header action and 38px inner geometry in a 30px input.
- The repaired exact story file passes **4 / 4**; all directly affected Settings
  stories pass **14 / 14** from a fresh browser-test process.
- All units pass **734 / 734**, 115 files.
- Source and three public consumer Svelte checks pass with no errors/warnings.
- Clean packed-consumer types and cold runtime startup pass with zero Svelte diagnostics. The existing documented low-severity KaTeX release exception is unchanged.
- Specification check, source-style audit, dependency audit and release
  configuration check pass. No audit exception or visual baseline changed.

The added stories remain visual-pending. The existing release CI supplies the
broader catalog, browser and packaging gates before merge/publication. Consumers
must use the released registry package; no source alias or CSS workaround is
introduced. This slice does not enable Sync enrollment or transfer.
