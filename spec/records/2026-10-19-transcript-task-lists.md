# Transcript task lists and inspectable read previews

Status: pending UI review; unqualified and uncommitted. The user has paused
automated checks, tests, type checks, audits, specification checks and baselines.

DC-CHAT-006 retains immutable captures, exact UTF-16 anchors, source syntax,
middle folds, disclosures and host-owned inspection. The reader previously
enabled Lezer tables but omitted TaskList, leaving checkbox markers literal.
Task parsing now uses Mira's public task-marker helper and Design Core's shared
disabled Checkbox for checked/unchecked presentation. No captured text is edited.
The passive source story includes nested/ordered tasks, inline literal text and
fenced examples. Source is unchanged when task controls are pressed.

Inspectable tools may now supply `inlineBlocks`, preserving original block
identities, revisions and text. The title calls the existing inspector callback;
a separate chevron expands syntax-highlighted source with existing middle folds.
The source story demonstrates both independent actions without autoplay.
Default inline and sidebar behavior stays unchanged without this opt-in.

The fixed-footer border gains the public
`--ui-transcript-body-footer-border` token, retaining its original default.
Notes opts out only for its fixed keyboard-hint review row.

Commands and results will be appended after source-owned archive preparation
and manual rendering. Packaging does not qualify the change. Existing diff-fence
and fixed-composer pending work remains in the same working copy. Wider source
and consumer gates remain deferred until user confirmation.

## Local review preparation

- Scoped `pnpm exec prettier --write` completed; log `.local/tool-preview-format.log`.
- `packLocal(process.cwd(), { outputDirectory: Notes/.local/archives/packed, suffix: "-tool-preview" })` prepared the public source-owned archive from code revision `346293d41ae005525b15663375524836e5451da3`. No tests or type-check command ran. Log `.local/tool-preview-pack.log`.
- Prepared package CSS: three styles compiled, 252 audited by the packaging step, zero remaining utility references. This is packaging output, not source or consumer qualification.
- Archive SHA256: `8dbad975537467802bfa0640c24ca9d2b98700e8b942650dd8e948a6419f134a`.
- The archive includes the previously pending diff-fence and fixed-composer source. Notes consumes it only through its ignored local archive overlay; portable manifests remain unchanged.
- Manual source/consumer rendering and original wider gates remain pending. No baseline changes or commit.

## Manual consumer observations

Notes Storybook 7491 was refreshed through its source-owned archive overlay.
The read chevron expands captured Markdown source with syntax colouring and
Show 16 more lines; Show less restores the fold. The title opens the body
overlay, and Escape returns focus to the title while retaining the inline
disclosure. Preview exposes eight read-only task checkboxes (three checked,
five unchecked), including nested and ordered items. Source remains literal
Markdown, while Capture retains the original request/response. The fixed hint
row has a computed 0px top border. Screenshots are retained by the Notes
E-AI-057 review record. This is manual consumer observation only; no source
story run, automated test, type check, audit, spec gate or baseline was run.
All original qualification gaps remain pending, and no verified-slice commit
or live/native application adoption is claimed.

## Checkbox alignment follow-up

The initial preview renders unchecked checkbox widgets about 7px lower than
checked widgets relative to their text. Browser measurements show a checked
16px control 1px below the 18.5px text box top; the unchecked control is 8px
below its text box top. The inline-flex widget uses a -2px baseline offset,
whose baseline changes when the inner shared Checkbox contains a check icon.
The owning reader now uses middle alignment for the widget box, independent
of whether its internal indicator is empty. The passive source fixture also
includes a wrapping task. No consumer selector override or checkbox redesign.

Automated tests, types, audits, specs and baselines remain paused. The
source-owned archive refresh and manual geometry observations are recorded below.

The alignment archive was prepared from source revision
`89e420806d93e9428bc6fe81f21a242659853c11` with SHA256
`4c658955def6a35659cfeec5f9206577a5763b428ced3e9ea70aaa0b1a9bd147`.
Scoped formatting completed (`.local/task-alignment-format.log`). Packaging
completed with three styles prepared, 252 audited by the packaging step and
zero utility references (`.local/task-alignment-pack.log`); this is packaging,
not test qualification. Notes refreshed only its ignored local package
overlay and owned Storybook 7491 listener.

After refresh, manual browser measurements show identical geometry across all
eight checked, unchecked, nested and ordered task controls: their top is
2.47px below the text box top, their centre offset is 1.22px, and every row
is 22.3984375px high. Computed widget vertical alignment is `middle`.
The screenshot is retained at
`Notes/.local/task-checkbox-alignment.png`. Manual review confirms the checked
and unchecked controls now align consistently with their text. These observations
are UI review only; automated qualification, visual approval, live integration
and a verified-slice commit remain pending.
