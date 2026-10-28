# Search placeholder contrast

DC-FILTER-003 retains accessible CodeMirror placeholder contrast on themed
form surfaces. Its foreground mix now uses 70 percent of the form foreground
instead of 62 percent. No public prop, query grammar or lifecycle contract
changes. Stories remain visual-pending and baselines are unchanged.

The jj-store Workflow unknown-outcome story reproduced an Axe contrast failure
of 4.02:1 on its actual Buzz application background. The new source regression,
`PlaceholderContrastOnThemedFormSurfaces`, measures rendered contrast on light
and dark form surfaces. With the original CSS it fails one test (three skipped);
with the repair the exact presentation file passes all four tests. The full
search-filter family passes four files and 14 tests, including interaction and
accessibility checks. Strict filter consumer checking reports zero errors and
warnings, and `pnpm spec:check` passes all three lanes.

`pnpm checks` passed governance, formatting, all public-consumer type checks,
914 unit tests, release/tool tests, static Storybook build and the visual
metadata audit. Its unbounded browser startup terminated with a Playwright JSON
transport error before producing test results. The cold retry,
`pnpm test:storybook --maxWorkers=2`, passes all 277 files and 973 tests.
Remaining pointer/browser lanes are recorded after execution below.

The prepared candidate archive was generated with the existing `packLocal`
helper for jj-store's explicit validation overlay. Its SHA-256 is
`b32d5fe4d2ad01049e4bce3ff750da011aec6e8a49b5d4377cd3056e1a110851`.
Consumer verification uses the production shared root: the exact four-file
Docker regression passes 41 tests (the original eight failures are zero).
This local archive does not establish registry publication or visual approval.

The full pointer run also exposed eight inherited stale acceptance cases. The
Markdown case used the retired chat-specific font token; its repair uses
`--mira-font-size` and checks the rendered paragraph and retained heading.
Composer and comment assertions now follow DC-CHAT-001/002's stock Mira content
and 6rem editor-host default. The transparent composer shell remains asserted.
Native queue/source-navigation checks reveal their existing hover controls
before activation; quoted-list spacing checks actual line boxes for gaps and
overlap. DC-CHAT-005/007/009 action, draft and acknowledgement contracts remain
unchanged. These changes repair acceptance against the documented APIs and do
not alter product typography, input behavior or visual baselines.

Final source evidence: `pnpm test:workspace:pointer` passes 16 cases,
`pnpm test:shell:pointer` passes 17, and `pnpm test:ai:browser` passes three.
The initial shadcn pointer run had eight failures, 145 passes and one platform
skip. All eight inherited failures now have repaired acceptance. The final
four-file run passed 38 of 41; it exposed the remaining stock list/paragraph
expectations and one catalog readiness timeout before queue interaction.
The exact cold three-case retry passes all three with the original readiness
deadline and pointer/draft/state assertions. Combined, these runs cover all 41
cases in the four affected files. Unchanged shadcn files retain their initial
passing evidence. `pnpm spec:check` passes validate, mdbook and spec-first.
Publication and visual review remain unqualified.
