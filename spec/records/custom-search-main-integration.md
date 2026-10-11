# Custom search main integration

Enclosing Jujutsu change: `urzxtuqs`.

The main workspace combines the verified custom-language change `ookknysq`
(`b0a8c96e`) with the newer tooltip restoration `quoystmy` (`bb40d39d`).
The merge is conflict-free and preserves both source histories. No source API
or behavior differs from the verified custom-language implementation.

Integration commands and evidence:

- `pnpm check:types`: all four Svelte/strict consumer checks pass with zero
  errors or warnings; `/tmp/rich-search-main-dc-types.log`.
- `pnpm test:storybook src/shared/filter/search-filter-bar`: three files and ten
  interaction/accessibility cases pass; `/tmp/rich-search-main-dc-stories.log`.
- Initial `pnpm spec:check`: validation and mdBook pass, but its default `@-`
  range is ambiguous for a merge. Final qualification passes all three lanes
  (validation, mdBook and spec-first) by supplying the files from
  `jj diff --from bb40d39d --to @ --name-only` to the supported `--file` option.

- `pnpm exec prettier --check` for the nine integrated source, story, chapter,
  changeset and record files passes; `/tmp/rich-search-main-dc-format-check.log`.

The complete nonvisual source qualification in `spec/src/verification.md`
remains the implementation evidence; this integration reruns the owning family,
source consumer types and canonical checks. Screenshot comparisons and baseline
updates are excluded by the user. The changeset remains pending a normal release;
this merge does not publish a package.

Workspace retirement follows verified ancestry and clean status; the unrelated
`release-verify-fix` workspace and its services remain retained.

After the verified main commit, `jj workspace forget rich-search` and
`trash -v /Users/stevejuma/code/lapismd/design-core-rich-search` removed the
registered temporary checkout recoverably. The original implementation commit
`b0a8c96e` remains an ancestor of main. A leftover static qualification host
(Python PID88148, loopback9170) was identified by its temporary workspace cwd
and stopped before retirement. The unrelated source hosts and
`release-verify-fix` workspace remain intact. Final record formatting and
specification validation pass; retirement evidence is folded into the same
main integration change.
