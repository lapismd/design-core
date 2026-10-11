# Tooltip sizing restoration

The enclosing source change is `quoystmy`, based on `4922feea`. DC-SHA-050
restores the default sizing from before `42a125503632`: theme small text,
12px inline padding and 6px block padding. Public sizing tokens and the existing
arrow remain available. No package version, manifest or lockfile changed.

The exact regression command was
`pnpm test:storybook src/shared/shadcn/tooltip/Tooltip.stories.svelte`.
Before restoration, one test failed (expected 12px text, received 11px) and one
passed. After restoration, all three passed, including a 28px default height
and a 36px height with custom public sizing tokens. Running both
`Tooltip.stories.svelte` and `Tooltip.variations.stories.svelte` passed four
tests. After moving the consumer example into
`Tooltip.sizing.example-sources.ts`, the exact story passed three tests again.

The shared foundation component affects multiple consumers, so verification
expanded to the required source aggregate and local jj-store navigation
acceptance. `pnpm checks` was attempted; its first governance failure was fixed
by separating an acceptance bullet, and its subsequent type failure was fixed
by moving the inline consumer source example out of the Svelte story.

The qualified aggregate attempt passed governance, formatting, all type and
consumer-type checks, the no-Tailwind audit, 715 unit tests across 111 files,
three Turbo tests, the static Storybook build and visual metadata audit. It
stopped at Storybook with 643 passes and one emoji-picker keyboard-focus
failure. The isolated emoji story initially reproduced that failure; two
unchanged-parent runs under identical installed dependencies and a subsequent
modified-source run each passed both tests. The failure was intermittent.
No unrelated implementation or assertion was changed.

`pnpm ci:storybook-interaction` then passed all 644 tests across 208 files.
The remaining aggregate lanes were run sequentially:

- `pnpm ci:browser-workspace`: 14 passed.
- `pnpm ci:browser-shell`: 11 passed.
- `pnpm ci:browser-ai`: 3 passed.
- `pnpm ci:browser-shadcn`: 35 passed, one platform-only skip.

All required nonvisual lanes passed through these recorded runs; the single
`pnpm checks` wrapper attempt did not pass uninterrupted. `pnpm check:types`
reported zero errors and warnings in all four checks. `pnpm spec:check` passed
validation, mdBook and spec-first. `pnpm pack --pack-destination
/tmp/dc-tooltip-restore-pack` created a local tarball without publication.

jj-store's Appearance workspace consumed this source through its documented
temporary pnpm hook, retaining registry manifests and lockfiles. Installed
tooltip bytes matched source. A fresh owned Vite process and browser run
confirmed the Projects tooltip at 30px height with 12px text, inherited 18px
line height and restored padding. jj-store web/catalog checks passed with zero
errors or warnings, and 50 stories passed across seven direct navigation and
shell consumer files. Consumer evidence is E-UI-087 in its progress ledger.

The compare-only visual command was:

```sh
pnpm visual-delta test --story-id shadcn-overlays-tooltip--open-tooltip --baseline-path-mode nested-import --external 'vendor/shadcn-svelte-docs/static/**'
```

The canonical container Storybook build passed, but capture stopped before
comparison with EACCES on the temporary
`/visual-delta/canonical-build-cache/entries/.../storybook-static` tree. The
artifact guard also reported the example edit made while the build ran. The
earlier `pnpm visual-delta test --help` attempt bootstrapped the worker and
failed because no selection mode was specified. No tooling changes, permission
workarounds or baseline updates were made. The story remains visual-pending;
the user subsequently instructed us to ignore Design Core visual tests, so
further visual testing is out of scope for this slice. Publication and
registry-only qualification remain separate.

The run logs are `/tmp/dc-tooltip-restore-*.log` and
`/tmp/jj-tooltip-restore-*.log`. Final changed-file formatting and `pnpm spec:check` passed with this source
record. Logs are `/tmp/dc-tooltip-restore-evidence-format.log` and
`/tmp/dc-tooltip-restore-evidence-spec.log`. Consumer spec-first, validation
and progress checks also passed; wider jj-store and Rust lanes remain out of
scope under its targeted policy.
