# Explorer pointer failure qualification

The implementation remains at `69f48e54`. This source record separates its
qualification from Desktop consumer and native acceptance.

- Exact rejected-open regression: one failed assertion and one unhandled
  rejection before the fix; one passing story afterward.
- The owning Explorer family passes 18 interaction/accessibility cases;
  its controller passes all 11 unit cases. Programmatic opens still reject.
- `pnpm test:unit` passes 914 cases in 142 files.
- `pnpm check` passes all four Svelte/public-consumer checks with zero errors
  and warnings. Changed-file formatting and all three specification lanes pass.
- `pnpm build-storybook` passes with the production catalog unchanged.
- The complete Storybook lane passes 972 cases in 277 files, using fresh
  sequential processes with `STORYBOOK_PORT=9380 pnpm test:storybook
--no-file-parallelism --shard=N/4 --reporter=verbose` for N=1,2,3,4.
  Counts are 242/267/235/228 cases and 70/69/69/69 files.

Earlier broad attempts remain unsuccessful evidence: the first process stalled
after 960 completed cases; a sequential retry completed 971 cases but its Sheet
Preview browser connection closed before the remaining result. Fresh shards
retain the original assertions and accessibility checks, including that case.

The first workspace pointer run passed 15 cases and timed out on the toast
story's initial navigation. Its exact retry then timed out during cold server
startup. A manual startup attempt passed an extra argument separator and was
rejected by Storybook before testing; the corrected checkout-owned command
started a fresh source server on port 9580. The unchanged readiness probe compiled
and settled its client entries. `STORYBOOK_PORT=9380 pnpm test:workspace:pointer
tests/workspace/notification-toasts.spec.ts` then passes its exact case, followed
by all 16 cases with `STORYBOOK_PORT=9380 pnpm test:workspace:pointer`.
No test timeout or assertion changed. `pnpm check:no-tailwind` also passes.

The public archive consumed by Desktop retains SHA256
`4301d5b285ed462c4e9819fdf9e186d67b0df2f0e0f50ba440af449957b8cdad`.
This documentation-only follow-up does not change that package input.
Stories remain visual-pending; no baseline, source application, installed app
or published package is changed.
