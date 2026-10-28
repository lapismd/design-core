# Explorer open failures

DC-WS-002/033: pointer activation catches rejected file opens in the presentation
owner and shows a destructive Alert. Retrying clears the failure and preserves
all three activation dispositions. The programmatic controller still rejects;
consumer file and workspace authority remains unchanged. Teardown cancels pending
single clicks and suppresses stale error presentation after unmount.

Exact regression: `STORYBOOK_PORT=9380 pnpm test:storybook
src/shared/workspace/explorer/WorkspaceExplorer.stories.svelte -t Rejected`
reported one failed case and one unhandled rejection, with 17 skipped. The first
case-sensitive filter matched no stories and does not establish a pass.
The story rejects the first real delayed pointer open, then retries through the
same UI and verifies the visible error clears and the adapter opens the file.
Further qualification follows below. No visual baselines are changed.

The unchanged exact regression now passes one case with 17 skipped and no runtime
errors. `pnpm check` passes all four Svelte/public-consumer checks with zero
errors/warnings. Initial specification validation passed; spec-first then found
the missing Explorer Panel chapter, which now records DC-WS-033 explicitly.

The first full unit/story/static attempts were cancelled under concurrent memory
contention and cannot qualify those lanes. Broad qualification is rerun with
bounded workers after focused commits; no test gate or assertion is waived.

Focused qualification completes with all 18 Explorer interaction/accessibility
stories and all 11 Explorer controller tests passing. Formatting and all three
specification lanes pass. Full repository units, broad stories/static catalog,
pointer acceptance and packed Desktop consumer qualification remain required
and are recorded separately after this focused source commit.
