# Warning tag contrast

Agent UI Branches exposed DC-SHA-057 / DC-CSS-004 warning-tag text at 3.89:1
on Lapis dark. Source was clean at `ab1570ca`; the exact source regression
`pnpm exec vitest run --project storybook src/shared/shadcn/tag-list/TagList.stories.svelte -t Warning`
reproduced one accessibility failure before the CSS fix. A first draft of the
new story also needed to await TagList's measured visible row; its inert probe
is not the acceptance target.

Warning labels now use semantic foreground, retaining the warning border/fill.
The new dark warning story and existing family remain visual-pending. No API,
geometry, baseline or released manifest changes.

Focused source stories, spec and prepared-package consumer checks are recorded
below. Broad qualification, publication and other consumer adoption remain
pending the user's final review.

## Source verification

- Exact warning-story regression: 1 contrast failure before, 0 after (1 case).
- `pnpm exec vitest run --project storybook src/shared/shadcn/tag-list/TagList.stories.svelte`: 7/7 passed, including dark warning and existing fitting/keyboard/lifetime stories.
- `pnpm spec:check`: validate, mdbook and spec-first passed (three lanes).
- Prepared the public package using `packLocal(..., { retainSource: true, suffix: "-branches-warning-review-source-built" })`: declarations emitted, 269 styles audited, three browser styles compiled, zero utility references.
- Local review archive SHA-256: `3cf11eb4fb4150d6ef488ac70ae68c8062e87b8970999ffa0379c2daf6302785`.
- Agent UI uses its ignored review-dependency hook; manifests/lockfile retain normal registry ranges. Its Branches record owns consumer acceptance and review limits. No other consumer was changed.
- Full suites, static catalog, screenshots/baselines and release qualification were not run, following the user's targeted-check review policy.
