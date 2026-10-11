# Runtime diagnostics and Dialog Frame opening focus

## Reproduction

PR #14's CI run 38138129208 failed one of 680 stories: DialogFrame/Dark
closed while typing `Updated record`, leaving 679 passes. Its job log also
contained 27 ignored Svelte `derived_inert` diagnostics.

The unchanged focused command
`pnpm test:storybook src/shared/forms/dialog-frame/DialogFrame.stories.svelte -t Dark`
passed locally (one pass, two filtered skips). A controlled opening-animation
frame regression then failed once: deferred Bits UI autofocus moved focus from
Field 1 to Close, so typing a space could activate Close. The public opening
autofocus callback now owns initial field focus and cancels the deferred default.

Design Core had no runtime-diagnostic guard. With the new guard active,
`pnpm test:storybook` exited 1 with 681 story passes and 36 runtime errors:
29 deferred Scroll Area resize rejections and seven text-selection pointer
errors, all from Bits UI 2.18.1 after owning state was destroyed.

`pnpm test:storybook src/shared/shadcn/scroll-area/ScrollArea.stories.svelte -t Styled`
reproduced the resize boundary: two functional passes, three filtered skips,
and 12 fatal runtime errors (exit 1). The final browser-delegating fixture also
fails on a temporary 2.18.1 installation with seven runtime errors and passes
on 2.19.5 with zero; the source manifest and lockfile retain `^2.19.5`.
The regression exercises both axes,
always/auto modes, queued observer work, three mount/dispose cycles, and pointer
interaction with a remaining control. Its controlled observer delegates normal
delivery to the browser while allowing an explicit resize immediately before
disposal; a manual-only mock failed to initialize both auto-mode axes and was
corrected without reducing the assertion.

## Repair

The guard retains console output and throws for Svelte runtime diagnostics in
warnings or errors. It remains active through browser rendering, interactions,
and teardown, including dependency-originated diagnostics. Unit evidence covers
formatted messages, diagnostic URLs, Error objects, logging, and restoration.

The published Bits UI 2.19.5 artifact includes upstream
[Scroll Area resize cleanup #2122](https://github.com/huntabyte/bits-ui/pull/2122)
and [text-selection destroyed-ref handling #2107](https://github.com/huntabyte/bits-ui/pull/2107).
Design Core now declares `^2.19.5` and resolves that release in its lockfile.
No dependency source or warning allowlist is patched.

## Verification

The exact Styled target passes both stories with zero runtime errors on 2.19.5.
The complete Dialog Frame family passes all four stories, including Dark and
the controlled opening-frame regression. All four runtime-guard unit tests pass.
`pnpm spec:check` passes validation, book build, and spec-first classification.

`pnpm checks` passes all nine nonvisual lanes: governance, formatting, source
style, four strict type projects, 727 unit tests, three Turbo tests, ten release
policy tests, static catalog build and metadata audit, 683 Storybook
interaction/accessibility stories, 15 Workspace pointer tests, 11 Shell pointer
tests, three AI browser tests, and 56 Shadcn browser tests with its existing
engine-specific skip. The complete Storybook run has zero Svelte runtime
diagnostics or fatal runtime errors (36 before repair, zero after repair).

The initial aggregate attempt stopped on one spec-first mapping diagnostic
after editing the agent testing guide. Updating its mapped governance chapter
and verification row resolved that diagnostic; the complete rerun passed.

`pnpm audit --json` and `pnpm audit --prod --json` each report zero workspace
findings. `pnpm packages:pack` passes source archive validation, strict clean
consumer types, and cold CodeEditor runtime acceptance. The clean installed
production graph retains six low-severity propagation findings terminating in
the existing accepted KaTeX advisory for 0.3.0.

Additional packed consumer acceptance:
`node .local/scroll-packed-runtime.mjs /Users/stevejuma/code/lapismd/design-core-npm-release/.release/tarballs/lapismd-design-core-0.3.0.tgz`
passes cold public startup, styled scrolling, three mount/dispose cycles, and
remaining pointer interactions with zero Svelte runtime diagnostics. This
isolated temporary validation consumes the tarball through public package
exports without aliases or dependency overrides.

Evidence logs: `/tmp/design-styled-teardown-final-before.log`,
`/tmp/design-styled-teardown-final-after.log`,
`/tmp/design-dialog-delayed-opening-before.log`,
`/tmp/design-dialog-delayed-opening-after.log`,
`/tmp/design-dialog-pr14-after.log`, `/tmp/design-runtime-guard-final.log`,
`/tmp/design-runtime-checks.log`, `/tmp/design-runtime-pack.log`, and
`/tmp/design-runtime-scroll-consumer.log`.

Visual comparisons and baseline updates are outside this user-authorized slice;
new acceptance stories remain visual-pending. The pending patch Changeset joins
the existing emoji focus Changeset; the source manifest remains 0.3.0 until the
release bot versions the package. The prior KaTeX exception remains restricted
to its explicitly approved versions.
