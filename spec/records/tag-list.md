# Compact TagList review slice

The user requested a shared-only review slice, with consumer adoption and
publication separate. The recovered `plain-css` workspace was empty and is
rebased onto main `c40cb35c` (Design Core 0.4.0); its existing port remains 9409.

Before editing, the exact Badge/Button story command passed 3/3 cases
(`/tmp/dc-tag-list-baseline-stories.log`) and catalog discovery passed 12/12
(`/tmp/dc-tag-list-baseline-catalog.log`). No display TagList existed. The
existing jj-store chip was inspected read-only at `64790b2b`, with Apache-2.0
provenance retained in the family documentation. No application file changed.

The component composes existing Badge/Button, Tooltip, Popover and ScrollArea;
the individual chip renderer stays private. Fitting measures an ordered prefix,
actual count indicators and the first chip's minimum geometry. Inert probes
remain inaccessible. The row retains first-tag priority with ellipsis and
provides indicator-only fallback. Callbacks, active state and data stay host-owned.

The initial slice stopped after focused validation for visual review. The user
subsequently approved main-workspace integration, a pull request and publication.
Stories stay visual-pending and baselines are unchanged. Consumer adoption stays
separate.

## Focused verification

- `pnpm test:unit src/shared/shadcn/tag-list/tag-list-fit.spec.ts scripts/ui-generator/tests/components.spec.ts`: 17/17 pass. Exact-width boundaries, fractional geometry, first-tag priority and indicator digit changes are covered. Catalog discovery initially failed 1/17 because its example parser requires string literals; copyable examples now use the existing supported format.
- `pnpm test:storybook src/shared/shadcn/tag-list/TagList.stories.svelte`: initial 3/6 failures, then 6/6 pass. Explicit dialog/tooltip roles repaired accessible overlay discovery; the state scenario waits for measured controls before querying them. Keyboard tooltip access uses actual Tab navigation.
- The final story target also reruns the unchanged Badge and Button baseline stories: 9/9 pass in total.
- `SHADCN_STORYBOOK_PORT=9409 SHADCN_VISUAL_SERVER_PORT=9410 pnpm test:shadcn:pointer tests/shadcn/tag-list.spec.ts`: initial 3/5 failures, then 6/6 pass including an added focused-removal case. Tooltip triggers now retain DOM identity through truncation changes. Popup focus restoration handles mouse and keyboard opening, resize removal and host data removal without overriding intentional outside focus. Popup sizing uses a border box and reduced-motion transitions are suppressed. The remount scenario now requests the same narrow width it asserts.
- `pnpm check:types`: all four source/consumer configurations pass with zero errors and warnings. Initial source errors (15) were corrected before browser acceptance.
- `pnpm check:no-tailwind`: pass; no new utilities or Tailwind tooling.
- `pnpm spec:check`: all three lanes pass. The new catalog surface has its required explicit DC-SHA-057 mapping.

The browser target covers single-row geometry, all-tags order, narrow viewports,
full-label tooltips, callbacks, controlled active state, disabled activation,
keyboard dismissal, focus recovery, host token propagation through the portal,
ScrollArea overflow, repeated teardown, dark mode, reduced motion and forced
colours. Cold startup is repeated after the final changes. Local diagnostics are
recorded in `/tmp/dc-tag-list-{stories,units,browser,types}-*.log` plus the spec
and CSS audit logs. Review screenshots are test artifacts, not baselines.

## Release qualification

Fetching `codex-https` found remote main unchanged at `c40cb35c`. The main
workspace was clean. Its imported implementation initially matched the reviewed
`plain-css` snapshot exactly; subsequent changes only add packed acceptance and
qualification evidence.

`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=1 pnpm checks` passes every required
nonvisual lane (`/tmp/dc-tag-release-checks.log`): three specification lanes,
repository formatting, four clean type configurations, the native-CSS audit,
746 units, three Turbo tests, 16 release/style tests, static Storybook and its
metadata audit, and 760 interaction/accessibility cases across 227 story files.
Cold browser acceptance passes Workspace 15/15, Shell 11/11, AI 3/3 and Shadcn
89/90, with the unchanged Chromium-only WebKit-preference skip: 118 passes,
one platform skip and zero failures. Existing non-failing ResizeObserver
diagnostics remain unchanged.

The existing archive fixture passed before extension
(`/tmp/dc-tag-release-pack-baseline.log`). TagList and its public types now join
that fixture without Tailwind tooling, consumer aliases or overrides. Its first
extended run failed one assertion because wrapper text included Svelte markup
whitespace. Inspecting the actual label nodes instead preserves the exact-label
assertion. `pnpm packages:pack` then passed all development/production, theme,
overflow-order, callback, token and focus checks
(`/tmp/dc-tag-release-packed-after.log`). The existing release/style target
passed 16/16 before and after the extension. `pnpm release:check` also passes.

Locked full and production audits report zero vulnerabilities
(`/tmp/dc-tag-release-audit.json`, `/tmp/dc-tag-release-audit-prod.json`). The
independent archive consumer retains only the existing approved low-severity
KaTeX exception GHSA-238p-pmpm-9mq7 and its six-package propagation chain.
No audit policy, exception, diagnostic, visual baseline or unrelated consumer
implementation changed. The existing minor Changeset supplies the release bump.
