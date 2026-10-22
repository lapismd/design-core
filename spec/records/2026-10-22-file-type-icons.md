# Shared filename icons — 2026-10-22

The user authorized a generic Design Core FileTypeIcon and default File Listing
adoption, reviewed the preview, then requested the remaining Diff/Chat filename
surfaces, wider checks and commits. This slice lives in the isolated
`file-type-icons` Jujutsu workspace (change `mtrtuvpr`, parent `749de753`);
unrelated default-checkout chat/reference work is untouched. Publication and
downstream applications/services remain unchanged.

## Source and runtime boundary

The component uses original Material artwork through a curated generated subset.
`material-file-icons` 2.4.0 is pinned as a development-only asset source; its
executable implementation is not copied and its full catalogue is not imported
by the runtime. The package root license retains the MIT attribution.

`pnpm icons:generate` emits 113 selected SVGs, 927 special filenames and 976
extension mappings. The hand-maintained catalog groups less-common developer
tools under shared category icons and adds personal-vault file types: PDF/EPUB,
office documents, sheets, slides, calendars, mail, photos, audio, video, archives,
databases, notebooks and note diagrams. Unknown input keeps the generic file.
Names are basename-only and case-insensitive; full-name matches precede longest
suffixes. Prototype keys never select inherited object properties.

JJButler was inspected as a read-only reference. A local coverage probe of all
356 extension and 546 filename keys (902 examples) resolved every example to a
known file or category icon rather than the unknown-file fallback. This is
category coverage, not a claim that every original tool has a dedicated logo.
No JJButler implementation, mapping table or artwork is copied into the package.

The generated artwork SHA printed by the checker is
`87b3520f860df0dfb0f3ba6a6fb2dd00d084b0781eea4bfc091c8ca9e61db6d4`.
`pnpm icons:check` rejects stale data and runs through both specification lanes.

## Presentation

Public sizes are `xs` 12px, `s` 14px, `md` 16px (default) and `lg` 24px.
Preset variables and an explicit size override are documented; the explicit
override takes precedence. Missing-SVG fallback colour remains semantic.
Default File Listing uses the same production component in its original 14px
slot; folder icons, row geometry, host selection and controller flow are retained.

The common-file story demonstrates 57 developer and notes files in one list.
Both that list and all six mode/virtualization preview boxes have a 1rem inset.
Standalone icon stories demonstrate the same common files, named/decorative
semantics, reactive filename updates, all four presets and a 20px override.

## Focused evidence

- Initial default-listing regression: one failure because the shared icon was
  absent; the exact target subsequently passed.
- Expanded file-type expectations initially passed 23 and failed 10. Two
  expectations were corrected to preserve RTF as Word and `.key` as a
  cryptographic key; added notes/office/calendar/diagram mappings repair the
  remaining missing cases. Initial preview-padding assertion failed once.
- `pnpm exec vitest run --project unit src/shared/shadcn/file-type-icon src/shared/diff/file-listing/file-icon.spec.ts`: 39 passed, zero failed.
- `pnpm exec vitest run --project storybook src/shared/shadcn/file-type-icon/FileTypeIcon.stories.svelte src/shared/diff/file-listing/FileListing.icons.stories.svelte src/shared/diff/file-listing/FileListing.stories.svelte`: 16 passed, zero failed, including real selection, virtual rows, preset geometry and custom-size precedence.
- `pnpm spec:validate`: generated assets verified; eight validators, 31 chapters and 305 requirements passed. The initial misplaced verification row and acceptance-paragraph formatting were corrected without weakening validation.
- Isolated minified browser resolver: 143,754 bytes / 46,437 bytes gzip (45.3 KiB), versus 177,561 bytes gzip for the full catalogue. The broader curated set is about 74% smaller; the earlier 58-icon/20 KiB experiment was illustrative, not the final coverage target.
- A focused Vite bundle test enforces less than 48 KiB gzip, no full-catalogue runtime module and the development-only dependency boundary.

Cold preview inspection after `pnpm storybook:restart` verified all 57 common
files in light and dark mode with a 16px container inset, 12/14/16/24px named
presets, and loaded MDX content without page errors. An initial manager-frame
heading probe timed out; direct docs-frame inspection confirmed the complete
rendered page, and the corrected attached-heading probe passed. No source or
assertion threshold was changed to hide a rendering failure.

## Filename surface audit

The same public component now renders FileDiffComposer filenames, MergeEditor
paths, explicit ChatTextBlock capture paths, ChatToolBlocks file disclosures,
default ChatTools path titles, RichToolCallDetail read/edit/search locations,
and default WorkspaceExplorer file and rename rows. Generic context/action
icons without an explicit filename contract remain unchanged. Host-provided
tool/Explorer icons, running/error status icons, folder/disclosure controls,
header-leading snippets, exact open-path locations and pathless fallback labels
keep precedence and original behavior. The legacy string icon helper and
Explorer `iconFor` remain compatible; `customIconFor` distinguishes explicit
host overrides from the renderer-owned fallback.

The first exact adoption run had six failures and seven passes; the added
Explorer regression initially failed once. Real expanded tool groups also
exposed one axe violation, repaired by giving labelled Collapsible content its
proper group role. The final 14 focused source checks passed, covering filenames,
Markdown captures, read/edit/search navigation, status/host precedence and rename.

The first wider interaction run had 916 passes and three failures. Two narrow
transcript checks measured the newly inserted icon span instead of the title;
the helper now selects the filename label explicitly while retaining every
width, wrapping, overflow and tooltip assertion. One Column Canvas return-scroll
check failed under the aggregate run; its source was unchanged, and the exact
combined readonly/Column Canvas rerun passed all 21 scenarios. The second full
interaction run passed those scenarios and 918 total, but one Message List
virtualized-history scenario failed while observing its jump button. Its exact
family rerun passed all eight cases. The complete interaction/accessibility suite
then passed all 919 cases across 267 files with one worker and file parallelism
disabled; no assertion or product behavior was changed for these transient scroll
failures.

`pnpm packages:pack` passed clean tarball installation, consumer types, cold
development and production CSS/fonts/themes/focus, TagList actions/overflow,
CodeEditor reactivity and Composer Input lifetime without Tailwind tooling or
Svelte diagnostics. The audit retained only the pre-existing, user-approved
KaTeX low-severity release exception across six packages.

## Wider source qualification

- `pnpm checks` ran governance, repo-wide formatting, strict source/shell/filter
  consumer types, native-CSS auditing, the full unit suite and static Storybook
  build/audit successfully. Unit results: 897 plus three concurrency and 16
  packaging/release tests, all passing. The default concurrent interaction runs
  and their exact before/after counts are documented above; the complete serial
  rerun used `pnpm exec vitest run --project storybook --maxWorkers=1 --no-file-parallelism`.
- `pnpm test:workspace:pointer`: 16 passed in a fresh catalog process.
- Remaining native-browser results are recorded below.

## Review gate

Storybook runs at http://localhost:9409 in the isolated source workspace.
`pnpm test:visual:affected` could not execute screenshot comparison because the
local Docker socket is unavailable. It discovered 798 affected stories through
the missing-cache fallback, then exited before capture. No daemon was started,
no baseline or threshold was changed, and changed stories remain visual-pending.
Functional and package qualification are recorded separately; this is not a
release or downstream rollout.
